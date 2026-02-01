
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface SaleItem {
  description: string;
  quantity: number;
  price: number;
  cost: number;
  productId?: string;
  discountPercentage?: number;
  discountType?: 'percentage' | 'amount';
  discountAmount?: number;
  createdAt?: string;
}

export interface SalesCategory {
  id: string;
  user_id: string;
  location_id?: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerAddress?: string;
  customerContact?: string;
  customerPhone?: string; 
  customerId?: string;
  items: SaleItem[];
  paymentStatus: PaymentStatus;
  profit: number;
  date: Date;
  taxRate?: number;
  cashTransactionId?: string;
  amountPaid?: number;
  amountDue?: number;
  notes?: string;
  categoryId?: string;
  installments?: Array<{
    date?: string | Date;
    amountPaid?: number;
  }>;
  createdAt: Date;
  source?: SaleSource;
}

export interface DbSale {
  id: string;
  user_id: string;
  location_id: string;
  receipt_number: string;
  customer_name: string;
  customer_address?: string | null;
  customer_contact?: string | null;
  customer_id?: string | null;
  items: Json;
  payment_status: string;
  profit: number;
  date: string;
  tax_rate?: number | null;
  created_at: string;
  updated_at: string;
  cash_transaction_id?: string | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  notes?: string | null;
  category_id?: string | null;
}

export interface SaleFormData {
  customerName: string;
  customerAddress: string;
  customerContact: string;
  items: SaleItem[];
  paymentStatus: PaymentStatus;
  receiptNumber?: string;
  taxRate?: number | null;
  amountPaid?: number;
  amountDue?: number;
  notes?: string;
  categoryId?: string;
}

// Analytics data type
export interface AnalyticsData {
  totalSales: number;
  totalProfit: number;
  totalCost: number;
  pendingSalesCount: number;
}

export type PaymentStatus = 'PAID' | 'UNPAID' | 'QUOTE' | 'INSTALLMENT' | 'PARTIAL';
export type SaleSource = 'WALK_IN' | 'PHONE' | 'ONLINE' | 'REFERRAL' | 'RETURNING';

export interface CreateSaleItemInput {
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  discount: number;
  description?: string;
}

export interface CreateSaleInput {
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  source?: SaleSource;
  items: CreateSaleItemInput[];
  subtotal?: number;
  discountType: 'PERCENTAGE' | 'AMOUNT';
  discount: number;
  taxRate: number;
  taxAmount?: number;
  total?: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  cashAccountId?: string;
}
