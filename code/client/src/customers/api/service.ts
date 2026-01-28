import { db } from '@gonza/shared/prisma/db';
import { Customer, CreateCustomerInput } from '../types';

export class CustomerService {
    static async getAll(adminId: string, branchId?: string): Promise<Customer[]> {
        const where: any = { adminId };

        if (branchId) {
            where.branchId = branchId;
        }

        return db.customer.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        }) as any;
    }

    static async getById(id: string): Promise<Customer | null> {
        return db.customer.findUnique({
            where: { id }
        }) as any;
    }

    static async searchByPhone(phone: string, adminId: string): Promise<Customer[]> {
        return db.customer.findMany({
            where: {
                phone: {
                    contains: phone
                },
                adminId
            },
            take: 10
        }) as any;
    }

    static async searchByName(name: string, adminId: string): Promise<Customer[]> {
        return db.customer.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                },
                adminId
            },
            take: 10
        }) as any;
    }

    static async create(data: CreateCustomerInput, adminId: string, branchId?: string): Promise<Customer> {
        return db.customer.create({
            data: {
                ...data,
                adminId,
                branchId
            }
        }) as any;
    }

    static async update(id: string, data: Partial<CreateCustomerInput>): Promise<Customer> {
        return db.customer.update({
            where: { id },
            data
        }) as any;
    }

    static async delete(id: string): Promise<void> {
        await db.customer.delete({
            where: { id }
        });
    }
}
