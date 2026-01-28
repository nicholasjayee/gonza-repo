'use server';

import { SupportService } from './service';

export async function getTicketsAction() {
    try {
        const data = await SupportService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
