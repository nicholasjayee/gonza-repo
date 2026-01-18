import { useState, useEffect } from 'react';

export function useExpenseData() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/expenses').then(res => res.json()).then(setExpenses).finally(() => setLoading(false));
    }, []);

    return { expenses, loading };
}
