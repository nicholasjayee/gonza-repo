export const FinanceService = {
    async fetchAccounts() {
        return [
            { id: '1', name: 'Main Bank Account', type: 'Bank', balance: 5000000 },
            { id: '2', name: 'Cash on Hand', type: 'Cash', balance: 250000 }
        ];
    },
    async getPnL(period: string) {
        return { revenue: 1000000, expenses: 400000, netProfit: 600000 };
    }
};
