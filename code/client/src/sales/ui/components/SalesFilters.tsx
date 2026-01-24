"use client";

import React from 'react';
import { PaymentStatus, SaleSource } from '@/sales/types';
import { Filter, X, Calendar, Database, Tag, CreditCard, ShoppingBag } from 'lucide-react';

export interface SalesFiltersState {
    minPrice: number;
    maxPrice: number;
    startDate: string;
    endDate: string;
    paymentStatus: PaymentStatus | '';
    source: SaleSource | '';
    datePreset?: string;
}

interface SalesFiltersProps {
    filters: SalesFiltersState;
    onChange: (filters: SalesFiltersState) => void;
    onClear: () => void;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
    filters,
    onChange,
    onClear
}) => {
    const handlePresetChange = (preset: string) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let start = '';
        let end = '';

        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                start = end = formatDate(now);
                break;
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                start = end = formatDate(yesterday);
                break;
            case 'this-week':
                const monday = new Date(now);
                monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
                start = formatDate(monday);
                end = formatDate(now);
                break;
            case 'last-week':
                const lastSun = new Date(now);
                lastSun.setDate(now.getDate() - (now.getDay() === 0 ? 7 : now.getDay()));
                const lastMon = new Date(lastSun);
                lastMon.setDate(lastSun.getDate() - 6);
                start = formatDate(lastMon);
                end = formatDate(lastSun);
                break;
            case 'this-month':
                start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
                end = formatDate(now);
                break;
            case 'last-month':
                const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                start = formatDate(lm);
                end = formatDate(lmEnd);
                break;
            case 'this-year':
                start = `${now.getFullYear()}-01-01`;
                end = formatDate(now);
                break;
            case 'last-year':
                const lastYear = now.getFullYear() - 1;
                start = `${lastYear}-01-01`;
                end = `${lastYear}-12-31`;
                break;
            case 'specific':
                start = end = filters.startDate || formatDate(now);
                break;
            case 'custom':
                start = filters.startDate;
                end = filters.endDate;
                break;
            default:
                start = '';
                end = '';
        }

        onChange({ ...filters, datePreset: preset, startDate: start, endDate: end });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({ ...filters, [name]: value });
    };

    const inputClasses = "w-full h-10 px-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-xs font-medium";
    const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5 block px-1";

    return (
        <div className="bg-muted/30 border border-border rounded-2xl p-6 mt-4 mb-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold">Sales Analysis Filters</h3>
                </div>
                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                >
                    <X className="w-3 h-3" />
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        <span className={labelClasses.replace("mb-1.5", "")}>Price Range</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min Price"
                            value={filters.minPrice || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max Price"
                            value={filters.maxPrice || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Status & Source */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <CreditCard className="w-3 h-3 text-muted-foreground" />
                        <span className={labelClasses.replace("mb-1.5", "")}>Payment & Source</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            name="paymentStatus"
                            value={filters.paymentStatus}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Status</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="QUOTE">Quote</option>
                            <option value="INSTALLMENT">Installment</option>
                        </select>
                        <select
                            name="source"
                            value={filters.source}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Source</option>
                            <option value="WALK_IN">Walk-in</option>
                            <option value="PHONE">Phone</option>
                            <option value="ONLINE">Online</option>
                            <option value="REFERRAL">Referral</option>
                            <option value="RETURNING">Returning</option>
                        </select>
                    </div>
                </div>

                {/* Date Range */}
                <div className="col-span-1 lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className={labelClasses.replace("mb-1.5", "")}>Timeline Selection</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                            value={filters.datePreset || ''}
                            onChange={(e) => handlePresetChange(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="">Any Time</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this-week">This Week</option>
                            <option value="last-week">Last Week</option>
                            <option value="this-month">This Month</option>
                            <option value="last-month">Last Month</option>
                            <option value="this-year">This Year</option>
                            <option value="last-year">Last Year</option>
                            <option value="specific">Specific Date</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {(filters.datePreset === 'specific' || filters.datePreset === 'custom') && (
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (filters.datePreset === 'specific') {
                                        onChange({ ...filters, startDate: val, endDate: val });
                                    } else {
                                        onChange({ ...filters, startDate: val });
                                    }
                                }}
                                className={inputClasses}
                            />
                        )}
                        {filters.datePreset === 'custom' && (
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleChange}
                                className={inputClasses}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
