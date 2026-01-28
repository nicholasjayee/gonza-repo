import { db, ProductHistoryType } from '@gonza/shared/prisma/db';
import { ProductHistoryService } from '@/products/api/historyService';

export class InventoryService {
    /**
     * Batch restock products
     */
    static async batchRestock(userId: string, branchId: string, supplierId: string | null, items: { productId: string, quantity: number }[]) {
        return db.$transaction(async (tx) => {
            const results = [];

            for (const item of items) {
                // Get current product state
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true, name: true }
                });

                if (!product) throw new Error(`Product ${item.productId} not found`);

                const newStock = product.stock + item.quantity;

                // Update stock
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: newStock }
                });

                // Log movement
                await ProductHistoryService.log(
                    item.productId,
                    userId,
                    "RESTOCK" as any,
                    {
                        quantityChange: item.quantity,
                        oldStock: product.stock,
                        newStock: newStock,
                        referenceId: supplierId || undefined,
                        referenceType: supplierId ? "SUPPLIER" : undefined,
                        reason: `Batch restock${supplierId ? ' from supplier' : ''}`
                    },
                    tx
                );

                results.push(updatedProduct);
            }

            return results;
        });
    }

    static async getAll() {
        return [];
    }

    static async updateStock(id: string, quantity: number) {
    }
}
