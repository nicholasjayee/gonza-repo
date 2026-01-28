import { useState, useEffect } from 'react';

export function useSettingData() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/settings').then(res => res.json()).then(setRoles).finally(() => setLoading(false));
    }, []);

    return { roles, loading };
}
