export const DashboardService = {
    async getMetrics() {
        return {
            totalSales: 4500000,
            revenue: 1200000,
            expenses: 300000,
            profit: 900000,
            lowStockCount: 12,
            outstandingBalance: 150000
        };
    },
    async getShortcuts() {
        return [
            { label: 'New Sale', path: '/sales/new', icon: 'plus' },
            { label: 'Inventory', path: '/inventory', icon: 'box' },
            { label: 'Customers', path: '/customers', icon: 'users' }
        ];
    }
};
