import { NextRequest, NextResponse } from "next/server";
import { PesaPalService } from "@/messaging/api/pesapal";

/**
 * BACKGROUND TRANSACTION WATCHDOG
 * This route can be called by a CRON job (e.g. Vercel Cron or GitHub Actions)
 * to scan for any pending transactions and update their status.
 * It ensures payments are completed even if callbacks fail or user leaves the page.
 */
export async function GET(req: NextRequest) {
    // Basic auth check for Cron secrets (optional but recommended)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    console.log('[Watchdog Route] Starting background sync...');

    try {
        const results = await PesaPalService.syncAllPending();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            processed: results.length,
            details: results
        });
    } catch (err: any) {
        console.error('[Watchdog Route] Error:', err.message);
        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}
