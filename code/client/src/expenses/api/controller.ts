'use server';

import { ExpenseService } from './service';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { Expense } from '../types';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@gonza/shared/config/env';

async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();
    const mockReq = { headers: headerList, cookies: { get: (name: string) => cookieStore.get(name) } } as any;
    return authGuard(mockReq, ['user', 'admin']);
}

/**
 * R2 Upload Helper (Internal)
 */
async function uploadImageToR2(file: File): Promise<string> {
    const s3Client = new S3Client({
        region: 'auto',
        endpoint: env.R2_ENDPOINT,
        credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `receipts/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    }));

    return `${env.R2_PUBLIC_URL}/${fileName}`;
}

export async function getExpensesAction(filters: {
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    category?: string;
    filterBranchId?: string;
} = {}) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        const { branchId, branchType } = await getActiveBranch();

        const serviceFilters: any = { ...filters };
        if (filters.startDate) serviceFilters.startDate = new Date(filters.startDate);
        if (filters.endDate) serviceFilters.endDate = new Date(filters.endDate);

        // If SUB branch, always enforce its own branchId.
        // If MAIN branch, use filterBranchId if provided, otherwise show all for this admin.
        if (branchType === 'SUB' && branchId) {
            serviceFilters.branchId = branchId;
        } else if (filters.filterBranchId) {
            serviceFilters.branchId = filters.filterBranchId;
        }

        const data = await ExpenseService.getAll(serviceFilters);
        return { success: true, data };
    } catch (error) {
        console.error('Get Expenses Error:', error);
        return { success: false, error: 'Failed to fetch expenses' };
    }
}

export async function createExpenseAction(formData: FormData) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };
    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: 'No active branch selected' };

    try {
        const amount = Number(formData.get('amount'));
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const date = new Date(formData.get('date') as string);
        const paymentMethod = formData.get('paymentMethod') as string;
        const reference = formData.get('reference') as string;
        const imageFile = formData.get('receiptImage') as File;

        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToR2(imageFile);
        }

        const expense = await ExpenseService.create({
            amount,
            description,
            category,
            date,
            paymentMethod: paymentMethod || null,
            reference: reference || null,
            receiptImage: imageUrl,
            userId: auth.user.id,
            branchId
        });
        return { success: true, data: expense };
    } catch (error) {
        console.error('Create Expense Error:', error);
        return { success: false, error: 'Failed to create expense' };
    }
}

export async function updateExpenseAction(id: string, formData: FormData) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        const data: any = {};
        const fields = ['description', 'category', 'paymentMethod', 'reference'];
        fields.forEach(field => {
            const val = formData.get(field);
            if (val !== null) data[field] = val;
        });

        if (formData.has('amount')) data.amount = Number(formData.get('amount'));
        if (formData.has('date')) data.date = new Date(formData.get('date') as string);

        const imageFile = formData.get('receiptImage') as File;
        if (imageFile && imageFile.size > 0) {
            data.receiptImage = await uploadImageToR2(imageFile);
        }

        const expense = await ExpenseService.update(id, data);
        return { success: true, data: expense };
    } catch (error) {
        console.error('Update Expense Error:', error);
        return { success: false, error: 'Failed to update expense' };
    }
}

export async function deleteExpenseAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        await ExpenseService.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete expense' };
    }
}

export async function deleteBulkExpensesAction(ids: string[]) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        await ExpenseService.deleteBulk(ids);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete expenses' };
    }
}

export async function updateBulkExpensesAction(ids: string[], data: any) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        await ExpenseService.updateBulkMany(ids, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update expenses' };
    }
}

export async function uploadBulkExpensesAction(expenses: any[]) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };
    const { branchId } = await getActiveBranch();
    if (!branchId) return { success: false, error: 'No active branch' };

    try {
        // Helper function to parse dates from various sources
        const parseDate = (dateValue: any): Date => {
            if (!dateValue) return new Date();

            // If already a valid Date object
            if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
                return dateValue;
            }

            // If it's a string or number, try to parse it
            const parsed = new Date(dateValue);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }

            // If Excel serial number (number > 1000, likely Excel date)
            if (typeof dateValue === 'number' && dateValue > 1000) {
                // Excel dates are days since 1900-01-01 (adjusted for Excel bug)
                const excelEpoch = new Date(1900, 0, 1);
                const daysOffset = dateValue - 2; // Adjust for Excel's 1900 leap year bug
                const msPerDay = 24 * 60 * 60 * 1000;
                return new Date(excelEpoch.getTime() + daysOffset * msPerDay);
            }

            // Fallback to current date if all parsing fails
            console.warn('Could not parse date:', dateValue, 'using current date');
            return new Date();
        };

        // Map CSV/Excel data to Expense objects
        const formatted = expenses.map(e => {
            // Parse and validate amount
            const parsedAmount = parseFloat(e.amount);
            const validAmount = !isNaN(parsedAmount) && isFinite(parsedAmount) ? parsedAmount : 0;

            const base = {
                amount: validAmount,
                description: e.description || 'Bulk Import',
                category: e.category || 'Uncategorized',
                date: parseDate(e.date),
                paymentMethod: e.paymentMethod || null,
                reference: e.reference || null,
                userId: auth.user.id,
                branchId
            };

            // If ID is provided and looks valid (not empty string), include it for update
            if (e.id && typeof e.id === 'string' && e.id.trim().length > 0) {
                return { ...base, id: e.id.trim() };
            }
            return base;
        });

        const count = await ExpenseService.bulkCreate(formatted);
        return { success: true, count };
    } catch (error) {
        console.error('Bulk Upload Error:', error);
        return { success: false, error: 'Failed to import expenses' };
    }
}

export async function bulkUpdateExpensesAction(expenses: any[]) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        // Helper function to parse dates
        const parseDate = (dateValue: any): Date | undefined => {
            if (!dateValue) return undefined;

            if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
                return dateValue;
            }

            const parsed = new Date(dateValue);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }

            if (typeof dateValue === 'number' && dateValue > 1000) {
                const excelEpoch = new Date(1900, 0, 1);
                const daysOffset = dateValue - 2;
                const msPerDay = 24 * 60 * 60 * 1000;
                return new Date(excelEpoch.getTime() + daysOffset * msPerDay);
            }

            return undefined;
        };

        // Map CSV/Excel data to update operations (ID is required)
        const formatted = expenses
            .filter(e => e.id && typeof e.id === 'string' && e.id.trim().length > 0)
            .map(e => {
                const parsedAmount = e.amount !== undefined ? parseFloat(e.amount) : undefined;
                const validAmount = parsedAmount !== undefined && !isNaN(parsedAmount) && isFinite(parsedAmount) ? parsedAmount : undefined;

                return {
                    id: e.id.trim(),
                    data: {
                        ...(validAmount !== undefined && { amount: validAmount }),
                        ...(e.description && { description: e.description }),
                        ...(e.category && { category: e.category }),
                        ...(e.date && { date: parseDate(e.date) }),
                        ...(e.paymentMethod !== undefined && { paymentMethod: e.paymentMethod || null }),
                        ...(e.reference !== undefined && { reference: e.reference || null }),
                    }
                };
            });

        if (formatted.length === 0) {
            return { success: false, error: 'No valid records with IDs found for update' };
        }

        const count = await ExpenseService.bulkUpdate(formatted);
        return { success: true, count };
    } catch (error) {
        console.error('Bulk Update Error:', error);
        return { success: false, error: 'Failed to update expenses' };
    }
}

export async function bulkDeleteExpensesAction(expenses: any[]) {
    const auth = await getAuth();
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    try {
        // Extract IDs from the uploaded data
        const ids = expenses
            .filter(e => e.id && typeof e.id === 'string' && e.id.trim().length > 0)
            .map(e => e.id.trim());

        if (ids.length === 0) {
            return { success: false, error: 'No valid IDs found for deletion' };
        }

        const count = await ExpenseService.bulkDelete(ids);
        return { success: true, count };
    } catch (error) {
        console.error('Bulk Delete Error:', error);
        return { success: false, error: 'Failed to delete expenses' };
    }
}
