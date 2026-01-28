"use client";

import React from 'react';
import { Filter, X } from 'lucide-react';
import { SalesFiltersState } from './SalesFilters/types';
import { PriceRangeFilter } from './SalesFilters/PriceRangeFilter';
import { StatusSourceFilter } from './SalesFilters/StatusSourceFilter';
import { DateRangeFilter } from './SalesFilters/DateRangeFilter';

export type { SalesFiltersState } from './SalesFilters/types';

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
                <PriceRangeFilter
                    filters={filters}
                    onChange={handleChange}
                />

                <StatusSourceFilter
                    filters={filters}
                    onChange={handleChange}
                />

                <DateRangeFilter
                    filters={filters}
                    onChange={(updates) => onChange({ ...filters, ...updates })}
                    onPresetChange={handlePresetChange}
                />
            </div>
        </div>
    );
};
