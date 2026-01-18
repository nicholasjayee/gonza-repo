import { NextResponse } from 'next/server';
import { TaskService } from './service';

export const TaskController = {
    async getTasks() {
        const tasks = await TaskService.fetchTasks();
        return NextResponse.json(tasks);
    }
};
