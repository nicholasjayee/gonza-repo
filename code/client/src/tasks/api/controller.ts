'use server';

import { TaskService, CreateTaskInput, UpdateTaskInput } from './task-service';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { db } from '@gonza/shared/prisma/db';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { serialize } from '@/shared/utils/serialize';
import { TaskStatus } from '@gonza/shared/prisma/db';

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

export async function getTasksAction(filters?: { status?: TaskStatus, assignedToId?: string, startDate?: Date, endDate?: Date }) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        const tasks = await TaskService.getAll(branchId, filters);
        return { success: true, data: serialize(tasks) };
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return { success: false, error: "Failed to fetch tasks" };
    }
}

export async function createTaskAction(data: CreateTaskInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        const task = await TaskService.create(auth.user.id, branchId, data);
        return { success: true, data: serialize(task) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTaskAction(id: string, data: UpdateTaskInput) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const task = await TaskService.update(id, data);
        return { success: true, data: serialize(task) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTaskAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        await TaskService.delete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTaskStatusAction(id: string, status: TaskStatus) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const task = await TaskService.updateStatus(id, status);
        return { success: true, data: serialize(task) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBranchUsersAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { branchId } = await getActiveBranch();
        const users = await db.user.findMany({
            where: { branchId },
            select: { id: true, name: true, image: true, email: true }
        });
        return { success: true, data: serialize(users) };
    } catch (error) {
        return { success: false, error: "Failed to fetch users" };
    }
}
