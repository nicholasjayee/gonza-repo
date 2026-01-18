import { useState, useEffect } from 'react';

export function useSupportData() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/support').then(res => res.json()).then(setDocs).finally(() => setLoading(false));
    }, []);

    return { docs, loading };
}
