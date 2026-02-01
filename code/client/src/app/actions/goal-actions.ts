/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db, Sale, SaleItem } from "@gonza/shared/prisma/db";
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

export async function getSalesGoalAction(month: number, year: number) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const goal = await db.salesGoal.findFirst({
      where: {
        userId: auth.user.id,
        branchId,
        month,
        year
      }
    });

    return { success: true, data: serialize(goal) };
  } catch (error: any) {
    console.error("Error fetching sales goal:", error);
    return { success: false, error: "Failed to fetch sales goal" };
  }
}

export async function updateSalesGoalAction(data: {
  month: number;
  year: number;
  dailyGoal?: number;
  weeklyGoal?: number;
  monthlyGoal?: number;
}) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Upsert logic for sales goal
    const existing = await db.salesGoal.findFirst({
      where: {
        userId: auth.user.id,
        branchId,
        month: data.month,
        year: data.year
      }
    });

    let goal;
    if (existing) {
      goal = await db.salesGoal.update({
        where: { id: existing.id },
        data: {
          dailyGoal: data.dailyGoal ?? existing.dailyGoal,
          weeklyGoal: data.weeklyGoal ?? existing.weeklyGoal,
          monthlyGoal: data.monthlyGoal ?? existing.monthlyGoal,
          updatedAt: new Date()
        }
      });
    } else {
      goal = await db.salesGoal.create({
        data: {
          userId: auth.user.id,
          branchId,
          month: data.month,
          year: data.year,
          dailyGoal: data.dailyGoal ?? 0,
          weeklyGoal: data.weeklyGoal ?? 0,
          monthlyGoal: data.monthlyGoal ?? 0
        }
      });
    }

    return { success: true, data: serialize(goal) };
  } catch (error: any) {
    console.error("Error updating sales goal:", error);
    return { success: false, error: "Failed to update sales goal" };
  }
}

export async function getPeriodSalesTotalAction(startDate: Date, endDate: Date) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const sales = await db.sale.findMany({
      where: {
        userId: auth.user.id,
        branchId,
        date: {
          gte: startDate,
          lte: endDate
        },
        paymentStatus: {
          not: "QUOTE"
        }
      },
      include: {
        items: true
      }
    });

    const total = sales.reduce((sum: number, sale: Sale & { items: SaleItem[] }) => {
      const saleTotal = sale.items.reduce((itemSum: number, item: SaleItem) => {
        return itemSum + (Number(item.sellingPrice) * item.quantity);
      }, 0);
      return sum + saleTotal;
    }, 0);

    return { success: true, data: total };
  } catch (error: any) {
    console.error("Error calculating period sales total:", error);
    return { success: false, error: "Failed to calculate sales total" };
  }
}
