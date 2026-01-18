export const ExpenseService = {
    async fetchExpenses() {
        return [
            { id: '1', category: 'Rent', amount: 50000, date: '2026-01-10' },
            { id: '2', category: 'Utilities', amount: 15000, date: '2026-01-15' }
        ];
    },
    async addExpense(data: any) {
        return { id: Math.random().toString(), ...data };
    }
};
