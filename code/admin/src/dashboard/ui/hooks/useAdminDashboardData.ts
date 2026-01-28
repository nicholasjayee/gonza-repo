import { useState, useEffect } from 'react';

export function useAdminDashboardData() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard').then(res => res.json()).then(setData).finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
