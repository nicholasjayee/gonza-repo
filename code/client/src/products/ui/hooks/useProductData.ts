import { useState, useEffect } from 'react';

export function useProductData() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products').then(res => res.json()).then(setProducts).finally(() => setLoading(false));
    }, []);

    return { products, loading };
}
