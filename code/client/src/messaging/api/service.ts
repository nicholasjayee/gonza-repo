import { db } from '@gonza/shared/prisma/db';
import { env } from '@gonza/shared/config/env';
import { Message, MessageChannel, WhatsAppSession } from '../types';

const EAZIREACH_BASE_URL = 'https://api.eazireach.com/api/v1';

export class MessagingService {
    static async sendMessage(data: {
        userId: string;
        recipient: string;
        content: string;
        channel: MessageChannel;
        mediaUrl?: string;
    }): Promise<Message> {
        // 1. Fetch user with credits
        const user = await db.user.findUnique({
            where: { id: data.userId },
            include: { whatsappSession: true }
        });

        if (!user) throw new Error('User not found.');
        if (user.credits < 1) {
            throw new Error('Insufficient credits. Please top up your account.');
        }

        const session = user.whatsappSession;
        const phoneNumber = data.recipient.replace(/\D/g, ''); // Clean phone number

        // 2. Create message in DB (Pending)
        const message = await db.message.create({
            data: {
                content: data.content,
                recipient: data.recipient,
                channel: data.channel,
                userId: data.userId,
                mediaUrl: data.mediaUrl,
                status: 'pending',
            },
        }) as any;

        // 3. Call Eazireach API
        try {
            // Helper for robust media type detection
            const getMediaType = (url: string): 'image' | 'video' => {
                try {
                    const path = new URL(url).pathname;
                    return path.match(/\.(mp4|avi|mov)$/i) ? 'video' : 'image';
                } catch (e) {
                    return url.match(/\.(mp4|avi|mov)/i) ? 'video' : 'image';
                }
            };

            // Eazireach prefers + prefix for international numbers
            let cleanPhone = data.recipient.trim();
            if (!cleanPhone.startsWith('+')) {
                cleanPhone = '+' + cleanPhone.replace(/\D/g, '');
            }

            const isWhatsApp = data.channel === 'whatsapp' || data.channel === 'both';
            const hasMedia = !!data.mediaUrl;

            // If media is present, docs only show support for whatsapp channel
            const channel = (hasMedia && isWhatsApp) ? ["whatsapp"] : (data.channel === 'both' ? ['sms', 'whatsapp'] : [data.channel]);

            const body: any = {
                recipients: [{ phone: cleanPhone }],
                message: data.content,
                channel: channel,
            };

            if (isWhatsApp) {
                if (!session?.instanceName) {
                    throw new Error('WhatsApp is not connected. Please connect your WhatsApp in the Connection tab.');
                }
                body.whatsappInstance = session.instanceName;

                if (data.mediaUrl) {
                    body.mediaUrl = data.mediaUrl;
                    body.mediaType = getMediaType(data.mediaUrl);
                }
            }

            console.log('[Eazireach] Sending Payload:', JSON.stringify(body, null, 2));

            const response = await fetch(`${EAZIREACH_BASE_URL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': env.EAZIREACH_API_KEY,
                    'X-Account-ID': env.EAZIREACH_ACCOUNT_ID,
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || `Eazireach API error: ${response.statusText}`);
            }

            console.log('[Eazireach] Message sent successfully:', result);

            // 4. Update status to 'sent' and deduct credit
            await db.user.update({
                where: { id: data.userId },
                data: { credits: { decrement: 1 } }
            });

            return await db.message.update({
                where: { id: message.id },
                data: { status: 'sent' },
            }) as any;
        } catch (error: any) {
            console.error('Failed to send message via Eazireach:', error);
            // Update status to 'failed'
            await db.message.update({
                where: { id: message.id },
                data: { status: 'failed' },
            });
            throw error;
        }
    }

    /**
     * Send bulk messages
     */
    static async sendBulk(data: {
        userId: string;
        recipients: string[];
        content: string;
        channel: MessageChannel;
        campaignName?: string;
        mediaUrl?: string;
    }) {
        // 1. Fetch user with credits
        const user = await db.user.findUnique({
            where: { id: data.userId },
            include: { whatsappSession: true }
        });

        if (!user) throw new Error('User not found.');

        const cost = data.recipients.length;
        if (user.credits < cost) {
            throw new Error(`Insufficient credits. This campaign requires ${cost} credits, but you only have ${user.credits}.`);
        }

        const session = user.whatsappSession;

        if ((data.channel === 'whatsapp' || data.channel === 'both') && !session?.instanceName) {
            throw new Error('WhatsApp is not connected. Please connect your WhatsApp in the Connection tab.');
        }

        // 2. Create a Campaign
        const campaign = await db.campaign.create({
            data: {
                name: data.campaignName,
                userId: data.userId,
            },
        });

        // 3. Create all messages in DB as pending
        const messages = await Promise.all(
            data.recipients.map(recipient =>
                db.message.create({
                    data: {
                        content: data.content,
                        recipient,
                        channel: data.channel,
                        userId: data.userId,
                        mediaUrl: data.mediaUrl,
                        campaignId: campaign.id,
                        status: 'pending',
                    },
                })
            )
        );

        // 4. Call native bulk API
        try {
            const getMediaType = (url: string): 'image' | 'video' => {
                try {
                    const path = new URL(url).pathname;
                    return path.match(/\.(mp4|avi|mov)$/i) ? 'video' : 'image';
                } catch (e) {
                    return url.match(/\.(mp4|avi|mov)/i) ? 'video' : 'image';
                }
            };

            const isWhatsApp = data.channel === 'whatsapp' || data.channel === 'both';
            const hasMedia = !!data.mediaUrl;
            const channel = (hasMedia && isWhatsApp) ? ["whatsapp"] : (data.channel === 'both' ? ['sms', 'whatsapp'] : [data.channel]);

            const body: any = {
                recipients: data.recipients.map(r => {
                    let phone = r.trim();
                    if (!phone.startsWith('+')) phone = '+' + phone.replace(/\D/g, '');
                    return { phone };
                }),
                message: data.content,
                channel: channel,
            };

            if (isWhatsApp) {
                body.whatsappInstance = session?.instanceName;
                if (data.mediaUrl) {
                    body.mediaUrl = data.mediaUrl;
                    body.mediaType = getMediaType(data.mediaUrl);
                }
            }

            console.log('[Eazireach] Sending Bulk Payload:', JSON.stringify(body, null, 2));

            const response = await fetch(`${EAZIREACH_BASE_URL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': env.EAZIREACH_API_KEY,
                    'X-Account-ID': env.EAZIREACH_ACCOUNT_ID,
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || `Bulk send error: ${response.statusText}`);
            }

            console.log('[Eazireach] Bulk messages sent successfully:', result);

            // 5. Update statuses to 'sent' and deduct credits
            await db.$transaction([
                db.message.updateMany({
                    where: { id: { in: messages.map(m => m.id) } },
                    data: { status: 'sent' },
                }),
                db.user.update({
                    where: { id: data.userId },
                    data: { credits: { decrement: cost } }
                })
            ]);

            return { campaign, success: true };
        } catch (error: any) {
            console.error('Bulk send failed:', error);
            // Update statuses to 'failed'
            await db.message.updateMany({
                where: { id: { in: messages.map(m => m.id) } },
                data: { status: 'failed' },
            });
            // Throw so the UI gets the error
            throw error;
        }
    }

