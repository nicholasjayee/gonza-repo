
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";


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

export async function getInstallmentPayments(saleId: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");
  
  try {
     const payments = await db.installmentPayment.findMany({
        where: { saleId },
        orderBy: { paymentDate: 'desc' }
     });
     
     const mapped = payments.map(p => ({
        id: p.id,
        saleId: p.saleId,
        userId: p.userId,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        notes: p.notes,
        cashTransactionId: p.cashTransactionId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
     }));
     return serialize(mapped);
  } catch (error) {
     console.error(error);
     return [];
  }
}

export async function createInstallmentPayment(data: {
  saleId: string;
  amount: number;
  notes?: string;
  paymentDate?: Date;
  cashTransactionId?: string;
}) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
     const payment = await db.installmentPayment.create({
        data: {
           saleId: data.saleId,
           userId: auth.user.id,
           amount: data.amount,
           notes: data.notes,
           paymentDate: data.paymentDate || new Date(),
           cashTransactionId: data.cashTransactionId
        }
     });
     
     revalidatePath(`/sales/${data.saleId}`); // Assuming route
     return serialize(payment);
  } catch(error) {
     console.error(error);
     throw error;
  }
}

export async function updateInstallmentPayment(id: string, data: {
  amount?: number;
  notes?: string;
  paymentDate?: Date;
}) {
   const auth = await getAuth();
   if (!auth.authorized) throw new Error("Unauthorized");
   
   try {
      const updateData: Partial<{ amount: number; notes: string; paymentDate: Date }> = {};
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
      
      const payment = await db.installmentPayment.update({
         where: { id },
         data: updateData
      });
      
      // Update linked cash transaction if exists?
      if (payment.cashTransactionId) {
         const txUpdate: Partial<{ amount: number; date: Date }> = {};
         if (data.amount !== undefined) txUpdate.amount = data.amount;
         if (data.paymentDate !== undefined) txUpdate.date = data.paymentDate;
         
         if (Object.keys(txUpdate).length > 0) {
            await db.cashTransaction.update({
               where: { id: payment.cashTransactionId },
               data: txUpdate
            });
            // TODO: Update balance?
         }
      }
      
      revalidatePath(`/sales/${payment.saleId}`);
      return serialize(payment);
   } catch (error) {
      console.error(error);
      throw error;
   }
}

export async function deleteInstallmentPayment(id: string) {
   const auth = await getAuth();
   if (!auth.authorized) throw new Error("Unauthorized");
   
   try {
      const payment = await db.installmentPayment.findUnique({ where: { id }});
      if (!payment) throw new Error("Not found");
      
      // Delete linked transaction?
      if (payment.cashTransactionId) {
         await db.cashTransaction.delete({
            where: { id: payment.cashTransactionId }
         });
         // Balance update handled by deleteCashTransaction logic if we reused it, 
         // but here direct delete.
         // Ideally call deleteCashTransaction action? or replicate logic.
      }
      
      await db.installmentPayment.delete({ where: { id }});
      revalidatePath(`/sales/${payment.saleId}`);
      return true;
   } catch (error) {
      console.error(error);
      return false;
   }
}

export async function linkPaymentToCashAccount(paymentId: string, accountId: string) {
   const auth = await getAuth();
   if (!auth.authorized) throw new Error("Unauthorized");
   
   try {
      const { branchId } = await getActiveBranch();
      const payment = await db.installmentPayment.findUnique({ where: { id: paymentId }, include: { sale: true } });
      if (!payment) throw new Error("Payment not found");
      if (payment.cashTransactionId) throw new Error("Already linked");
      
      const description = `Installment payment for ${payment.sale.customerName || 'Sale'}`; // Simplification
      
      const tx = await db.cashTransaction.create({
         data: {
            branchId: branchId || payment.sale.branchId, // Fallback
            userId: auth.user.id,
            accountId,
            amount: payment.amount,
            transactionType: 'cash_in',
            category: 'Installment payment',
            description,
            date: payment.paymentDate,
            tags: []
         }
      });
      
      await db.cashAccount.update({
         where: { id: accountId },
         data: { currentBalance: { increment: payment.amount } }
      });
      
      await db.installmentPayment.update({
         where: { id: paymentId },
         data: { cashTransactionId: tx.id }
      });
      
      return serialize(tx);
   } catch (error) {
      console.error(error);
      throw error;
   }
}

export async function unlinkPaymentFromCashAccount(paymentId: string) {
   const auth = await getAuth();
   if (!auth.authorized) throw new Error("Unauthorized");
   
   try {
      const payment = await db.installmentPayment.findUnique({ where: { id: paymentId }});
      if (!payment || !payment.cashTransactionId) throw new Error("Not linked");
      
      const tx = await db.cashTransaction.findUnique({ where: { id: payment.cashTransactionId }});
      
      if (tx) {
         await db.cashTransaction.delete({ where: { id: tx.id }});
         
         await db.cashAccount.update({
            where: { id: tx.accountId },
            data: { currentBalance: { decrement: tx.amount } }
         });
      }
      
      await db.installmentPayment.update({
         where: { id: paymentId },
         data: { cashTransactionId: null }
      });
      
      return true;
   } catch (error) {
      console.error(error);
      throw error;
   }
}
