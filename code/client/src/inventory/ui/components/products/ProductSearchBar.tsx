"use client";

import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
    searchQuery,
    onSearchChange
}) => {
    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                placeholder="Search products by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-full bg-white transition-all duration-200 focus:shadow-md"
            />
        </div>
    );
};
