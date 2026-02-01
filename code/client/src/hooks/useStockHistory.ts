"use client";

import { useMemo } from 'react';
import { StockHistoryEntry } from '@/types';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useQuery } from '@tanstack/react-query';
import { getStockHistoryAction } from '@/app/inventory/actions';

export const useStockHistory = (userId: string | undefined, productId?: string) => {
  const { currentBusiness } = useBusiness();

  const queryKey = useMemo(() => ['stock_history', currentBusiness?.id, productId], [currentBusiness?.id, productId]);

  const { data: stockHistory = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<StockHistoryEntry[]> => {
      if (!userId || !currentBusiness) return [];
      const result = await getStockHistoryAction(productId);
      if (result.success && result.data) {
        interface SerializedHistoryEntry {
          id: string;
          productId: string;
          oldQuantity: number;
          newQuantity: number;
          changeReason: string;
          referenceId?: string;
          createdAt: string | Date;
          product?: {
            name: string;
            costPrice: number;
            sellingPrice: number;
            itemNumber: string;
          };
        }
        return (result.data as SerializedHistoryEntry[]).map(entry => ({
          id: entry.id,
          productId: entry.productId,
          oldQuantity: entry.oldQuantity,
          newQuantity: entry.newQuantity,
          changeReason: entry.changeReason,
          createdAt: new Date(entry.createdAt),
          referenceId: entry.referenceId,
          product: entry.product
        }));
      }
      const errResult = result as { success: false; error: string };
      throw new Error(errResult.error || 'Failed to fetch stock history');
    },
    enabled: !!userId && !!currentBusiness?.id,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const createStockHistoryEntry = async (
    _productId: string,
    _previousQuantity: number,
    _newQuantity: number,
    _reason: string,
    _referenceId?: string,
    _entryDate?: Date,
    _receiptNumber?: string,
    _productName?: string
  ) => {
    void _productId; void _previousQuantity; void _newQuantity; void _reason;
    void _referenceId; void _entryDate; void _receiptNumber; void _productName;
    console.warn('createStockHistoryEntry is now handled automatically by product update actions in Prisma migration.');
    return true;
  };

  const updateStockHistoryEntry = async (
    _entryId: string,
    _newQuantity: number,
    _newChangeReason: string,
    _newDate?: Date
  ) => {
    void _entryId; void _newQuantity; void _newChangeReason; void _newDate;
    console.warn('updateStockHistoryEntry should be handled by a dedicated Server Action if needed.');
    return false;
  };

  const deleteStockHistoryEntry = async (_entryId: string) => {
    void _entryId;
    console.warn('deleteStockHistoryEntry should be handled by a dedicated Server Action if needed.');
    return false;
  };

  return {
    stockHistory,
    isLoading,
    createStockHistoryEntry,
    updateStockHistoryEntry,
    deleteStockHistoryEntry,
    deleteMultipleStockHistoryEntries: async () => false,
    recalculateStockChain: async () => false,
    updateStockHistoryDatesBySaleId: async () => false,
    recalculateProductStock: async () => 0,
    loadStockHistory: refetch
  };
};
