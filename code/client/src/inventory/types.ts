// Product types compatible with Prisma schema

export interface Product {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    sellingPrice: number;
    costPrice: number;
    initialStock: number;
    minStock: number;
    stock: number; // current stock (renamed from quantity)
    barcode?: string | null;
    sku?: string | null;
    image?: string | null;

    categoryId?: string | null;
    categoryName?: string; // For display purposes

    supplierId?: string | null;
    supplierName?: string; // For display purposes

    branchId?: string | null;
    userId: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Supplier {
    id: string;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductFilters {
    search: string;
    category: string;
    stockStatus: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
    sortBy: 'name' | 'stock' | 'sellingPrice' | 'costPrice' | 'createdAt';
    sortOrder: 'asc' | 'desc';
}

export interface CreateProductInput {
    name: string;
    description?: string;
    sellingPrice: number;
    costPrice: number;
    initialStock: number;
    minStock: number;
    sku?: string;
    barcode?: string;
    categoryId?: string;
    supplierId?: string;
    image?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    stock?: number;
}

export type SortField = 'name' | 'categoryName' | 'stock' | 'sellingPrice' | 'costPrice' | 'sku';
export type StockStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
