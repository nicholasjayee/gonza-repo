import { db } from '@gonza/shared/prisma/db';

export class AdminDashboardService {
    static async getSystemStats() {
        const [
            totalUsers,
            activeUsers,
            totalProducts,
            salesSum,
            recentUsers,
            recentSales
        ] = await Promise.all([
            db.user.count(),
            db.user.count({ where: { isActive: true } }),
            db.product.count(),
            db.sale.aggregate({ _sum: { total: true } }),
            db.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, createdAt: true, image: true }
            }),
            db.sale.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { customer: true }
            })
        ]);

        return {
            totalUsers,
            activeUsers,
            totalProducts,
            totalRevenue: salesSum._sum.total || 0,
            recentActivity: [
                ...recentUsers.map(u => ({
                    id: u.id,
                    type: 'user_registered',
                    title: 'New User Registered',
                    description: `${u.name || u.email} joined the system`,
                    timestamp: u.createdAt,
                    image: u.image
                })),
                ...recentSales.map(s => ({
                    id: s.id,
                    type: 'sale_completed',
                    title: 'New Sale Recorded',
                    description: `Sale of ${s.total} for ${s.customer?.name || 'Walk-in'}`,
                    timestamp: s.createdAt
                }))
            ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8)
        };
    }
}
