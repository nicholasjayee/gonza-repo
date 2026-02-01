/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import {
  getSaleCategoriesAction,
  createSaleCategoryAction,
  updateSaleCategoryAction,
  deleteSaleCategoryAction,
  createBulkSaleCategoriesAction
} from '@/app/sales/actions';
import { SalesCategory } from '@/types';
import { useCallback } from 'react';

export const useSalesCategories = () => {
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();
  const queryClient = useQueryClient();

  const queryKey = ['sale_categories', currentBusiness?.id];

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<SalesCategory[]> => {
      if (!currentBusiness) return [];
      const result = await getSaleCategoriesAction();
      if (result.success && result.data) {
        return (result.data as any[]).map(cat => ({
          id: cat.id,
          name: cat.name,
          user_id: cat.userId,
          location_id: cat.branchId,
          is_default: cat.isDefault,
          created_at: cat.createdAt,
          updated_at: cat.updatedAt
        }));
      }
      throw new Error(result.error || 'Failed to fetch categories');
    },
    enabled: !!currentBusiness,
  });

  const createCategory = async (name: string) => {
    try {
      const result = await createSaleCategoryAction(name);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Category created successfully"
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      const result = await updateSaleCategoryAction(id, name);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const result = await deleteSaleCategoryAction(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
      return false;
    }
  };

  const createDefaultCategories = useCallback(async () => {
    const defaults = [
      { name: 'Retail', isDefault: true },
      { name: 'Online', isDefault: true },
      { name: 'Wholesale', isDefault: true },
    ];
    try {
      const result = await createBulkSaleCategoriesAction(defaults);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  }, [queryClient, queryKey]);

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    createDefaultCategories,
    refetch,
  };
};