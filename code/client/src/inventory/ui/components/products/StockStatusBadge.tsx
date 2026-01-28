import React from 'react';
import { Product } from '@/inventory/types';
import { Badge } from '@/shared/components/ui/badge';

interface StockStatusBadgeProps {
    product: Product;
}

const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ product }) => {
    if (product.stock === 0) {
        return (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                Out of Stock
            </Badge>
        );
    }

    if (product.stock <= product.minStock) {
        return (
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                Low Stock
            </Badge>
        );
    }

    return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            In Stock
        </Badge>
    );
};

export default StockStatusBadge;
