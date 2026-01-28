import { db, Prisma } from '@gonza/shared/prisma/db';
import { Sale, CreateSaleInput, PaymentStatus } from '../types';
import { ProductHistoryService } from '@/products/api/historyService';

export class SaleService {
    /**
     * Generate unique sale number: SAL-2024-001
     */
    static async generateSaleNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const lastSale = await db.sale.findFirst({
            where: {
                saleNumber: {
                    startsWith: `SAL-${year}-`
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        let nextNumber = 1;
        if (lastSale) {
            const lastNumber = parseInt(lastSale.saleNumber.split('-')[2]);
            nextNumber = lastNumber + 1;
        }

        return `SAL-${year}-${nextNumber.toString().padStart(3, '0')}`;
    }

    /**
     * Create sale with automatic stock deduction (except QUOTE)
     */
    static async create(data: CreateSaleInput, userId: string, branchId: string): Promise<Sale> {
        // Calculate line totals and sale totals
        const itemsWithTotals = data.items.map(item => ({
            ...item,
            lineTotal: (item.sellingPrice * item.quantity) - item.discount
        }));

        const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0);
        const discountAmount = data.discountType === 'PERCENTAGE'
            ? (subtotal * data.discount) / 100
            : data.discount;

        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * data.taxRate) / 100;
        const total = afterDiscount + taxAmount;
        const balance = total - data.amountPaid;

        const saleNumber = await this.generateSaleNumber();

        // Create sale with items in transaction
        const sale = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create the sale
            const newSale = await tx.sale.create({
                data: {
                    saleNumber,
                    date: new Date(),
                    customerId: data.customerId,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    customerAddress: data.customerAddress,
                    source: data.source,
                    subtotal,
                    discount: discountAmount,
                    discountType: data.discountType,
                    taxRate: data.taxRate,
                    taxAmount,
                    total,
                    paymentStatus: data.paymentStatus,
                    amountPaid: data.amountPaid,
                    balance,
                    cashAccountId: data.cashAccountId,
                    branchId,
                    userId,
                    items: {
                        create: itemsWithTotals
                    }
                },
                include: {
                    items: true,
                    customer: true
                }
            });

            // Update Cash Account Balance if money received
            if (data.cashAccountId && data.amountPaid > 0) {
                await tx.cashAccount.update({
                    where: { id: data.cashAccountId },
                    data: {
                        currentBalance: {
                            increment: data.amountPaid
                        }
                    }
                });
            }

            // Deduct stock ONLY if NOT a quote
            if (data.paymentStatus !== 'QUOTE') {
                for (const item of data.items) {
                    if (item.productId) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: {
                                    stock: {
                                        decrement: item.quantity
                                    }
                                }
                            });

                            // Log Sale History
                            await ProductHistoryService.log(
                                item.productId,
                                userId,
                                'SALE',
                                {
                                    oldStock: product.stock,
                                    newStock: product.stock - item.quantity,
                                    quantityChange: -item.quantity,
                                    referenceId: newSale.id,
                                    referenceType: 'SALE',
                                    reason: `Sold in Sale #${newSale.saleNumber}`
                                }
                            );
                        }
                    }
                }
            }

            return newSale;
        });

        return sale as any;
    }

    static async getAll(adminId: string, branchId?: string, branchType: 'MAIN' | 'SUB' = 'MAIN', filterBranchId?: string): Promise<Sale[]> {
        const where: any = {
            branch: {
                adminId
            }
        };

        // If SUB branch, only see its own sales. 
        // If MAIN branch, optionally filter by a specific sub-branch.
        if (branchType === 'SUB' && branchId) {
            where.branchId = branchId;
        } else if (filterBranchId) {
            where.branchId = filterBranchId;
        }

        return db.sale.findMany({
            where,
            include: {
                items: true,
                customer: true,
                branch: true
            },
            orderBy: { createdAt: 'desc' }
        }) as any;
    }

    static async getById(id: string): Promise<Sale | null> {
        return db.sale.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                customer: true,
                branch: true,
                user: true
            }
        }) as any;
    }

    static async updatePaymentStatus(
        id: string,
        paymentStatus: PaymentStatus,
        amountPaid: number
    ): Promise<Sale> {
        const sale = await db.sale.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!sale) throw new Error('Sale not found');

        // If changing FROM quote TO paid status, deduct stock now
        const wasQuote = sale.paymentStatus === 'QUOTE';
        const isNowPaid = paymentStatus !== 'QUOTE';

        const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            if (wasQuote && isNowPaid) {
                // Deduct stock for quote-to-paid conversion
                for (const item of sale.items) {
                    if (item.productId) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: {
                                    stock: {
                                        decrement: item.quantity
                                    }
                                }
                            });

                            // Log Sale History (delayed from quote)
                            // Note: We use sale.userId or could rely on current user context if passed, 
                            // but updatePaymentStatus doesn't currently take userId. 
                            // We'll use the sale.userId as the best proxy for "User who made that sale originally" 
                            // OR we should ideally start passing userId to updatePaymentStatus.
                            // For now using sale.userId is safer than guessing.
                            await ProductHistoryService.log(
                                item.productId,
                                sale.userId,
                                'SALE',
                                {
                                    oldStock: product.stock,
                                    newStock: product.stock - item.quantity,
                                    quantityChange: -item.quantity,
                                    referenceId: sale.id,
                                    referenceType: 'SALE',
                                    reason: `Quote converted to Sale #${sale.saleNumber}`
                                }
                            );
                        }
                    }
                }
            }

            const balance = Number(sale.total) - amountPaid;
            const diff = amountPaid - Number(sale.amountPaid);

            // Update Cash Account Balance if money received and account linked
            if (sale.cashAccountId && diff !== 0) {
                await tx.cashAccount.update({
                    where: { id: sale.cashAccountId },
                    data: {
                        currentBalance: {
                            increment: diff
                        }
                    }
                });
            }

            return tx.sale.update({
                where: { id },
                data: {
                    paymentStatus,
                    amountPaid,
                    balance
                },
                include: {
                    items: true,
                    customer: true
                }
            });
        });

        return updated as any;
    }


    static async update(id: string, data: CreateSaleInput, userId: string): Promise<Sale> {
        const oldSale = await db.sale.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!oldSale) throw new Error('Sale not found');

        // Calculate new totals
        const itemsWithTotals = data.items.map(item => ({
            ...item,
            lineTotal: (item.sellingPrice * item.quantity) - item.discount
        }));

        const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0);
        const discountAmount = data.discountType === 'PERCENTAGE'
            ? (subtotal * data.discount) / 100
            : data.discount;

        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * data.taxRate) / 100;
        const total = afterDiscount + taxAmount;
        const balance = total - data.amountPaid;

        const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Restore stock from old items (if they were not quotes)
            if (oldSale.paymentStatus !== 'QUOTE') {
                for (const item of oldSale.items) {
                    if (item.productId) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } }
                        });
                        // Log restoration in history as part of adjustment
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            await ProductHistoryService.log(item.productId, userId, 'ADJUSTMENT', {
                                oldStock: product.stock - item.quantity,
                                newStock: product.stock,
                                quantityChange: item.quantity,
                                reason: `Stock restored from edited Sale #${oldSale.saleNumber}`
                            });
                        }
                    }
                }
            }

            // 2. Clear old items
            await tx.saleItem.deleteMany({ where: { saleId: id } });

            // 3. Update sale and create new items
            const newSale = await tx.sale.update({
                where: { id },
                data: {
                    customerId: data.customerId,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    customerAddress: data.customerAddress,
                    source: data.source,
                    subtotal,
                    discount: discountAmount,
                    discountType: data.discountType,
                    taxRate: data.taxRate,
                    taxAmount,
                    total,
                    paymentStatus: data.paymentStatus,
                    amountPaid: data.amountPaid,
                    balance,
                    cashAccountId: data.cashAccountId,
                    items: {
                        create: itemsWithTotals
                    }
                },
                include: {
                    items: true,
                    customer: true
                }
            });

            // Handle Balance Adjustment if account changed or amount changed
            const amountDiff = data.amountPaid - Number(oldSale.amountPaid);

            // If account changed, refund old and credit new
            if (oldSale.cashAccountId && oldSale.cashAccountId !== data.cashAccountId) {
                // Refund old
                await tx.cashAccount.update({
                    where: { id: oldSale.cashAccountId },
                    data: { currentBalance: { decrement: Number(oldSale.amountPaid) } }
                });

                // Credit new
                if (data.cashAccountId) {
                    await tx.cashAccount.update({
                        where: { id: data.cashAccountId },
                        data: { currentBalance: { increment: data.amountPaid } }
                    });
                }
            } else if (data.cashAccountId && amountDiff !== 0) {
                // Same account, just update diff
                await tx.cashAccount.update({
                    where: { id: data.cashAccountId },
                    data: { currentBalance: { increment: amountDiff } }
                });
            }

            // 4. Deduct stock for new items (if NOT a quote)
            if (data.paymentStatus !== 'QUOTE') {
                for (const item of data.items) {
                    if (item.productId) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } }
                            });

                            // Log new deduction
                            await ProductHistoryService.log(item.productId, userId, 'SALE', {
                                oldStock: product.stock,
                                newStock: product.stock - item.quantity,
                                quantityChange: -item.quantity,
                                referenceId: newSale.id,
                                referenceType: 'SALE',
                                reason: `Updated in Sale #${newSale.saleNumber}`
                            });
                        }
                    }
                }
            }

            return newSale;
        });

        return updated as any;
    }

    static async delete(id: string): Promise<void> {
        const sale = await db.sale.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!sale) throw new Error('Sale not found');

        await db.$transaction(async (tx) => {
            // Restore stock if it was deducted (not a quote)
            if (sale.paymentStatus !== 'QUOTE') {
                for (const item of sale.items) {
                    if (item.productId) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { increment: item.quantity } }
                            });

                            // Log restoration in history
                            await ProductHistoryService.log(
                                item.productId,
                                sale.userId,
                                'RETURN_IN',
                                {
                                    oldStock: product.stock,
                                    newStock: product.stock + item.quantity,
                                    quantityChange: item.quantity,
                                    referenceId: sale.id,
                                    referenceType: 'SALE_DELETED',
                                    reason: `Stock restored from deleted Sale #${sale.saleNumber}`
                                },
                                tx as any
                            );
                        }
                    }
                }
            }

            // Deduct from cash account if money was paid
            if (sale.cashAccountId && Number(sale.amountPaid) > 0) {
                await tx.cashAccount.update({
                    where: { id: sale.cashAccountId },
                    data: { currentBalance: { decrement: Number(sale.amountPaid) } }
                });
            }

            await tx.sale.delete({
                where: { id }
            });
        });
    }

    static async getByCustomerId(customerId: string): Promise<Sale[]> {
        return db.sale.findMany({
            where: { customerId },
            include: {
                items: true,
                branch: true
            },
            orderBy: { date: 'desc' }
        }) as any;
    }
}
