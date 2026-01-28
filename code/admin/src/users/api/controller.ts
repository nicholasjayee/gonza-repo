'use server';

import { AdminUserService } from './service';

export async function getUsersAction() {
    try {
        const data = await AdminUserService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch users' };
    }
}

export async function updateUserAction(userId: string, data: any) {
    try {
        const updatedUser = await AdminUserService.update(userId, data);
        return { success: true, data: updatedUser };
    } catch (error) {
        return { success: false, error: 'Failed to update user' };
    }
}

export async function toggleUserStatusAction(userId: string, isActive: boolean) {
    try {
        await AdminUserService.toggleStatus(userId, isActive);
        return { success: true };
    } catch (error) {
        return { success: false, error: `Failed to ${isActive ? 'unfreeze' : 'freeze'} user` };
    }
}

export async function deleteUserAction(userId: string) {
    try {
        await AdminUserService.delete(userId);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete user' };
    }
}

export async function getRolesAction() {
    try {
        const roles = await AdminUserService.getRoles();
        return { success: true, data: roles };
    } catch (error) {
        return { success: false, error: 'Failed to fetch roles' };
    }
}

