import { db, ProductHistoryType } from '@gonza/shared/prisma/db';

export class ProductHistoryService {
    static async getHistory(productId: string) {
        return db.productHistory.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async log(
        productId: string,
        userId: string,
        type: ProductHistoryType,
        data: {
            quantityChange?: number;
            oldStock: number;
            newStock: number;
            oldPrice?: number;
            newPrice?: number;
            oldCost?: number;
            newCost?: number;
            referenceId?: string;
            referenceType?: string;
            reason?: string;
        },
        prismaClient?: any
    ) {
        const client = prismaClient || db;
        return client.productHistory.create({
            data: {
                productId,
                userId,
                type,
                ...data
            }
        });
    }
}
