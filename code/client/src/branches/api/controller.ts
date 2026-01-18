'use server';

import { BranchService } from './service';

export async function getBranchesAction() {
    try {
        const data = await BranchService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch branches' };
    }
}
