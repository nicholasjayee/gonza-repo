"use client";

import { useState, useEffect } from 'react';

export function useBranchData() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/branches').then(res => res.json()).then(setBranches).finally(() => setLoading(false));
    }, []);

    return { branches, loading };
}
