import { NextResponse } from 'next/server';
import { DashboardService } from './service';

export const DashboardController = {
    async getOverview() {
        try {
            const metrics = await DashboardService.getMetrics();
            const shortcuts = await DashboardService.getShortcuts();
            return NextResponse.json({ metrics, shortcuts });
        } catch (error) {
            return NextResponse.json({ error: 'Failed' }, { status: 500 });
        }
    }
};
