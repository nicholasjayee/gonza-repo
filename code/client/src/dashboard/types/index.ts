export interface Product {
  id: string;
  itemNumber?: string;
  name: string;
  description?: string | null;
  category?: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string | null;
  imageUrl?: string | null;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  description: string;
  quantity: number;
  price: number;
  cost: number;
  productId?: string;
  discountPercentage?: number;
  discountType?: 'amount' | 'percentage';
  discountAmount?: number;
  createdAt?: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerAddress?: string;
  customerContact?: string;
  customerId?: string;
  items: SaleItem[];
  paymentStatus: 'Paid' | 'NOT PAID' | 'Quote' | 'Installment Sale' | 'Partial';
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
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  paymentMethod?: string | null;
  personInCharge?: string | null;
  receiptImage?: string | null;
  cashAccountId?: string | null;
  cashTransactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLogo?: string;
  currency: string;
  signature?: string;
  paymentInfo?: string;
  defaultPrintFormat?: 'standard' | 'thermal';
}

export interface AnalyticsData {
  totalSales: number;
  totalProfit: number;
  totalCost: number;
  paidSalesCount: number;
  pendingSalesCount: number;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  birthday: Date | null;
  location: string | null;
  categoryId: string | null;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    other?: string;
  } | null;
  gender: string | null;
  tags: string[] | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormErrors {
  customerName?: string;
  customerAddress?: string;
  customerContact?: string;
  itemDescription?: string;
  quantity?: string;
  salePrice?: string;
  costOfProduction?: string;
  taxRate?: string;
}

export interface SaleFormData {
  customerName: string;
  customerAddress: string;
  customerContact: string;
  items: SaleItem[];
  paymentStatus: "Paid" | "NOT PAID" | "Quote" | "Installment Sale";
  receiptNumber?: string;
  taxRate?: number | null;
  amountPaid?: number;
  amountDue?: number;
  notes?: string;
  categoryId?: string;
}
