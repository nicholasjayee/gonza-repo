'use server';

import { FinanceService } from './service';

export async function getTransactionsAction() {
    try {
        const data = await FinanceService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
