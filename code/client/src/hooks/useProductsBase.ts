/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { getInventoryProductsAction } from '@/app/inventory/actions';

/**
 * Base hook for fetching and storing products
 */
export const useProductsBase = (userId: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  const loadProducts = async () => {
    try {
      if (!userId || !currentBusiness?.id) return;
      
      setIsLoading(true);
      
      // Fetch all products (passing empty filters)
      const result = await getInventoryProductsAction({} as any, 1, 1000); // Fetch adequate amount for suggestions

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch products");
      }

      // Result data is already formatted/serialized by the action, 
      // but we need to ensure it matches the Product interface if there are minor discrepancies
      const fetchedProducts = result.data.products as any[];
      
      const formattedProducts: Product[] = fetchedProducts.map(p => ({
        id: p.id,
        itemNumber: p.itemNumber || '',
        name: p.name,
        description: p.description || '',
        category: p.category,
        quantity: p.quantity,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        supplier: p.supplier || '',
        imageUrl: p.image || null,
        minimumStock: p.minimumStock,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
      
      setProducts(formattedProducts);
      return formattedProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && currentBusiness?.id) {
        loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentBusiness?.id]);

  return {
    products,
    isLoading,
    setProducts,
    loadProducts
  };
};
