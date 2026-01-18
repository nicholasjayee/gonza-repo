import { useState, useEffect } from 'react';

export function useAdminAnalyticsData() {
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics').then(res => res.json()).then(setReport).finally(() => setLoading(false));
    }, []);

    return { report, loading };
}
