import { db } from '@gonza/shared/prisma/db';

export interface DashboardMetrics {
    // Sales metrics
    totalRevenue: number;
    salesCount: number;
    averageOrderValue: number;

    // Inventory metrics
    totalProducts: number;
    lowStockCount: number;
    totalInventoryValue: number;

    // Expense metrics
    totalExpenses: number;
    expenseCount: number;
    topExpenseCategory: string;

    // Customer metrics
    totalCustomers: number;
    newCustomers: number; // last 30 days
}

export class DashboardService {
    /**
     * Get aggregated dashboard metrics
     * @param currentBranchId - The current user's branch
     * @param currentBranchType - MAIN or SUB
     * @param filterBranchId - Optional filter for main branches to view specific sub-branch
     */
    static async getMetrics(
        currentBranchId: string,
        currentBranchType: 'MAIN' | 'SUB',
        filterBranchId?: string
    ): Promise<DashboardMetrics> {
        // Determine which branches to query
        let branchIds: string[];

        if (currentBranchType === 'SUB') {
            // Sub-branches only see their own data
            branchIds = [currentBranchId];
        } else if (filterBranchId) {
            // Main branch filtering by specific branch
            branchIds = [filterBranchId];
        } else {
            // Main branch viewing all branches
            const branches = await db.branch.findMany({
                where: {
                    type: { in: ['MAIN', 'SUB'] } // Get all branches
                },
                select: { id: true }
            });
            branchIds = branches.map(b => b.id);
        }

        // Fetch all metrics in parallel
        const [salesMetrics, inventoryMetrics, expenseMetrics, customerMetrics] = await Promise.all([
            this.getSalesMetrics(branchIds),
            this.getInventoryMetrics(branchIds),
            this.getExpenseMetrics(branchIds),
            this.getCustomerMetrics(branchIds)
        ]);

        return {
            ...salesMetrics,
            ...inventoryMetrics,
            ...expenseMetrics,
            ...customerMetrics
        };
    }

    private static async getSalesMetrics(branchIds: string[]) {
        const sales = await db.sale.findMany({
            where: {
                branchId: { in: branchIds },
                paymentStatus: { not: 'QUOTE' } // Exclude quotes from metrics
            },
            select: {
                total: true
            }
        });

        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const salesCount = sales.length;
        const averageOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

        return {
            totalRevenue,
            salesCount,
            averageOrderValue
        };
    }

    private static async getInventoryMetrics(branchIds: string[]) {
        const products = await db.product.findMany({
            where: {
                branchId: { in: branchIds }
            },
            select: {
                stock: true,
                minStock: true,
                costPrice: true,
                sellingPrice: true
            }
        });

        const totalProducts = products.length;
        const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
        const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.sellingPrice) * p.stock), 0);

        return {
            totalProducts,
            lowStockCount,
            totalInventoryValue
        };
    }

    private static async getExpenseMetrics(branchIds: string[]) {
        const expenses = await db.expense.findMany({
            where: {
                branchId: { in: branchIds }
            },
            select: {
                amount: true,
                category: true
            }
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const expenseCount = expenses.length;

        // Find top expense category
        const categoryTotals: Record<string, number> = {};
        expenses.forEach(exp => {
            const cat = exp.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount);
        });

        let topExpenseCategory = 'N/A';
        let topAmount = 0;
        Object.entries(categoryTotals).forEach(([cat, amount]) => {
            if (amount > topAmount) {
                topExpenseCategory = cat;
                topAmount = amount;
            }
        });

        return {
            totalExpenses,
            expenseCount,
            topExpenseCategory
        };
    }

    private static async getCustomerMetrics(branchIds: string[]) {
        const customers = await db.customer.findMany({
            where: {
                branchId: { in: branchIds }
            },
            select: {
                createdAt: true
            }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalCustomers = customers.length;
        const newCustomers = customers.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;

        return {
            totalCustomers,
            newCustomers
        };
    }

    /**
     * Get list of sub-branches for main branch filtering
     */
    static async getSubBranches(mainBranchId: string) {
        return db.branch.findMany({
            where: {
                type: 'SUB' // Get all SUB branches for filtering
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
}
