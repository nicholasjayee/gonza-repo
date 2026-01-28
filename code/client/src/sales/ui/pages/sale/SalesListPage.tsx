"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, TrendingUp, Filter, Loader2 } from 'lucide-react';
import { Sale } from '@/sales/types';
import { SalesTable } from '../../components/SalesTable';
import { SalesSummary } from '../../components/SalesSummary';
import { SalesFilters, SalesFiltersState } from '../../components/SalesFilters';
import { HardwareManager } from '@/products/hardware/ui/HardwareManager';
import { BranchFilter } from '@/shared/components/BranchFilter';
import { getSalesAction } from '@/sales/api/controller';

interface SalesListPageProps {
    initialSales: Sale[];
    branchType?: string;
    branches?: { id: string; name: string }[];
}

export const SalesListPage: React.FC<SalesListPageProps> = ({ initialSales, branchType, branches = [] }) => {
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filters, setFilters] = useState<SalesFiltersState>({
        minPrice: 0,
        maxPrice: 0,
        startDate: '',
        endDate: '',
        paymentStatus: '',
        source: '',
        datePreset: ''
    });

    const handleBranchChange = async (branchId: string | null) => {
        setSelectedBranchId(branchId);
        setIsRefreshing(true);
        try {
            const res = await getSalesAction(branchId || undefined);
            if (res.success && res.data) {
                setSales(res.data as Sale[]);
            }
        } catch (error) {
            console.error("Failed to refresh sales:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const filteredSales = sales.filter(s => {
        // Search filter
        const matchesSearch =
            s.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.customerPhone?.includes(searchQuery);

        // Price filter
        const matchesPrice = (filters.minPrice === 0 || s.total >= filters.minPrice) &&
            (filters.maxPrice === 0 || s.total <= filters.maxPrice);

        // Status filter
        const matchesStatus = !filters.paymentStatus || s.paymentStatus === filters.paymentStatus;

        // Source filter
        const matchesSource = !filters.source || s.source === filters.source;

        // Date filter
        const date = new Date(s.date);
        const matchesStart = !filters.startDate || date >= new Date(filters.startDate);

        let matchesEnd = true;
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            matchesEnd = date <= end;
        }

        return matchesSearch && matchesPrice && matchesStatus && matchesSource && matchesStart && matchesEnd;
    });

    const clearFilters = () => {
        setFilters({
            minPrice: 0,
            maxPrice: 0,
            startDate: '',
            endDate: '',
            paymentStatus: '',
            source: '',
            datePreset: ''
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 flex-1">
                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-2 text-primary">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-[0.15em]">Revenue Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">Sales</h1>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Manage your transactions, quotes and receipts in one place.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {branchType === 'MAIN' && branches.length > 0 && (
                            <div className="bg-card border border-border p-3 rounded-2xl shadow-sm">
                                <BranchFilter
                                    branches={branches}
                                    selectedBranchId={selectedBranchId}
                                    onBranchChange={handleBranchChange}
                                />
                            </div>
                        )}
                        <Link
                            href="/sales/new"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group shrink-0"
                        >
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>New Sale</span>
                        </Link>
                    </div>
                </div>

                <div className="w-full lg:w-80">
                    <HardwareManager />
                </div>
            </div>

            {/* Financial Summary */}
            <SalesSummary sales={filteredSales} />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-2 bg-muted/30 border border-border rounded-2xl shadow-inner-sm">
                <div className="relative flex-1 group w-full sm:w-auto">
                    {isRefreshing ? (
                        <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                    ) : (
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    )}
                    <input
                        type="text"
                        placeholder="Search by sale #, customer name or phone..."
                        className="w-full h-12 pl-11 pr-4 bg-transparent outline-none text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border w-full sm:w-auto justify-center ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border hover:bg-muted'}`}
                >
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                    {(filters.minPrice > 0 || filters.maxPrice > 0 || filters.paymentStatus || filters.source || filters.startDate) && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                </button>
            </div>

            {showFilters && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                    <SalesFilters
                        filters={filters}
                        onChange={setFilters}
                        onClear={clearFilters}
                    />
                </div>
            )}

            {/* Table */}
            <div className="animate-in slide-in-from-bottom-5 duration-700">
                <SalesTable sales={filteredSales} />
            </div>
        </div>
    );
};
