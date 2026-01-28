import { db, Prisma } from '@gonza/shared/prisma/db';
import { ProductHistoryService } from '@/products/api/historyService';

export interface TransferItemInput {
    productId: string;
    quantity: number;
}

export class StockTransferService {
    /**
     * Executes a stock transfer between branches
     */
    static async transferStock(
        userId: string,
        fromBranchId: string,
        toBranchId: string,
        items: TransferItemInput[],
        notes?: string
    ) {
        if (fromBranchId === toBranchId) {
            throw new Error("Cannot transfer stock to the same branch.");
        }

        return await db.$transaction(async (tx) => {
            // 1. Generate Transfer Number
            const count = await tx.stockTransfer.count();
            const transferNumber = `TRF-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

            // 2. Fetch branch names for human-readable logs
            const [fromBranch, toBranch] = await Promise.all([
                tx.branch.findUnique({ where: { id: fromBranchId } }),
                tx.branch.findUnique({ where: { id: toBranchId } })
            ]);

            const fromName = fromBranch?.name || fromBranchId;
            const toName = toBranch?.name || toBranchId;

            // 3. Create the main transfer record
            const transfer = await tx.stockTransfer.create({
                data: {
                    transferNumber,
                    fromBranchId,
                    toBranchId,
                    userId,
                    notes,
                    status: 'COMPLETED'
                }
            });

            for (const itemInput of items) {
                // 4. Find source product
                const sourceProduct = await tx.product.findUnique({
                    where: { id: itemInput.productId },
                    include: { category: true, supplier: true }
                });

                if (!sourceProduct) {
                    throw new Error(`Product with ID ${itemInput.productId} not found.`);
                }

                if (sourceProduct.branchId !== fromBranchId) {
                    throw new Error(`Product ${sourceProduct.name} does not belong to the source branch.`);
                }

                if (sourceProduct.stock < itemInput.quantity) {
                    throw new Error(`Insufficient stock for ${sourceProduct.name}. Available: ${sourceProduct.stock}, Requested: ${itemInput.quantity}`);
                }

                // 5. Deduct from source
                const updatedSource = await tx.product.update({
                    where: { id: sourceProduct.id },
                    data: { stock: { decrement: itemInput.quantity } }
                });

                // Log Source History
                await ProductHistoryService.log(sourceProduct.id, userId, 'TRANSFER_OUT', {
                    oldStock: sourceProduct.stock,
                    newStock: sourceProduct.stock - itemInput.quantity,
                    quantityChange: -itemInput.quantity,
                    referenceId: transfer.id,
                    referenceType: 'TRANSFER',
                    reason: `Transferred to branch: ${toName}`
                }, tx as any);

                // 6. Handle Destination
                // Find if product exists in destination (by SKU)
                let destinationProduct = null;
                if (sourceProduct.sku) {
                    destinationProduct = await tx.product.findFirst({
                        where: {
                            branchId: toBranchId,
                            sku: sourceProduct.sku
                        }
                    });
                }

                if (destinationProduct) {
                    // Update existing
                    await tx.product.update({
                        where: { id: destinationProduct.id },
                        data: { stock: { increment: itemInput.quantity } }
                    });

                    // Log Destination History
                    await ProductHistoryService.log(destinationProduct.id, userId, 'TRANSFER_IN', {
                        oldStock: destinationProduct.stock,
                        newStock: destinationProduct.stock + itemInput.quantity,
                        quantityChange: itemInput.quantity,
                        referenceId: transfer.id,
                        referenceType: 'TRANSFER',
                        reason: `Received from branch: ${fromName}`
                    }, tx as any);
                } else {
                    // Clone to destination
                    const newProduct = await tx.product.create({
                        data: {
                            name: sourceProduct.name,
                            description: sourceProduct.description,
                            sellingPrice: sourceProduct.sellingPrice,
                            costPrice: sourceProduct.costPrice,
                            initialStock: 0,
                            minStock: sourceProduct.minStock,
                            stock: itemInput.quantity,
                            barcode: sourceProduct.barcode,
                            sku: sourceProduct.sku,
                            image: sourceProduct.image,
                            categoryId: sourceProduct.categoryId,
                            supplierId: sourceProduct.supplierId,
                            branchId: toBranchId,
                            userId: userId
                        }
                    });

                    // Log Destination history (Creation via Transfer)
                    await ProductHistoryService.log(newProduct.id, userId, 'TRANSFER_IN', {
                        oldStock: 0,
                        newStock: itemInput.quantity,
                        quantityChange: itemInput.quantity,
                        referenceId: transfer.id,
                        referenceType: 'TRANSFER',
                        reason: `Cloned and received from branch: ${fromName}`
                    }, tx as any);
                }

                // 7. Record transfer item
                await tx.stockTransferItem.create({
                    data: {
                        transferId: transfer.id,
                        productId: sourceProduct.id,
                        productName: sourceProduct.name,
                        sku: sourceProduct.sku,
                        quantity: itemInput.quantity
                    }
                });
            }

            return transfer;
        });
    }

    /**
     * Fetches all transfers for a branch (either as source or destination)
     */
    static async getTransfers(branchId: string) {
        return db.stockTransfer.findMany({
            where: {
                OR: [
                    { fromBranchId: branchId },
                    { toBranchId: branchId }
                ]
            },
            include: {
                fromBranch: true,
                toBranch: true,
                items: true,
                user: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
