import { NextRequest, NextResponse } from "next/server";
import { PesaPalService } from "@/messaging/api/pesapal";
import { db } from "@gonza/shared/prisma/db";

async function handleIPN(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // PesaPal sends these params in GET or body in POST
    let orderTrackingId = searchParams.get('OrderTrackingId');
    let merchantReference = searchParams.get('OrderMerchantReference');
    let notificationType = searchParams.get('OrderNotificationType');

    if (!orderTrackingId && req.method === 'POST') {
        try {
            const body = await req.json();
            orderTrackingId = body.OrderTrackingId;
            merchantReference = body.OrderMerchantReference;
            notificationType = body.OrderNotificationType;
        } catch (e) {
            console.error('[PesaPal IPN] Failed to parse POST body:', e);
        }
    }

    console.log('[PesaPal IPN] Received:', { orderTrackingId, merchantReference, notificationType });

    if (!orderTrackingId || !merchantReference) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // 1. Fetch current status from PesaPal
        const statusResult = await PesaPalService.getTransactionStatus(orderTrackingId);
        console.log('[PesaPal IPN] Status Check Result:', statusResult);

        // 2. Update Transaction in DB
        const transaction = await db.transaction.findUnique({
            where: { pesapalMerchantReference: merchantReference }
        });

        if (!transaction) {
            console.error('[PesaPal IPN] Transaction not found for reference:', merchantReference);
            return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
        }

        // Only update if it's not already completed
        if (transaction.status === 'completed') {
            console.log('[PesaPal IPN] Transaction already completed.');
            return NextResponse.json({ success: true, status: 'already_completed' });
        }

        const newStatus = statusResult.status_code === 1 ? 'completed' :
            statusResult.status_code === 3 ? 'failed' : 'pending';

        await db.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus,
                // Any other info from statusResult?
            }
        });

        // 3. Award credits if completed
        if (newStatus === 'completed') {
            // Logic: amount / 100 for credits (Adjust as needed)
            const creditsToStore = Math.floor(transaction.amount / 100);

            await db.user.update({
                where: { id: transaction.userId },
                data: {
                    credits: { increment: creditsToStore }
                }
            });
            console.log(`[PesaPal IPN] Awarded ${creditsToStore} credits to user ${transaction.userId}`);
        }

        // PesaPal expects a specific response and code 200/500
        return NextResponse.json({
            orderNotificationType: notificationType,
            orderTrackingId: orderTrackingId,
            orderMerchantReference: merchantReference,
            status: 200
        });
    } catch (error) {
        console.error('[PesaPal IPN] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return handleIPN(req);
}

export async function POST(req: NextRequest) {
    return handleIPN(req);
}
