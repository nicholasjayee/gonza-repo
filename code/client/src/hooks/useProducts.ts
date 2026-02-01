"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductFormData, ProductFilters } from '@/types';
import { useProductFilters } from './useProductFilters';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clearInventoryCaches } from '@/utils/inventoryCacheUtils';
import {
  getInventoryProductsAction,
  createProductAction,
  updateProductAction,
  updateProductsBulkAction,
  deleteProductAction
} from '@/app/inventory/actions';
import { useToast } from '@/hooks/use-toast';

export const useProducts = (userId: string | undefined, initialPageSize: number = 50) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const { currentBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { filters, setFilters, filteredProducts } = useProductFilters(products);

  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  const setFiltersWithTypingState = useCallback((newFilters: ProductFilters) => {
    if (newFilters.search !== filters.search) {
      setIsTyping(true);
      if (typingTimer) clearTimeout(typingTimer);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 600);
      setTypingTimer(timer);
    }
    setFilters(newFilters);
  }, [filters.search, typingTimer, setFilters]);

  const baseQueryKey = useMemo(() => ['products', userId, currentBusiness?.id], [userId, currentBusiness?.id]);
  const queryKey = useMemo(() => [...baseQueryKey, page, pageSize, filters.search, filters.category, filters.stockStatus], [baseQueryKey, page, pageSize, filters.search, filters.category, filters.stockStatus]);

  const { data: queriedData, isLoading: isQueryLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId || !currentBusiness) return { products: [], count: 0 };
      const result = await getInventoryProductsAction(filters, page, pageSize);
      if (result.success && result.data) {
        interface SerializedProduct {
          id: string;
          name: string;
          description: string;
          category: string;
          quantity: number;
          sellingPrice: number;
          costPrice: number;
          image: string | null;
          supplier: string | null | undefined;
          itemNumber: string;
          barcode: string | null;
          minimumStock: number;
          locationId: string | null;
          userId: string;
          createdAt: string | Date;
          updatedAt: string | Date;
        }
        return {
          products: (result.data.products as SerializedProduct[]).map(p => ({
            id: p.id,
            itemNumber: p.itemNumber,
            name: p.name,
            description: p.description,
            category: p.category,
            quantity: p.quantity,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            supplier: p.supplier,
            imageUrl: p.image,
            minimumStock: p.minimumStock,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          })) as Product[],
          count: result.data.count
        };
      }
      const errResult = result as { success: false; error: string };
      throw new Error(errResult.error || 'Failed to fetch products');
    },
    enabled: !!userId && !!currentBusiness?.id,
    staleTime: 30_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    if (queriedData) {
      setProducts(queriedData.products);
      setTotalCount(queriedData.count);
    }
  }, [queriedData]);

  const isLoading = (isQueryLoading && !queriedData) && !isTyping;

  const createProduct = async (productData: ProductFormData): Promise<Product | null> => {
    try {
      if (!userId || !currentBusiness) return null;

      const result = await createProductAction(productData);
      if (result.success && result.data) {
         interface NewProductRaw {
           id: string;
           sku: string;
           barcode: string;
           name: string;
           description: string | null;
           category: { name: string } | null;
           stock: number;
           costPrice: number;
           sellingPrice: number;
           supplier: { name: string } | null;
           image: string | null;
           minStock: number;
           createdAt: string | Date;
           updatedAt: string | Date;
         }
         const p = result.data as NewProductRaw;
         const newProduct: Product = {
            id: p.id,
            itemNumber: p.sku || p.barcode || '',
            name: p.name,
            description: p.description || '',
            category: p.category?.name || 'Uncategorized',
            quantity: p.stock,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            supplier: p.supplier?.name || '',
            imageUrl: p.image,
            minimumStock: p.minStock,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
         };
         queryClient.invalidateQueries({ queryKey: baseQueryKey });
         clearInventoryCaches(queryClient);
         toast({ title: "Success", description: "Product created successfully" });
         return newProduct;
      }
      const errResult = result as { success: false; error: string };
      throw new Error(errResult.error);
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      const message = error instanceof Error ? error.message : "Failed to create product";
      toast({ title: "Error", description: message, variant: "destructive" });
      return null;
    }
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Product>,
    _: File | null = null,
    __: boolean = false,
    customChangeReason?: string,
    ___: Date = new Date(),
    referenceId?: string,
    ____: string = ""
  ): Promise<boolean> => {
    void _; void __; void ___; void ____;
    try {
      if (!userId) return false;

      // Note: Image upload logic should be handled by the caller or a separate utility
      // if imageFile is provided. For now we focus on the basic update.

      const result: { success: boolean; error?: string } = await updateProductAction(id, updates, customChangeReason, referenceId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: baseQueryKey });
        clearInventoryCaches(queryClient);
        return true;
      }
      throw new Error(result.error);
    } catch (error: unknown) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      if (!userId) return false;
      const result: { success: boolean; error?: string } = await deleteProductAction(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: baseQueryKey });
        clearInventoryCaches(queryClient);
        toast({ title: "Success", description: "Product deleted successfully" });
        return true;
      }
      throw new Error(result.error);
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      return false;
    }
  };

  const updateProductsBulk = async (
    updates: Array<{ id: string; updated: Partial<Product>; imageFile?: File | null }>,
    userIdForHistory?: string,
    changeReason?: string,
    referenceId?: string,
    _: Date = new Date(),
    __: string = ""
  ): Promise<boolean> => {
    void _; void __;
    try {
      const result: { success: boolean; error?: string } = await updateProductsBulkAction(updates, userIdForHistory, changeReason, referenceId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: baseQueryKey });
        clearInventoryCaches(queryClient);
        return true;
      }
      throw new Error(result.error);
    } catch (error: unknown) {
      console.error('Error in updateProductsBulk:', error);
      return false;
    }
  };

  // Removed realtime subscription as per policy (using React Query invalidation)

  return {
    products,
    isLoading,
    loadProducts: refetch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    createProduct,
    updateProduct,
    updateProductsBulk,
    deleteProduct,
    uploadProductImage: async () => null, // Placeholder or implement storage upload
    refetch,
    isFetching,
    filters,
    setFilters: setFiltersWithTypingState,
    filteredProducts
  };
};
