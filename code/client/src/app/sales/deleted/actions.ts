
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

// ===== DELETED SALES ACTIONS (ActivityHistory) =====

export async function getDeletedSalesAction() {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const deletedSales = await db.activityHistory.findMany({
      where: {
        locationId: branchId,
        module: "SALES",
        activityType: "DELETE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: serialize(deletedSales),
    };
  } catch (error: unknown) {
    console.error("Error fetching deleted sales:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch deleted sales",
    };
  }
}