    /**
     * Get or Create WhatsApp Session for a user
     * Now checks live status from Eazireach if in 'connecting' state
     */
    static async getWhatsAppSession(userId: string): Promise<WhatsAppSession> {
        let session = await db.whatsAppSession.findUnique({
            where: { userId },
        });

        if (!session) {
            session = await db.whatsAppSession.create({
                data: {
                    userId,
                    status: 'disconnected',
                },
            });
        }

        // If status is 'connecting', check live status from Eazireach
        if (session.status === 'connecting') {
            try {
                const instanceName = (session as any).instanceName || `gonza_${userId.substring(0, 8)}`;
                console.log(`[Eazireach] Checking live status for: ${instanceName}`);

                const statusResponse = await fetch(`${EAZIREACH_BASE_URL}/whatsapp/status/${instanceName}`, {
                    method: 'GET',
                    headers: {
                        'X-API-Key': env.EAZIREACH_API_KEY,
                        'X-Account-ID': env.EAZIREACH_ACCOUNT_ID,
                    },
                });

                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    console.log(`[Eazireach] Live status response for ${instanceName}:`, JSON.stringify(statusData, null, 2));

                    // Robust check: Eazireach response formats vary, so we check all possibilities
                    // Log shows: data.instance.state: "open"
                    const isConnected =
                        statusData.connected === true ||
                        statusData.data?.status?.toLowerCase() === 'connected' ||
                        statusData.status?.toLowerCase() === 'connected' ||
                        statusData.data?.connected === true ||
                        statusData.data?.instance?.state === 'open';

                    if (isConnected) {
                        console.log(`[Eazireach] Instance ${instanceName} is now CONNECTED according to API! Updating database.`);
                        session = await db.whatsAppSession.update({
                            where: { userId },
                            data: {
                                status: 'connected',
                                qrCode: null,
                                pairingCode: null,
                            },
                        });
                    } else {
                        console.log(`[Eazireach] Instance ${instanceName} is still NOT connected.`);
                    }
                } else {
                    console.log(`[Eazireach] Status API returned ${statusResponse.status}: ${statusResponse.statusText}`);
                }
            } catch (error) {
                console.error('[Eazireach] Failed to check live status:', error);
            }
        }

