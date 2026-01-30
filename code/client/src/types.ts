export * from '@/products/types';
export * from '@/sales/types';

export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    isActive?: boolean;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    status?: string;
    stockStatus?: string;
}

export type ProductCategory = {
    id: string;
    name: string;
};

export interface StockHistoryEntry {
    id: string;
    productId: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason?: string;
    changeReason?: string; // Alias or specific reason
    receiptNumber?: string;
    referenceId?: string;
    oldQuantity: number;
    newQuantity: number;
    createdAt: Date;
    user?: {
        name: string;
    };
    product?: {
        name: string;
        costPrice: number;
        sellingPrice: number;
    };
}

export interface ProductFormData {
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    minStock: number;
    minimumStock?: number; // Alias
    costPrice: number;
    sellingPrice: number;
    categoryId?: string;
    category?: string; // Alias or name
    supplierId?: string;
    supplier?: string; // Alias or name
    image?: string;
}

export const mapDbProductToProduct = (dbProduct: unknown): unknown => dbProduct;
export const mapDbSaleToSale = (dbSale: unknown): unknown => dbSale;
export const mapDbProductCategoryToProductCategory = (dbCategory: unknown): unknown => dbCategory;
