export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
}

export interface CashAccount {
    id: string;
    name: string;
    description?: string | null;
    initialBalance: number;
    currentBalance: number;
    isActive: boolean;
    branchId: string;
    createdAt: Date;
    updatedAt: Date;
}
