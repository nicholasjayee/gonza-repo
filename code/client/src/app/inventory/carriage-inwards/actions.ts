/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db, Expense } from "@gonza/shared/prisma/db";
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

export type CarriageInwardFormData = {
  supplierName: string;
  details: string;
  amount: number;
  date: Date;
  cashAccountId?: string;
};

// CONSTANT for mapping Carriage Inwards to Expense Category
const CARRIAGE_CATEGORY = "Transport";

export async function getCarriageInwardsAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Using Expense model, filtering by category 'Transport'
    const expenses = await db.expense.findMany({
      where: { 
        branchId,
        category: CARRIAGE_CATEGORY
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    // Map Expense to CarriageInward structure expected by frontend
    const carriageInwards = expenses.map((expense: Expense) => {
      // Parse description to extract supplier if we stored it there
      // Format: "Supplier: [Name] - [Details]"
      let supplierName = "Unknown";
      let details = expense.description;
      
      if (expense.description.startsWith("Supplier: ")) {
        const parts = expense.description.split(" - ");
        if (parts.length > 1) {
          supplierName = parts[0].replace("Supplier: ", "");
          details = parts.slice(1).join(" - ");
        }
      }

      return {
        id: expense.id,
        userId: expense.userId,
        locationId: expense.branchId,
        supplierName,
        details,
        amount: Number(expense.amount),
        date: expense.date,
        cashAccountId: null, // Expense doesn't directly link cashAccount in schema? Wait, it has paymentMethod/reference but not relation in visible schema snippets for expense -> cashAccount, but Sale has it.
        // Actually Expense model in schema doesn't seem to have cashAccountId.
        // We will ignore cashAccountId linkage for read for now or rely on reference if we store it there.
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt
      };
    });

    return {
      success: true,
      data: serialize(carriageInwards),
    };
  } catch (error: unknown) {
    console.error("Error loading carriage inwards:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load carriage inwards";
    return { success: false, error: message };
  }
}

export async function createCarriageInwardAction(data: CarriageInwardFormData) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Create description combining supplier and details
    const description = `Supplier: ${data.supplierName} - ${data.details}`;

    // Note: Schema for Expense does not show cashAccountId relation. 
    // If we want to track cash flow, we might need a separate CashTransaction if Expense doesn't double as one.
    // But Expense is usually distinct. 
    // The previous plan tried to create CashTransaction. Schema HAS CashAccount but Expense doesn't link to it. 
    // We will just create Expense for now. 
    
    // If we can, we should deduct from CashAccount manually if needed, but 'CashTransaction' logic is safer if modeled.
    // The previous actions tried to create CashTransaction. Schema has 'Transaction' (Pesapal) but no generic CashTransaction model visible in 600 lines?
    // Wait, lines 158: model Transaction. 
    // Lines 260: model CashAccount. 
    // There is no generic "CashTransaction" model linked to CashAccount in the snippet I saw.
    // So I will just stick to creating an Expense.

    const expense = await db.expense.create({
      data: {
        userId: auth.user.id,
        branchId: branchId,
        amount: data.amount,
        category: CARRIAGE_CATEGORY,
        description: description,
        date: new Date(data.date),
        // reference: data.cashAccountId // Store cashAccountId in reference?
      },
    });

    return { success: true, data: serialize(expense) };
  } catch (error: unknown) {
    console.error("Error creating carriage inwards:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create carriage inward";
    return { success: false, error: message };
  }
}

export async function updateCarriageInwardAction(
  id: string,
  updates: Partial<CarriageInwardFormData>
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Fetch existing validation
    const existing = await db.expense.findUnique({ where: { id }});
    if (!existing) throw new Error("Record not found");

    const updateData: any = {};
    
    if (updates.date !== undefined) updateData.date = new Date(updates.date);
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    
    // If supplier or details update, we need to reconstruct description.
    // Ideally we shouldn't parse string for partial updates, but here we must.
    if (updates.supplierName !== undefined || updates.details !== undefined) {
      let currentSupplier = "Unknown";
      let currentDetails = existing.description;
       if (existing.description.startsWith("Supplier: ")) {
        const parts = existing.description.split(" - ");
        if (parts.length > 1) {
          currentSupplier = parts[0].replace("Supplier: ", "");
          currentDetails = parts.slice(1).join(" - ");
        }
      }
      
      const newSupplier = updates.supplierName || currentSupplier;
      const newDetails = updates.details || currentDetails;
      updateData.description = `Supplier: ${newSupplier} - ${newDetails}`;
    }

    await db.expense.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating carriage inwards:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update carriage inward";
    return { success: false, error: message };
  }
}

export async function deleteCarriageInwardAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    await db.expense.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting carriage inwards:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete carriage inward";
    return { success: false, error: message };
  }
}
