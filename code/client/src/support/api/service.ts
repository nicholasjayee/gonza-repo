import { db } from '@gonza/shared/prisma/db';
import { Ticket } from '../types';

export class SupportService {
    static async getAll(): Promise<Ticket[]> {
        // return db.ticket.findMany();
        return [];
    }
}
