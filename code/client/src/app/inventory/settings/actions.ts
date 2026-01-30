'use server';

import { db } from '@gonza/shared/prisma/db';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { serialize } from '@/shared/utils/serialize';
import { NextRequest } from 'next/server';

interface UpdateSettingsInput {
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessLogo?: string;
    currency?: string;
    signature?: string;
}

async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const mockReq = {
        headers: headerList,
        cookies: {
            get: (name: string) => cookieStore.get(name)
        }
    } as unknown as NextRequest;

    return authGuard(mockReq, ['user', 'admin']);
}

export async function getBusinessSettingsAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const settings = await db.branchSettings.findUnique({
            where: { branchId }
        });

        if (!settings) return { success: true, data: null };

        // Map Prisma model to frontend BusinessSettings interface
        const mappedSettings = {
            id: settings.id,
            businessName: settings.businessName || '',
            businessAddress: settings.address || '',
            businessPhone: settings.phone || '',
            businessEmail: settings.email || '',
            businessLogo: settings.logo || '',
            currency: settings.currency || 'UGX',
            signature: settings.signatureImage || '',
            // paymentInfo and defaultPrintFormat are not in the current Prisma schema
            paymentInfo: '',
            defaultPrintFormat: 'standard'
        };

        return { success: true, data: serialize(mappedSettings) };
    } catch (error: unknown) {
        console.error("Error fetching business settings:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch settings" };
    }
}

export async function updateBusinessSettingsAction(settingsData: UpdateSettingsInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const updateData = {
            businessName: settingsData.businessName,
            address: settingsData.businessAddress,
            phone: settingsData.businessPhone,
            email: settingsData.businessEmail,
            logo: settingsData.businessLogo,
            currency: settingsData.currency,
            signatureImage: settingsData.signature,
            // paymentInfo and defaultPrintFormat are not in the current Prisma schema
        };

        const settings = await db.branchSettings.upsert({
            where: { branchId },
            update: updateData,
            create: {
                ...updateData,
                branchId
            }
        });

        return { success: true, data: serialize(settings) };
    } catch (error: unknown) {
        console.error("Error updating business settings:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" };
    }
}
