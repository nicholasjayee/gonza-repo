import { db } from '@gonza/shared/prisma/db';

interface ProfitLossReport {
    // Revenue
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    grossMargin: number;

    // Expenses
    totalExpenses: number;
    expensesByCategory: { category: string; amount: number }[];

    // Net Profit
    netProfit: number;
    netMargin: number;
}

export class ProfitLossService {
    static async generateReport(
        branchId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ProfitLossReport> {
        // Ensure end date is inclusive of the entire day
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);

        // Get sales data
        const sales = await db.sale.findMany({
            where: {
                branchId,
                date: { gte: startDate, lte: adjustedEndDate },
                paymentStatus: { not: 'QUOTE' } // Exclude quotes
            },
            include: {
                items: true
            }
        });

        // Calculate revenue and cost
        let totalRevenue = 0;
        let totalCost = 0;

        sales.forEach(sale => {
            totalRevenue += Number(sale.total);
            sale.items.forEach(item => {
                totalCost += Number(item.unitCost) * item.quantity;
            });
        });

        const grossProfit = totalRevenue - totalCost;
        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

        // Get expenses data
        const expenses = await db.expense.findMany({
            where: {
                branchId,
                date: { gte: startDate, lte: adjustedEndDate }
            }
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

        // Group expenses by category
        const expensesByCategory = expenses.reduce((acc, exp) => {
            const existing = acc.find(e => e.category === exp.category);
            if (existing) {
                existing.amount += Number(exp.amount);
            } else {
                acc.push({ category: exp.category, amount: Number(exp.amount) });
            }
            return acc;
        }, [] as { category: string; amount: number }[]);

        // Calculate net profit
        const netProfit = grossProfit - totalExpenses;
        const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            grossProfit,
            grossMargin,
            totalExpenses,
            expensesByCategory,
            netProfit,
            netMargin
        };
    }
}
