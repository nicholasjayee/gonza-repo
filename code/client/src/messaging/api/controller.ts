'use server';

import { MessagingService, MessageTemplateService } from './service';
import { StorageService } from './storage';
import { PesaPalService } from './pesapal';
import { db } from "@gonza/shared/prisma/db";
import { MessageChannel, CreateTemplateInput } from '../types';
import { serialize } from '@/shared/utils/serialize';

/**
 * Action to send a single or bulk message
 */
export async function sendMessageAction(data: {
    userId: string;
    recipients: string[]; // Array for bulk support
    content: string;
    channel: MessageChannel;
    campaignName?: string;
    mediaUrl?: string;
}) {
    try {
        if (data.recipients.length > 1) {
            const result = await MessagingService.sendBulk(data);
            return { success: true, data: result };
        } else {
            const result = await MessagingService.sendMessage({
                ...data,
                recipient: data.recipients[0],
            });
            return { success: true, data: result };
        }
    } catch (error: any) {
        console.error("SendMessageAction Error:", error);
        return { success: false, error: error.message || 'Failed to send message' };
    }
}

/**
 * Action to fetch message history
 */
export async function getMessagesAction(userId: string) {
    try {
        const data = await MessagingService.getAllMessages(userId);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch messages' };
    }
}

/**
 * Action to initiate WhatsApp linking
 */
export async function linkWhatsAppAction(userId: string, type: 'qr' | 'pairing', phoneNumber: string) {
    try {
        const session = await MessagingService.requestWhatsAppLink(userId, type, phoneNumber);
        return { success: true, data: session };
    } catch (error) {
        return { success: false, error: 'Failed to initiate WhatsApp link' };
    }
}

/**
 * Action to get WhatsApp status
 */
export async function getWhatsAppStatusAction(userId: string) {
    try {
        const session = await MessagingService.getWhatsAppSession(userId);
        return { success: true, data: session };
    } catch (error) {
        return { success: false, error: 'Failed to fetch WhatsApp status' };
    }
}

/**
 * Action to disconnect WhatsApp
 */
export async function disconnectWhatsAppAction(userId: string) {
    try {
        const session = await MessagingService.disconnectWhatsApp(userId);
        return { success: true, data: session };
    } catch (error) {
        return { success: false, error: 'Failed to disconnect WhatsApp' };
    }
}

/**
 * Action to initiate a PesaPal Top-up
 */
export async function initiateTopUpAction(data: {
    userId: string;
    amount: number;
    description: string;
    email: string;
    name: string;
    phoneNumber: string;
}) {
    console.log('[Controller] initiateTopUpAction called for user:', data.userId, 'amount:', data.amount);
    try {
        const result = await PesaPalService.initiatePayment(data);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('[Controller] initiateTopUpAction failed:', error.message);
        return { success: false, error: error.message || 'Failed to initiate top-up' };
    }
}

/**
 * Action to get user's credit balance
 */
export async function getCreditBalanceAction(userId: string) {
    console.log('[Controller] getCreditBalanceAction called for user:', userId);
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        return { success: true, data: user?.credits || 0 };
    } catch (error: any) {
        console.error('[Controller] getCreditBalanceAction failed:', error);
        return { success: false, error: 'Failed to fetch credit balance' };
    }
}

/**
 * Action to get a pre-signed upload URL for R2
 */
export async function getUploadUrlAction(fileName: string, contentType: string) {
    try {
        const result = await StorageService.getUploadUrl(fileName, contentType);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to generate upload URL' };
    }
}

/**
 * Message Template Actions
 */
export async function getTemplatesAction(userId: string) {
    try {
        const data = await MessageTemplateService.getAll(userId);
        return { success: true, data: serialize(data) };
    } catch (error) {
        return { success: false, error: 'Failed to fetch templates' };
    }
}

export async function createTemplateAction(userId: string, data: CreateTemplateInput) {
    try {
        const template = await MessageTemplateService.create(userId, data);
        return { success: true, data: serialize(template) };
    } catch (error) {
        return { success: false, error: 'Failed to create template' };
    }
}

export async function updateTemplateAction(id: string, data: Partial<CreateTemplateInput>) {
    try {
        const template = await MessageTemplateService.update(id, data);
        return { success: true, data: serialize(template) };
    } catch (error) {
        return { success: false, error: 'Failed to update template' };
    }
}

export async function deleteTemplateAction(id: string) {
    try {
        await MessageTemplateService.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete template' };
    }
}

/**
 * Action to manually trigger a sync of all pending payments
 */
export async function syncPaymentsAction() {
    console.log('[Controller] syncPaymentsAction triggered');
    try {
        const results = await PesaPalService.syncAllPending();
        return { success: true, data: results };
    } catch (error: any) {
        console.error('[Controller] syncPaymentsAction failed:', error);
        return { success: false, error: 'Failed to sync payments' };
    }
}
