'use server';

import { SettingService, UpdateSettingsInput } from './service';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { serialize } from '@/shared/utils/serialize';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@gonza/shared/config/env';

async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const mockReq = {
        headers: headerList,
        cookies: {
            get: (name: string) => cookieStore.get(name)
        }
    } as unknown as { cookies: { get: (key: string) => { value: string } | undefined } };

    return authGuard(mockReq, ['user', 'admin', 'manager']);
}

/**
 * R2 Upload Helper
 */
async function uploadImageToR2(file: File): Promise<string> {
    const s3Client = new S3Client({
        region: 'auto',
        endpoint: env.R2_ENDPOINT,
        credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `settings/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    }));

    return `${env.R2_PUBLIC_URL}/${fileName}`;
}

export async function getSettingsAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch selected");

        const settings = await SettingService.getSettings(branchId);
        return { success: true, data: serialize(settings) };
    } catch (error: unknown) {
        console.error("Failed to fetch settings:", error);
        return { success: false, error: "Failed to fetch settings" };
    }
}

export async function updateSettingsAction(formData: FormData) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch selected");

        const data: UpdateSettingsInput = {};

        // Text fields
        const fields = ['businessName', 'address', 'phone', 'email', 'website', 'currency'] as const;
        fields.forEach(field => {
            const val = formData.get(field);
            if (val !== null) {
                // Type-safe assignment
                (data as Record<string, string | boolean | undefined>)[field] = val as string;
            }
        });

        // Booleans
        if (formData.has('enableSignature')) {
            data.enableSignature = formData.get('enableSignature') === 'true';
        }

        // Files
        const logoFile = formData.get('logo') as File;
        if (logoFile && logoFile.size > 0) {
            data.logo = await uploadImageToR2(logoFile);
        }

        const signatureFile = formData.get('signatureImage') as File;
        if (signatureFile && signatureFile.size > 0) {
            data.signatureImage = await uploadImageToR2(signatureFile);
        }

        const settings = await SettingService.updateSettings(branchId, data);
        return { success: true, data: serialize(settings) };
    } catch (error: unknown) {
        console.error("Failed to update settings:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
        return { success: false, error: errorMessage };
    }
}
