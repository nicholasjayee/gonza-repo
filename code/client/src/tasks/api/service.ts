import { db } from '@gonza/shared/infra/db';
import { Task } from '../types';

export class TaskService {
    static async getAll(): Promise<Task[]> {
        // return db.task.findMany();
        return [];
    }
}
