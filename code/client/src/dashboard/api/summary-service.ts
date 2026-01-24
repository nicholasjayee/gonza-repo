import { db } from '@gonza/shared/prisma/db';

export interface RecentSale {
    id: string;
    saleNumber: string;
    customerName: string;
    total: number;
    date: Date;
    paymentStatus: string;
}

export interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
    minStock: number;
    sellingPrice: number;
}

export interface RecentExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: Date;
}

export interface RecentCustomer {
    id: string;
    name: string;
    phone: string | null;
    createdAt: Date;
}

export interface DashboardSummaries {
    recentSales: RecentSale[];
    lowStockProducts: LowStockProduct[];
    recentExpenses: RecentExpense[];
    recentCustomers: RecentCustomer[];
}

export class DashboardSummaryService {
    /**
     * Get detailed summaries for dashboard
     */
    static async getSummaries(branchIds: string[]): Promise<DashboardSummaries> {
        const [recentSales, lowStockProducts, recentExpenses, recentCustomers] = await Promise.all([
            this.getRecentSales(branchIds),
            this.getLowStockProducts(branchIds),
            this.getRecentExpenses(branchIds),
            this.getRecentCustomers(branchIds)
        ]);

        return {
            recentSales,
            lowStockProducts,
            recentExpenses,
            recentCustomers
        };
    }

    private static async getRecentSales(branchIds: string[]): Promise<RecentSale[]> {
        const sales = await db.sale.findMany({
            where: {
                branchId: { in: branchIds },
                paymentStatus: { not: 'QUOTE' }
            },
            select: {
                id: true,
                saleNumber: true,
                customerName: true,
                total: true,
                date: true,
                paymentStatus: true
            },
            orderBy: {
                date: 'desc'
            },
            take: 5
        });

        return sales.map(s => ({
            ...s,
            total: Number(s.total)
        }));
    }

    private static async getLowStockProducts(branchIds: string[]): Promise<LowStockProduct[]> {
        const products = await db.product.findMany({
            where: {
                branchId: { in: branchIds },
                stock: {
                    lte: db.product.fields.minStock
                }
            },
            select: {
                id: true,
                name: true,
                stock: true,
                minStock: true,
                sellingPrice: true
            },
            orderBy: {
                stock: 'asc'
            },
            take: 5
        });

        return products.map(p => ({
            ...p,
            sellingPrice: Number(p.sellingPrice)
        }));
    }

    private static async getRecentExpenses(branchIds: string[]): Promise<RecentExpense[]> {
        const expenses = await db.expense.findMany({
            where: {
                branchId: { in: branchIds }
            },
            select: {
                id: true,
                description: true,
                amount: true,
                category: true,
                date: true
            },
            orderBy: {
                date: 'desc'
            },
            take: 5
        });

        return expenses.map(e => ({
            ...e,
            amount: Number(e.amount)
        }));
    }

    private static async getRecentCustomers(branchIds: string[]): Promise<RecentCustomer[]> {
        return db.customer.findMany({
            where: {
                branchId: { in: branchIds }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });
    }
}
