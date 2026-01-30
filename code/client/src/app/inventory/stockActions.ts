'use server';

import { db } from '@gonza/shared/prisma/db';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { serialize } from '@/shared/utils/serialize';
import { NextRequest } from 'next/server';
import { Prisma } from '@gonza/shared/prisma/db';

async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const mockReq = {
        headers: headerList,
        cookies: {
            get: (name: string) => cookieStore.get(name)
        }
    } as unknown as NextRequest;

    return authGuard(mockReq, ['user', 'admin']);
}

export async function getStockHistoryAction(productId?: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");



        const history = await db.productHistory.findMany({
            where: {
                product: {
                    branchId
                },
                ...(productId ? { productId } : {})
            },
            include: {
                product: {
                    select: {
                        name: true,
                        costPrice: true,
                        sellingPrice: true,
                        sku: true // item_number equivalent
                    }
                }
            },
            orderBy: [
                { createdAt: 'asc' },
                { id: 'asc' }
            ]
        });

        // Map to frontend type
        // Map to frontend type
        const formattedHistory = history.map(entry => ({
            id: entry.id,
            productId: entry.productId,
            oldQuantity: entry.oldStock,
            newQuantity: entry.newStock,
            changeReason: entry.reason || '',
            createdAt: entry.createdAt,
            referenceId: entry.referenceId,
            receiptNumber: '', // Not available in ProductHistory
            product: entry.product ? {
                name: entry.product.name,
                costPrice: entry.product.costPrice,
                sellingPrice: entry.product.sellingPrice,
                itemNumber: entry.product.sku
            } : undefined
        }));

        // Reverse for display (newest first) as per original hook
        return { success: true, data: serialize(formattedHistory.reverse()) };
    } catch (error: unknown) {
        console.error("Error fetching stock history:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch stock history" };
    }
}

export async function createStockHistoryEntryAction(
    productId: string,
    previousQuantity: number,
    newQuantity: number,
    reason: string,
    referenceId?: string,
    entryDate?: Date,
    receiptNumber?: string,
    productName?: string
) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const snapshottedReason = productName
            ? `[${productName}] | ${reason}`
            : reason;

        const data: Prisma.ProductHistoryCreateInput = {
            user: { connect: { id: auth.user.id } },
            product: { connect: { id: productId } },
            // branch: { connect: { id: branchId } }, // ProductHistory doesn't have branchId
            oldStock: previousQuantity,
            newStock: newQuantity,
            quantityChange: newQuantity - previousQuantity, // Change amount
            reason: snapshottedReason,
            // reason: reason, // duplicate
            type: 'ADJUSTMENT', // Default type
            referenceId: referenceId,
            // receiptNumber: receiptNumber, // Not in schema
        };

        if (entryDate) {
             const hours = entryDate.getHours();
             const minutes = entryDate.getMinutes();
             const seconds = entryDate.getSeconds();
             const isMidnight = hours === 0 && minutes === 0 && seconds === 0;
             const isNoon = hours === 12 && minutes === 0 && seconds === 0;

             if (!isMidnight && !isNoon) {
                 data.createdAt = entryDate;
             }
        }

        await db.productHistory.create({ data });

        return { success: true };
    } catch (error: unknown) {
        console.error("Error creating stock history:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create stock history" };
    }
}

export async function updateStockHistoryEntryAction(
    entryId: string,
    newQuantity: number,
    newChangeReason: string,
    newDate?: Date
) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        return await db.$transaction(async (tx) => {
            const currentEntry = await tx.productHistory.findUnique({
                where: { id: entryId }
            });

            if (!currentEntry) throw new Error("Entry not found");

            // Check if initial stock
            // Check if initial stock
            const firstEntry = await tx.productHistory.findFirst({
                where: {
                    productId: currentEntry.productId,
                    product: { branchId }
                },
                orderBy: [
                    { createdAt: 'asc' },
                    { id: 'asc' }
                ]
            });

            const isInitialStock = firstEntry?.id === entryId;

            // Update current entry
            // Update current entry
            const updateData: Prisma.ProductHistoryUpdateInput = {
                newStock: newQuantity,
                reason: newChangeReason,
                quantityChange: newQuantity - currentEntry.oldStock // Update change amount
            };

            if (newDate) {
                updateData.createdAt = newDate;
            }

            await tx.productHistory.update({
                where: { id: entryId },
                data: updateData
            });

            if (isInitialStock && newDate) {
                await tx.product.update({
                    where: { id: currentEntry.productId },
                    data: { createdAt: newDate }
                });
            }

            // Recalculate chain
            const allHistory = await tx.productHistory.findMany({
                where: {
                    productId: currentEntry.productId,
                    product: { branchId }
                },
                orderBy: [
                    { createdAt: 'asc' },
                    { id: 'asc' }
                ]
            });

            let runningQuantity = 0;
            for (const entry of allHistory) {
                // For the updated entry, we already set the newQuantity.
                // But we need to ensure the chain is consistent.
                // The logic in client was:
                // If it's the updated entry, use its new values (which we just set).
                // If it's subsequent, apply its original change to the new running total.



                if (entry.id === entryId) {
                    // This is the one we manually changed.
                    // Its oldQuantity should match the runningQuantity from previous steps.
                    // Its newQuantity is what user set.
                    // So we update oldQuantity to match runningQuantity.
                    if (entry.oldStock !== runningQuantity) {
                        await tx.productHistory.update({
                            where: { id: entry.id },
                            data: { oldStock: runningQuantity }
                        });
                    }
                    // runningQuantity becomes the newQuantity user set.
                    runningQuantity = newQuantity; 
                } else {
                    // Subsequent entry.
                    // original change = entry.newQuantity - entry.oldQuantity
                    // new oldQuantity = runningQuantity
                    // new newQuantity = runningQuantity + originalChange
                    
                    const originalChange = entry.newStock - entry.oldStock;
                    const newOld = runningQuantity;
                    const newNew = runningQuantity + originalChange;

                    if (entry.oldStock !== newOld || entry.newStock !== newNew) {
                         await tx.productHistory.update({
                            where: { id: entry.id },
                            data: {
                                oldStock: newOld,
                                newStock: newNew
                            }
                        });
                    }
                    runningQuantity = newNew;
                }
            }

            // Update product stock
            await tx.product.update({
                where: { id: currentEntry.productId },
                data: { stock: runningQuantity }
            });

            return { success: true };
        });

    } catch (error: unknown) {
        console.error("Error updating stock history:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update stock history" };
    }
}

