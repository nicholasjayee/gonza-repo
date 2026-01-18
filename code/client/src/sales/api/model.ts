export interface Sale {
    id: string;
    customer: string;
    amount: number;
    date: string;
}

export interface CreateSaleInput {
    customer: string;
    amount: number;
}
