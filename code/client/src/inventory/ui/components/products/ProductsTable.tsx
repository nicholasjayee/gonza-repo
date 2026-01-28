"use client";

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import { Product } from '@/inventory/types';
import { formatNumber } from '@/shared/utils/format';
import { format } from 'date-fns';
import { Eye, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import StockStatusBadge from './StockStatusBadge';
import EmptyProductState from './EmptyProductState';

interface ProductsTableProps {
    products: Product[];
    currency: string;
    onViewProduct: (id: string) => void;
    onEditProduct: (id: string) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
    products,
    currency,
    onViewProduct,
    onEditProduct
}) => {
    if (products.length === 0) {
        return <EmptyProductState />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-border/50">
            <div className="p-4 sm:p-6 border-b border-border/50">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Product Inventory</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Cost Price</TableHead>
                                <TableHead className="text-right">Selling Price</TableHead>
                                <TableHead className="text-right">Total Value</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => {
                                const totalValue = product.stock * product.sellingPrice;

                                return (
                                    <TableRow
                                        key={product.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => onViewProduct(product.id)}
                                    >
                                        <TableCell className="font-mono text-sm">
                                            {product.sku || '-'}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell>
                                            {product.categoryName || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {product.stock}
                                        </TableCell>
                                        <TableCell>
                                            <StockStatusBadge product={product} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {currency} {formatNumber(product.costPrice)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {currency} {formatNumber(product.sellingPrice)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {currency} {formatNumber(totalValue)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(product.createdAt), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewProduct(product.id);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Product</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditProduct(product.id);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit Product</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};
