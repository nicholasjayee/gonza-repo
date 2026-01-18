'use server';

import { MessagingService } from './service';

export async function getMessagesAction() {
    try {
        const data = await MessagingService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
