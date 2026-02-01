"use client";

import { useState, useEffect } from 'react';

export function useMessagingData() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/messaging').then(res => res.json()).then(setLogs).finally(() => setLoading(false));
    }, []);

    return { logs, loading };
}
