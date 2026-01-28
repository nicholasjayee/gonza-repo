import { db } from '@gonza/shared/prisma/db';
import { Branch } from '../types';
import bcrypt from 'bcryptjs';

export class BranchService {
    static async getAll(adminId: string): Promise<Branch[]> {
        return db.branch.findMany({
            where: { adminId },
            orderBy: { createdAt: 'desc' }
        }) as any;
    }

    static async create(data: Omit<Branch, 'id'>): Promise<Branch> {
        // Enforce Single Main Branch Rule
        if (data.type === 'MAIN' && data.adminId) {
            const existingMain = await db.branch.findFirst({
                where: {
                    adminId: data.adminId,
                    type: 'MAIN'
                }
            });

            if (existingMain) {
                throw new Error("A Main Branch already exists. You can only have one Main Branch.");
            }
        }

        let hashedPwd = null;
        if (data.accessPassword) {
            hashedPwd = await bcrypt.hash(data.accessPassword, 10);
        }

        return db.branch.create({
            data: {
                name: data.name,
                location: data.location,
                phone: data.phone,
                email: data.email,
                type: data.type,
                accessPassword: hashedPwd,
                adminId: data.adminId
            }
        }) as any;
    }

    static async update(id: string, data: Partial<Omit<Branch, 'id'>>): Promise<Branch> {
        const updateData: any = { ...data };
        if (data.accessPassword) {
            updateData.accessPassword = await bcrypt.hash(data.accessPassword, 10);
        }

        return db.branch.update({
            where: { id },
            data: updateData
        }) as any;
    }

    static async delete(id: string): Promise<void> {
        await db.branch.delete({
            where: { id }
        });
    }

    static async verifyPassword(id: string, password: string): Promise<boolean> {
        const branch = await db.branch.findUnique({ where: { id } });
        if (!branch || !branch.accessPassword) return true;
        return bcrypt.compare(password, branch.accessPassword);
    }
}
