import { db } from '@gonza/shared/infra/db';
import { Message } from '../types';

export class MessagingService {
    static async getAll(): Promise<Message[]> {
        // return db.message.findMany();
        return [];
    }
}
