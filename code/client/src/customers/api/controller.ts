'use server';

import { CustomerService } from './service';
import { StatementService } from './statement-service';
import { CreateCustomerInput } from '../types';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';

import { serialize } from '@/shared/utils/serialize';

// ... existing code ...

export async function getCustomerStatementAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data = await StatementService.getStatement(id);
        return { success: true, data: serialize(data) };
    } catch (error) {
        console.error("Error fetching customer statement:", error);
        return { success: false, error: 'Failed to fetch statement' };
    }
}

async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const mockReq = {
        headers: headerList,
        cookies: {
            get: (name: string) => cookieStore.get(name)
        }
    } as any;

    return authGuard(mockReq, ['user', 'admin']);
}

export async function getCustomersAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        const data = await CustomerService.getAll(auth.user.id, branchId);
        return { success: true, data: serialize(data) };
    } catch (error) {
        console.error("Error fetching customers:", error);
        return { success: false, error: 'Failed to fetch customers' };
    }
}

export async function searchCustomersByPhoneAction(phone: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data = await CustomerService.searchByPhone(phone, auth.user.id);
        return { success: true, data: serialize(data) };
    } catch (error) {
        return { success: false, error: 'Search failed' };
    }
}

export async function searchCustomersByNameAction(name: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data = await CustomerService.searchByName(name, auth.user.id);
        return { success: true, data: serialize(data) };
    } catch (error) {
        return { success: false, error: 'Search failed' };
    }
}

export async function createCustomerAction(data: CreateCustomerInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        const customer = await CustomerService.create(data, auth.user.id, branchId);
        return { success: true, data: serialize(customer) };
    } catch (error: any) {
        console.error("Error creating customer:", error);
        return { success: false, error: error.message || 'Failed to create customer' };
    }
}

export async function updateCustomerAction(id: string, data: Partial<CreateCustomerInput>) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const customer = await CustomerService.update(id, data);
        return { success: true, data: serialize(customer) };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update customer' };
    }
}

export async function deleteCustomerAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        await CustomerService.delete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to delete customer' };
    }
}

export async function getCustomerAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data = await CustomerService.getById(id);
        return { success: true, data: serialize(data) };
    } catch (error) {
        return { success: false, error: 'Failed to fetch customer' };
    }
}
