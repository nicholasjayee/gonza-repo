import { db } from '@gonza/shared/prisma/db';
import { Task, TaskPriority, TaskStatus } from '@gonza/shared/prisma/db';

export interface CreateTaskInput {
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: TaskPriority;
    assignedToId?: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    dueDate?: Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedToId?: string;
}

export class TaskService {
    /**
     * Create a new task
     */
    static async create(userId: string, branchId: string, data: CreateTaskInput) {
        return db.task.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                priority: data.priority || 'NORMAL',
                status: 'TODO',
                branchId,
                createdById: userId,
                assignedToId: data.assignedToId
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, image: true, email: true }
                },
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
    }

    /**
     * Get all tasks for a branch, optionally filtered
     */
    static async getAll(branchId: string, filters?: {
        status?: TaskStatus,
        assignedToId?: string,
        startDate?: Date,
        endDate?: Date
    }) {
        const where: any = { branchId };

        if (filters?.status) where.status = filters.status;
        if (filters?.assignedToId) where.assignedToId = filters.assignedToId;

        if (filters?.startDate && filters?.endDate) {
            where.dueDate = {
                gte: filters.startDate,
                lte: filters.endDate
            };
        }

        return db.task.findMany({
            where,
            include: {
                assignedTo: {
                    select: { id: true, name: true, image: true }
                },
                createdBy: {
                    select: { id: true, name: true }
                }
            },
            orderBy: [
                { status: 'asc' }, // TODO first
                { dueDate: 'asc' }, // Earliest due first
                { priority: 'desc' } // URGENT first
            ]
        });
    }

    /**
     * Get a single task by ID
     */
    static async getById(id: string) {
        return db.task.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: { id: true, name: true, image: true, email: true }
                },
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
    }

    /**
     * Update a task
     */
    static async update(id: string, data: UpdateTaskInput) {
        return db.task.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, image: true }
                }
            }
        });
    }

    /**
     * Delete a task
     */
    static async delete(id: string) {
        return db.task.delete({
            where: { id }
        });
    }

    /**
     * Update task status (quick action)
     */
    static async updateStatus(id: string, status: TaskStatus) {
        return db.task.update({
            where: { id },
            data: { status }
        });
    }
}
