import { db } from '@gonza/shared/infra/db';
import { Customer } from '../types';

export class CustomerService {
    static async getAll(): Promise<Customer[]> {
        // return db.customer.findMany();
        return [];
    }

    static async getById(id: string): Promise<Customer | null> {
        // return db.customer.findUnique({ where: { id } });
        return null;
    }
}
