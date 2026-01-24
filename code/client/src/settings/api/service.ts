import { db } from '@gonza/shared/prisma/db';

export interface UpdateSettingsInput {
    logo?: string;
    signatureImage?: string;
    enableSignature?: boolean;
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    currency?: string;
}

export class SettingService {
    /**
     * Get settings for a branch.
     * Creates default settings if they don't exist.
     */
    static async getSettings(branchId: string) {
        return db.branchSettings.upsert({
            where: { branchId },
            update: {}, // No update needed if exists
            create: {
                branchId,
                currency: 'UGX',
                enableSignature: false
            }
        });
    }

    /**
     * Update settings for a branch
     */
    static async updateSettings(branchId: string, data: UpdateSettingsInput) {
        return db.branchSettings.upsert({
            where: { branchId },
            create: {
                branchId,
                ...data
            },
            update: {
                ...data
            }
        });
    }
}
