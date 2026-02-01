export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = {
    id: string;
    name: string;
};

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

export interface Product {
  id: string;
  itemNumber: string; 
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string | null;
  imageUrl: string | null;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbProduct {
  id: string;
  user_id: string;
  item_number: string;
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  supplier: string | null;
  image_url: string | null;
  minimum_stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category?: string;
  quantity: number; 
  costPrice?: number;
  sellingPrice?: number;
  supplier?: string;
  minimumStock?: number;
  imageFile?: File | null;
  imageUrl?: string | null;
  createdAt?: Date; 
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  changeReason: string;
  referenceId?: string | null;
  receiptNumber?: string;
  createdAt: Date;
  product?: {
    name: string;
    costPrice: number;
    sellingPrice: number;
    itemNumber: string;
  };
}

export interface DbStockHistoryEntry {
  id: string;
  user_id: string;
  product_id: string;
  previous_quantity: number;
  new_quantity: number;
  change_reason: string;
  reference_id?: string | null;
  created_at: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  stockStatus: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
}

export interface DbProductCategory {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
