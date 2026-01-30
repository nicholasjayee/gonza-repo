"use client";
import { useState } from "react";

import { useProducts } from "@/inventory/hooks/useProducts";
import { useCategories } from "@/inventory/hooks/useCategories";
import { ProductFormData } from "@/inventory/types/";
import { toast } from "sonner";

export const useBulkProducts = () => {
  const { createProduct, deleteProduct } = useProducts();
  const { categories, createCategory } = useCategories();
  const [isUploading, setIsUploading] = useState(false);
  
  // Selection state for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleAllProducts = (productIds: string[]) => {
    setSelectedProductIds((prev) => {
      if (prev.size === productIds.length) {
        return new Set();
      }
      return new Set(productIds);
    });
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const bulkDeleteProducts = async (ids: Set<string>) => {
    let successCount = 0;
    let failCount = 0;
    
    for (const id of Array.from(ids)) {
      const success = await deleteProduct(id);
      if (success) successCount++;
      else failCount++;
    }

    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} products`);
    }
    
    return successCount > 0;
  };

  const createMissingCategories = async (productCategories: string[]) => {
    const existingCategoryNames = categories.map((cat) =>
      cat.name.toLowerCase(),
    );
    const uniqueCategories = [
      ...new Set(productCategories.filter((cat) => cat.trim() !== "")),
    ];
    const missingCategories = uniqueCategories.filter(
      (category) => !existingCategoryNames.includes(category.toLowerCase()),
    );

    const createdCategories: string[] = [];
    const failedCategories: string[] = [];

    for (const categoryName of missingCategories) {
      try {
        const result = await createCategory(categoryName);
        if (result) {
          createdCategories.push(categoryName);
        } else {
          failedCategories.push(categoryName);
        }
      } catch (error) {
        console.error(`Failed to create category ${categoryName}:`, error);
        failedCategories.push(categoryName);
      }
    }

    return { createdCategories, failedCategories };
  };

  const bulkCreateProducts = async (
    products: ProductFormData[],
    progressCallback?: (current: number, total: number) => void,
  ) => {
    // Auth check handled by server actions

    setIsUploading(true);
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    try {
      // Extract all categories from products
      const productCategories = products
        .map((p) => p.category)
        .filter((c): c is string => !!c);

      // Create missing categories first
      if (productCategories.length > 0) {
        const { createdCategories, failedCategories } =
          await createMissingCategories(productCategories);

        if (createdCategories.length > 0) {
          toast.success(`Created ${createdCategories.length} new categories`);
        }

        if (failedCategories.length > 0) {
          toast.error(`Failed to create ${failedCategories.length} categories`);
        }
      }

      // Now create products with progress tracking
      for (let i = 0; i < products.length; i++) {
        const productData = products[i];

        try {
          const result = await createProduct(productData);
          if (result) {
            successCount++;
          } else {
            failureCount++;
            errors.push(`Failed to create product: ${productData.name}`);
          }
        } catch (error) {
          failureCount++;
          errors.push(`Error creating ${productData.name}: ${error}`);
          console.error(`Error creating product ${productData.name}:`, error);
        }

        // Update progress after each product
        if (progressCallback) {
          progressCallback(successCount + failureCount, products.length);
        }
      }

      // Show summary toast only if no progress callback (for regular usage)
      if (!progressCallback) {
        if (successCount > 0) {
          toast.success(`Successfully created ${successCount} products`);
        }

        if (failureCount > 0) {
          toast.error(`${failureCount} products failed to upload`);
        }
      }

      return { successCount, failureCount, errors };
    } finally {
      setIsUploading(false);
    }
  };

  const detectNewCategories = (products: ProductFormData[]): string[] => {
    const existingCategoryNames = categories.map((cat) =>
      cat.name.toLowerCase(),
    );
    const productCategories = products
      .map((p) => p.category)
      .filter((c): c is string => !!c);
    const uniqueCategories = [...new Set(productCategories)];

    return uniqueCategories.filter(
      (category) => !existingCategoryNames.includes(category.toLowerCase()),
    );
  };

  return {
    bulkCreateProducts,
    detectNewCategories,
    isUploading,
    selectedProductIds,
    toggleProductSelection,
    toggleAllProducts,
    clearSelection,
    bulkDeleteProducts
  };
};
