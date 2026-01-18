'use server';

import { CustomerService } from './service';

export async function getCustomersAction() {
    try {
        const data = await CustomerService.getAll();
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return { success: false, error: 'Failed to fetch customers' };
    }
}
