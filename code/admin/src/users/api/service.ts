import { db } from '@gonza/shared/prisma/db';

export class AdminUserService {
    static async getAll() {
        return db.user.findMany({
            include: {
                role: true,
                _count: {
                    select: {
                        sales: true,
                        products: true,
                        customers: true,
                        transactions: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getById(id: string) {
        return db.user.findUnique({
            where: { id },
            include: {
                role: true,
                _count: {
                    select: {
                        sales: true,
                        products: true,
                        customers: true,
                        transactions: true,
                    }
                }
            },
        });
    }

    static async update(userId: string, data: any) {
        return db.user.update({
            where: { id: userId },
            data,
            include: {
                role: true,
            },
        });
    }

    static async toggleStatus(userId: string, isActive: boolean) {
        return db.user.update({
            where: { id: userId },
            data: { isActive },
        });
    }

    static async delete(userId: string) {
        return db.user.delete({
            where: { id: userId },
        });
    }

    static async getRoles() {
        return db.role.findMany();
    }
}

