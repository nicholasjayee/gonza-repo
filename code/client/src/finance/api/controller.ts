import { NextResponse } from 'next/server';
import { FinanceService } from './service';

export const FinanceController = {
    async getAccounts() {
        const accounts = await FinanceService.fetchAccounts();
        return NextResponse.json(accounts);
    },
    async getPnL(period: string) {
        const pnl = await FinanceService.getPnL(period);
        return NextResponse.json(pnl);
    }
};
