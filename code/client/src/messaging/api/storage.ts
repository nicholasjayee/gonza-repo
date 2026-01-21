import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@gonza/shared/config/env";

const r2Client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false, // Use virtual-hosted style for better CORS compatibility
});

export class StorageService {
    /**
     * Generate a pre-signed URL for uploading a file to R2
     */
    static async getUploadUrl(fileName: string, contentType: string) {
        if (!env.R2_BUCKET_NAME || !env.R2_ACCOUNT_ID) {
            throw new Error("Cloudflare R2 is not configured. Please add R2 credentials to .env");
        }

        // Sanitize fileName: remove special characters and spaces
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `messaging/${Date.now()}-${safeName}`;

        const command = new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

        return { uploadUrl, publicUrl, key };
    }
}
