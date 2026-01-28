import { NextRequest, NextResponse } from "next/server";
import { PesaPalService } from "@/messaging/api/pesapal";
import { PaymentService } from "@/messaging/api/payment-service";

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
        // 1. Fetch current status from PesaPal with wait/poll
        const statusResult = await PesaPalService.waitForFinalStatus(orderTrackingId);
        console.log('[PesaPal IPN] Status Check Result:', statusResult);
        if (!statusResult) throw new Error("Timed out or failed to get transaction status.");

        // 2. Update Transaction in DB using PaymentService
        await PaymentService.updateTransactionStatus(merchantReference, statusResult);

        // Always return 200 to Pesapal if we received the notification correctly
        return NextResponse.json({
            success: true,
            status: statusResult.status,
            orderTrackingId
        });
    } catch (err: any) {
        console.error('[PesaPal IPN] processing error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return handleIPN(req);
}

export async function POST(req: NextRequest) {
    return handleIPN(req);
}
