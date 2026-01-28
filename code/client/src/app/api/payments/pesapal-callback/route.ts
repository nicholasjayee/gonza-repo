import { NextRequest, NextResponse } from "next/server";
import { PesaPalService } from "@/messaging/api/pesapal";
import { PaymentService } from "@/messaging/api/payment-service";
import { env } from "@gonza/shared/config/env";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderRef = searchParams.get('OrderMerchantReference');

    console.log('[PesaPal Callback] Hit with:', { orderTrackingId, orderRef });

    if (!orderTrackingId || !orderRef) {
        return NextResponse.redirect(`${env.CLIENT_URL}/messaging?tab=history&error=missing_params`);
    }

    try {
        // 1. Fetch latest status with polling/wait
        const statusResult = await PesaPalService.waitForFinalStatus(orderTrackingId);
        if (!statusResult) throw new Error("Timed out or failed to get transaction status.");

        // 2. Apply status immediately
        const result = await PaymentService.updateTransactionStatus(orderRef, statusResult);

        const status = result.status || 'pending';
        const redirectUrl = `${env.CLIENT_URL}/messaging?tab=history&status=${status}&orderId=${orderRef}`;

        // Return a small script to redirect the TOP window (breaking out of the iframe)
        return new NextResponse(
            `<html>
                <body>
                    <p>Redirecting back to application...</p>
                    <script>
                        window.top.location.href = "${redirectUrl}";
                    </script>
                </body>
            </html>`,
            {
                headers: { "Content-Type": "text/html" }
            }
        );
    } catch (err) {
        console.error('[PesaPal Callback] Error:', err);
        return NextResponse.redirect(`${env.CLIENT_URL}/messaging?tab=history&error=callback_failed`);
    }
}
