export interface Sale {
    id: string;
    amount: number;
    items: any[]; // define stricter type later
    date: Date;
    status: 'completed' | 'pending' | 'cancelled';
}
