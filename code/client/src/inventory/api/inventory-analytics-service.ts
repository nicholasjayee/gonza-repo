import { db, ProductHistoryType } from '@gonza/shared/prisma/db';

export interface InventoryStats {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalCostValue: number;
    totalSellingValue: number;
    potentialProfit: number;
}

export interface InventoryMovement {
    id: string;
    type: ProductHistoryType;
    productName: string;
    quantityChange: number;
    newStock: number;
    reason: string | null;
    userName: string | null;
    createdAt: Date;
}

export class InventoryAnalyticsService {
    /**
     * Get high-level inventory metrics for a branch
     */
    static async getOverview(adminId: string, branchId?: string): Promise<InventoryStats> {
        const where: any = {
            branch: { adminId }
        };
        if (branchId) where.branchId = branchId;

        const products = await db.product.findMany({
            where,
            select: {
                stock: true,
                minStock: true,
                costPrice: true,
                sellingPrice: true
            }
        });

        const stats: InventoryStats = {
            totalProducts: products.length,
            lowStockCount: products.filter((p: any) => p.stock > 0 && p.stock <= p.minStock).length,
            outOfStockCount: products.filter((p: any) => p.stock === 0).length,
            totalCostValue: products.reduce((sum: number, p: any) => sum + (p.costPrice * p.stock), 0),
            totalSellingValue: products.reduce((sum: number, p: any) => sum + (p.sellingPrice * p.stock), 0),
            potentialProfit: 0
        };

        stats.potentialProfit = stats.totalSellingValue - stats.totalCostValue;

        return stats;
    }

    /**
     * Get recent product history movements for analysis
     */
    static async getRecentMovements(
        adminId: string,
        branchId?: string,
        limit: number = 20
    ): Promise<InventoryMovement[]> {
        const where: any = {
            product: {
                branch: { adminId }
            }
        };
        if (branchId) where.product.branchId = branchId;

        const movements = await db.productHistory.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                product: { select: { name: true } },
                user: { select: { name: true } }
            }
        });

        return movements.map((m: any) => ({
            id: m.id,
            type: m.type,
            productName: m.product.name,
            quantityChange: m.quantityChange,
            newStock: m.newStock,
            reason: m.reason,
            userName: m.user.name,
            createdAt: m.createdAt
        }));
    }

    /**
     * Get distribution of items sold by inventory status
     */
    static async getSalesInventoryAnalysis(adminId: string, branchId?: string) {
        const where: any = {
            sale: {
                branch: { adminId }
            }
        };
        if (branchId) where.sale.branchId = branchId;

        const saleItems = await db.saleItem.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        stock: true
                    }
                }
            }
        });

        const inStockSales = saleItems.filter((item: any) => item.product && item.product.stock > 0).length;
        const outOfStockSales = saleItems.filter((item: any) => !item.product || item.product.stock === 0).length;

        return {
            inStockSales,
            outOfStockSales,
            totalSales: saleItems.length
        };
    }

    /**
     * Get detailed stock take data for a specific product by barcode or ID
     */
    static async getProductStockTakeData(identifier: string, branchId: string, type: 'barcode' | 'id' = 'barcode') {
        const product = await db.product.findFirst({
            where: {
                [type]: identifier,
                branchId
            },
            select: {
                id: true,
                name: true,
                barcode: true,
                initialStock: true,
                stock: true, // current recorded stock
            }
        });

        if (!product) throw new Error("Product not found in this branch");

        // Calculate total items sold
        const saleItems = await db.saleItem.findMany({
            where: {
                productId: product.id,
                sale: {
                    branchId,
                    paymentStatus: { not: 'QUOTE' } // Exclude quotes
                }
            },
            select: {
                quantity: true
            }
        });

        const totalSold = saleItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
            ...product,
            totalSold,
            recordedStock: product.stock // Using the current system stock as recorded stock
        };
    }
}
