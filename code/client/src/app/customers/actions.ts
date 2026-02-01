"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@gonza/shared/prisma/db";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";

// Helper to simulate request for authGuard (can be imported from utils if available)
async function getAuth() {
  const headerList = await headers();
  const cookieStore = await cookies();

  const mockReq = {
    headers: headerList,
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  } as unknown as NextRequest;

  return authGuard(mockReq, ["user", "admin", "superadmin"]);
}

export interface CustomerCategory {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCustomerDTO = {
    fullName: string;
    phoneNumber?: string | null;
    email?: string | null;
    address?: string | null;
    location?: string | null;
    city?: string | null;
    categoryId?: string | null;
    notes?: string | null;
    tags?: string[] | null;
    socialMedia?: any | null;
    birthday?: Date | null;
    gender?: string | null;
};

export async function getCustomersAction() {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
     const { branchId } = await getActiveBranch();
     if (!branchId) throw new Error("No active branch found");

     const customers = await db.customer.findMany({
         where: { branchId },
         orderBy: { createdAt: 'desc' },
     });

     return { success: true, data: serialize(customers) };
  } catch (error: any) {
      console.error("Error fetching customers:", error);
      return { success: false, error: "Failed to fetch customers" };
  }
}

export async function findCustomerByNameAction(name: string) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const customers = await db.customer.findMany({
      where: {
        branchId,
        name: {
          contains: name.trim(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    return { success: true, data: serialize(customers) };
  } catch (error: any) {
    console.error("Error finding customer by name:", error);
    return { success: false, error: "Failed to find customer" };
  }
}

export async function createCustomerAction(data: CreateCustomerDTO) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: "Unauthorized" };

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const customer = await db.customer.create({
            data: {
                name: data.fullName,
                phone: data.phoneNumber,
                email: data.email,
                address: data.location || data.address,
                city: data.city,
                notes: data.notes,
                branchId,
                adminId: auth.user.id, 
            }
        });

        return { success: true, data: serialize(customer) };
    } catch (error: any) {
        console.error("Error creating customer:", error);
        return { success: false, error: error.message || "Failed to create customer" };
    }
}

export async function getCustomerCategoriesAction() {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const mockCategories: CustomerCategory[] = [
      { id: '1', name: 'Regular', isDefault: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'VIP', isDefault: false, createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'Wholesale', isDefault: false, createdAt: new Date(), updatedAt: new Date() },
    ];

    return { success: true, data: mockCategories };
  } catch (error: any) {
    console.error("Error fetching customer categories:", error);
    return { success: false, error: error.message || "Failed to fetch categories" };
  }
}

export async function createCustomerCategoryAction(name: string) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: "Unauthorized" };

    try {
        return { success: true, data: { id: Date.now().toString(), name, isDefault: false, createdAt: new Date(), updatedAt: new Date() } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function mergeCustomersAction(primaryCustomerId: string, duplicateIds: string[]) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: "Unauthorized" };

    try {
        // Simple transaction not needed if we are just calling db methods sequentially and relying on logical consistency
        // But for data integrity, let's just do sequential updates.
        
        // 1. Update sales to primary customer
        await db.sale.updateMany({
            where: {
                customerId: {
                    in: duplicateIds
                }
            },
            data: {
                customerId: primaryCustomerId
            }
        });

        // 2. Delete duplicate customers
        await db.customer.deleteMany({
            where: {
                id: {
                    in: duplicateIds
                }
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error merging customers:", error);
        return { success: false, error: error.message || "Failed to merge customers" };
    }
}

export async function updateCustomerAction(id: string, updates: any) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const updateData: any = {};
    if (updates.fullName !== undefined) updateData.name = updates.fullName;
    if (updates.phoneNumber !== undefined) updateData.phone = updates.phoneNumber;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.location !== undefined || updates.address !== undefined) 
        updateData.address = updates.location || updates.address;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    // ... add more if needed

    const customer = await db.customer.update({
      where: { id },
      data: updateData
    });

    return { success: true, data: serialize(customer) };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function deleteCustomerAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    await db.customer.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return { success: false, error: error.message || "Failed to delete customer" };
  }
}
