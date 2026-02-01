"use client";

import { useState, useEffect } from 'react';
import { getCustomerCategoriesAction, createCustomerCategoryAction, CustomerCategory } from '@/app/customers/actions';

export type { CustomerCategory };

export const useCustomerCategories = () => {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getCustomerCategoriesAction();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error('Failed to load categories:', response.error);
      }
    } catch (error) {
      console.error('Error loading customer categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (name: string) => {
    try {
        const response = await createCustomerCategoryAction(name);
        if (response.success) {
            await loadCategories();
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error creating category:', error);
        return null;
    }
  };

  const updateCategory = async (id: string, name: string) => {
    // TODO: Implement API call
    console.log('Updating category:', id, name);
    return true;
  };

  const deleteCategory = async (id: string) => {
    // TODO: Implement API call
    console.log('Deleting category:', id);
    return true;
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    loadCategories
  };
};
