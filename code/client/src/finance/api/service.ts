import { db } from '@gonza/shared/infra/db';
import { Transaction } from '../types';

export class FinanceService {
    static async getAll(): Promise<Transaction[]> {
        // return db.transaction.findMany();
        return [];
    }
}
