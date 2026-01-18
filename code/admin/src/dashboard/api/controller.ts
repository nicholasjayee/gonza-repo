'use server';

import { AdminDashboardService } from './service';

export async function getSystemStatsAction() {
    try {
        const data = await AdminDashboardService.getSystemStats();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
