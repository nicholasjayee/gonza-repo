/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { NextRequest } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

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

// --- Expenses ---

export async function getExpensesAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const expenses = await db.expense.findMany({
      where: {
        branchId,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Map Prisma Expense to frontend Expense interface
    const mappedExpenses = expenses.map((expense) => ({
      id: expense.id,
      amount: Number(expense.amount),
      description: expense.description,
      category: expense.category,
      date: expense.date.toISOString(),
      paymentMethod: expense.paymentMethod,
      personInCharge: null, // Not in Prisma
      receiptImage: expense.receiptImage,
      cashAccountId: null, // Not in Prisma
      cashTransactionId: null, // Not in Prisma
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    return { success: true, data: serialize(mappedExpenses) };
  } catch (error: unknown) {
    console.error("Error fetching expenses:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch expenses",
    };
  }
}

export async function createExpenseAction(expenseData: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const newExpense = await db.expense.create({
      data: {
        branchId,
        userId: auth.user.id,
        amount: new Decimal(expenseData.amount),
        description: expenseData.description,
        category: expenseData.category || "Uncategorized",
        date: expenseData.date ? new Date(expenseData.date) : new Date(),
        paymentMethod: expenseData.paymentMethod,
        receiptImage: expenseData.receiptImage,
        // Missing fields: personInCharge, cashAccountId, cashTransactionId
      },
    });

    const mappedExpense = {
      id: newExpense.id,
      amount: Number(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
      date: newExpense.date.toISOString(),
      paymentMethod: newExpense.paymentMethod,
      personInCharge: null,
      receiptImage: newExpense.receiptImage,
      cashAccountId: null,
      cashTransactionId: null,
      createdAt: newExpense.createdAt.toISOString(),
      updatedAt: newExpense.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedExpense) };
  } catch (error: unknown) {
    console.error("Error creating expense:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function updateExpenseAction(id: string, updates: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const updateData: any = {};
    if (updates.amount !== undefined)
      updateData.amount = new Decimal(updates.amount);
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.date !== undefined) updateData.date = new Date(updates.date);
    if (updates.paymentMethod !== undefined)
      updateData.paymentMethod = updates.paymentMethod;
    if (updates.receiptImage !== undefined)
      updateData.receiptImage = updates.receiptImage;

    const updatedExpense = await db.expense.update({
      where: { id },
      data: updateData,
    });

    const mappedExpense = {
      id: updatedExpense.id,
      amount: Number(updatedExpense.amount),
      description: updatedExpense.description,
      category: updatedExpense.category,
      date: updatedExpense.date.toISOString(),
      paymentMethod: updatedExpense.paymentMethod,
      personInCharge: null,
      receiptImage: updatedExpense.receiptImage,
      cashAccountId: null,
      cashTransactionId: null,
      createdAt: updatedExpense.createdAt.toISOString(),
      updatedAt: updatedExpense.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedExpense) };
  } catch (error: unknown) {
    console.error("Error updating expense:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update expense",
    };
  }
}

export async function deleteExpenseAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    await db.expense.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting expense:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}

export async function createBulkExpensesAction(expensesData: any[]) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const expensesToCreate = expensesData.map((e) => ({
      branchId: branchId!,
      userId: auth.user!.id,
      amount: new Decimal(e.amount),
      description: e.description,
      category: e.category || "Uncategorized",
      date: e.date ? new Date(e.date) : new Date(),
      paymentMethod: e.paymentMethod,
      receiptImage: e.receiptImage,
    }));

    await db.expense.createMany({
      data: expensesToCreate,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating bulk expenses:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create bulk expenses",
    };
  }
}

// --- Cash Accounts ---

export async function getCashAccountsAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const accounts = await db.cashAccount.findMany({
      where: { branchId },
      orderBy: { name: "asc" },
    });

    const mappedAccounts = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      description: account.description,
      openingBalance: Number(account.initialBalance), // Mapped from initialBalance
      isDefault: false, // Not in Prisma
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    }));

    return { success: true, data: serialize(mappedAccounts) };
  } catch (error: unknown) {
    console.error("Error fetching cash accounts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch cash accounts",
    };
  }
}

export async function createCashAccountAction(accountData: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const newAccount = await db.cashAccount.create({
      data: {
        branchId,
        name: accountData.name,
        description: accountData.description,
        initialBalance: new Decimal(accountData.openingBalance || 0),
        currentBalance: new Decimal(accountData.openingBalance || 0),
        isActive: true,
      },
    });

    const mappedAccount = {
      id: newAccount.id,
      name: newAccount.name,
      description: newAccount.description,
      openingBalance: Number(newAccount.initialBalance),
      isDefault: false,
      createdAt: newAccount.createdAt.toISOString(),
      updatedAt: newAccount.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedAccount) };
  } catch (error: unknown) {
    console.error("Error creating cash account:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create cash account",
    };
  }
}

export async function updateCashAccountAction(id: string, updates: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.openingBalance !== undefined)
      updateData.initialBalance = new Decimal(updates.openingBalance);

    const updatedAccount = await db.cashAccount.update({
      where: { id },
      data: updateData,
    });

    const mappedAccount = {
      id: updatedAccount.id,
      name: updatedAccount.name,
      description: updatedAccount.description,
      openingBalance: Number(updatedAccount.initialBalance),
      isDefault: false,
      createdAt: updatedAccount.createdAt.toISOString(),
      updatedAt: updatedAccount.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedAccount) };
  } catch (error: unknown) {
    console.error("Error updating cash account:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update cash account",
    };
  }
}

export async function deleteCashAccountAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    await db.cashAccount.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting cash account:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete cash account",
    };
  }
}

// --- Placeholders for Missing Models ---

// Expense Categories
export async function getExpenseCategoriesAction() {
  return { success: true, data: [] };
}
export async function createExpenseCategoryAction(name: string) {
  return {
    success: true,
    data: {
      id: "placeholder",
      name,
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
  };
}
export async function deleteExpenseCategoryAction(id: string) {
  return { success: true };
}

// Cash Transactions
export async function getCashTransactionsAction(accountId?: string) {
  return { success: true, data: [] };
}
export async function createCashTransactionAction(data: any) {
  return {
    success: true,
    data: {
      id: "placeholder",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
export async function updateCashTransactionAction(id: string, data: any) {
  return { success: true, data: { id, ...data } };
}
export async function deleteCashTransactionAction(id: string) {
  return { success: true };
}
export async function createBulkCashTransactionsAction(data: any[]) {
  return { success: true, data: [] };
}

// Installment Payments
export async function getInstallmentPaymentsAction(saleId: string) {
  return { success: true, data: [] };
}
export async function createInstallmentPaymentAction(data: any) {
  return {
    success: true,
    data: {
      id: "placeholder",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
export async function updateInstallmentPaymentAction(id: string, data: any) {
  return { success: true, data: { id, ...data } };
}
export async function deleteInstallmentPaymentAction(id: string) {
  return { success: true };
}
