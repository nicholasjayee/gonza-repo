/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
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

export async function exportBusinessDataAction(branchId: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Verify user has access to this branch
    const branch = await db.branch.findFirst({
      where: {
        id: branchId,
        OR: [
          { adminId: auth.user.id },
          { users: { some: { id: auth.user.id } } }
        ]
      }
    });

    if (!branch) throw new Error("Branch not found or access denied");

    const data: Record<string, any[]> = {};

    // Parallel fetch for efficiency
    const [
      settings,
      categories,
      suppliers,
      products,
      sales,
      customers,
      expenses,
      expenseCategories,
      cashAccounts,
      cashTransactions,
      tasks,
      taskCategories,
      productHistory,
      installmentPayments
    ] = await Promise.all([
      db.branchSettings.findMany({ where: { branchId } }),
      db.category.findMany(), // Global or per branch? Schema suggests global but usually used per branch context
      db.supplier.findMany(),
      db.product.findMany({ where: { branchId } }),
      db.sale.findMany({ where: { branchId }, include: { items: true } }),
      db.customer.findMany({ where: { branchId } }),
      db.expense.findMany({ where: { branchId } }),
      db.expenseCategory.findMany({ where: { branchId } }),
      db.cashAccount.findMany({ where: { branchId } }),
      db.cashTransaction.findMany({ where: { branchId } }),
      db.task.findMany({ where: { branchId } }),
      db.taskCategory.findMany({ where: { branchId } }),
      db.productHistory.findMany({ where: { product: { branchId } } }),
      db.installmentPayment.findMany({ where: { userId: auth.user.id } }) // Payments are user-tied in schema
    ]);

    data.branch_settings = settings;
    data.categories = categories;
    data.suppliers = suppliers;
    data.products = products;
    data.sales = sales;
    data.customers = customers;
    data.expenses = expenses;
    data.expense_categories = expenseCategories;
    data.cash_accounts = cashAccounts;
    data.cash_transactions = cashTransactions;
    data.tasks = tasks;
    data.task_categories = taskCategories;
    data.product_history = productHistory;
    data.installment_payments = installmentPayments;

    return { 
      success: true, 
      data: serialize({
        metadata: {
          version: '2.0-prisma',
          timestamp: new Date().toISOString(),
          businessName: branch.name,
          businessId: branch.id,
          exportType: 'full_backup'
        },
        data
      })
    };
  } catch (error: unknown) {
    console.error("Export failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Backup export failed" 
    };
  }
}

// Import is more complex because we need to clear and then re-insert while maintaining relations
// Or we can just do a naive "replace everything for this branch" approach
export async function importBusinessDataAction(branchId: string, backupData: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
     // Verify user has access to this branch
     const branch = await db.branch.findFirst({
        where: {
          id: branchId,
          adminId: auth.user.id // Only admin can restore
        }
      });
  
      if (!branch) throw new Error("Branch not found or unauthorized for restore");

      const { data } = backupData;

      // Wrap in transaction for safety
      await db.$transaction(async (tx) => {
        // Clear existing data in correct order
        await tx.installmentPayment.deleteMany({ where: { userId: auth.user.id } });
        await tx.productHistory.deleteMany({ where: { product: { branchId } } });
        await tx.saleItem.deleteMany({ where: { sale: { branchId } } });
        await tx.sale.deleteMany({ where: { branchId } });
        await tx.cashTransaction.deleteMany({ where: { branchId } });
        await tx.expense.deleteMany({ where: { branchId } });
        await tx.task.deleteMany({ where: { branchId } });
        await tx.product.deleteMany({ where: { branchId } });
        await tx.customer.deleteMany({ where: { branchId } });
        await tx.cashAccount.deleteMany({ where: { branchId } });
        await tx.expenseCategory.deleteMany({ where: { branchId } });
        await tx.taskCategory.deleteMany({ where: { branchId } });
        await tx.branchSettings.deleteMany({ where: { branchId } });

        // Restore data
        // This is simplified and might need mapping if IDs are different, 
        // but usually backup/restore preserves IDs or replaces them.
        
        if (data.branch_settings?.length) {
            await tx.branchSettings.createMany({ data: data.branch_settings.map((s: any) => ({ ...s, branchId })) });
        }
        if (data.task_categories?.length) {
            await tx.taskCategory.createMany({ data: data.task_categories.map((c: any) => ({ ...c, branchId })) });
        }
        if (data.expense_categories?.length) {
            await tx.expenseCategory.createMany({ data: data.expense_categories.map((c: any) => ({ ...c, branchId })) });
        }
        if (data.cash_accounts?.length) {
            await tx.cashAccount.createMany({ data: data.cash_accounts.map((a: any) => ({ ...a, branchId })) });
        }
        if (data.customers?.length) {
            await tx.customer.createMany({ data: data.customers.map((c: any) => ({ ...c, branchId, adminId: auth.user.id })) });
        }
        if (data.products?.length) {
            await tx.product.createMany({ data: data.products.map((p: any) => ({ ...p, branchId, userId: auth.user.id })) });
        }
        if (data.tasks?.length) {
            await tx.task.createMany({ data: data.tasks.map((t: any) => ({ ...t, branchId, createdById: auth.user.id })) });
        }
        if (data.expenses?.length) {
            await tx.expense.createMany({ data: data.expenses.map((e: any) => ({ ...e, branchId, userId: auth.user.id })) });
        }
        if (data.cash_transactions?.length) {
            await tx.cashTransaction.createMany({ data: data.cash_transactions.map((t: any) => ({ ...t, branchId, userId: auth.user.id })) });
        }
        if (data.sales?.length) {
            for (const sale of data.sales) {
                const { items, ...saleData } = sale;
                await tx.sale.create({
                    data: {
                        ...saleData,
                        branchId,
                        userId: auth.user.id,
                        items: {
                            create: items
                        }
                    }
                });
            }
        }
        if (data.product_history?.length) {
            await tx.productHistory.createMany({ data: data.product_history.map((h: any) => ({ ...h, userId: auth.user.id })) });
        }
        if (data.installment_payments?.length) {
            await tx.installmentPayment.createMany({ data: data.installment_payments.map((p: any) => ({ ...p, userId: auth.user.id })) });
        }
      });

      return { success: true };
  } catch (error: unknown) {
    console.error("Import failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Backup import failed" 
    };
  }
}
