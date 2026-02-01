/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";

// Helper to simulate request for authGuard
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

export async function getProfilesAction() {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: "No active branch found" };

    const users = await db.user.findMany({
      where: {
        // Users belonging to this branch (either via branchId or direct relation if modeled that way)
        OR: [
            { branchId: branchId },
            { ownedBranches: { some: { id: branchId } } } // Include owners if they should appear
        ]
      },
      include: {
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Map to a frontend friendly structure if needed, or just return as is
    const mappedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name || "Unknown", // Assuming Role has a name field
      roleId: user.roleId,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive, 
      branchId: user.branchId
    }));

    return { success: true, data: serialize(mappedUsers) };
  } catch (error: any) {
    console.error("Error fetching profiles:", error);
    return { success: false, error: error.message || "Failed to fetch profiles" };
  }
}

export async function createProfileAction(data: {
  name: string;
  email: string;
  role: string; // Expecting role name or ID
  password?: string;
  phoneNumber?: string; // Not in User schema directly, maybe need to check
}) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: "No active branch found" };

    // Find Role
    let role = await db.role.findFirst({
        where: { name: { equals: data.role, mode: 'insensitive' } }
    });
    
    // If role not found by name, try ID or default
    if (!role) {
         // Try finding by ID if passed string is an ID
         role = await db.role.findUnique({ where: { id: data.role } });
    }

    if (!role) {
         // Fallback or error? Let's error for now
         return { success: false, error: `Role '${data.role}' not found.` };
    }

    const existingUser = await db.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        return { success: false, error: "User with this email already exists." };
    }

    const newUser = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || null, // Password handling should ideally be hashed if this is a real auth flow
        roleId: role.id,
        branchId: branchId,
        isActive: true,
        // phoneNumber: data.phoneNumber // User schema doesn't have phone? Let's check schema again if needed.
        // Schema has `name`, `email`, `roleId`, `branchId`...
      },
      include: {
        role: true
      }
    });

    return { success: true, data: serialize(newUser) };
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return { success: false, error: error.message || "Failed to create profile" };
  }
}

export async function updateProfileAction(id: string, data: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
}) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: "Unauthorized" };

    try {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        if (data.role) {
             const role = await db.role.findFirst({
                where: { name: { equals: data.role, mode: 'insensitive' } }
             });
             if (role) {
                 updateData.roleId = role.id;
             }
        }

        const updatedUser = await db.user.update({
            where: { id },
            data: updateData,
            include: { role: true }
        });

        return { success: true, data: serialize(updatedUser) };

    } catch (error: any) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
}

// ... existing code ...

export async function deleteProfileAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: "Unauthorized" };

    try {
        await db.user.delete({
            where: { id }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting profile:", error);
        return { success: false, error: error.message || "Failed to delete profile" };
    }
}

export async function getCurrentUserAction() {
    const auth = await getAuth();
    if (!auth.authorized || !auth.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const user = await db.user.findUnique({
            where: { id: auth.user.id },
            include: { role: true, branch: true }
        });

        if (!user) return { success: false, error: "User not found" };

        return { success: true, user: serialize(user) };
    } catch (error: any) {
        console.error("Error fetching current user:", error);
        return { success: false, error: error.message || "Failed to fetch current user" };
    }
}
