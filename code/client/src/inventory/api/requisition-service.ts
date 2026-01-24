import { db, RequisitionStatus } from '@gonza/shared/prisma/db';

export interface CreateRequisitionInput {
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    notes?: string;
    items: {
        productName: string;
        sku?: string;
        quantity: number;
    }[];
}

export class RequisitionService {
    /**
     * Create a new requisition
     */
    static async create(userId: string, branchId: string, data: CreateRequisitionInput) {
        // Generate REQ Number
        const count = await db.requisition.count();
        const requisitionNumber = `REQ-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        return db.requisition.create({
            data: {
                requisitionNumber,
                branchId,
                userId,
                priority: data.priority,
                notes: data.notes,
                items: {
                    create: data.items
                }
            },
            include: {
                items: true,
                branch: true
            }
        });
    }

    /**
     * Get all requisitions for an admin's branches
     */
    static async getAll(adminId: string, branchId?: string) {
        const where: any = {
            branch: { adminId }
        };
        if (branchId) where.branchId = branchId;

        return db.requisition.findMany({
            where,
            include: {
                items: true,
                branch: true,
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Update a requisition
     */
    static async update(id: string, data: CreateRequisitionInput) {
        return db.$transaction(async (tx) => {
            // Delete old items
            await tx.requisitionItem.deleteMany({
                where: { requisitionId: id }
            });

            // Update main record and re-create items
            return tx.requisition.update({
                where: { id },
                data: {
                    priority: data.priority,
                    notes: data.notes,
                    items: {
                        create: data.items
                    }
                },
                include: {
                    items: true,
                    branch: true
                }
            });
        });
    }

    /**
     * Update requisition status
     */
    static async updateStatus(id: string, status: RequisitionStatus) {
        return db.requisition.update({
            where: { id },
            data: { status }
        });
    }

    /**
     * Delete a requisition
     */
    static async delete(id: string) {
        return db.requisition.delete({
            where: { id }
        });
    }

    /**
     * Get requisition by ID
     */
    static async getById(id: string) {
        return db.requisition.findUnique({
            where: { id },
            include: {
                items: true,
                branch: true,
                user: { select: { name: true, email: true } }
            }
        });
    }

    /**
     * Get products that are below their minStock level for a branch
     */
    static async getLowStockItems(branchId: string) {
        return db.product.findMany({
            where: {
                branchId,
                OR: [
                    { stock: 0 },
                    { stock: { lte: db.product.fields.minStock } }
                ]
            },
            select: {
                id: true,
                name: true,
                sku: true,
                stock: true,
                minStock: true
            }
        });
    }
}
