"use client";
import { useState, useEffect } from "react";
import { ProductCategory } from "@/inventory/types/";
import { useToast } from "@/inventory/hooks/use-toast";
import { useBusiness } from "@/inventory/contexts/BusinessContext";
import { getCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/inventory/actions";

export const useCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  const loadCategories = async () => {
    try {
      if (!currentBusiness) return;

      setIsLoading(true);
      setIsLoading(true);
      const res = await getCategoriesAction();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to load categories",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "Failed to load product categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [currentBusiness?.id]);

  const createCategory = async (name: string) => {
    try {
      const res = await createCategoryAction(name);
      if (res.success && res.data) {
        setCategories([...categories, res.data]);
        return res.data;
      }
      throw new Error(res.error);
    } catch (error) {
       console.error(error);
       return null;
    }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      const res = await updateCategoryAction(id, name);
      if (res.success) {
        setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
        return true;
      }
       throw new Error(res.error);
    } catch (error) {
       console.error(error);
       return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== id));
        return true;
      }
       throw new Error(res.error);
    } catch (error) {
       console.error(error);
       return false;
    }
  };

  return {
    categories,
    isLoading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
