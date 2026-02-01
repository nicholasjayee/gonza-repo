/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
// ... existing imports

export async function getTransactionsAction() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20 // Limit for now
    });
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
}

// ... existing code
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { NextRequest } from "next/server";

async function getAuth() {
  const headerList = await headers();
  const cookieStore = await cookies();

  const mockReq = {
    headers: headerList,
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  } as unknown as NextRequest;

  return authGuard(mockReq, ["user", "admin"]);
}

export async function getSalesAction(options?: { 
  userId?: string; 
  pageSize?: number; 
  skip?: number; 
  sortOrder?: 'asc' | 'desc' 
}) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const { userId, pageSize, skip, sortOrder = 'desc' } = options || {};

    const sales = await db.sale.findMany({
      where: {
        branchId,
        ...(userId ? { userId } : {}),
      },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
        customer: true,
        branch: { select: { name: true } },
      },
      orderBy: { date: sortOrder },
      ...(pageSize ? { take: pageSize } : {}),
      ...(skip ? { skip } : {}),
    });

    return { success: true, data: serialize(sales) };
  } catch (error: unknown) {
    console.error("Error fetching sales:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch sales";
    return { success: false, error: message };
  }
}

// Separate action for "deleted" sales if we implement soft delete or logging.
// Legacy seemed to have `useDeletedSales`. If we don't have soft delete, we might mock returns empty.
export async function getDeletedSalesAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");
  
  // Return empty or implement if schema supports it or we use a separate log
  return { success: true, data: [] };
}

export type CreateSaleDTO = {
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    sellingPrice: number;
    unitCost?: number;
    discount?: number;
  }[];
  paymentStatus: "PAID" | "UNPAID" | "PARTIAL" | "QUOTE";
  customerId?: string;
  customerName?: string; // Added field
  source?: "WALK_IN" | "PHONE" | "ONLINE";
  discount?: number;
  amountPaid?: number;
  taxRate?: number;
  date?: Date;
  cashAccountId?: string;
};

// Helper to generate sale number
async function generateSaleNumber(branchId: string): Promise<string> {
  const count = await db.sale.count({
    where: { branchId }
  });
  const prefix = "SALE";
  const timestamp = new Date().getFullYear().toString().substr(-2);
  const padding = (count + 1).toString().padStart(5, '0');
  
  return `${prefix}-${timestamp}-${padding}`;
}

export async function createSaleAction(data: CreateSaleDTO) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const saleNumber = await generateSaleNumber(branchId);

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const totalDiscount = data.discount || 0; 
    const total = subtotal - totalDiscount;

    const sale = await db.sale.create({
      data: {
        saleNumber,
        branchId,
        userId: auth.user.id,
        customerId: data.customerId,
        customerName: data.customerName || "Walk-in Customer", // Use provided name or default
        source: data.source || "WALK_IN",
        paymentStatus: data.paymentStatus,
        subtotal,
        discount: totalDiscount,
        total: total,
        amountPaid: data.amountPaid || 0,
        balance: total - (data.amountPaid || 0),
        cashAccountId: data.cashAccountId,
        date: data.date || new Date(),
        items: {
          create: data.items.map(item => ({
             productId: item.productId,
             productName: item.productName,
             quantity: item.quantity,
             sellingPrice: item.sellingPrice,
             unitCost: item.unitCost || 0,
             lineTotal: (item.sellingPrice * item.quantity) - (item.discount || 0)
          }))
        }
      },
      include: { items: true }
    });

    // Update stock levels
    if (data.paymentStatus !== "QUOTE") {
      for (const item of data.items) {
        if (item.productId) {
          await db.product.update({
             where: { id: item.productId },
             data: { stock: { decrement: item.quantity } }
          });
          
          // Add history entry?
          await db.productHistory.create({
            data: {
               productId: item.productId,
               type: "SALE",
               quantityChange: -item.quantity,
               oldStock: 0, // Need to fetch? optimization point
               newStock: 0, // Need to fetch?
               reason: `Sale ${saleNumber}`,
               userId: auth.user.id,
               referenceId: sale.id,
               referenceType: "SALE"
            }
          });
        }
      }
    }

    return { success: true, data: serialize(sale) };
  } catch (error: unknown) {
    console.error("Error creating sale:", error);
    const message = error instanceof Error ? error.message : "Failed to create sale";
    return { success: false, error: message };
  }
}

export async function deleteSaleAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Start a transaction to ensure atomic deletion
    return await db.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id, branchId },
        include: { items: true }
      });

      if (!sale) throw new Error("Sale not found or unauthorized");

      // 1. Restore stock
      if (sale.paymentStatus !== "QUOTE") {
        for (const item of sale.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });

            // Log stock restoration
            await tx.productHistory.create({
              data: {
                productId: item.productId,
                type: "RESTOCK",
                quantityChange: item.quantity,
                oldStock: 0, // Simplified
                newStock: 0, // Simplified
                reason: `Sale ${sale.saleNumber} deleted`,
                userId: auth.user.id,
                referenceId: sale.id,
                referenceType: "SALE_DELETED"
              }
            });
          }
        }
      }

      // 2. Delete associated transaction if exists
      if (sale.cashAccountId) {
        // We might want to find the transaction first. 
        // Prisma schema for Sale doesn't explicitly link to a Transaction ID besides being related to a User/Branch.
        // But legacy code says `saleToDelete.cashTransactionId`.
        // Let's check schema for transaction link.
      }

      // 3. Delete the sale (Prisma onCascade should handle items if configured, or we delete them)
      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });

      return { success: true };
    });
  } catch (error: unknown) {
    console.error("Error deleting sale:", error);
    const message = error instanceof Error ? error.message : "Failed to delete sale";
    return { success: false, error: message };
  }
}

