/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useCallback } from 'react';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCashTransactionsAction,
  createCashTransactionAction,
  updateCashTransactionAction,
  deleteCashTransactionAction,
  createBulkCashTransactionsAction,
  createTransferAction
} from '@/app/inventory/expenses/actions';
import {
  CashTransaction,
  CashTransactionFormData,
  DailyCashSummary,
} from '@/components/types/cash';

export const useCashTransactions = (accountId?: string) => {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ['cash_transactions', currentBusiness?.id, accountId], [currentBusiness?.id, accountId]);

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<CashTransaction[]> => {
      if (!currentBusiness) return [];
      const result = await getCashTransactionsAction(accountId);
      if (result.success && result.data) {
        const rawData = result.data as any[];
        return rawData.map(t => ({
          id: t.id,
          userId: t.userId,
          accountId: t.accountId,
          amount: Number(t.amount),
          transactionType: t.transactionType as any,
          category: t.category,
          description: t.description,
          personInCharge: t.personInCharge,
          tags: t.tags || [],
          date: new Date(t.date),
          paymentMethod: t.paymentMethod,
          receiptImage: t.receiptImage,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }));
      }
      throw new Error((result as any).error || 'Failed to fetch transactions');
    },
    enabled: !!currentBusiness?.id,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const createTransaction = useCallback(async (transactionData: CashTransactionFormData) => {
    try {
      if (!currentBusiness) throw new Error('No business selected');

      let result: any;
      if (transactionData.transactionType === 'transfer' && transactionData.toAccountId) {
        result = await createTransferAction(transactionData);
      } else {
        result = await createCashTransactionAction({
            ...transactionData,
            transactionType: transactionData.transactionType === 'transfer' ? 'cash_out' : transactionData.transactionType
        });
      }

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cash_transactions', currentBusiness.id] });
        toast({
          title: "Success",
          description: "Transaction created successfully"
        });
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error('Error creating transaction:', error);
      const message = error instanceof Error ? error.message : "Failed to create transaction";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  }, [currentBusiness, queryClient, toast]);

  const createBulkTransactions = useCallback(async (transactionsData: CashTransactionFormData[]) => {
    try {
      if (!currentBusiness) throw new Error('No business selected');

      // Note: Bulk actions don't handle transfers atomically unless implemented on server.
      // For now, let's just use createBulkCashTransactionsAction if there are no transfers,
      // or handle them individually if there are. Or just pass it all to the server if we had a better action.
      // To keep it simple, we'll implement individual calls for transfers in the future if needed, 
      // but for now let's just use the bulk action for simple ones.
      
      const simpleTransactions = transactionsData.filter(t => t.transactionType !== 'transfer');
      const transfers = transactionsData.filter(t => t.transactionType === 'transfer');

      if (simpleTransactions.length > 0) {
        const result = await createBulkCashTransactionsAction(simpleTransactions);
        if (!result.success) throw new Error((result as any).error);
      }

      for (const transfer of transfers) {
        await createTransferAction(transfer);
      }

      queryClient.invalidateQueries({ queryKey: ['cash_transactions', currentBusiness.id] });
      toast({
        title: "Success",
        description: `Successfully processed ${transactionsData.length} transactions`
      });
      return true;
    } catch (error: unknown) {
      console.error('Error creating bulk transactions:', error);
      const message = error instanceof Error ? error.message : "Failed to process bulk transactions";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  }, [currentBusiness, queryClient, toast]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<CashTransactionFormData>) => {
    try {
      if (!currentBusiness) throw new Error('No business selected');

      const result = await updateCashTransactionAction(id, updates);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cash_transactions', currentBusiness.id] });
        toast({
          title: "Success",
          description: "Transaction updated successfully"
        });
        return (result as any).data;
      } else {
        throw new Error((result as any).error);
      }
    } catch (error: unknown) {
      console.error('Error updating transaction:', error);
      const message = error instanceof Error ? error.message : "Failed to update transaction";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  }, [currentBusiness, queryClient, toast]);

  const deleteTransaction = useCallback(async (id: string, onDeleted?: () => void) => {
    try {
      if (!currentBusiness) throw new Error('No business selected');

      const result = await deleteCashTransactionAction(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cash_transactions', currentBusiness.id] });
        toast({
          title: "Success",
          description: (result as any).unlinkedCount > 0 
            ? "Transaction deleted and unlinked from installment payments successfully" 
            : "Transaction deleted successfully"
        });
        if (onDeleted) onDeleted();
        return true;
      } else {
        throw new Error((result as any).error);
      }
    } catch (error: unknown) {
      console.error('Error deleting transaction:', error);
      const message = error instanceof Error ? error.message : "Failed to delete transaction";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    }
  }, [currentBusiness, queryClient, toast]);

  const getDailySummary = useCallback(async (date: Date, summaryAccountId?: string): Promise<DailyCashSummary> => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Use transactions from cache if available
    let filteredTransactions = transactions.filter(t =>
      t.date.toISOString().split('T')[0] === dateStr
    );

    if (summaryAccountId) {
      filteredTransactions = filteredTransactions.filter(t => t.accountId === summaryAccountId);
    }

    const cashIn = filteredTransactions
      .filter(t => t.transactionType === 'cash_in' || t.transactionType === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashOut = filteredTransactions
      .filter(t => t.transactionType === 'cash_out' || t.transactionType === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersIn = filteredTransactions
      .filter(t => t.transactionType === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersOut = filteredTransactions
      .filter(t => t.transactionType === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);

    // Opening balance calculation would ideally come from the server for precision,
    // but for now we mimic the legacy client-side calculation.
    // In a real app, this should be a Server Action.
    
    const openingBalance = 0; // Placeholder: legacy code had complex logic here
    const closingBalance = openingBalance + cashIn - cashOut;

    return {
      date,
      openingBalance,
      cashIn,
      cashOut,
      transfersIn,
      transfersOut,
      closingBalance
    };
  }, [transactions]);

  const getDateRangeSummary = useCallback(async (startDate: Date, endDate: Date, summaryAccountId?: string): Promise<DailyCashSummary> => {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    let filteredTransactions = transactions.filter(t => {
      const d = t.date.toISOString().split('T')[0];
      return d >= startStr && d <= endStr;
    });

    if (summaryAccountId) {
      filteredTransactions = filteredTransactions.filter(t => t.accountId === summaryAccountId);
    }

    const cashIn = filteredTransactions
      .filter(t => t.transactionType === 'cash_in' || t.transactionType === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashOut = filteredTransactions
      .filter(t => t.transactionType === 'cash_out' || t.transactionType === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersIn = filteredTransactions
      .filter(t => t.transactionType === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersOut = filteredTransactions
      .filter(t => t.transactionType === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);

    const openingBalance = 0;
    const closingBalance = openingBalance + cashIn - cashOut;

    return {
      date: startDate,
      openingBalance,
      cashIn,
      cashOut,
      transfersIn,
      transfersOut,
      closingBalance
    };
  }, [transactions]);

  return useMemo(() => ({
    transactions,
    isLoading,
    createTransaction,
    createBulkTransactions,
    updateTransaction,
    deleteTransaction,
    getDailySummary,
    getDateRangeSummary,
    refreshTransactions: refetch
  }), [transactions, isLoading, createTransaction, createBulkTransactions, updateTransaction, deleteTransaction, getDailySummary, getDateRangeSummary, refetch]);
};
