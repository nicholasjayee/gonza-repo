"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { serialize } from "@/shared/utils/serialize";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

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

export async function getBranchesAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    const branches = await db.branch.findMany({
      where: {
        OR: [
          { adminId: auth.user.id },
          { users: { some: { id: auth.user.id } } }
        ]
      },
      orderBy: [
        { type: 'asc' }, // MAIN branches first (assuming MAIN < SUB if they were sorted, but we usually want MAIN first)
        { createdAt: 'asc' }
      ]
    });

    return { success: true, data: serialize(branches) };
  } catch (error: unknown) {
    console.error("Error fetching branches:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch branches" 
    };
  }
}

export async function createBranchAction(data: { name: string; location: string; phone?: string; email?: string; type?: 'MAIN' | 'SUB' }) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    const branch = await db.branch.create({
      data: {
        ...data,
        adminId: auth.user.id,
        users: { connect: { id: auth.user.id } }
      }
    });

    return { success: true, data: serialize(branch) };
  } catch (error: unknown) {
    console.error("Error creating branch:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create branch" 
    };
  }
}

export async function updateBranchAction(id: string, data: Partial<{ name: string; location: string; phone: string; email: string }>) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Check if user is admin of the branch
    const branch = await db.branch.findUnique({ where: { id } });
    if (!branch || branch.adminId !== auth.user.id) {
      throw new Error("Unauthorized or branch not found");
    }

    const updatedBranch = await db.branch.update({
      where: { id },
      data
    });

    return { success: true, data: serialize(updatedBranch) };
  } catch (error: unknown) {
    console.error("Error updating branch:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update branch" 
    };
  }
}

export async function deleteBranchAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Check if user is admin of the branch
    const branch = await db.branch.findUnique({ where: { id } });
    if (!branch || branch.adminId !== auth.user.id) {
      throw new Error("Unauthorized or branch not found");
    }

    // Check if it's the last branch? Or let CASCADE handle it.
    // The previous implementation prevented deleting the default business.
    // In Prisma, we don't have isDefault on Branch, but we have branchId on User.

    await db.branch.delete({ where: { id } });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting branch:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete branch" 
    };
  }
}

export async function setDefaultBranchAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");


  try {
    // Update user's branchId
    await db.user.update({
      where: { id: auth.user.id },
      data: { branchId: id }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error setting default branch:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to set default branch" 
    };
  }
}

// =========================
// PASSWORD MANAGEMENT
// =========================

export async function setBranchPasswordAction(branchId: string, password: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Verify user is admin of this branch
    const branch = await db.branch.findFirst({
      where: {
        id: branchId,
        adminId: auth.user.id
      }
    });

    if (!branch) {
      throw new Error("Branch not found or unauthorized");
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update branch with hashed password
    await db.branch.update({
      where: { id: branchId },
      data: { accessPassword: hashedPassword }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error setting branch password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set password"
    };
  }
}

export async function verifyBranchPasswordAction(branchId: string, password: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Fetch branch with password
    const branch = await db.branch.findFirst({
      where: {
        id: branchId,
        OR: [
          { adminId: auth.user.id },
          { users: { some: { id: auth.user.id } } }
        ]
      },
      select: { accessPassword: true }
    });

    if (!branch) {
      throw new Error("Branch not found or unauthorized");
    }

    if (!branch.accessPassword) {
      return { success: true, verified: false };
    }

    // Verify password using bcrypt
    const verified = await bcrypt.compare(password, branch.accessPassword);

    return { success: true, verified };
  } catch (error: unknown) {
    console.error("Error verifying branch password:", error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : "Failed to verify password"
    };
  }
}

export async function removeBranchPasswordAction(branchId: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Verify user is admin of this branch
    const branch = await db.branch.findFirst({
      where: {
        id: branchId,
        adminId: auth.user.id
      }
    });

    if (!branch) {
      throw new Error("Branch not found or unauthorized");
    }

    // Remove password
    await db.branch.update({
      where: { id: branchId },
      data: { accessPassword: null }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error removing branch password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove password"
    };
  }
}
