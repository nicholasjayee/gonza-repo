'use server';

import { SalesService } from './service';

export async function getSalesAction() {
    try {
        const sales = await SalesService.getAllSales();
        return { success: true, data: sales };
    } catch (error) {
        console.error("Failed to fetch sales:", error);
        return { success: false, error: "Failed to fetch sales" };
    }
}

export async function createSaleAction(formData: FormData) {
    // Extract data from formData and call Service
    const amount = parseFloat(formData.get('amount') as string);
    await SalesService.createSale({ amount });
    return { success: true };
}
