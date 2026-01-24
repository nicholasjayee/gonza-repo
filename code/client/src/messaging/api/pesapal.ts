import { env } from "@gonza/shared/config/env";
import { db } from "@gonza/shared/prisma/db";

const PESAPAL_URL = env.PESAPAL_BASE_URL;

// Token Caching
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export class PesaPalService {
    /**
     * Helper to safely parse JSON or log raw text on error
     */
    private static async safeJson(response: Response, logPrefix: string) {
        const text = await response.text();
        if (!response.ok) {
            console.error(`${logPrefix} HTTP Error ${response.status}:`, text);
            throw new Error(`PesaPal API Error: ${response.status} - ${text.substring(0, 100)}`);
        }
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`${logPrefix} JSON Parse Error:`, e);
            throw new Error("Invalid response from PesaPal.");
        }
    }

    /**
     * Centralized fetch with error logging
     */
    private static async safeFetch(url: string, options: RequestInit, logPrefix: string) {
        try {
            console.log(`${logPrefix} Requesting: ${options.method || 'GET'} ${url}`);
            const response = await fetch(url, options);
            return response;
        } catch (err: any) {
            console.error(`${logPrefix} Fetch Failure:`, err.message);
            if (err.cause) console.error(`${logPrefix} Cause:`, err.cause);
            throw new Error(`Network failure to PesaPal: ${err.message}`);
        }
    }

    /**
     * Get Authentication Token from PesaPal (with caching)
     */
    private static async getAuthToken() {
        if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
            return cachedToken;
        }

        const tokenUrl = `${PESAPAL_URL}/api/Auth/RequestToken`;
        const response = await this.safeFetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                consumer_key: env.PESAPAL_CONSUMER_KEY,
                consumer_secret: env.PESAPAL_CONSUMER_SECRET
            })
        }, '[PesaPal Auth]');

        const result = await this.safeJson(response, '[PesaPal Auth]');
        if (!result || !result.token) {
            throw new Error("PesaPal authentication failed or returned no token.");
        }

        cachedToken = result.token;
        tokenExpiry = Date.now() + 4 * 60 * 1000;
        return cachedToken;
    }

    /**
     * Register or find existing IPN
     */
    private static async getIpnId(token: string) {
        const callbackUrl = `${env.CLIENT_URL}/api/payments/pesapal-ipn`;
        const listUrl = `${PESAPAL_URL}/api/URLSetup/GetIpnList`;

        const listResponse = await this.safeFetch(listUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        }, '[PesaPal IPN List]');

        const ipns = await this.safeJson(listResponse, '[PesaPal IPN List]');

        let myIPN = null;
        if (Array.isArray(ipns)) {
            myIPN = ipns.find((i: any) => i.url === callbackUrl && i.ipn_status === 1);
        }

        if (myIPN) return myIPN.ipn_id;

        const regUrl = `${PESAPAL_URL}/api/URLSetup/RegisterIPN`;
        const regResponse = await this.safeFetch(regUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: callbackUrl,
                ipn_notification_type: 'POST'
            })
        }, '[PesaPal IPN Reg]');

        const regResult = await this.safeJson(regResponse, '[PesaPal IPN Reg]');
        if (!regResult || !regResult.ipn_id) {
            throw new Error("PesaPal IPN Registration failed.");
        }

        return regResult.ipn_id;
    }

    /**
     * Initiate Payment and get Iframe URL
     */
    static async initiatePayment(data: {
        userId: string,
        amount: number,
        description: string,
        email: string,
        name: string,
        phoneNumber: string
    }) {
        const token = await this.getAuthToken();
        const ipnId = await this.getIpnId(token);
        const merchantReference = `TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const body = {
            id: merchantReference,
            currency: "UGX",
            amount: data.amount,
            description: data.description,
            callback_url: `${env.CLIENT_URL}/api/payments/pesapal-callback`,
            notification_id: ipnId,
            billing_address: {
                email_address: data.email,
                first_name: data.name,
                phone_number: data.phoneNumber
            }
        };

        const orderUrl = `${PESAPAL_URL}/api/Transactions/SubmitOrderRequest`;
        const response = await this.safeFetch(orderUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        }, '[PesaPal Order]');

        const result = await this.safeJson(response, '[PesaPal Order]');
        if (!result || !result.order_tracking_id) {
            throw new Error("PesaPal Order submission failed.");
        }

        await db.transaction.create({
            data: {
                userId: data.userId,
                amount: data.amount,
                pesapalMerchantReference: merchantReference,
                pesapalOrderTrackingId: result.order_tracking_id,
                description: data.description,
                status: 'pending'
            }
        });

        return {
            redirectUrl: result.redirect_url,
            orderTrackingId: result.order_tracking_id,
            merchantReference
        };
    }

    /**
     * Get Transaction status
     */
    static async getTransactionStatus(trackingId: string) {
        const token = await this.getAuthToken();
        const url = `${PESAPAL_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`;

        const response = await this.safeFetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        }, '[PesaPal Status Check]');

        return await this.safeJson(response, '[PesaPal Status Check]');
    }

    /**
     * Polls PesaPal status until it reaches a final state (COMPLETED, FAILED, INVALID)
     * or times out after 30 seconds.
     */
    static async waitForFinalStatus(trackingId: string, maxAttempts = 10, intervalMs = 3000) {
        let attempts = 0;
        let lastStatus = null;

        while (attempts < maxAttempts) {
            attempts++;
            console.log(`[PesaPal Wait] Attempt ${attempts}/${maxAttempts} for ${trackingId}...`);

            try {
                const result = await this.getTransactionStatus(trackingId);
                lastStatus = result;

                const statusCode = result?.status_code || 0;
                const statusStr = result?.status?.toUpperCase() || '';

                if (['COMPLETED', 'FAILED', 'INVALID', 'CANCELLED', 'SUCCESS'].includes(statusStr)) {
                    console.log(`[PesaPal Wait] Reached final state: ${statusStr}`);
                    return result;
                }

                if (statusCode === 1 || statusCode === 2) {
                    console.log(`[PesaPal Wait] Reached final state via code: ${statusCode}`);
                    return result;
                }
            } catch (err) {
                console.error(`[PesaPal Wait] Error on attempt ${attempts}:`, err);
            }

            if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        }

        console.warn(`[PesaPal Wait] Timed out waiting for ${trackingId}. Last status:`, lastStatus?.status);
        return lastStatus;
    }

    /**
     * Scans all pending transactions in the DB and syncs them with PesaPal.
     * This is the "Watchdog" logic to recover from missed IPNs or abandoned callbacks.
     */
    static async syncAllPending() {
        console.log('[PesaPal Watchdog] Starting global sync...');

        // Find all transactions that are still 'pending'
        const pending = await db.transaction.findMany({
            where: { status: 'pending' },
            take: 20 // Limit batch size
        });

        console.log(`[PesaPal Watchdog] Found ${pending.length} pending transactions.`);

        const results = [];
        for (const tx of pending) {
            if (!tx.pesapalOrderTrackingId || !tx.pesapalMerchantReference) continue;

            console.log(`[PesaPal Watchdog] Syncing: ${tx.pesapalMerchantReference}...`);
            try {
                const statusResult = await this.getTransactionStatus(tx.pesapalOrderTrackingId);

                // Use PaymentService to award credits and update status
                const { PaymentService } = await import('./payment-service');
                const updateRes = await PaymentService.updateTransactionStatus(tx.pesapalMerchantReference, statusResult);

                results.push({
                    ref: tx.pesapalMerchantReference,
                    status: updateRes.status,
                    updated: true
                });
            } catch (err: any) {
                console.error(`[PesaPal Watchdog] Failed to sync ${tx.pesapalMerchantReference}:`, err.message);
                results.push({
                    ref: tx.pesapalMerchantReference,
                    error: err.message,
                    updated: false
                });
            }
        }

        console.log('[PesaPal Watchdog] Global sync complete.');
        return results;
    }
}
