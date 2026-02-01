/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db, Prisma, Expense, CashAccount } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { NextRequest } from "next/server";
// import { Decimal } from "@prisma/client";

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
    const mappedExpenses = expenses.map((expense: Expense) => ({
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
        amount: new Prisma.Decimal(expenseData.amount),
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
      updateData.amount = new Prisma.Decimal(updates.amount);
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
      amount: new Prisma.Decimal(e.amount),
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

    const mappedAccounts = accounts.map((account: CashAccount) => ({
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
        initialBalance: new Prisma.Decimal(accountData.openingBalance || 0),
        currentBalance: new Prisma.Decimal(accountData.openingBalance || 0),
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
      updateData.initialBalance = new Prisma.Decimal(updates.openingBalance);

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
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const categories = await db.expenseCategory.findMany({
      where: {
        branchId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: serialize(categories) };
  } catch (error: unknown) {
    console.error("Error fetching expense categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

export async function createExpenseCategoryAction(name: string, isDefault: boolean = false) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const category = await db.expenseCategory.create({
      data: {
        name: name.trim(),
        isDefault,
        branchId,
        userId: auth.user.id,
      },
    });

    return { success: true, data: serialize(category) };
  } catch (error: unknown) {
    console.error("Error creating expense category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function deleteExpenseCategoryAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    await db.expenseCategory.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting expense category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}

export async function createBulkExpenseCategoriesAction(categories: { name: string, isDefault: boolean }[]) {
    const auth = await getAuth();
    if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const data = categories.map(cat => ({
            name: cat.name.trim(),
            isDefault: cat.isDefault,
            branchId,
            userId: auth.user!.id
        }));

        await db.expenseCategory.createMany({
            data,
            skipDuplicates: true
        });

        return { success: true };
    } catch (error: unknown) {
        console.error("Error creating bulk expense categories:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create categories",
        };
    }
}

// Cash Transactions
export async function getCashTransactionsAction(accountId?: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const transactions = await db.cashTransaction.findMany({
      where: {
        branchId,
        ...(accountId ? { accountId } : {}),
      },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, data: serialize(transactions) };
  } catch (error: unknown) {
    console.error("Error fetching cash transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}

export async function createCashTransactionAction(data: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const transaction = await db.cashTransaction.create({
      data: {
        branchId,
        userId: auth.user.id,
        accountId: data.accountId,
        amount: new Prisma.Decimal(data.amount),
        transactionType: data.transactionType,
        category: data.category,
        description: data.description,
        personInCharge: data.personInCharge,
        tags: data.tags || [],
        date: data.date ? new Date(data.date) : new Date(),
        paymentMethod: data.paymentMethod,
        receiptImage: data.receiptImage,
      },
    });

    return { success: true, data: serialize(transaction) };
  } catch (error: unknown) {
    console.error("Error creating cash transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create transaction",
    };
  }
}

export async function updateCashTransactionAction(id: string, updates: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = new Prisma.Decimal(updates.amount);
    if (updates.transactionType !== undefined) updateData.transactionType = updates.transactionType;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.personInCharge !== undefined) updateData.personInCharge = updates.personInCharge;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.date !== undefined) updateData.date = new Date(updates.date);
    if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod;
    if (updates.receiptImage !== undefined) updateData.receiptImage = updates.receiptImage;

    const transaction = await db.cashTransaction.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: serialize(transaction) };
  } catch (error: unknown) {
    console.error("Error updating cash transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update transaction",
    };
  }
}

export async function deleteCashTransactionAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    return await db.$transaction(async (tx: any) => {
      // First, check if this transaction is linked to any installment payments
      const installmentPayments = await tx.installmentPayment.findMany({
        where: { cashTransactionId: id },
        select: { id: true }
      });

      // If there are linked installment payments, unlink them
      if (installmentPayments.length > 0) {
        await tx.installmentPayment.updateMany({
          where: { cashTransactionId: id },
          data: { cashTransactionId: null }
        });
      }

      // Now delete the cash transaction
      await tx.cashTransaction.delete({
        where: { id },
      });

      return { success: true, unlinkedCount: installmentPayments.length };
    });
  } catch (error: unknown) {
    console.error("Error deleting cash transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete transaction",
    };
  }
}

export async function getCashTransactionByIdAction(transactionId: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const transaction = await db.cashTransaction.findFirst({
      where: {
        id: transactionId,
        branchId
      },
      select: {
        id: true,
        accountId: true
      }
    });

    return {
      success: true,
      data: transaction ? serialize(transaction) : null
    };
  } catch (error: unknown) {
    console.error("Error fetching cash transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch cash transaction",
    };
  }
}

export async function createTransferAction(data: any) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    return await db.$transaction(async (tx: any) => {
      // Get account names for descriptions
      const fromAccount = await tx.cashAccount.findUnique({
        where: { id: data.accountId },
        select: { name: true }
      });
      const toAccount = await tx.cashAccount.findUnique({
        where: { id: data.toAccountId },
        select: { name: true }
      });

      const fromName = fromAccount?.name || 'Unknown Account';
      const toName = toAccount?.name || 'Unknown Account';

      const transferOut = await tx.cashTransaction.create({
        data: {
          branchId,
          userId: auth.user!.id,
          accountId: data.accountId,
          amount: new Prisma.Decimal(data.amount),
          transactionType: 'transfer_out',
          description: `Transfer to ${toName}: ${data.description || ''}`,
          date: data.date ? new Date(data.date) : new Date(),
          personInCharge: data.personInCharge,
          tags: data.tags || [],
        }
      });

      const transferIn = await tx.cashTransaction.create({
        data: {
          branchId,
          userId: auth.user!.id,
          accountId: data.toAccountId,
          amount: new Prisma.Decimal(data.amount),
          transactionType: 'transfer_in',
          description: `Transfer from ${fromName}: ${data.description || ''}`,
          date: data.date ? new Date(data.date) : new Date(),
          personInCharge: data.personInCharge,
          tags: data.tags || [],
        }
      });

      return { success: true, data: { transferOut, transferIn } };
    });
  } catch (error: unknown) {
    console.error("Error creating transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create transfer",
    };
  }
}

export async function createBulkCashTransactionsAction(transactions: any[]) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const data = transactions.map(t => ({
      branchId,
      userId: auth.user!.id,
      accountId: t.accountId,
      amount: new Prisma.Decimal(t.amount),
      transactionType: t.transactionType,
      category: t.category,
      description: t.description,
      personInCharge: t.personInCharge,
      tags: t.tags || [],
      date: t.date ? new Date(t.date) : new Date(),
      paymentMethod: t.paymentMethod,
      receiptImage: t.receiptImage,
    }));

    await db.cashTransaction.createMany({
      data,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating bulk cash transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create transactions",
    };
  }
}

export async function getInstallmentPaymentsAction(_saleId: string) {
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
export async function deleteInstallmentPaymentAction(_id: string) {
  return { success: true };
}
