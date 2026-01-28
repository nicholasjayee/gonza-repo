'use server';

import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { CashAccountService } from './cash-account-service';
import { ProfitLossService } from './profit-loss-service';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { serialize } from '@/shared/utils/serialize';

// Auth helper
async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const mockReq = {
        headers: headerList,
        cookies: {
            get: (name: string) => cookieStore.get(name)
        }
    } as any;

    return authGuard(mockReq, ['user', 'admin']);
}

export async function getCashAccountsAction() {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: 'No active branch' };

    try {
        const accounts = await CashAccountService.getAll(branchId);
        return { success: true, data: serialize(accounts) };
    } catch (error) {
        console.error('Get cash accounts error:', error);
        return { success: false, error: 'Failed to fetch cash accounts' };
    }
}

export async function getCashAccountByIdAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        const account = await CashAccountService.getById(id);
        if (!account) return { success: false, error: 'Account not found' };
        return { success: true, data: serialize(account) };
    } catch (error) {
        console.error('Get cash account error:', error);
        return { success: false, error: 'Failed to fetch account' };
    }
}

export async function createCashAccountAction(data: {
    name: string;
    description?: string;
    initialBalance: number;
}) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: 'No active branch' };

    try {
        const account = await CashAccountService.create({
            ...data,
            branchId
        });
        return { success: true, data: serialize(account) };
    } catch (error) {
        console.error('Create cash account error:', error);
        return { success: false, error: 'Failed to create account' };
    }
}

export async function updateCashAccountAction(id: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
}) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        const account = await CashAccountService.update(id, data);
        return { success: true, data: serialize(account) };
    } catch (error) {
        console.error('Update cash account error:', error);
        return { success: false, error: 'Failed to update account' };
    }
}

export async function deleteCashAccountAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        await CashAccountService.delete(id);
        return { success: true };
    } catch (error) {
        console.error('Delete cash account error:', error);
        return { success: false, error: 'Failed to delete account' };
    }
}

export async function getProfitLossReportAction(startDate: string, endDate: string) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: 'No active branch' };

    try {
        const report = await ProfitLossService.generateReport(
            branchId,
            new Date(startDate),
            new Date(endDate)
        );
        return { success: true, data: serialize(report) };
    } catch (error) {
        console.error('Generate P&L report error:', error);
        return { success: false, error: 'Failed to generate report' };
    }
}
