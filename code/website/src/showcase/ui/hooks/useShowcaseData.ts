import { useState, useEffect } from 'react';
import { ProductShowcase } from '../types';

export function useShowcaseData() {
    const [products, setProducts] = useState<ProductShowcase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/showcase')
            .then(res => res.json())
            .then(setProducts)
            .finally(() => setLoading(false));
    }, []);

    return { products, loading };
}
