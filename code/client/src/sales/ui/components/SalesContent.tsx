"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw } from 'lucide-react';
import SalesTableSkeleton from './SalesTableSkeleton';
import SalesDataTable from './SalesDataTable';
import { SalesSummaryCards } from './SalesSummaryCards';
import SalesTableFilters from './SalesTableFilters';
import SalesTablePagination from './SalesTablePagination';
import { useSalesData } from '@/sales/hooks/useSalesData';
import { useSalesFilters } from '@/sales/hooks/useSalesFilters';
import { useSalesActions } from '@/sales/hooks/useSalesActions';
import { usePagination } from '@/sales/hooks/usePagination';

export const SalesContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch sales data
    const {
        sales,
        isLoading,
        deleteSale,
        refetch,
        isFetching
    } = useSalesData();

    // Filters
    const {
        searchQuery,
        setSearchQuery,
        paymentFilter,
        setPaymentFilter,
        dateFilter,
        setDateFilter,
        filteredSales
    } = useSalesFilters(sales);

    // Actions
    const {
        handleViewReceipt,
        handleEditSale,
        handleDeleteSale
    } = useSalesActions();

    // Pagination
    const {
        currentPage,
        setCurrentPage,
        paginatedItems: paginatedSales,
        totalPages
    } = usePagination({
        items: filteredSales,
        itemsPerPage: 10
    });

    // Currency - TODO: Get from settings
    const currency = 'UGX';

    const handleRefresh = async () => {
        await refetch();
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <SalesTableSkeleton />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Sales Management</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="flex items-center gap-2"
                    disabled={isFetching}
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Sales Overview</TabsTrigger>
                    <TabsTrigger value="analysis">Sales Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <SalesSummaryCards sales={filteredSales} currency={currency} />

                    <SalesTableFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        paymentFilter={paymentFilter}
                        setPaymentFilter={setPaymentFilter}
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                    />

                    <SalesDataTable
                        sales={paginatedSales}
                        onViewReceipt={handleViewReceipt}
                        onEditSale={handleEditSale}
                        onDeleteSale={handleDeleteSale}
                        currency={currency}
                    />

                    {filteredSales.length > 0 && (
                        <SalesTablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </TabsContent>

                <TabsContent value="analysis" className="mt-6">
                    <div className="p-8 text-center text-muted-foreground">
                        <p>Sales analysis and charts will be displayed here.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
