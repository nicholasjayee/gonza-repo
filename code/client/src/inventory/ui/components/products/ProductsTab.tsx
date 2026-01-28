"use client";

import React, { useState, useMemo } from 'react';
import { Product, StockStatus } from '@/inventory/types';
import { InventoryStats } from './InventoryStats';
import { ProductSearchBar } from './ProductSearchBar';
import { ProductFilters } from './ProductFilters';
import { ProductsTable } from './ProductsTable';

interface ProductsTabProps {
    products: Product[];
    categories: string[];
    currency: string;
    onViewProduct: (id: string) => void;
    onEditProduct: (id: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
    products,
    categories,
    currency,
    onViewProduct,
    onEditProduct
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState<StockStatus>('all');

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                product.name.toLowerCase().includes(searchLower) ||
                product.sku?.toLowerCase().includes(searchLower) ||
                product.barcode?.toLowerCase().includes(searchLower) ||
                product.categoryName?.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            // Category filter
            if (categoryFilter !== 'all' && product.categoryName !== categoryFilter) {
                return false;
            }

            // Stock status filter
            if (stockFilter !== 'all') {
                if (stockFilter === 'out-of-stock' && product.stock !== 0) return false;
                if (stockFilter === 'low-stock' && (product.stock === 0 || product.stock > product.minStock)) return false;
                if (stockFilter === 'in-stock' && (product.stock === 0 || product.stock <= product.minStock)) return false;
            }

            return true;
        });
    }, [products, searchQuery, categoryFilter, stockFilter]);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <InventoryStats products={filteredProducts} currency={currency} />

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <ProductSearchBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>
                <ProductFilters
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    stockFilter={stockFilter}
                    onStockFilterChange={setStockFilter}
                    categories={categories}
                />
            </div>

            {/* Products Table */}
            <ProductsTable
                products={filteredProducts}
                currency={currency}
                onViewProduct={onViewProduct}
                onEditProduct={onEditProduct}
            />
        </div>
    );
};
