'use server';

import { ExpenseService } from './service';

export async function getExpensesAction() {
    try {
        const data = await ExpenseService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
