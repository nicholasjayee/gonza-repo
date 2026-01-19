import { db } from '@gonza/shared/prisma/db';
import { Expense } from '../types';

export class ExpenseService {
    static async getAll(): Promise<Expense[]> {
        // return db.expense.findMany();
        return [];
    }
}
