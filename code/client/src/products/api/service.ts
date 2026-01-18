import { db } from '@gonza/shared/infra/db';
import { Product } from '../types';

export class ProductService {
    static async getAll(): Promise<Product[]> {
        // return db.product.findMany();
        return [];
    }

    static async getById(id: string): Promise<Product | null> {
        // return db.product.findUnique({ where: { id } });
        return null;
    }
}
