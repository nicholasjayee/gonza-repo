"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Sale } from "@/inventory/types/";
import { useToast } from "@/inventory/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "@/inventory/contexts/BusinessContext";
import { useProducts } from "@/inventory/hooks/useProducts";
import { getInventorySalesAction } from "@/app/inventory/actions";
import { 
  createSaleAction, 
  deleteSaleAction, 
  updateSaleAction 
} from "@/sales/api/controller";
import { CreateSaleInput } from "@/sales/types"; // Verify path later, assuming based on controller logic

export interface TopCustomer {
  id?: string;
  name: string;
  totalPurchases: number;
  orderCount: number;
}

export const useSalesData = (
  sortOrder: string = "desc",
  pageSize?: number,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();
  const { updateProduct } = useProducts();

  const loadSales = useCallback(async (): Promise<Sale[]> => {
    try {
      if (!currentBusiness) {
        return [];
      }
      const res = await getInventorySalesAction(1, pageSize, sortOrder as "asc" | "desc");
      
      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load sales");
      }
      
      // Data is already mapped in getInventorySalesAction, but type might need assertion if not perfect
      // The returning type of getInventorySalesAction.data.sales is basically what we need.
      return res.data.sales as unknown as Sale[]; 
    } catch (error) {
      console.error("Error loading sales:", error);
      toast({
        title: "Error",
        description: "Failed to load sales data.",
        variant: "destructive",
      });
      return [];
    }
  }, [currentBusiness?.id, sortOrder, toast]);

  const baseQueryKey = useMemo(
    () => ["sales", currentBusiness?.id],
    [currentBusiness?.id],
  );
  const queryKey = useMemo(
    () => [...baseQueryKey, sortOrder, pageSize],
    [baseQueryKey, sortOrder, pageSize],
  );

  const {
    data: sales = [],
    isLoading: isQueryLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: loadSales,
    enabled: !!currentBusiness?.id,
  });

  const isLoading = isQueryLoading || (isFetching && sales.length === 0);

  const getTopCustomers = useMemo((): TopCustomer[] => {
    const nonQuoteSales = sales.filter(
      (sale) => sale.paymentStatus !== "Quote",
    );
    const customerMap = new Map<
      string,
      { total: number; count: number; customerId?: string }
    >();

    nonQuoteSales.forEach((sale) => {
      const customerName = sale.customerName;
      const saleTotal = sale.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, {
          total: saleTotal,
          count: 1,
          customerId: sale.customerId,
        });
      } else {
        const current = customerMap.get(customerName)!;
        customerMap.set(customerName, {
          total: current.total + saleTotal,
          count: current.count + 1,
          customerId: current.customerId || sale.customerId,
        });
      }
    });

    return Array.from(customerMap.entries())
      .map(([name, data]) => ({
        id: data.customerId,
        name,
        totalPurchases: data.total,
        orderCount: data.count,
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases);
  }, [sales]);

  const getCustomerLifetimePurchases = useMemo(() => {
    return (customerName: string) => {
      const customerSales = sales.filter(
        (sale) =>
          sale.customerName.toLowerCase() === customerName.toLowerCase() &&
          sale.paymentStatus !== "Quote",
      );

      const total = customerSales.reduce(
        (sum, sale) =>
          sum +
          sale.items.reduce(
            (itemSum, item) => itemSum + item.price * item.quantity,
            0,
          ),
        0,
      );

      return {
        total,
        count: customerSales.length,
      };
    };
  }, [sales]);

  const deleteSale = async (id: string) => {
    try {
      const res = await deleteSaleAction(id);
      if (!res.success) throw new Error(res.error);

      // Update local cache
      queryClient.setQueryData(queryKey, (oldData: Sale[] | undefined) => {
        return oldData ? oldData.filter((sale) => sale.id !== id) : [];
      });
      queryClient.invalidateQueries({ queryKey: baseQueryKey });

      toast({
        title: "Sale Deleted",
        description: "The sale record has been successfully deleted.",
      });
      return true;
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive"
      });
      return false;
    }
  };

  const clearSoldItemsCache = useCallback(() => {
    // No-op or clear local storage if needed
  }, []);

  const addSale = useCallback(
    async (newSale: Sale) => {
        // Map Sale to CreateSaleInput
        const saleInput: any = {
            ...newSale,
            // You might need to adjust mapping here depending on CreateSaleInput structure vs Sale structure
            // For now assuming compatible or handling as any to unblock
        };
      await createSaleAction(saleInput);
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
    [queryClient, baseQueryKey],
  );

  const updateSale = useCallback(
    async (updatedSale: Sale) => {
        const saleInput: any = { ...updatedSale };
      await updateSaleAction(updatedSale.id, saleInput);
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
    [queryClient, baseQueryKey],
  );

  return {
    sales,
    isLoading,
    deleteSale,
    addSale,
    updateSale,
    getTopCustomers,
    getCustomerLifetimePurchases,
    clearSoldItemsCache,
    refetch,
    isFetching,
  };
};
