export const AdminAnalyticsService = {
    async getPerformanceReport() {
        return [
            { branch: 'Main', sales: 450000, growth: '+12%' },
            { branch: 'West', sales: 120000, growth: '-5%' }
        ];
    }
};
