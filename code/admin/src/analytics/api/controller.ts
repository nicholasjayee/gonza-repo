import { NextResponse } from 'next/server';
import { AdminAnalyticsService } from './service';

export const AdminAnalyticsController = {
    async getPerformance() {
        const report = await AdminAnalyticsService.getPerformanceReport();
        return NextResponse.json(report);
    }
};
