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

// ===== CATEGORY ACTIONS =====

export async function getCategoriesAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: serialize(categories),
    };
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

export async function createCategoryAction(name: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    // Check if category already exists
    const existing = await db.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      return {
        success: false,
        error: "Category already exists",
        data: serialize(existing),
      };
    }

    const category = await db.category.create({
      data: { name },
    });

    return {
      success: true,
      data: serialize(category),
    };
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategoryAction(id: string, name: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    // Check if another category with this name exists
    const existing = await db.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Another category with this name already exists",
      };
    }

    const category = await db.category.update({
      where: { id },
      data: { name },
    });

    return {
      success: true,
      data: serialize(category),
    };
  } catch (error: unknown) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategoryAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    // Check if any products use this category
    const productsCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error: "Cannot delete category that is being used by products",
      };
    }

    await db.category.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}
