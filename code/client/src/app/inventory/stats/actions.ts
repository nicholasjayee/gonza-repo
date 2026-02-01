/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
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

export async function getInventoryStatsAction(locationId: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user) throw new Error("Unauthorized");

  try {
    // Call the database function using raw query
    // Adjust syntax based on PostgreSQL function call
    // Assuming get_inventory_stats returns a single row with json or record
    
    const result: any[] = await db.$queryRaw`SELECT * FROM get_inventory_stats(${locationId}::uuid)`;

    if (result && result.length > 0) {
      const stats = result[0];
      // Map keys if necessary, or return as is depending on function output
      // The hook expects: totalCostValue, totalStockValue, lowStockCount, outOfStockCount
      // Check if function returns camelCase or snake_case
      // Usually Postgres returns lowercase columns.
      
      // If the function returns a JSON object, result might be slightly different.
      // Based on hook usage: (supabase.rpc as any)('get_inventory_stats', ...)
      // It returns an object.
      
      return {
        success: true,
        data: {
            totalCostValue: Number(stats.totalCostValue || stats.totalcostvalue || 0),
            totalStockValue: Number(stats.totalStockValue || stats.totalstockvalue || 0),
            lowStockCount: Number(stats.lowStockCount || stats.lowstockcount || 0),
            outOfStockCount: Number(stats.outOfStockCount || stats.outofstockcount || 0)
        }
      };
    }

    return {
      success: true,
      data: {
        totalCostValue: 0,
        totalStockValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      }
    };
  } catch (error: unknown) {
    console.error("Error fetching inventory stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory stats",
    };
  }
}
