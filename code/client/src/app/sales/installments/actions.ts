
"use server";

import { db } from "@gonza/shared/prisma/db";
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

// ===== INSTALLMENT PAYMENT ACTIONS =====

export async function getInstallmentPaymentsBySaleAction(saleId: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Verify the sale belongs to the current branch
    const sale = await db.sale.findFirst({
      where: {
        id: saleId,
        branchId,
      },
    });

    if (!sale) {
      return {
        success: false,
        error: "Sale not found or unauthorized",
      };
    }

    const payments = await db.installmentPayment.findMany({
      where: { saleId },
      orderBy: { paymentDate: "desc" },
    });

    return {
      success: true,
      data: serialize(payments),
    };
  } catch (error: unknown) {
    console.error("Error fetching installment payments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch installment payments",
    };
  }
}

export async function getAllInstallmentPaymentsAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const payments = await db.installmentPayment.findMany({
      where: {
        sale: {
          branchId,
        },
      },
      include: {
        sale: {
          select: {
            id: true,
            customerName: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return {
      success: true,
      data: serialize(payments),
    };
  } catch (error: unknown) {
    console.error("Error fetching all installment payments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch installment payments",
    };
  }
}

export async function createInstallmentPaymentAction(data: {
  saleId: string;
  amount: number;
  paymentDate?: Date;
  notes?: string;
  cashTransactionId?: string;
}) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Verify the sale belongs to the current branch
    const sale = await db.sale.findFirst({
      where: {
        id: data.saleId,
        branchId,
      },
    });

    if (!sale) {
      return {
        success: false,
        error: "Sale not found or unauthorized",
      };
    }

    const payment = await db.installmentPayment.create({
      data: {
        saleId: data.saleId,
        amount: data.amount,
        paymentDate: data.paymentDate || new Date(),
        notes: data.notes,
        userId: auth.user.id,
        cashTransactionId: data.cashTransactionId,
      },
    });

    return {
      success: true,
      data: serialize(payment),
    };
  } catch (error: unknown) {
    console.error("Error creating installment payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create installment payment",
    };
  }
}

export async function createInstallmentWithCashAction(data: {
  saleId: string;
  amount: number;
  paymentDate?: Date;
  notes?: string;
  cashAccountId: string;
  locationId: string;
  description: string;
}) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    return await db.$transaction(async (tx) => {
      // 1. Create Cash Transaction
      const cashTransaction = await tx.cashTransaction.create({
        data: {
          amount: data.amount,
          transactionType: "cash_in", // map 'cash_in' to enum
          category: "Installment payment",
          description: data.description,
          date: data.paymentDate || new Date(),
          userId: auth.user!.id,
          branchId: branchId, // Use branchId instead of locationId if possible, or verify locationId
          accountId: data.cashAccountId,
          // Add default values for required fields if any
        },
      });

      // 2. Create Installment Payment linked to Cash Transaction
      const payment = await tx.installmentPayment.create({
        data: {
          saleId: data.saleId,
          amount: data.amount,
          paymentDate: data.paymentDate || new Date(),
          notes: data.notes,
          userId: auth.user!.id,
          cashTransactionId: cashTransaction.id,
        },
      });

      return {
        success: true,
        data: serialize(payment),
        cashTransactionId: cashTransaction.id,
      };
    });
  } catch (error: unknown) {
    console.error("Error creating installment with cash:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create installment with cash",
    };
  }
}

export async function linkPaymentToCashAction(
  paymentId: string,
  data: {
    accountId: string;
    locationId: string;
    description: string;
    amount: number;
    date: Date;
  }
) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    return await db.$transaction(async (tx) => {
      // 1. Create Cash Transaction
      const cashTransaction = await tx.cashTransaction.create({
        data: {
          amount: data.amount,
          transactionType: "cash_in", // map 'cash_in' to enum
          category: "Installment payment",
          description: data.description,
          date: data.date,
          userId: auth.user!.id,
          branchId: branchId,
          accountId: data.accountId,
        },
      });

      // 2. Update Payment
      const payment = await tx.installmentPayment.update({
        where: { id: paymentId },
        data: {
          cashTransactionId: cashTransaction.id,
        },
      });

      return {
        success: true,
        data: serialize(payment),
      };
    });
  } catch (error: unknown) {
    console.error("Error linking payment to cash:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to link payment to cash",
    };
  }
}

export async function unlinkPaymentFromCashAction(paymentId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    await db.$transaction(async (tx) => {
      const payment = await tx.installmentPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || !payment.cashTransactionId) {
        throw new Error("Payment not found or not linked to cash");
      }

      await tx.cashTransaction.delete({
        where: { id: payment.cashTransactionId },
      });
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error unlinking payment from cash:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unlink payment from cash",
    };
  }
}

export async function updateInstallmentPaymentAction(
  id: string,
  data: {
    amount?: number;
    paymentDate?: Date;
    notes?: string;
  }
) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Verify the payment belongs to a sale in the current branch
    const existingPayment = await db.installmentPayment.findFirst({
      where: {
        id,
        sale: {
          branchId,
        },
      },
    });

    if (!existingPayment) {
      return {
        success: false,
        error: "Payment not found or unauthorized",
      };
    }

    const payment = await db.installmentPayment.update({
      where: { id },
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        notes: data.notes,
      },
    });

    return {
      success: true,
      data: serialize(payment),
    };
  } catch (error: unknown) {
    console.error("Error updating installment payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update installment payment",
    };
  }
}

export async function deleteInstallmentPaymentAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Verify the payment belongs to a sale in the current branch
    const existingPayment = await db.installmentPayment.findFirst({
      where: {
        id,
        sale: {
          branchId,
        },
      },
      include: {
        cashTransaction: true,
      },
    });

    if (!existingPayment) {
      return {
        success: false,
        error: "Payment not found or unauthorized",
      };
    }

    // Delete associated cash transaction if exists
    if (existingPayment.cashTransactionId) {
      await db.cashTransaction.delete({
        where: { id: existingPayment.cashTransactionId },
      });
    }

    await db.installmentPayment.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error deleting installment payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete installment payment",
    };
  }
}
