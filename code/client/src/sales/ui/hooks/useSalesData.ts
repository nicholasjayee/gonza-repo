"use client";

import { useState, useEffect } from 'react';
import { Sale } from '@/sales/types';

export function useSalesData() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await fetch('/api/sales');
                if (!response.ok) throw new Error('Failed to fetch sales');
                const data = await response.json();
                setSales(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    return { sales, loading, error };
}
