"use client";


import { useState, useEffect, useCallback } from 'react';
import { TaskCategory } from '@/components/types/task';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { toast } from 'sonner';
import { 
  getCategoriesAction, 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction 
} from '@/app/tasks/actions';

export const useTaskCategories = () => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();

  const loadCategories = useCallback(async () => {
    if (!user?.id || !currentBusiness?.id) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getCategoriesAction();

      if (result.success && result.data) {
        const rawCategories = result.data as Array<{
          id: string;
          user_id: string;
          location_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        }>;
        const mapped: TaskCategory[] = rawCategories.map(cat => ({
          id: cat.id,
          user_id: cat.user_id,
          location_id: cat.location_id,
          name: cat.name,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        }));
        setCategories(mapped);
      } else {
        throw new Error(result.error || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading task categories:', error);
      toast.error('Failed to load task categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentBusiness?.id]);

  const createCategory = async (name: string): Promise<TaskCategory | null> => {
    if (!user?.id || !currentBusiness?.id) return null;

    try {
      const result = await createCategoryAction(name);

      if (result.success && result.data) {
        const newCat = result.data as {
          id: string;
          user_id: string;
          location_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        const mapped: TaskCategory = {
          id: newCat.id,
          user_id: newCat.user_id,
          location_id: newCat.location_id,
          name: newCat.name,
          created_at: newCat.created_at,
          updated_at: newCat.updated_at
        };
        setCategories(prev => [...prev, mapped]);
        toast.success('Category created successfully');
        return mapped;
      } else {
        throw new Error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating task category:', error);
      toast.error('Failed to create category');
      return null;
    }
  };

  const updateCategory = async (id: string, name: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const result = await updateCategoryAction(id, name);

      if (result.success) {
        setCategories(prev =>
          prev.map(cat => (cat.id === id ? { ...cat, name: name.trim() } : cat))
        );
        toast.success('Category updated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating task category:', error);
      toast.error('Failed to update category');
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const result = await deleteCategoryAction(id);

      if (result.success) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        toast.success('Category deleted successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting task category:', error);
      toast.error('Failed to delete category');
      return false;
    }
  };

  const createDefaultCategories = async () => {
    if (!user?.id || !currentBusiness?.id) return;

    const defaultCategories = ['General', 'Marketing', 'Operations', 'Finance', 'Follow-up'];
    
    try {
      // For each default category, check if it exists and create if not
      // This is less efficient than a bulk check but simpler for now
      // A better way would be a specialized 'createDefaultCategoriesAction'
      for (const name of defaultCategories) {
        const exists = categories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
          await createCategory(name);
        }
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    createDefaultCategories,
    refreshCategories: loadCategories,
  };
};
