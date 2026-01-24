export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    paymentMethod?: string | null;
    reference?: string | null;
    branchId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
