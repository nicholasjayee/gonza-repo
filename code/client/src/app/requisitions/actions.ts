/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function getRequisitionsAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const requisitions = await db.requisition.findMany({
      where: {
        branchId,
        userId: auth.user.id
      },
      include: {
        items: true
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: serialize(requisitions),
    };
  } catch (error: unknown) {
    console.error("Error fetching requisitions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch requisitions",
    };
  }
}

export async function createRequisitionAction(data: {
  title: string;
  items: { productId: string; productName: string; quantity: number; sku?: string }[];
  notes?: string;
  status: string; // 'draft' etc mapped to enum
}) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Map status
    // Prisma: PENDING, APPROVED, REJECTED, FULFILLED, CANCELLED
    // Hook: draft, submitted, approved, completed
    let prismaStatus: "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED" | "CANCELLED" = "PENDING";
    if (data.status === 'approved') prismaStatus = 'APPROVED';
    if (data.status === 'completed') prismaStatus = 'FULFILLED';
    if (data.status === 'submitted') prismaStatus = 'PENDING';
    
    // Generate requisition number ?? Or let database do it if auto-increment?
    // Schema says String @unique. User generated custom logic in hook.
    // I will generate it here or accept it from client?
    // Hook generates `REQ2401201200`. I should replicate logic or use a sequence.
    // Let's implement generation here to be safe and consistent.
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const time = date.getTime().toString().slice(-4);
    const requisitionNumber = `REQ${year}${month}${day}${time}`;

    const requisition = await db.requisition.create({
      data: {
        userId: auth.user.id,
        branchId,
        requisitionNumber,
        title: data.title,
        status: prismaStatus,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            sku: item.sku
          }))
        }
      },
      include: {
        items: true
      }
    });

    return {
      success: true,
      data: serialize(requisition),
    };
  } catch (error: unknown) {
    console.error("Error creating requisition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create requisition",
    };
  }
}

export async function updateRequisitionAction(id: string, updates: {
  title?: string;
  items?: { productId: string; productName: string; quantity: number; sku?: string }[];
  notes?: string;
  status?: string;
}) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
     const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const existing = await db.requisition.findFirst({
        where: { id, userId: auth.user.id }
    });
    if (!existing) throw new Error("Requisition not found");

    let statusUpdate = undefined;
    if (updates.status) {
        if (updates.status === 'approved') statusUpdate = 'APPROVED';
        else if (updates.status === 'completed') statusUpdate = 'FULFILLED';
        else if (updates.status === 'submitted') statusUpdate = 'PENDING';
        else statusUpdate = 'PENDING';
    }

    // For items, if we are updating, usually we replace all items or update specific ones.
    // Simple approach: delete all and recreate if items are provided.
    
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.notes) updateData.notes = updates.notes;
    if (statusUpdate) updateData.status = statusUpdate;

    if (updates.items) {
        // Transaction might be better but let's trust prisma nested write
        updateData.items = {
            deleteMany: {},
            create: updates.items.map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                sku: item.sku
            }))
        };
    }

    const requisition = await db.requisition.update({
        where: { id },
        data: updateData,
        include: { items: true }
    });

    return {
      success: true,
      data: serialize(requisition),
    };
  } catch (error: unknown) {
    console.error("Error updating requisition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update requisition",
    };
  }
}

export async function deleteRequisitionAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    await db.requisition.delete({
      where: {
        id,
        userId: auth.user.id
      }
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error deleting requisition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete requisition",
    };
  }
}
