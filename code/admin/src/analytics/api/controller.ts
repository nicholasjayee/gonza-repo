'use server';

import { AnalyticsService } from './service';

export async function getMetricsAction() {
    try {
        const data = await AnalyticsService.getGlobalMetrics();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
