import { type Role } from "@gonza/shared/prisma/db";

export interface UserWithRole {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    roleId: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        sales: number;
        products: number;
        customers: number;
        transactions: number;
    };
}

export type UserUpdateInput = {
    name?: string;
    email?: string;
    roleId?: string;
    isActive?: boolean;
};
