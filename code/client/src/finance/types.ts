export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
}
