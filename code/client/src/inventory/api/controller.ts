'use server';

import { InventoryService } from './service';

export async function getInventoryAction() {
    try {
        const data = await InventoryService.getAll();
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return { success: false, error: 'Failed to fetch inventory' };
    }
}
