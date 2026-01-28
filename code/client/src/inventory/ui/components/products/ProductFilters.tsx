"use client";

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { StockStatus } from '@/inventory/types';

interface ProductFiltersProps {
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    stockFilter: StockStatus;
    onStockFilterChange: (value: StockStatus) => void;
    categories: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
    categoryFilter,
    onCategoryChange,
    stockFilter,
    onStockFilterChange,
    categories
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                            {category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={onStockFilterChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Stock Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stock Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
