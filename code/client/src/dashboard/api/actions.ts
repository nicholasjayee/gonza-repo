'use server';

import { db } from '@gonza/shared/prisma/db';
import { Sale, Expense, Product, SaleItem } from '@/dashboard/types';
import { startOfDay, endOfDay } from 'date-fns';

// Helper to map Prisma Sale to Dashboard Sale type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPrismaSaleToDashboardSale = (prismaSale: any): Sale => {
  return {
    id: prismaSale.id,
    receiptNumber: prismaSale.saleNumber,
    customerName: prismaSale.customerName,
    customerAddress: prismaSale.customerAddress || undefined,
    customerContact: prismaSale.customerPhone || undefined,
    customerId: prismaSale.customerId || undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: prismaSale.items.map((item: any): SaleItem => ({
      description: item.productName,
      quantity: item.quantity,
      price: Number(item.sellingPrice),
      cost: Number(item.unitCost),
      productId: item.productId || undefined,
      discountPercentage: 0, 
      discountType: 'amount',
      discountAmount: Number(item.discount),
      createdAt: item.createdAt.toISOString(),
    })),
    paymentStatus: (prismaSale.paymentStatus === 'UNPAID' ? 'NOT PAID' : 
                   prismaSale.paymentStatus === 'PAID' ? 'Paid' :
                   prismaSale.paymentStatus === 'QUOTE' ? 'Quote' :
                   prismaSale.paymentStatus === 'INSTALLMENT' ? 'Installment Sale' : 'NOT PAID') as Sale['paymentStatus'],
    profit: Number(prismaSale.total) - Number(prismaSale.subtotal), 
    date: prismaSale.date,
    taxRate: Number(prismaSale.taxRate),
    cashTransactionId: prismaSale.cashAccountId || undefined,
    amountPaid: Number(prismaSale.amountPaid),
    amountDue: Number(prismaSale.balance),
    notes: undefined, 
    categoryId: undefined, 
    createdAt: prismaSale.createdAt,
  };
};

export async function getSales(startDate?: Date, endDate?: Date, branchId?: string): Promise<Sale[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      };
    }
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    const sales = await db.sale.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return sales.map(mapPrismaSaleToDashboardSale);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
}

export async function getExpenses(startDate?: Date, endDate?: Date, branchId?: string): Promise<Expense[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      };
    }
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    const expenses = await db.expense.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return expenses.map((expense: any): Expense => ({
      id: expense.id,
      amount: Number(expense.amount),
      description: expense.description,
      category: expense.category,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      personInCharge: null, 
      receiptImage: expense.receiptImage,
      cashAccountId: null, 
      cashTransactionId: null,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function getProducts(branchId?: string): Promise<Product[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    const products = await db.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return products.map((product: any): Product => ({
      id: product.id,
      itemNumber: product.sku || '', 
      name: product.name,
      description: product.description,
      category: product.categoryId || '', 
      quantity: product.stock,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
      supplier: product.supplierId || null,
      imageUrl: product.image,
      minimumStock: product.minStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
