import { db } from '@gonza/shared/prisma/db';
import { Sale } from '../types';

export class SalesService {

    static async getAllSales(): Promise<Sale[]> {
        // maps prisma model to our domain model if needed
        // const sales = await db.sale.findMany(); 
        // return sales;

        // Mock implementation until DB schema matches
        return [];
    }

    static async createSale(data: Partial<Sale>) {
        /*
        return db.sale.create({
            data: {
                amount: data.amount!,
                // ...
            }
        });
        */

    }
}
