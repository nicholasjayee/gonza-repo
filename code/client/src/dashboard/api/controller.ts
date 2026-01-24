'use server';

import { DashboardService } from './dashboard-service';
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

export async function getDashboardMetricsAction(filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();

        if (!branchId) {
            return { success: false, error: "No active branch selected" };
        }

        const metrics = await DashboardService.getMetrics(
            branchId,
            branchType,
            filterBranchId
        );

        return { success: true, data: serialize(metrics) };
    } catch (error: any) {
        console.error("Failed to fetch dashboard metrics:", error);
        return { success: false, error: error.message || "Failed to fetch metrics" };
    }
}

export async function getSubBranchesAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();

        if (branchType !== 'MAIN') {
            return { success: false, error: "Only main branches can access sub-branches list" };
        }

        const branches = await DashboardService.getSubBranches(branchId!);
        return { success: true, data: serialize(branches) };
    } catch (error: any) {
        console.error("Failed to fetch sub-branches:", error);
        return { success: false, error: error.message || "Failed to fetch branches" };
    }
}

export async function getDashboardSummariesAction(filterBranchId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();

        if (!branchId) {
            return { success: false, error: "No active branch selected" };
        }

        // Determine which branches to query (same logic as metrics)
        let branchIds: string[];

        if (branchType === 'SUB') {
            branchIds = [branchId];
        } else if (filterBranchId) {
            branchIds = [filterBranchId];
        } else {
            const { db } = await import('@gonza/shared/prisma/db');
            const branches = await db.branch.findMany({
                where: {
                    type: { in: ['MAIN', 'SUB'] }
                },
                select: { id: true }
            });
            branchIds = branches.map(b => b.id);
        }

        const { DashboardSummaryService } = await import('./summary-service');
        const summaries = await DashboardSummaryService.getSummaries(branchIds);

        return { success: true, data: serialize(summaries) };
    } catch (error: any) {
        console.error("Failed to fetch dashboard summaries:", error);
        return { success: false, error: error.message || "Failed to fetch summaries" };
    }
}
