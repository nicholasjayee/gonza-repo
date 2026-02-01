/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { ProductCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { 
  getCategoriesAction, 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction 
} from '@/app/categories/actions';

export const useCategories = (userId: string | undefined) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  const loadCategories = useCallback(async () => {
    try {
      if (!userId || !currentBusiness) return;
      
      setIsLoading(true);
      const result = await getCategoriesAction();

      if (result.success && result.data) {
        // Map serialized data to ProductCategory
        // Assuming serialized data matches what we need or simple mapping
        const formattedCategories: ProductCategory[] = (result.data as any[]).map(cat => ({
          id: cat.id,
          name: cat.name,
          userId: cat.userId || userId,
          locationId: currentBusiness.id,
          createdAt: cat.createdAt,
          // Add other fields if ProductCategory requires them
        }));
        setCategories(formattedCategories);
      } else {
        throw new Error(result.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load product categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentBusiness, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = async (name: string) => {
    try {
      if (!userId || !currentBusiness) return null;

      const result = await createCategoryAction(name);

      if (result.success && result.data) {
        const data = result.data as any;
        const newCategory: ProductCategory = {
          id: data.id,
          name: data.name,
          userId: userId,
          locationId: currentBusiness.id,
          createdAt: data.createdAt
        };
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      } else if (result.error === "Category already exists") {
         toast({
          title: "Category exists",
          description: "This category already exists.",
          variant: "default"
        });
        // If it exists, detailed data might be in result.data if needed, but for now return null or existing
        return null; 
      }
      
      throw new Error(result.error);
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create category. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      if (!userId) return false;

      const result = await updateCategoryAction(id, name);

      if (result.success && result.data) {
        const data = result.data as any;
        const updatedCategory: ProductCategory = {
          id: data.id,
          name: data.name,
          userId: userId,
          locationId: currentBusiness?.id || '',
          createdAt: data.createdAt
        };
        setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
        return true;
      } else if (result.error === "Another category with this name already exists") {
        toast({
          title: "Category exists",
          description: "Another category with this name already exists.",
          variant: "default"
        });
        return false;
      }

      throw new Error(result.error);
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      if (!userId) return false;

      const result = await deleteCategoryAction(id);

      if (result.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        return true;
      } else {
        // Handle specific error for products using category
        if (result.error && result.error.includes("being used by products")) {
          toast({
            title: "Cannot delete category",
            description: "This category is being used by one or more products.",
            variant: "destructive"
          });
          return false;
        }
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    categories, 
    isLoading, 
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
