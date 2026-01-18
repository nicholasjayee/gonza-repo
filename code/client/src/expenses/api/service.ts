import { db } from '@gonza/shared/infra/db';
import { Expense } from '../types';

export class ExpenseService {
    static async getAll(): Promise<Expense[]> {
        // return db.expense.findMany();
        return [];
    }
}
