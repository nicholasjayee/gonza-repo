import { NextResponse } from "next/server";
import { db } from "@gonza/shared/prisma/db";
import { PesaPalService } from "@/messaging/api/pesapal";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max 60 seconds for this endpoint

/**
 * Server-side polling endpoint that checks pending transactions
 * This runs independently of user actions, ensuring credits are awarded
 * even if the user closes the browser
 */
export async function GET() {
    console.log('[Payment Poller] Starting transaction status check...');

    try {
        // Find all pending transactions created in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const pendingTransactions = await db.transaction.findMany({
            where: {
                status: 'pending',
                createdAt: {
                    gte: oneDayAgo
                }
            },
            select: {
                id: true,
                userId: true,
                amount: true,
                pesapalOrderTrackingId: true,
                pesapalMerchantReference: true,
                createdAt: true
            }
        });

        console.log(`[Payment Poller] Found ${pendingTransactions.length} pending transactions`);

        const results = [];

        for (const transaction of pendingTransactions) {
            try {
                // Check status with PesaPal
                const statusResult = await PesaPalService.getTransactionStatus(
                    transaction.pesapalOrderTrackingId
                );

                console.log(`[Payment Poller] Transaction ${transaction.pesapalMerchantReference}:`, statusResult);

                const newStatus = statusResult.status_code === 1 ? 'completed' :
                    statusResult.status_code === 3 ? 'failed' : 'pending';

                if (newStatus !== 'pending') {
                    // Update transaction
                    await db.transaction.update({
                        where: { id: transaction.id },
                        data: { status: newStatus }
                    });

                    // Award credits if completed
                    if (newStatus === 'completed') {
                        const creditsToAward = Math.floor(transaction.amount / 100);

                        await db.user.update({
                            where: { id: transaction.userId },
                            data: {
                                credits: { increment: creditsToAward }
                            }
                        });

                        console.log(`[Payment Poller] ✅ Awarded ${creditsToAward} credits to user ${transaction.userId}`);

                        results.push({
                            reference: transaction.pesapalMerchantReference,
                            status: 'completed',
                            creditsAwarded: creditsToAward
                        });
                    } else {
                        console.log(`[Payment Poller] ❌ Transaction ${transaction.pesapalMerchantReference} failed`);
                        results.push({
                            reference: transaction.pesapalMerchantReference,
                            status: 'failed'
                        });
                    }
                }
            } catch (err) {
                console.error(`[Payment Poller] Error processing transaction ${transaction.pesapalMerchantReference}:`, err);
                results.push({
                    reference: transaction.pesapalMerchantReference,
                    error: err instanceof Error ? err.message : 'Unknown error'
                });
            }
        }

        return NextResponse.json({
            success: true,
            checked: pendingTransactions.length,
            results
        });
    } catch (error) {
        console.error('[Payment Poller] Fatal error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
