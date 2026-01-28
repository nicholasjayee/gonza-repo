import { db } from "@gonza/shared/prisma/db";

export class PaymentService {
    /**
     * Update transaction status and award credits if completed
     * Accepts a raw status string or a full Pesapal status object
     */
    static async updateTransactionStatus(merchantReference: string, statusInfo: any) {
        let statusCode = -1;
        let statusStr = 'PENDING';

        if (typeof statusInfo === 'object' && statusInfo !== null) {
            // Priority 1: status_code (used in the reference)
            if (statusInfo.status_code !== undefined) {
                statusCode = Number(statusInfo.status_code);
            } else if (statusInfo.payment_status_code !== undefined) {
                statusCode = Number(statusInfo.payment_status_code);
            }

            // Priority 2: description
            statusStr = statusInfo.payment_status_description ||
                statusInfo.status ||
                'PENDING';
        } else if (typeof statusInfo === 'string') {
            statusStr = statusInfo;
            // Try to infer code if it's a numeric string
            if (/^\d+$/.test(statusInfo)) statusCode = Number(statusInfo);
        }

        const rawStatus = String(statusStr).toUpperCase();
        console.log(`[PaymentService] Processing ${merchantReference}. Code: ${statusCode}, Desc: ${rawStatus}`);

        const transaction = await db.transaction.findUnique({
            where: { pesapalMerchantReference: merchantReference }
        });

        if (!transaction) {
            console.error(`[PaymentService] Transaction NOT FOUND: ${merchantReference}`);
            return { success: false, error: "Transaction not found" };
        }

        // Mapping from reference: 0: INVALID, 1: SUCCESS, 2: FAILED, 3: REVERSED
        const isSuccess = statusCode === 1 || rawStatus === 'COMPLETED' || rawStatus === 'SUCCESS';
        const isFailure = statusCode === 0 || statusCode === 2 || statusCode === 3 || rawStatus === 'FAILED' || rawStatus === 'INVALID';

        // Idempotency: skip if already completed
        if (transaction.status === 'completed') {
            console.log(`[PaymentService] Transaction ${merchantReference} already completed. Skipping.`);
            return { success: true, status: 'completed' };
        }

        if (isSuccess) {
            const creditsToAward = Math.floor(transaction.amount / 100);
            console.log(`[PaymentService] SUCCESS verified. Awarding ${creditsToAward} credits.`);

            try {
                await db.$transaction([
                    db.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'completed' }
                    }),
                    db.user.update({
                        where: { id: transaction.userId },
                        data: { credits: { increment: creditsToAward } }
                    })
                ]);
                return { success: true, status: 'completed', creditsAwarded: creditsToAward };
            } catch (error) {
                console.error(`[PaymentService] DB Update Failed:`, error);
                throw error;
            }
        }

        if (isFailure && transaction.status === 'pending') {
            console.log(`[PaymentService] FAILURE. Updating status to failed.`);
            await db.transaction.update({
                where: { id: transaction.id },
                data: { status: 'failed' }
            });
            return { success: true, status: 'failed' };
        }

        console.log(`[PaymentService] No action for ${merchantReference}. DB: ${transaction.status}. Success matched? ${isSuccess}`);
        return { success: true, status: transaction.status };
    }
}