export async function deleteStockHistoryEntryAction(entryId: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        return await db.$transaction(async (tx) => {
            const entryToDelete = await tx.productHistory.findUnique({
                where: { id: entryId }
            });

            if (!entryToDelete) throw new Error("Entry not found");

            await tx.productHistory.delete({
                where: { id: entryId }
            });

            // Recalculate chain
            const allHistory = await tx.productHistory.findMany({
                where: {
                    productId: entryToDelete.productId,
                    product: { branchId }
                },
                orderBy: [
                    { createdAt: 'asc' },
                    { id: 'asc' }
                ]
            });

            let runningQuantity = 0;
            for (const entry of allHistory) {
                const originalChange = entry.newStock - entry.oldStock;
                const newOld = runningQuantity;
                const newNew = runningQuantity + originalChange;

                if (entry.oldStock !== newOld || entry.newStock !== newNew) {
                    await tx.productHistory.update({
                        where: { id: entry.id },
                        data: {
                            oldStock: newOld,
                            newStock: newNew
                        }
                    });
                }
                runningQuantity = newNew;
            }

            await tx.product.update({
                where: { id: entryToDelete.productId },
                data: { stock: runningQuantity }
            });

            return { success: true };
        });

    } catch (error: unknown) {
        console.error("Error deleting stock history:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete stock history" };
    }
}

export async function deleteMultipleStockHistoryEntriesAction(entryIds: string[]) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        // Simple delete for now, chain recalculation might be heavy if done for multiple products.
        // Client code disabled chain recalculation for bulk delete.
        await db.productHistory.deleteMany({
            where: { id: { in: entryIds } }
        });
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting multiple entries:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete entries" };
    }
}

export async function recalculateProductStockAction(productId: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        const allHistory = await db.productHistory.findMany({
            where: {
                productId,
                product: { branchId }
            },
            orderBy: [
                { createdAt: 'asc' },
                { id: 'asc' }
            ]
        });

        let currentStock = 0;
        if (allHistory.length > 0) {
            currentStock = allHistory[0].newStock;
            for (let i = 1; i < allHistory.length; i++) {
                const entry = allHistory[i];
                const prev = allHistory[i-1];
                const change = entry.newStock - entry.oldStock;
                currentStock = prev.newStock + change;
            }
            // Actually, the loop above just calculates what it *should* be if we followed the chain.
            // But if we want to update the product to match the *last entry*, we should just take the last entry.
            // However, the client logic was:
            // currentStock = previousEntry.new_quantity + change;
            // This implies it's verifying/fixing the chain logic?
            // "The final stock is the new_quantity of the last entry"
            currentStock = allHistory[allHistory.length - 1].newStock;
        }

        await db.product.update({
            where: { id: productId },
            data: { stock: currentStock }
        });

        return { success: true, data: currentStock };

    } catch (error: unknown) {
        console.error("Error recalculating product stock:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to recalculate" };
    }
}

export async function updateStockHistoryDatesBySaleIdAction(saleId: string, newDate: Date) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        await db.productHistory.updateMany({
            where: { 
                referenceId: saleId,
                product: { branchId }
            },
            data: { createdAt: newDate }
        });

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating stock history dates:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update dates" };
    }
}

export interface ActivityFilters {
    activityType: string;
    module: string;
    search?: string;
    dateRange: {
        from?: Date;
        to?: Date;
    };
}

export async function getActivityHistoryAction(
    page: number, 
    pageSize: number, 
    filters?: ActivityFilters
) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId } = await getActiveBranch();
        if (!branchId) throw new Error("No active branch found");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            branchId,
            userId: auth.user.id
        };

        if (filters) {
            if (filters.activityType !== 'ALL') {
                where.activityType = filters.activityType;
            }
            if (filters.module !== 'ALL') {
                where.module = filters.module;
            }
            if (filters.search) {
                where.OR = [
                    { entityName: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } }
                ];
            }
            if (filters.dateRange.from) {
                where.createdAt = { gte: filters.dateRange.from };
            }
            if (filters.dateRange.to) {
                const toDate = new Date(filters.dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                where.createdAt = { ...where.createdAt as any, lte: toDate };
            }
        }

        const [activities, count] = await Promise.all([
            // db.activityHistory.findMany({
            //     where,
            //     orderBy: { createdAt: 'desc' },
            //     skip: (page - 1) * pageSize,
            //     take: pageSize
            // }),
            // db.activityHistory.count({ where })
            Promise.resolve([]),
            Promise.resolve(0)
        ]);

        return { success: true, data: { activities, count } };

    } catch (error: unknown) {
        console.error("Error fetching activity history:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch activity history" };
    }
}

export async function getCurrentUserAction() {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: "Unauthorized" };
    return { success: true, data: { id: auth.user.id, email: auth.user.email } };
}
