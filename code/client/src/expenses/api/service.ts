import { db } from '@gonza/shared/prisma/db';
import { Expense } from '../types';

export class ExpenseService {
    static async getAll(filters: {
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
        category?: string;
        branchId?: string;
    }): Promise<Expense[]> {
        const where: any = {};

        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = filters.startDate;
            if (filters.endDate) where.date.lte = filters.endDate;
        }

        if (filters.minAmount !== undefined) {
            where.amount = { ...where.amount, gte: filters.minAmount };
        }
        if (filters.maxAmount !== undefined) {
            where.amount = { ...where.amount, lte: filters.maxAmount };
        }

        if (filters.category) {
            where.category = filters.category;
        }

        if (filters.branchId) {
            where.branchId = filters.branchId;
        }

        const expenses = await db.expense.findMany({
            where,
            orderBy: { date: 'desc' },
            include: { user: { select: { name: true } } }
        });

        return expenses.map((e: any) => ({
            ...e,
            amount: Number(e.amount)
        })) as unknown as Expense[];
    }

    static async create(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        const expense = await db.expense.create({
            data: {
                ...data,
                amount: data.amount
            }
        });

        return {
            ...expense,
            amount: Number(expense.amount)
        } as unknown as Expense;
    }

    static async createBulk(expenses: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
        const created = await db.expense.createMany({
            data: expenses.map(e => ({
                ...e,
                amount: e.amount
            }))
        });
        return created.count;
    }

    static async update(id: string, data: Partial<Expense>): Promise<Expense> {
        const expense = await db.expense.update({
            where: { id },
            data
        });

        return {
            ...expense,
            amount: Number(expense.amount)
        } as unknown as Expense;
    }

    static async delete(id: string): Promise<void> {
        await db.expense.delete({
            where: { id }
        });
    }

    static async deleteBulk(ids: string[]): Promise<void> {
        await db.expense.deleteMany({
            where: { id: { in: ids } }
        });
    }

    static async updateBulkMany(ids: string[], data: Partial<Expense>): Promise<void> {
        await db.expense.updateMany({
            where: { id: { in: ids } },
            data: {
                ...data,
                // amount: data.amount // If amount is updated, prisma handles number->decimal
            }
        });
    }
    static async bulkCreate(expenses: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
        const created = await db.expense.createMany({
            data: expenses.map(e => ({
                amount: e.amount,
                description: e.description,
                category: e.category,
                date: e.date,
                paymentMethod: e.paymentMethod,
                reference: e.reference,
                branchId: e.branchId,
                userId: e.userId,
            }))
        });
        return created.count;
    }

    static async bulkUpdate(expenses: { id: string; data: Partial<Expense> }[]): Promise<number> {
        const operations = expenses.map(({ id, data }) =>
            db.expense.update({
                where: { id },
                data: {
                    amount: data.amount !== undefined ? Number(data.amount) || 0 : undefined,
                    description: data.description,
                    category: data.category,
                    date: data.date,
                    paymentMethod: data.paymentMethod,
                    reference: data.reference,
                }
            })
        );

        await db.$transaction(operations);
        return operations.length;
    }

    static async bulkDelete(ids: string[]): Promise<number> {
        const deleted = await db.expense.deleteMany({
            where: { id: { in: ids } }
        });
        return deleted.count;
    }
}
