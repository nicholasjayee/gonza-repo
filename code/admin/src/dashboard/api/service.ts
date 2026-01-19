import { db } from '@gonza/shared/prisma/db';

export class AdminDashboardService {
    static async getSystemStats() {
        return {
            totalUsers: 0,
            cpuUsage: '12%',
            memoryUsage: '45%'
        };
    }
}
