"use client";

import { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { getCustomersAction } from '../../api/controller';

export function useCustomerData() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = async () => {
        try {
            const res = await getCustomersAction();
            if (res.success) {
                setCustomers(res.data as any);
            } else {
                throw new Error(res.error || 'Failed to fetch customers');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return { customers, loading, error, refresh: fetchCustomers };
}
