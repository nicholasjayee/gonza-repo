import { db } from '@gonza/shared/prisma/db';
import { Product, Category, Supplier } from '../types';
import { ProductHistoryService } from './historyService';

export class ProductService {
    static async getAll(adminId: string, branchId?: string, branchType: 'MAIN' | 'SUB' = 'MAIN') {
        const where: any = {
            branch: {
                adminId: adminId
            }
        };

        if (branchType === 'SUB' && branchId) {
            where.branchId = branchId;
        }

        return db.product.findMany({
            where,
            include: {
                category: true,
                supplier: true,
                branch: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getById(id: string) {
        return db.product.findUnique({
            where: { id },
            include: {
                category: true,
                supplier: true
            }
        });
    }

    static async getByBarcode(barcode: string) {
        return db.product.findUnique({
            where: { barcode },
            include: {
                category: true,
                supplier: true
            }
        });
    }

    static async getBySlug(slug: string) {
        return db.product.findUnique({
            where: { slug },
            include: {
                category: true,
                supplier: true
            }
        });
    }

    static async create(data: {
        name: string;
        slug?: string;
        description?: string;
        sellingPrice: number;
        costPrice: number;
        initialStock: number;
        minStock: number;
        stock: number;
        barcode?: string;
        sku?: string;
        image?: string;
        categoryId?: string;
        supplierId?: string;
        userId: string;
        branchId?: string;
    }) {
        // --- Internal Generation ---
        if (!data.sku) {
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            data.sku = `SKU-${random}`;
        }
        if (!data.barcode) {
            const random = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            data.barcode = random;
        }
        // ---------------------------

        const product = await db.product.create({ data });

        // Log creation
        await ProductHistoryService.log(
            product.id,
            data.userId,
            'CREATED',
            {
                oldStock: 0,
                newStock: product.stock,
                newPrice: product.sellingPrice,
                newCost: product.costPrice,
                quantityChange: product.stock
            }
        ).catch(err => console.error("Failed to log history:", err));

        return product;
    }

    static async update(
        id: string,
        data: Partial<{
            name: string;
            slug: string;
            description: string;
            sellingPrice: number;
            costPrice: number;
            initialStock: number;
            minStock: number;
            stock: number;
            barcode: string;
            sku: string;
            image: string;
            categoryId: string;
            supplierId: string;
        }>,
        userId: string
    ) {
        // Fetch current state for comparison
        const current = await db.product.findUnique({ where: { id } });
        if (!current) throw new Error("Product not found");

        const updated = await db.product.update({
            where: { id },
            data
        });

        // Detect and log changes
        const changes: any[] = [];

        // 1. Price Change
        if (data.sellingPrice !== undefined && data.sellingPrice !== current.sellingPrice) {
            changes.push(
                ProductHistoryService.log(id, userId, 'PRICE_CHANGE', {
                    oldStock: current.stock,
                    newStock: current.stock,
                    oldPrice: current.sellingPrice,
                    newPrice: data.sellingPrice,
                    reason: `Price updated from ${current.sellingPrice} to ${data.sellingPrice}`
                })
            );
        }

        // 2. Cost Change
        if (data.costPrice !== undefined && data.costPrice !== current.costPrice) {
            changes.push(
                ProductHistoryService.log(id, userId, 'COST_CHANGE', {
                    oldStock: current.stock,
                    newStock: current.stock,
                    oldCost: current.costPrice,
                    newCost: data.costPrice,
                    reason: `Cost updated from ${current.costPrice} to ${data.costPrice}`
                })
            );
        }

        // 3. Stock Adjustment (Manual update via edit form)
        if (data.stock !== undefined && data.stock !== current.stock) {
            const diff = data.stock - current.stock;
            const type = diff > 0 ? 'RESTOCK' : 'ADJUSTMENT'; // Assume manual edit decreases are adjustments
            changes.push(
                ProductHistoryService.log(id, userId, type, {
                    oldStock: current.stock,
                    newStock: data.stock,
                    quantityChange: diff,
                    reason: 'Manual stock update'
                })
            );
        }

        await Promise.all(changes).catch(err => console.error("Failed to log history:", err));

        return updated;
    }

    static async delete(id: string) {
        return db.product.delete({ where: { id } });
    }

    static async deleteMany(ids: string[]) {
        return db.product.deleteMany({
            where: {
                id: { in: ids }
            }
        });
    }
}

export class CategoryService {
    static async getAll() {
        return db.category.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async create(data: { name: string; description?: string }) {
        return db.category.create({ data });
    }

    static async update(id: string, data: { name?: string; description?: string }) {
        return db.category.update({
            where: { id },
            data
        });
    }

    static async delete(id: string) {
        return db.category.delete({ where: { id } });
    }
}

export class SupplierService {
    static async getAll() {
        return db.supplier.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async create(data: {
        name: string;
        contactName?: string;
        email?: string;
        phone?: string;
        address?: string;
    }) {
        return db.supplier.create({ data });
    }

    static async update(id: string, data: Partial<{
        name: string;
        contactName: string;
        email: string;
        phone: string;
        address: string;
    }>) {
        return db.supplier.update({
            where: { id },
            data
        });
    }

    static async delete(id: string) {
        return db.supplier.delete({ where: { id } });
    }
}
