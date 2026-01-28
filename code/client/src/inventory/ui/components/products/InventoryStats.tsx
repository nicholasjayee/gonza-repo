"use client";

import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Product } from '@/inventory/types';
import { Package, AlertTriangle, Ban, TrendingUp, DollarSign } from 'lucide-react';
import { formatNumber } from '@/shared/utils/format';

interface InventoryStatsProps {
    products: Product[];
    currency?: string;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({
    products,
    currency = 'UGX'
}) => {
    // Calculate stats
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    const totalCostValue = products.reduce((sum, product) => sum + (product.costPrice * product.stock), 0);
    const totalStockValue = products.reduce((sum, product) => sum + (product.sellingPrice * product.stock), 0);

    return (
        <div className="grid gap-3 md:gap-4 mb-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="inline-flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
                            <Package className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Total Products</p>
                            <h3 className="text-lg md:text-2xl font-bold">{totalProducts}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="inline-flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-500">
                            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Low Stock</p>
                            <h3 className="text-lg md:text-2xl font-bold">{lowStockProducts}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="inline-flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                            <Ban className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Out of Stock</p>
                            <h3 className="text-lg md:text-2xl font-bold">{outOfStockProducts}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="inline-flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
                            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Cost Value</p>
                            <h3 className="text-sm md:text-lg font-bold break-all leading-tight">
                                {currency} {formatNumber(totalCostValue)}
                            </h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center">
                        <div className="inline-flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-500">
                            <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Stock Value</p>
                            <h3 className="text-sm md:text-lg font-bold break-all leading-tight">
                                {currency} {formatNumber(totalStockValue)}
                            </h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
