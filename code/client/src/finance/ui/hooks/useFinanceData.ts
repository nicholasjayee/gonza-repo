"use client";

import { useState, useEffect } from 'react';

export function useFinanceData() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/finance').then(res => res.json()).then(setAccounts).finally(() => setLoading(false));
    }, []);

    return { accounts, loading };
}
