import { db } from '@gonza/shared/prisma/db';
import { Branch } from '../types';

export class BranchService {
    static async getAll(): Promise<Branch[]> {
        // return db.branch.findMany();
        return [];
    }
}
