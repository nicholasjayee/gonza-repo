"use client";

import { useState, useCallback } from 'react';
import { useToast } from "@/inventory/hooks/use-toast";
import { getDeletedSalesAction } from '@/app/sales/actions'; // Assuming actions.ts supports this

// Assuming DeletedSale structure similar to Sale or as needed
export interface Sale { // Reuse type or define specific
  id: string;
  // ... other fields
}

export const useDeletedSales = () => {
  const [deletedSales, setDeletedSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeletedSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDeletedSalesAction();
      if (result.success && result.data) {
        setDeletedSales(result.data as any[]);
      } else {
        // Optional: handle specific error or empty state
      }
    } catch (error) {
      console.error('Error fetching deleted sales:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch deleted sales history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial fetch? Or controlled by component? Legacy hook probably fetched on mount or demand.
  // We'll leave it to the component to call refetch.

  return {
    deletedSales,
    isLoading,
    refetch: fetchDeletedSales
  };
};
