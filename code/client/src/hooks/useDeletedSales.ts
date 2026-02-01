/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";



import { useState, useCallback, useEffect } from 'react';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useCurrentUser } from './useCurrentUser';
import { getDeletedSalesAction } from '@/app/sales/deleted/actions';

export interface DeletedSale {
    id: string;
    receiptNumber: string;
    customerName: string;
    amount: number;
    totalQuantity: number;
    deletedAt: string;
    deletedBy: string;
    items: any[];
    fullMetadata: any;
}

export const useDeletedSales = () => {
    const [deletedSales, setDeletedSales] = useState<DeletedSale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // const { currentBusiness } = useBusiness(); // Context handled by server action
    // const { userId } = useCurrentUser();

    const fetchDeletedSales = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getDeletedSalesAction();

            if (result.success && result.data) {
                // The action returns serialized list of activity history objects
                // data format similar to what Supabase returned but serialized
                const formatted: DeletedSale[] = (result.data as any[]).map((log: any) => {
                    const metadata = log.metadata || {};
                    const items = Array.isArray(metadata.items) ? metadata.items : [];

                    // Fallback: If totalAmount is missing or 0, calculate it from items
                    let amount = Number(metadata.totalAmount || 0);
                    if (amount === 0 && items.length > 0) {
                        amount = items.reduce((sum: number, item: any) => {
                            const itemTotal = Number(item.total) || (Number(item.price || 0) * Number(item.quantity || 0));
                            return sum + itemTotal;
                        }, 0);
                    }

                    // Calculate total quantity
                    const totalQuantity = items.reduce((sum: number, item: any) => sum + (Number(item.quantity ?? item.qty ?? 0)), 0);

                    return {
                        id: log.id,
                        receiptNumber: metadata.receiptNumber || 'N/A',
                        customerName: metadata.customerName || 'Unknown',
                        amount: amount,
                        totalQuantity: totalQuantity,
                        deletedAt: log.createdAt, // Note: Prisma uses camelCase
                        deletedBy: log.profileName || 'Admin', // Note: Prisma uses camelCase if mapped, or check raw
                        items: items,
                        fullMetadata: metadata
                    };
                });
                setDeletedSales(formatted);
            } else {
                console.error('Failed to fetch deleted sales:', result.error);
                // Optionally show toast
            }

        } catch (error) {
            console.error('Error fetching deleted sales:', error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependencies removed as business/user context is handled by the action

    useEffect(() => {
        fetchDeletedSales();
    }, [fetchDeletedSales]);

    return {
        deletedSales,
        isLoading,
        refetch: fetchDeletedSales
    };
};
