"use client";


import { useState, useEffect, useCallback } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';

export interface CustomerCategory {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useCustomerCategories = () => {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); // Kept for future use or mock
  // const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  const loadCategories = useCallback(async () => {
    if (!currentBusiness) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Mocking for now
      console.warn("Customer categories loading disabled during Supabase removal.");
      setCategories([]);
    } catch (error) {
      console.error('Error loading customer categories:', error);
      toast({
        title: "Error",
        description: "Failed to load customer categories.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness, toast]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createCategory = async (name: string) => {
    console.warn("createCategory disabled");
    toast({ title: "Unavailable", description: "Feature disabled during refactor." });
    return null;
    /*
    // ... original code ...
    */
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateCategory = async (id: string, name: string) => {
    console.warn("updateCategory disabled");
    return false;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteCategory = async (id: string) => {
    console.warn("deleteCategory disabled");
    return false;
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
    loadCategories
  };
};
