/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { 
  getExpenseCategoriesAction, 
  createExpenseCategoryAction, 
  deleteExpenseCategoryAction,
  createBulkExpenseCategoriesAction
} from '@/app/inventory/expenses/actions';

export interface ExpenseCategory {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
}

const DEFAULT_CATEGORIES = [
  'Rent & Utilities',
  'Salaries & Wages',
  'Marketing & Advertising',
  'Office Supplies & Equipment',
  'Professional Services',
  'Cost of bringing Goods',
  'Delivery To Customer',
  'Insurance',
  'Licenses, Permits & Fees',
  'Software & Subscriptions',
  'Depreciation & Amortization',
  'Training & Development',
  'Communication',
  'Bank & Transaction Fees',
  'Miscellaneous'
];

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  // Internal fetch function to avoid circular dependencies
  const fetchCategories = useCallback(async () => {
    if (!currentBusiness) return [];
    
    try {
      const result = await getExpenseCategoriesAction();
      if (result.success && result.data) {
         const formattedCategories: ExpenseCategory[] = (result.data as any[]).map(category => ({
          id: category.id,
          name: category.name,
          isDefault: category.isDefault,
          createdAt: new Date(category.createdAt)
        }));
        
        // Remove duplicates
        return formattedCategories.filter((category, index, self) =>
          index === self.findIndex(c => c.name.toLowerCase() === category.name.toLowerCase())
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }, [currentBusiness]);

  const createDefaultCategories = useCallback(async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const categoriesToCreate = DEFAULT_CATEGORIES.map(name => ({
        name,
        isDefault: true
      }));

      const result = await createBulkExpenseCategoriesAction(categoriesToCreate);

      if (result.success) {
        // Refresh after creation
        const freshCats = await fetchCategories();
        setCategories(freshCats);
      } else {
        throw new Error(result.error || 'Failed to create default categories');
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
      toast({
        title: "Error",
        description: "Failed to create default categories.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness, fetchCategories, toast]);

  const loadCategories = useCallback(async () => {
    if (!currentBusiness) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const uniqueCategories = await fetchCategories();

      if (uniqueCategories.length === 0) {
        // Break recursion by calling createDefaultCategories which manages its own state update
        await createDefaultCategories(); 
        return;
      }

      setCategories(uniqueCategories);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load expense categories.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness, fetchCategories, createDefaultCategories, toast]);

  const createCategory = async (name: string) => {
    if (!currentBusiness) return null;

    try {
      // Check if category already exists (case-insensitive)
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingCategory) {
        toast({
          title: "Category exists",
          description: "This category already exists.",
          variant: "default"
        });
        return existingCategory;
      }

      const result = await createExpenseCategoryAction(name, false);

      if (result.success && result.data) {
        const newCatData = result.data as any;
        const newCategory: ExpenseCategory = {
          id: newCatData.id,
          name: newCatData.name,
          isDefault: newCatData.isDefault,
          createdAt: new Date(newCatData.createdAt)
        };

        setCategories([...categories, newCategory]);
        return newCategory;
      } else {
        throw new Error(result.error || 'Failed to create category');
      }
    } catch (_error) {
      console.error('Error creating category:', _error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const result = await deleteExpenseCategoryAction(id);

      if (result.success) {
        setCategories(categories.filter(c => c.id !== id));
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    createCategory,
    deleteCategory,
    refreshCategories: loadCategories
  };
};
