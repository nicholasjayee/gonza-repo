/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { SaleService } from './service';
import { CreateSaleInput, PaymentStatus } from '../types';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { serialize } from '@/shared/utils/serialize';

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

export async function createSaleAction(data: CreateSaleInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const sale = await SaleService.create(data, auth.user.id, branchId);
        return { success: true, data: serialize(sale) };
    } catch (error: any) {
        console.error("Error creating sale:", error);
        return { success: false, error: error.message || 'Failed to create sale' };
    }
}

export async function getSalesAction(filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();
        const data = await SaleService.getAll(auth.user.id, branchId, branchType, filterBranchId);
        return { success: true, data: serialize(data) };
    } catch (error) {
        console.error("Error fetching sales:", error);
        return { success: false, error: 'Failed to fetch sales' };
    }
}

export async function getSaleAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data = await SaleService.getById(id);
        return { success: true, data: serialize(data) };
    } catch {
        return { success: false, error: 'Failed to fetch sale' };
    }
}

export async function updatePaymentStatusAction(
    id: string,
    paymentStatus: PaymentStatus,
    amountPaid: number
) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const sale = await SaleService.updatePaymentStatus(id, paymentStatus, amountPaid);
        return { success: true, data: serialize(sale) };
    } catch (error: any) {
        console.error("Error updating payment status:", error);
        return { success: false, error: error.message || 'Failed to update payment status' };
    }
}

export async function deleteSaleAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        await SaleService.delete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to delete sale' };
    }
}

export async function updateSaleAction(id: string, data: CreateSaleInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const sale = await SaleService.update(id, data, auth.user.id);
        return { success: true, data: serialize(sale) };
    } catch (error: any) {
        console.error("Error updating sale:", error);
        return { success: false, error: error.message || 'Failed to update sale' };
    }
}

export async function getSalesByCustomerAction(customerId: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data = await SaleService.getByCustomerId(customerId);
        return { success: true, data: serialize(data) };
    } catch {
        return { success: false, error: 'Failed to fetch customer sales' };
    }
}
