import { NextResponse } from 'next/server';
import { AdminDashboardService } from './service';

export const AdminDashboardController = {
    async getOverview() {
        const metrics = await AdminDashboardService.getGlobalMetrics();
        return NextResponse.json(metrics);
    }
};
