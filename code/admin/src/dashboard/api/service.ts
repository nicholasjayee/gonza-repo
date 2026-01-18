export const AdminDashboardService = {
    async getGlobalMetrics() {
        return {
            totalRevenue: 154000000,
            activeBranches: 5,
            totalEmployees: 42,
            systemHealth: 'Optimal'
        };
    }
};
