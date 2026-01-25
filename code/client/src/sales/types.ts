export type SaleSource = 'WALK_IN' | 'PHONE' | 'ONLINE' | 'REFERRAL' | 'RETURNING';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'QUOTE' | 'INSTALLMENT' | 'PARTIAL';
export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export interface SaleItem {
    id: string;
    saleId: string;
    productId?: string | null;
    productName: string;
    sku?: string | null;
    quantity: number;
    unitCost: number;
    sellingPrice: number;
    discount: number;
    lineTotal: number;
    createdAt: Date;
}

export interface Sale {
    id: string;
    saleNumber: string;
    date: Date;
    customerId?: string | null;
    customerName: string;
    customerPhone?: string | null;
    customerAddress?: string | null;
    source: SaleSource;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    discountType: DiscountType;
    taxRate: number;
    taxAmount: number;
    total: number;
    paymentStatus: PaymentStatus;
    amountPaid: number;
    balance: number;
    cashAccountId?: string | null;
    branchId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSaleItemInput {
    productId?: string;
    productName: string;
    sku?: string;
    quantity: number;
    unitCost: number;
    sellingPrice: number;
    discount: number;
}

export interface CreateSaleInput {
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    customerId?: string;
    source: SaleSource;
    items: CreateSaleItemInput[];
    discount: number;
    discountType: DiscountType;
    taxRate: number;
    paymentStatus: PaymentStatus;
    amountPaid: number;
    cashAccountId?: string;
}

export interface BranchSettings {
    id: string;
    branchId: string;
    businessName: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logo?: string | null;
    currency: string;
    timezone: string;
    enableSignature: boolean;
    signatureImage?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
