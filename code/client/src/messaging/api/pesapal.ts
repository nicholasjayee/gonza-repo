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
        console.log(`${logPrefix} Raw Response:`, text || '[Empty Body]');

        if (!response.ok) {
            console.error(`${logPrefix} HTTP Error ${response.status}:`, text);
            throw new Error(`PesaPal API Error: ${response.status}`);
        }

        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`${logPrefix} JSON Parse Error:`, e);
            console.error(`${logPrefix} Problematic Text:`, text);
            throw new Error("Invalid response from PesaPal. Check server logs.");
        }
    }

    /**
     * Get Authentication Token from PesaPal (with caching)
     */
    private static async getAuthToken() {
        if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
            console.log('[PesaPal Service] Using cached token');
            return cachedToken;
        }

        const tokenUrl = `${PESAPAL_URL}/api/Auth/RequestToken`;
        console.log('[PesaPal Service] Requesting new token from:', tokenUrl);

        let response;
        try {
            response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    consumer_key: env.PESAPAL_CONSUMER_KEY,
                    consumer_secret: env.PESAPAL_CONSUMER_SECRET
                })
            });
        } catch (fetchErr: any) {
            console.error('[PesaPal Service] Network Fetch Failed:', fetchErr.message);
            console.error('[PesaPal Service] Fetch Cause:', fetchErr.cause);
            console.error('[PesaPal Service] Fetch Stack:', fetchErr.stack);
            throw new Error(`Network connection to PesaPal failed: ${fetchErr.message}`);
        }

        const result = await this.safeJson(response, '[PesaPal Auth]');

        if (!result) {
            throw new Error("PesaPal returned an empty authentication response. Double check your PESAPAL_BASE_URL and credentials.");
        }

        if (result.error) throw new Error(`PesaPal Auth Error: ${result.error.message || 'Unknown error'}`);

        if (!result.token) {
            console.error('[PesaPal Auth] Success status but no token in response:', result);
            throw new Error("PesaPal response succeeded but didn't contain an auth token.");
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
        console.log('[PesaPal Service] Fetching IPN list from:', listUrl);
        const listResponse = await fetch(listUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const ipns = await this.safeJson(listResponse, '[PesaPal IPN List]');

        let myIPN = null;
        if (Array.isArray(ipns)) {
            myIPN = ipns.find((i: any) => i.url === callbackUrl && i.ipn_status === 1);
        }

        if (myIPN) {
            console.log('[PesaPal Service] Found active IPN:', myIPN.ipn_id);
            return myIPN.ipn_id;
        }

        const regUrl = `${PESAPAL_URL}/api/URLSetup/RegisterIPN`;
        console.log('[PesaPal Service] Registering new IPN at:', regUrl);
        const regResponse = await fetch(regUrl, {
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
        });

        const regResult = await this.safeJson(regResponse, '[PesaPal IPN Reg]');
        if (!regResult || !regResult.ipn_id || regResult.error) {
            throw new Error(`PesaPal IPN Registration Error: ${regResult?.error?.message || 'Unknown error'}`);
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
        console.log('[PesaPal Service] initiatePayment started for user:', data.userId);
        const token = await this.getAuthToken();
        if (!token) throw new Error("Could not authenticate with PesaPal");

        const ipnId = await this.getIpnId(token);
        if (!ipnId) throw new Error("Could not register or find a valid IPN ID");

        const merchantReference = `TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const body = {
            id: merchantReference,
            currency: "UGX",
            amount: data.amount,
            description: data.description,
            callback_url: `${env.CLIENT_URL}/messaging?tab=history`,
            notification_id: ipnId,
            billing_address: {
                email_address: data.email,
                first_name: data.name,
                phone_number: data.phoneNumber
            }
        };

        const orderUrl = `${PESAPAL_URL}/api/Transactions/SubmitOrderRequest`;
        console.log('[PesaPal Service] Submitting order request to:', orderUrl);
        const response = await fetch(orderUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await this.safeJson(response, '[PesaPal Order]');
        if (!result) throw new Error("PesaPal returned an empty order response.");
        if (result.error) throw new Error(`PesaPal Order Error: ${result.error.message || 'Failed to submit order'}`);

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
        console.log('[PesaPal Service] Checking status for:', trackingId);
        const url = `${PESAPAL_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        return await this.safeJson(response, '[PesaPal Status Check]');
    }
}
