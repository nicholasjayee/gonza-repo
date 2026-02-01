"use client";

import React, { useMemo } from 'react';
import { Sale } from '@/sales/types';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import SalesTableRow from './SalesTableRow';
import EmptySalesState from './EmptySalesState';

interface SalesDataTableProps {
    sales: Sale[];
    onViewReceipt: (sale: Sale) => void;
    onEditSale: (sale: Sale) => void;
    onDeleteSale: (sale: Sale) => void;
    currency: string;
}

const SalesDataTable: React.FC<SalesDataTableProps> = ({
    sales,
    onViewReceipt,
    onEditSale,
    onDeleteSale,
    currency
}) => {
    const memoizedSales = useMemo(() => sales, [sales]);

    if (memoizedSales.length === 0) {
        return <EmptySalesState />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-border/50">
            <div className="p-4 sm:p-6 border-b border-border/50">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Sales Records</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {memoizedSales.length} {memoizedSales.length === 1 ? 'record' : 'records'} found
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Receipt #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Total Qty</TableHead>
                                <TableHead className="text-right">Avg Price</TableHead>
                                <TableHead className="text-right">Discount</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Profit</TableHead>
                                <TableHead className="text-right">Total (incl. Tax)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {memoizedSales.map((sale) => (
                                <SalesTableRow
                                    key={sale.id}
                                    sale={sale}
                                    currency={currency}
                                    onViewReceipt={onViewReceipt}
                                    onEditSale={onEditSale}
                                    onDeleteSale={onDeleteSale}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default SalesDataTable;
