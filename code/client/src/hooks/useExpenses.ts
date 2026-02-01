/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { 
  getExpensesAction, 
  createExpenseAction, 
  updateExpenseAction, 
  deleteExpenseAction,
  createBulkExpensesAction
} from '@/app/inventory/expenses/actions';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date: Date;
  paymentMethod?: string;
  personInCharge?: string;
  receiptImage?: string;
  cashAccountId?: string;
  cashTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useExpenses = () => {
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();
  const queryClient = useQueryClient();

  const queryKey = ['expenses', currentBusiness?.id];

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentBusiness) return [];
      const result = await getExpensesAction();
      if (result.success && result.data) {
        return (result.data as any[]).map(e => ({
          id: e.id,
          amount: e.amount,
          description: e.description,
          category: e.category,
          date: new Date(e.date),
          paymentMethod: e.paymentMethod,
          personInCharge: e.personInCharge,
          receiptImage: e.receiptImage,
          cashAccountId: e.cashAccountId,
          cashTransactionId: e.cashTransactionId,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt)
        }));
      }
      throw new Error(result.error || 'Failed to fetch expenses');
    },
    enabled: !!currentBusiness,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const createExpense = async (expenseData: any) => {
    try {
      const result = await createExpenseAction(expenseData);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Expense recorded successfully"
        });
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create expense",
        variant: "destructive"
      });
      return null;
    }
  };

  const createBulkExpenses = async (expensesData: any[]) => {
    try {
      const result = await createBulkExpensesAction(expensesData);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: `Successfully created ${expensesData.length} expenses`
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error creating bulk expenses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bulk expenses",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateExpense = async (id: string, updates: any) => {
    try {
      const result = await updateExpenseAction(id, updates);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Expense updated"
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const result = await deleteExpenseAction(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Expense deleted"
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    expenses,
    isLoading,
    createExpense,
    createBulkExpenses,
    updateExpense,
    deleteExpense,
    refreshExpenses: refetch
  };
};
