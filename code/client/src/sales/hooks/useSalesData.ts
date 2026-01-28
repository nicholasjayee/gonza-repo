// Temporary mock hook for sales data - will be replaced with real API integration
import { useState } from 'react';
import { Sale } from '@/sales/types';

export function useSalesData() {
    const [sales] = useState<Sale[]>([]);
    const [isLoading] = useState(false);
    const [isFetching] = useState(false);

    const deleteSale = async (sale: Sale) => {
        console.log('Delete sale:', sale.id);
        // TODO: Implement actual delete logic
    };

    const refetch = async () => {
        console.log('Refetch sales');
        // TODO: Implement actual refetch logic
    };

    return {
        sales,
        isLoading,
        deleteSale,
        refetch,
        isFetching
    };
}
