import { db } from '@gonza/shared/infra/db';

export class AdminDashboardService {
    static async getSystemStats() {
        return {
            totalUsers: 0,
            cpuUsage: '12%',
            memoryUsage: '45%'
        };
    }
}
