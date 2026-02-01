"use client";

import { useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CashAccount } from '@/components/types/cash';
import {
  getCashAccountsAction,
  createCashAccountAction,
  updateCashAccountAction,
  deleteCashAccountAction
} from '@/app/inventory/expenses/actions';

export const useCashAccounts = () => {
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ['cash_accounts', currentBusiness?.id], [currentBusiness?.id]);

  const { data: accounts = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<CashAccount[]> => {
      if (!currentBusiness) return [];
      const result = await getCashAccountsAction();
      if (result.success && result.data) {
        interface SerializedCashAccount {
          id: string;
          name: string;
          description: string | null;
          openingBalance: number;
          isDefault: boolean;
          createdAt: string;
          updatedAt: string;
        }
        return (result.data as SerializedCashAccount[]).map(account => ({
          id: account.id,
          name: account.name,
          description: account.description,
          openingBalance: account.openingBalance,
          isDefault: account.isDefault,
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt)
        }));
      }
      throw new Error(result.error || 'Failed to fetch cash accounts');
    },
    enabled: !!currentBusiness?.id,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const createAccount = useCallback(async (accountData: Partial<CashAccount>, cb?: () => void) => {
    try {
      if (!currentBusiness) throw new Error('No business selected');
      const result = await createCashAccountAction(accountData);
      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Cash account created successfully"
        });
        if (cb) cb();
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error('Error creating cash account:', error);
      const message = error instanceof Error ? error.message : "Failed to create cash account";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  }, [currentBusiness, queryClient, queryKey, toast]);

  const updateAccount = useCallback(async (id: string, updates: Partial<CashAccount>, cb?: () => void) => {
    try {
      const result = await updateCashAccountAction(id, updates);
      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Cash account updated successfully"
        });
        if (cb) cb();
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error('Error updating cash account:', error);
      const message = error instanceof Error ? error.message : "Failed to update cash account";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    }
  }, [queryClient, queryKey, toast]);

  const deleteAccount = useCallback(async (id: string, cb?: () => void) => {
    try {
      const result = await deleteCashAccountAction(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Cash account deleted successfully"
        });
        if (cb) cb();
        return { success: true, hasTransactions: false };
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error('Error deleting cash account:', error);
      const message = error instanceof Error ? error.message : "Failed to delete cash account";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return { success: false, hasTransactions: false };
    }
  }, [queryClient, queryKey, toast]);

  const getAccountBalance = useCallback(async (): Promise<number> => {
    console.warn('getAccountBalance is currently a stub in useCashAccounts (Prisma migration)');
    return 0;
  }, []);

  return useMemo(() => ({
    accounts,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    deleteAccountWithTransactions: async (id: string, _del: boolean, cb?: () => void) => {
        return deleteAccount(id, cb);
    },
    getAccountBalance,
    loadAccounts: refetch,
    refreshAccounts: () => queryClient.invalidateQueries({ queryKey })
  }), [accounts, isLoading, createAccount, updateAccount, deleteAccount, getAccountBalance, refetch, queryClient, queryKey]);
};
