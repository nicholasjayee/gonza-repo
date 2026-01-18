import { NextResponse } from 'next/server';
import { CustomerService } from './service';

export const CustomerController = {
    async getCustomers() {
        try {
            const customers = await CustomerService.fetchCustomers();
            return NextResponse.json(customers);
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
        }
    }
};
