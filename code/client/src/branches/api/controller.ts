'use server';

import { BranchService } from './service';
import { Branch } from '../types';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch, setActiveBranch } from './branchContext';

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

export async function switchBranchAction(branchId: string, type: 'MAIN' | 'SUB') {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    // Verify user owns/has access to this branch
    const all = await BranchService.getAll(auth.user.id);
    const branch = all.find(b => b.id === branchId);

    if (!branch) {
        return { success: false, error: "Branch not found or unauthorized" };
    }

    await setActiveBranch(branch.id, branch.type);
    return { success: true };
}

export async function getBranchesAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType, isVerified } = await getActiveBranch();
        const data = await BranchService.getAll(auth.user.id);
        return { success: true, data, activeType: branchType, activeId: branchId, isVerified };
    } catch (error) {
        console.error("Error fetching branches:", error);
        return { success: false, error: 'Failed to fetch branches' };
    }
}

export async function getBranchAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const all = await BranchService.getAll(auth.user.id);
        const branch = all.find(b => b.id === id);
        return { success: true, data: branch };
    } catch (error) {
        return { success: false, error: 'Failed to fetch branch' };
    }
}

export async function verifyBranchPasswordAction(id: string, password: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const isValid = await BranchService.verifyPassword(id, password);
        return { success: true, isValid };
    } catch (error) {
        return { success: false, error: 'Password verification failed' };
    }
}

export async function createBranchAction(data: Omit<Branch, 'id' | 'adminId'>) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    const { branchType } = await getActiveBranch();

    // Strict Server-Side Enforcement
    if (branchType !== 'MAIN') {
        return { success: false, error: "Only the Main Branch (HQ) can create new branches." };
    }

    try {
        const branch = await BranchService.create({
            ...data,
            adminId: auth.user.id
        });
        return { success: true, data: branch };
    } catch (error: any) {
        console.error("Error creating branch:", error);
        return { success: false, error: error.message || 'Failed to create branch' };
    }
}

export async function updateBranchAction(id: string, data: Partial<Omit<Branch, 'id'>>) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const branch = await BranchService.update(id, data);
        return { success: true, data: branch };
    } catch (error: any) {
        console.error("Error updating branch:", error);
        return { success: false, error: error.message || 'Failed to update branch' };
    }
}

export async function deleteBranchAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        await BranchService.delete(id);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting branch:", error);
        return { success: false, error: error.message || 'Failed to delete branch' };
    }
}
