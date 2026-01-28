import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';

export function useInventoryData() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/api/inventory');
                if (!response.ok) throw new Error('Failed to fetch inventory');
                const data = await response.json();
                setItems(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    return { items, loading, error };
}
