/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
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

export async function getBranchSettingsAction(branchId: string) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Verify user has access to this branch
    const branch = await db.branch.findFirst({
      where: {
        id: branchId,
        OR: [
          { adminId: auth.user.id },
          { users: { some: { id: auth.user.id } } }
        ]
      }
    });

    if (!branch) {
      throw new Error("Branch not found or access denied");
    }

    // Fetch settings
    const settings = await db.branchSettings.findUnique({
      where: { branchId }
    });

    return { 
      success: true, 
      data: settings ? serialize(settings) : null 
    };
  } catch (error: unknown) {
    console.error("Error fetching branch settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings"
    };
  }
}

export async function updateBranchSettingsAction(
  branchId: string, 
  settingsData: {
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    signatureImage?: string;
    enableSignature?: boolean;
    currency?: string;
    paymentInfo?: string;
    defaultPrintFormat?: string;
  }
) {
  const auth = await getAuth();
  if (!auth.authorized || !auth.user?.id) throw new Error("Unauthorized");

  try {
    // Verify user has access to this branch
    const branch = await db.branch.findFirst({
      where: {
        id: branchId,
        OR: [
          { adminId: auth.user.id },
          { users: { some: { id: auth.user.id } } }
        ]
      }
    });

    if (!branch) {
      throw new Error("Branch not found or access denied");
    }

    // Prepare update data - map from hook's field names to schema field names
    const updateData: any = {
      branchId
    };

    if (settingsData.businessName !== undefined) updateData.businessName = settingsData.businessName;
    if (settingsData.address !== undefined) updateData.address = settingsData.address;
    if (settingsData.phone !== undefined) updateData.phone = settingsData.phone;
    if (settingsData.email !== undefined) updateData.email = settingsData.email;
    if (settingsData.website !== undefined) updateData.website = settingsData.website;
    if (settingsData.logo !== undefined) updateData.logo = settingsData.logo;
    if (settingsData.signatureImage !== undefined) updateData.signatureImage = settingsData.signatureImage;
    if (settingsData.enableSignature !== undefined) updateData.enableSignature = settingsData.enableSignature;
    if (settingsData.currency !== undefined) updateData.currency = settingsData.currency;

    // Upsert settings
    const settings = await db.branchSettings.upsert({
      where: { branchId },
      create: updateData,
      update: updateData
    });

    return { 
      success: true, 
      data: serialize(settings) 
    };
  } catch (error: unknown) {
    console.error("Error updating branch settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings"
    };
  }
}
