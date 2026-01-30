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

export interface Product {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  sellingPrice: number;
  costPrice: number;
  initialStock: number;
  minStock: number;
  stock: number;
  barcode?: string | null;
  sku?: string | null;
  image?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
