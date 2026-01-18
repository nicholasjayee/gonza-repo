'use server';

import { AdminUserService } from './service';

export async function getUsersAction() {
    try {
        const data = await AdminUserService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
