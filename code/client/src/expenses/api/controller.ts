import { NextResponse } from 'next/server';
import { ExpenseService } from './service';

export const ExpenseController = {
    async getExpenses() {
        const expenses = await ExpenseService.fetchExpenses();
        return NextResponse.json(expenses);
    }
};
