import { db } from '@gonza/shared/prisma/db';
import { InventoryItem } from '../types';

export class InventoryService {
    static async getAll(): Promise<InventoryItem[]> {
        // return db.inventory.findMany();
        return [];
    }

    static async updateStock(id: string, quantity: number) {
        // return db.inventory.update({ where: { id }, data: { stock: quantity } });
    }
}
