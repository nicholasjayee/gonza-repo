/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db, Prisma } from "@gonza/shared/prisma/db";
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

export async function exportBusinessDataAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const [
      branchSettings,
      products,
      categories,
      productHistory,
      sales,
      customers,
      expenses,
      cashAccounts,
      tasks,
      profile,
    ] = await Promise.all([
      db.branchSettings.findUnique({ where: { branchId } }),
      db.product.findMany({ where: { branchId } }),
      db.category.findMany(), // Categories are global in this schema
      db.productHistory.findMany({ where: { product: { branchId } } }),
      db.sale.findMany({ where: { branchId }, include: { items: true } }),
      db.customer.findMany({ where: { branchId } }),
      db.expense.findMany({ where: { branchId } }),
      db.cashAccount.findMany({ where: { branchId } }),
      db.task.findMany({ where: { branchId } }),
      db.user.findUnique({ where: { id: auth.user.id } }),
    ]);

    const data = {
      branch_settings: branchSettings ? [branchSettings] : [],
      products: products || [],
      product_categories: categories || [],
      stock_history: productHistory || [],
      sales: sales || [],
      customers: customers || [],
      expenses: expenses || [],
      cash_accounts: cashAccounts || [],
      tasks: tasks || [],
      profiles: profile ? [profile] : [],
    };

    return { success: true, data: serialize(data) };
  } catch (error: unknown) {
    console.error("Error exporting business data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export data",
    };
  }
}

export async function importBusinessDataAction(backupData: {
  data: Record<string, unknown[]>;
}) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const data = backupData.data;

    // Clear existing data in correct order
    await db.$transaction([
      db.saleItem.deleteMany({ where: { sale: { branchId } } }),
      db.productHistory.deleteMany({ where: { product: { branchId } } }),
      db.sale.deleteMany({ where: { branchId } }),
      db.expense.deleteMany({ where: { branchId } }),
      db.task.deleteMany({ where: { branchId } }),
      db.product.deleteMany({ where: { branchId } }),
      db.customer.deleteMany({ where: { branchId } }),
      db.cashAccount.deleteMany({ where: { branchId } }),
      // Categories are global, we might not want to delete them or we only delete if unused
      // db.category.deleteMany(),
    ]);

    // Import data
    // Note: This is a simplified import. In a real scenario, we'd need to handle IDs and relations carefully.
    // For now, we'll assume the backup IDs are valid or we'll let Prisma handle them.

    // Import Categories first
    if (data.product_categories) {
      for (const cat of data.product_categories as Record<string, unknown>[]) {
        const name = typeof cat.name === "string" ? cat.name : undefined;
        const description =
          typeof cat.description === "string" ? cat.description : undefined;
        if (!name) continue;
        await db.category.upsert({
          where: { name },
          update: {},
          create: { name, description },
        });
      }
    }

    // Import Customers
    if (data.customers) {
      await db.customer.createMany({
        data: (data.customers as Prisma.CustomerCreateManyInput[]).map((c) => ({
          ...c,
          branchId,
          adminId: auth.user.id,
          id: undefined,
        })),
      });
    }

    // Import Products
    if (data.products) {
      await db.product.createMany({
        data: (data.products as Prisma.ProductCreateManyInput[]).map((p) => ({
          ...p,
          branchId,
          userId: auth.user.id,
          id: undefined,
        })),
      });
    }

    // Import Sales and SaleItems
    if (data.sales) {
      for (const sale of data.sales as unknown[]) {
        const { items, ...saleData } = sale as {
          items: Record<string, unknown>[];
        } & Record<string, unknown>;
        const saleCreateData = {
          ...(saleData as any),
          branchId,
          userId: auth.user.id,
          id: undefined,
          items: {
            create: (
              items as unknown as Prisma.SaleItemCreateWithoutSaleInput[]
            ).map((i) => ({
              ...(i as any),
              id: undefined,
            })),
          },
        } as Prisma.SaleCreateInput;
        await db.sale.create({ data: saleCreateData });
      }
    }

    // Import Expenses
    if (data.expenses) {
      await db.expense.createMany({
        data: (data.expenses as Prisma.ExpenseCreateManyInput[]).map((e) => ({
          ...e,
          branchId,
          userId: auth.user.id,
          id: undefined,
        })),
      });
    }

    // Import Tasks
    if (data.tasks) {
      await db.task.createMany({
        data: (data.tasks as Prisma.TaskCreateManyInput[]).map((t) => ({
          ...t,
          branchId,
          createdById: auth.user.id,
          id: undefined,
        })),
      });
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error importing business data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import data",
    };
  }
}
