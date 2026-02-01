/* eslint-disable @typescript-eslint/no-explicit-any */

import { Product } from '@/types';
// import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStockHistory } from '@/hooks/useStockHistory';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';

/**
 * Hook for Create, Read, Update, Delete operations on products
 */
export const useProductCRUD = (
  userId: string | undefined,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  const { toast } = useToast();
  const { createStockHistoryEntry } = useStockHistory(userId);
  const { currentBusiness } = useBusiness();
  const { logActivity } = useActivityLogger();

  const createProduct = async (productData: Partial<Product> & { createdAt?: Date }) => {
    try {
      if (!userId || !currentBusiness) {
        toast({
          title: "Error",
          description: "You must be logged in and have a business selected to create products",
          variant: "destructive"
        });
        return null;
      }

      console.log('useProductCRUD - Creating product with data:', productData);

      // TODO: Replace with server action
      // const result = await createProductAction(productData);
      
      console.warn("Product creation temporarily disabled during refactor to Server Actions.");
      toast({
         title: "Refactor in progress",
         description: "Product creation is currently being updated to use Server Actions.",
         variant: "default"
      });
      
      return null;
      /*
      // Original logic removed to break dependency on supabase-js client
      */
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateProduct = async (
    productId: string,
    productData: Partial<Product> & { createdAt?: Date },
    referenceId?: string,
    isFromSale = false,
    customChangeReason?: string
  ) => {
    try {
      if (!userId || !currentBusiness) return false;

      // MOCK: Get current product from local state instead of DB
      const currentProduct: Product | null = products.find(p => p.id === productId) || null;

      /* 
      // TEMPORARILY DISABLED SUPABASE LOGIC
      if (productData.quantity !== undefined) {
        // ... (Supabase select logic was here)
      }
      */

      // Prepare data for update (excluding item_number as it's auto-generated and shouldn't be updated)
      const updateData: { [key: string]: any } = {};
      if (productData.name !== undefined) updateData.name = productData.name;
      // ... (other assignments)

      /*
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();
      
      if (error) throw error;
      */

      // MOCK SUCCESS FOR NOW
      console.warn('Product update is currently mocked pending Server Actions implementation.');
      const data = { ...updateData, id: productId } as any; 

      if (data) {
        // const updatedProduct = mapDbProductToProduct(data as DbProduct);
        // Using partial mock mapping for now since we don't have full DB record
        const updatedProduct: Product = {
             ...products.find(p => p.id === productId)!,
             ...productData,
             updatedAt: new Date()
        } as Product;

        // Update local state
        const updatedProducts = products.map(p => p.id === productId ? updatedProduct : p);
        setProducts(updatedProducts);

        // Create stock history entry if quantity changed and not skipping history
        if (productData.quantity !== undefined && currentProduct && customChangeReason !== 'skip-history') {
          // Use custom change reason if provided, otherwise determine reason based on context
          let changeReason = "";

          if (customChangeReason) {
            changeReason = customChangeReason;
          } else if (isFromSale && productData.quantity < currentProduct.quantity) {
            changeReason = "Sale";
          } else if (currentProduct.quantity === 0 && productData.quantity > 0) {
            // First time adding stock to a product that had 0 stock - this is initial stock
            changeReason = "Initial stock";
          } else if (productData.quantity > currentProduct.quantity) {
            changeReason = "Manual stock addition";
          } else {
            changeReason = "Manual stock reduction";
          }

          await createStockHistoryEntry(
            productId,
            currentProduct.quantity,
            productData.quantity,
            changeReason,
            referenceId,
            undefined,
            undefined,
            currentProduct.name
          );
        }

        // Log activity for product update
        await logActivity({
          activityType: 'UPDATE',
          module: 'INVENTORY',
          entityType: 'product',
          entityId: productId,
          entityName: updatedProduct.name,
          description: `Updated product "${updatedProduct.name}"${currentProduct && productData.quantity !== undefined ? ` - Stock changed from ${currentProduct.quantity} to ${productData.quantity}` : ''}`,
          metadata: {
            changes: updateData,
            previousQuantity: currentProduct?.quantity,
            newQuantity: productData.quantity
          }
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      if (!userId) return false;

      // Get product details before deletion for logging
      const productToDelete = products.find(p => p.id === productId);

      /*
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      */
      console.warn('Product deletion is currently mocked pending Server Actions implementation.');

      // Update local state
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);

      // Log activity
      if (productToDelete) {
        await logActivity({
          activityType: 'DELETE',
          module: 'INVENTORY',
          entityType: 'product',
          entityId: productId,
          entityName: productToDelete.name,
          description: `Deleted product "${productToDelete.name}"`,
          metadata: {
            itemNumber: productToDelete.itemNumber,
            category: productToDelete.category,
            lastQuantity: productToDelete.quantity
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct
  };
};
