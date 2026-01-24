'use server';

import { TaskService } from './service';

export async function getTasksAction() {
    try {
        const data = await TaskService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
