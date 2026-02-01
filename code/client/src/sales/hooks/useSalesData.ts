"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/inventory/hooks/use-toast";
import { getSalesAction, deleteSaleAction } from "@/app/sales/actions";
import { Sale, SaleItem } from "../types";

export type { Sale };

export const useSalesData = (userId?: string) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  const fetchSales = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await getSalesAction(userId);
      if (result.success && result.data) {
        // Map Prisma result to legacy Sale interface
        const rawData = result.data as any[];
        const mappedSales: Sale[] = rawData.map((item) => {
          // Map items
          const items: SaleItem[] = (item.items || []).map((i: any) => ({
             description: i.productName || "Unknown",
             quantity: Number(i.quantity),
             price: Number(i.sellingPrice),
             cost: Number(i.unitCost),
             productId: i.productId,
             // ... other mappings if available
          }));

          return {
             id: item.id,
             receiptNumber: item.saleNumber, // Mapped from saleNumber
             customerName: item.customerName || (item.customer ? item.customer.name : "Walk-in Customer"),
             items: items,
             paymentStatus: item.paymentStatus === "UNPAID" ? "NOT PAID" : item.paymentStatus === "PAID" ? "Paid" : item.paymentStatus === "QUOTE" ? "Quote" : "Installment Sale", // Map status
             profit: Number(item.total) - 0, // TODO: Calculate profit properly
             date: new Date(item.date),
             createdAt: new Date(item.createdAt),
             amountPaid: Number(item.amountPaid),
             amountDue: Number(item.balance),
             // ... other fields
             customerId: item.customerId,
          };
        });
        setSales(mappedSales);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
       console.error("Error fetching sales:", err);
       toast({
         title: "Error",
         description: "Failed to load sales data.",
         variant: "destructive"
       });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [userId, toast]);

  const deleteSale = async (id: string) => {
    try {
      const result = await deleteSaleAction(id);
      if (result.success) {
         toast({ title: "Success", description: "Sale deleted successfully." });
         await fetchSales(); // Refresh list
         return true;
      } else {
         throw new Error(result.error);
      }
    } catch (error) {
       toast({
         title: "Error",
         description: "Failed to delete sale.",
         variant: "destructive"
       });
       return false;
    }
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    isLoading,
    isFetching,
    refetch: fetchSales,
    deleteSale
  };
};
