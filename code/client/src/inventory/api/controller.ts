'use server';

import { InventoryService } from './service';
import { InventoryAnalyticsService } from './inventory-analytics-service';
import { RequisitionService, CreateRequisitionInput } from './requisition-service';
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

export async function getInventoryAction() {
    try {
        const data = await InventoryService.getAll();
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return { success: false, error: 'Failed to fetch inventory' };
    }
}

export async function getInventoryOverviewAction(filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();

        // If MAIN branch and filterBranchId is provided, use it.
        // Otherwise use the active branchId.
        const targetBranchId = (branchType === 'MAIN' && filterBranchId) ? filterBranchId : branchId;

        const stats = await InventoryAnalyticsService.getOverview(auth.user.id, targetBranchId);
        return { success: true, data: serialize(stats) };
    } catch (error) {
        console.error("Error fetching overview:", error);
        return { success: true, data: serialize({ totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalCostValue: 0, totalSellingValue: 0, potentialProfit: 0 }) };
    }
}

export async function getInventoryMovementsAction(limit?: number, filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();
        const targetBranchId = (branchType === 'MAIN' && filterBranchId) ? filterBranchId : branchId;

        const movements = await InventoryAnalyticsService.getRecentMovements(auth.user.id, targetBranchId, limit);
        return { success: true, data: serialize(movements) };
    } catch (error) {
        return { success: false, error: "History failed" };
    }
}

export async function getSalesInventoryAnalysisAction(filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId, branchType } = await getActiveBranch();
        const targetBranchId = (branchType === 'MAIN' && filterBranchId) ? filterBranchId : branchId;

        const data = await InventoryAnalyticsService.getSalesInventoryAnalysis(auth.user.id, targetBranchId);
        return { success: true, data: serialize(data) };
    } catch (error) {
        return { success: false, error: "Analysis failed" };
    }
}

export async function getRequisitionsAction(filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId, branchType } = await getActiveBranch();
        const targetBranchId = (branchType === 'MAIN' && filterBranchId) ? filterBranchId : branchId;

        const data = await RequisitionService.getAll(auth.user.id, targetBranchId);
        return { success: true, data: serialize(data) };
    } catch (error) {
        return { success: false, error: "Failed to fetch requisitions" };
    }
}

export async function createRequisitionAction(data: CreateRequisitionInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No branch selected");
        const req = await RequisitionService.create(auth.user.id, branchId, data);
        return { success: true, data: serialize(req) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getLowStockItemsAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No branch selected");
        const items = await RequisitionService.getLowStockItems(branchId);
        return { success: true, data: serialize(items) };
    } catch (error) {
        return { success: false, error: "Failed to fetch suggestions" };
    }
}

export async function batchRestockAction(data: { supplierId: string | null, items: { productId: string, quantity: number }[] }) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No branch selected");
        const results = await InventoryService.batchRestock(auth.user.id, branchId, data.supplierId, data.items);
        return { success: true, data: serialize(results) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
export async function deleteRequisitionAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        await RequisitionService.delete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRequisitionStatusAction(id: string, status: any) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const updated = await RequisitionService.updateStatus(id, status);
        return { success: true, data: serialize(updated) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRequisitionAction(id: string, data: CreateRequisitionInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const updated = await RequisitionService.update(id, data);
        return { success: true, data: serialize(updated) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getProductByBarcodeForStockTakeAction(barcode: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No branch selected");

        const data = await InventoryAnalyticsService.getProductStockTakeData(barcode, branchId, 'barcode');
        return { success: true, data: serialize(data) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getProductByIdForStockTakeAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No branch selected");

        const data = await InventoryAnalyticsService.getProductStockTakeData(id, branchId, 'id');
        return { success: true, data: serialize(data) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
