/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import { useMemo, useCallback } from 'react';
import { Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { getSalesAction, deleteSaleAction as deleteSaleFromAction } from '@/app/sales/actions';
import { clearInventoryCaches } from '@/utils/inventoryCacheUtils';

export interface TopCustomer {
  id?: string;
  name: string;
  totalPurchases: number;
  orderCount: number;
}

export const useSalesData = (userId: string | undefined, sortOrder: string = 'desc', pageSize?: number) => {

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  const loadSales = useCallback(async (): Promise<Sale[]> => {
    try {
      if (!userId || !currentBusiness) {
        return [];
      }

      const result = await getSalesAction({
        userId,
        pageSize,
        sortOrder: sortOrder as any
      });

      if (result.success && result.data) {
        // Map Prisma Sale to Frontend Sale
        return (result.data as any[]).map(item => ({
          id: item.id,
          userId: item.userId,
          locationId: item.branchId,
          receiptNumber: item.saleNumber,
          customerName: item.customerName || '',
          customerAddress: '',
          customerContact: '',
          customerId: item.customerId,
          items: item.items.map((i: any) => ({
            id: i.id,
            description: i.productName,
            quantity: i.quantity,
            price: i.sellingPrice,
            cost: i.unitCost || 0,
            discountPercentage: 0,
            discountAmount: 0
          })),
          paymentStatus: item.paymentStatus as any,
          profit: item.items.reduce((sum: number, i: any) => sum + ((i.sellingPrice - (i.unitCost || 0)) * i.quantity), 0),
          date: item.date,
          taxRate: 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          amountPaid: item.amountPaid,
          amountDue: item.balance,
        }));
      }

      if (!result.success) throw new Error(result.error);
      return [];

    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [userId, currentBusiness, sortOrder, pageSize, toast]);

  // React Query caching with persistent storage for improved performance
  const baseQueryKey = useMemo(() => ['sales', currentBusiness?.id, userId], [currentBusiness?.id, userId]);
  const queryKey = useMemo(() => [...baseQueryKey, sortOrder, pageSize], [baseQueryKey, sortOrder, pageSize]);

  const {
    data: sales = [],
    isLoading: isQueryLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey,
    queryFn: loadSales,
    enabled: !!userId && !!currentBusiness?.id,
    staleTime: 30_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Derived loading state
  const isLoading = isQueryLoading || (isFetching && sales.length === 0);

  // Real-time subscription is disabled in moving to Prisma

  const getTopCustomers = useMemo((): TopCustomer[] => {
    // Skip quotes since they're not actual purchases
    const nonQuoteSales = sales.filter(sale => sale.paymentStatus !== "Quote");

    // Group sales by customer name
    const customerMap = new Map<string, { total: number, count: number, customerId?: string }>();

    nonQuoteSales.forEach(sale => {
      const customerName = sale.customerName;
      const saleTotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, {
          total: saleTotal,
          count: 1,
          customerId: sale.customerId
        });
      } else {
        const current = customerMap.get(customerName)!;
        customerMap.set(customerName, {
          total: current.total + saleTotal,
          count: current.count + 1,
          customerId: current.customerId || sale.customerId
        });
      }
    });

    // Convert map to array and sort by total purchases
    return Array.from(customerMap.entries())
      .map(([name, data]) => ({
        id: data.customerId,
        name,
        totalPurchases: data.total,
        orderCount: data.count
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases);
  }, [sales]);

  // Memoize customer lifetime purchases function
  const getCustomerLifetimePurchases = useMemo(() => {
    return (customerName: string) => {
      // Filter sales by customer name and exclude quotes
      const customerSales = sales.filter(sale =>
        sale.customerName.toLowerCase() === customerName.toLowerCase() &&
        sale.paymentStatus !== "Quote"
      );

      // Calculate total purchase amount and count
      const total = customerSales.reduce((sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
      );

      return {
        total,
        count: customerSales.length
      };
    };
  }, [sales]);

  const deleteSale = async (id: string) => {
    try {
      const saleToDelete = sales.find(sale => sale.id === id);
      if (!saleToDelete) throw new Error('Sale not found');

      const result = await deleteSaleFromAction(id);
      if (!result.success) throw new Error((result as any).error || 'Failed to delete sale');

      // Update React Query cache
      queryClient.setQueryData(queryKey, (oldData: Sale[] | undefined) => {
        return oldData ? oldData.filter(sale => sale.id !== id) : [];
      });
      queryClient.invalidateQueries({ queryKey: baseQueryKey });

      // Clear caches
      clearSoldItemsCache();
      clearInventoryCaches(queryClient);

      toast({
        title: "Sale Deleted",
        description: "The sale record has been successfully deleted."
      });

      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: "Failed to delete sale. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const clearSoldItemsCache = useCallback(() => {
    if (!currentBusiness?.id) return;
    const key = `soldItemsFilters_${currentBusiness.id}`;
    localStorage.removeItem(key);

    // Also clear legacy keys for safety
    localStorage.removeItem('soldItemsFilters');
  }, [currentBusiness?.id]);

  const addSale = useCallback((newSale: Sale) => {
    queryClient.setQueryData(queryKey, (oldData: Sale[] | undefined) => {
      return oldData ? [newSale, ...oldData] : [newSale];
    });
    queryClient.invalidateQueries({ queryKey: baseQueryKey });
    clearSoldItemsCache();
  }, [queryClient, queryKey, baseQueryKey, clearSoldItemsCache]);

  const updateSale = useCallback((updatedSale: Sale) => {
    queryClient.setQueryData(queryKey, (oldData: Sale[] | undefined) => {
      return oldData ? oldData.map(s => s.id === updatedSale.id ? updatedSale : s) : [updatedSale];
    });
    queryClient.invalidateQueries({ queryKey: baseQueryKey });
    clearSoldItemsCache();
  }, [queryClient, queryKey, baseQueryKey, clearSoldItemsCache]);

  return {
    sales,
    // Removed setSales to prevent manual manipulation outside of mutations
    isLoading,
    deleteSale,
    addSale,
    updateSale,
    getTopCustomers,
    getCustomerLifetimePurchases,
    clearSoldItemsCache,
    refetch,
    isFetching
  };
};
