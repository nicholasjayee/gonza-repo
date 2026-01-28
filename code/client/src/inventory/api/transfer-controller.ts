'use server';

import { StockTransferService, TransferItemInput } from './transfer-service';
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

export async function initiateTransferAction(
    toBranchId: string,
    items: TransferItemInput[],
    notes?: string
) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const transfer = await StockTransferService.transferStock(
            auth.user.id,
            branchId,
            toBranchId,
            items,
            notes
        );

        return { success: true, data: serialize(transfer) };
    } catch (error: any) {
        console.error("Error initiating transfer:", error);
        return { success: false, error: error.message || 'Failed to initiate transfer' };
    }
}

export async function getTransfersAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const transfers = await StockTransferService.getTransfers(branchId);
        return { success: true, data: serialize(transfers) };
    } catch (error) {
        console.error("Error fetching transfers:", error);
        return { success: false, error: 'Failed to fetch transfers' };
    }
}
