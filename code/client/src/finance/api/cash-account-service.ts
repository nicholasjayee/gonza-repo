import { db, CashAccount } from '@gonza/shared/prisma/db';

export class CashAccountService {
    static async getAll(branchId: string): Promise<CashAccount[]> {
        return db.cashAccount.findMany({
            where: { branchId },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getById(id: string): Promise<CashAccount | null> {
        return db.cashAccount.findUnique({
            where: { id },
            include: {
                sales: {
                    select: {
                        id: true,
                        saleNumber: true,
                        total: true,
                        createdAt: true
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    static async create(data: {
        name: string;
        description?: string;
        initialBalance: number;
        branchId: string;
    }): Promise<CashAccount> {
        return db.cashAccount.create({
            data: {
                ...data,
                currentBalance: data.initialBalance
            }
        });
    }

    static async update(id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<CashAccount> {
        return db.cashAccount.update({
            where: { id },
            data
        });
    }

    static async delete(id: string): Promise<void> {
        // Soft delete by marking as inactive
        await db.cashAccount.update({
            where: { id },
            data: { isActive: false }
        });
    }

    static async updateBalance(id: string, amount: number, isAddition: boolean = true): Promise<void> {
        const account = await db.cashAccount.findUnique({ where: { id } });
        if (!account) throw new Error('Cash account not found');

        const newBalance = isAddition
            ? Number(account.currentBalance) + amount
            : Number(account.currentBalance) - amount;

        await db.cashAccount.update({
            where: { id },
            data: { currentBalance: newBalance }
        });
    }
}