        return session as any;
    }

    /**
     * Request a new WhatsApp connection (QR or Pairing)
     * Following Eazireach API: Create instance, then get connection data
     */
    static async requestWhatsAppLink(userId: string, type: 'qr' | 'pairing', phoneNumber: string) {
        try {
            // Use userId as instance name to keep it unique per user
            const instanceName = `gonza_${userId.substring(0, 8)}`;

            console.log('[Eazireach] Creating WhatsApp instance:', instanceName);

            // Step 1: Create WhatsApp instance
            const createResponse = await fetch(`${EAZIREACH_BASE_URL}/whatsapp/instance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': env.EAZIREACH_API_KEY,
                    'X-Account-ID': env.EAZIREACH_ACCOUNT_ID,
                },
                body: JSON.stringify({
                    instanceName: instanceName,
                }),
            });

            let actualInstanceName = instanceName;

            if (createResponse.ok) {
                const createData = await createResponse.json();
                console.log('[Eazireach] Instance created successfully:', createData);
                // Use the instance name returned by the API if available
                if (createData.instanceName) {
                    actualInstanceName = createData.instanceName;
                }
            } else {
                const errorText = await createResponse.text();
                console.log('[Eazireach] Create instance response:', {
                    status: createResponse.status,
                    statusText: createResponse.statusText,
                    body: errorText
                });

                // If instance already exists, that's okay, continue
                // Otherwise, throw error
                if (createResponse.status !== 409 && createResponse.status !== 400) {
                    throw new Error(`Failed to create instance: ${errorText}`);
                }
                console.log('[Eazireach] Instance might already exist, proceeding...');
            }

            // Step 2: Get connection data (QR code / pairing code)
            const method = type === 'qr' ? 'qrCode' : 'pairingCode';
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            const connectUrl = `${EAZIREACH_BASE_URL}/whatsapp/connect/${actualInstanceName}?number=${cleanNumber}&method=${method}`;
            console.log('[Eazireach] Connect URL:', connectUrl);

            // Tip from docs: May need to retry if pairingCode is null
            let connectResponse;
            let retryCount = 0;
            let apiData;

            do {
                if (retryCount > 0) {
                    console.log('[Eazireach] Retrying connection data fetch...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                connectResponse = await fetch(connectUrl, {
                    method: 'GET',
                    headers: {
                        'X-API-Key': env.EAZIREACH_API_KEY,
                        'X-Account-ID': env.EAZIREACH_ACCOUNT_ID,
                    },
                });

                if (!connectResponse.ok) {
                    const errorText = await connectResponse.text();
                    console.error('[Eazireach] Connect error:', {
                        status: connectResponse.status,
                        statusText: connectResponse.statusText,
                        body: errorText,
                        url: connectUrl
                    });
                    throw new Error(`Eazireach API error: ${connectResponse.statusText}`);
                }

                apiData = await connectResponse.json();
                console.log('[Eazireach] Connection data received:', apiData);
                retryCount++;
            } while (apiData.data?.pairingCode === null && apiData.data?.base64 === null && retryCount < 3);

            // Extract data from response
            const qrCode = apiData.data?.base64 || null;
            const pairingCode = apiData.data?.pairingCode || null;

            console.log('[Eazireach] Extracted codes:', { hasQR: !!qrCode, hasPairing: !!pairingCode });

            // Update database with real API data
            return await db.whatsAppSession.update({
                where: { userId },
                data: {
                    status: 'connecting',
                    instanceName: actualInstanceName,
                    qrCode,
                    pairingCode,
                    linkedPhoneNumber: phoneNumber,
                    sessionData: JSON.stringify(apiData),
                },
            });
        } catch (error) {
            console.error('[Eazireach] Failed to request WhatsApp link:', error);

            // Fallback: Update DB with disconnected status
            return await db.whatsAppSession.update({
                where: { userId },
                data: {
                    status: 'disconnected',
                    qrCode: null,
                    pairingCode: null,
                },
            });
        }
    }

    /**
     * Disconnect WhatsApp session
     */
    static async disconnectWhatsApp(userId: string) {
        return await db.whatsAppSession.update({
            where: { userId },
            data: {
                status: 'disconnected',
                qrCode: null,
                pairingCode: null,
                linkedPhoneNumber: null,
                sessionData: null,
            },
        });
    }

    /**
     * Internal: Call Eazireach SMS API (Legacy)
     * Now handled directly in sendMessage via the unified /send endpoint
     */
    private static async sendExternalSMS(to: string, message: string) {
        // Implementation moved to sendMessage
    }

    /**
     * Internal: Call Eazireach WhatsApp API (Legacy)
     * Now handled directly in sendMessage via the unified /send endpoint
     */
    private static async sendExternalWhatsApp(to: string, message: string, mediaUrl?: string) {
        // Implementation moved to sendMessage
    }

    static async getAllMessages(userId: string): Promise<Message[]> {
        return await db.message.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }) as any;
    }
}