// Update action if needed

export async function updateSaleCustomerAction(saleId: string, customerId: string) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const updatedSale = await db.sale.update({
      where: { id: saleId, branchId },
      data: { customerId }
    });

    return { success: true, data: serialize(updatedSale) };
  } catch (error: any) {
    console.error("Error updating sale customer:", error);
    return { success: false, error: error.message || "Failed to update sale" };
  }
}

export async function deleteSalePermanentlyAction(saleId: string) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    await db.sale.delete({
      where: { id: saleId, branchId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error permanently deleting sale:", error);
    return { success: false, error: error.message || "Failed to delete sale" };
  }
}

export type ManualEntryDTO = {
  customerId: string;
  customerName: string;
  amount: number;
  description: string;
  date: Date;
};

async function generateManualReceiptNumber(branchId: string, type: 'ADJ' | 'PAY'): Promise<string> {
   // Use a similar approach to sales but maybe a different sequence or simple counter logic if acceptable.
   // Or just use the main sale counter? The legacy code used existing sales max + 1.
   // We can reuse generateSaleNumber logic but prefix it.
   // But generateSaleNumber uses SALE-YY-XXXXX.
   // Legacy used ADJ-XXXXXX.
   // Let's implement independent counter via finding last receipt of that type?
   // Or simpler: Find last sale with receiptNumber starting with ADJ/PAY.
   
   const prefix = type + '-';
   const lastSale = await db.sale.findFirst({
      where: { 
          branchId,
          saleNumber: { startsWith: prefix }
      },
      orderBy: { createdAt: 'desc' },
      select: { saleNumber: true }
   });

   let nextNum = 1;
   if (lastSale?.saleNumber) {
       const parts = lastSale.saleNumber.split('-');
       if (parts.length > 1) {
           const numPart = parts[1]; // Assuming ADJ-XXXXXX
           const parsed = parseInt(numPart, 10);
           if (!isNaN(parsed)) nextNum = parsed + 1;
       }
   }
   
   return nextNum.toString().padStart(6, '0');
}

export async function addManualChargeAction(data: ManualEntryDTO) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const receiptNum = await generateManualReceiptNumber(branchId, 'ADJ');
    const saleNumber = `ADJ-${receiptNum}`;

    const sale = await db.sale.create({
      data: {
        userId: auth.user.id,
        branchId,
        saleNumber, // This field is unique.
        customerId: data.customerId,
        customerName: data.customerName,
        date: data.date,
        paymentStatus: 'UNPAID', // Was 'NOT PAID'
        subtotal: data.amount,
        total: data.amount,
        balance: data.amount, 
        amountPaid: 0,
        source: 'WALK_IN', 
        items: {
          create: {
            productName: data.description || 'Manual Charge',
            quantity: 1,
            sellingPrice: data.amount,
            lineTotal: data.amount,
            unitCost: 0,
          }
        }
      },
      include: {
        items: true
      }
    });

    return { success: true, data: serialize(sale) };
  } catch (error: any) {
    console.error("Error adding manual charge:", error);
    return { success: false, error: error.message || "Failed to add charge" };
  }
}

export async function addManualPaymentAction(data: ManualEntryDTO) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const receiptNum = await generateManualReceiptNumber(branchId, 'PAY');
    const saleNumber = `PAY-${receiptNum}`;

    const sale = await db.sale.create({
      data: {
        userId: auth.user.id,
        branchId,
        saleNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        date: data.date,
        paymentStatus: 'PAID',
        subtotal: 0,
        total: 0,
        amountPaid: data.amount, // Payment amount
        balance: 0,
        items: {
            create: {
                productName: data.description || 'Account Payment',
                quantity: 1,
                sellingPrice: 0,
                lineTotal: 0,
                unitCost: 0
            }
        }
      },
      include: {
        items: true
      }
    });

    return { success: true, data: serialize(sale) };
  } catch (error: any) {
    console.error("Error adding manual payment:", error);
    return { success: false, error: error.message || "Failed to add payment" };
  }
}

export async function getNextReceiptNumberAction() {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const count = await db.sale.count({
      where: { branchId }
    });

    const nextNumber = (count + 1).toString().padStart(6, '0');
    return { success: true, data: nextNumber };
  } catch (error: any) {
    console.error("Error generating receipt number:", error);
    return { success: false, error: "Failed to generate receipt number" };
  }
}

// --- Sale Categories ---

export async function getSaleCategoriesAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const categories = await db.saleCategory.findMany({
      where: {
        branchId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: serialize(categories) };
  } catch (error: unknown) {
    console.error("Error fetching sale categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

export async function createSaleCategoryAction(name: string, isDefault: boolean = false) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const category = await db.saleCategory.create({
      data: {
        name: name.trim(),
        isDefault,
        branchId,
        userId: auth.user.id,
      },
    });

    return { success: true, data: serialize(category) };
  } catch (error: unknown) {
    console.error("Error creating sale category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateSaleCategoryAction(id: string, name: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const category = await db.saleCategory.update({
      where: { id },
      data: { name: name.trim() },
    });

    return { success: true, data: serialize(category) };
  } catch (error: unknown) {
    console.error("Error updating sale category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteSaleCategoryAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    await db.saleCategory.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting sale category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}

export async function createBulkSaleCategoriesAction(categories: { name: string, isDefault: boolean }[]) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const data = categories.map(cat => ({
      name: cat.name.trim(),
      isDefault: cat.isDefault,
      branchId,
      userId: auth.user!.id
    }));

    await db.saleCategory.createMany({
      data,
      skipDuplicates: true
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating bulk sale categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create categories",
    };
  }
}
