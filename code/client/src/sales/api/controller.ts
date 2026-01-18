import { NextResponse } from 'next/server';
import { SalesService } from './service';

export const SalesController = {
    async getSales() {
        try {
            const sales = await SalesService.fetchSales();
            return NextResponse.json(sales);
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
        }
    },

    async createSale(data: any) {
        try {
            // Add validation logic here
            if (!data.amount) throw new Error('Amount is required');

            const newSale = await SalesService.persistSale(data);
            return NextResponse.json(newSale, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
};
