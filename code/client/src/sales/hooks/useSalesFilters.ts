"use client";

import { useState, useMemo } from 'react';
import { Sale, PaymentStatus } from '@/sales/types';

export function useSalesFilters(sales: Sale[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
    const [cashTransactionFilter, setCashTransactionFilter] = useState<'all' | 'linked' | 'unlinked'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined
    });
    const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);

    const isCustomRange = dateFilter === 'custom';
    const isSpecificDate = dateFilter === 'specific';

    const filteredSales = useMemo(() => {
        return sales.filter((sale) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    sale.customerName.toLowerCase().includes(query) ||
                    sale.saleNumber.toLowerCase().includes(query) ||
                    sale.customerPhone?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Payment status filter
            if (paymentFilter !== 'all' && sale.paymentStatus !== paymentFilter) {
                return false;
            }

            // Cash transaction filter
            if (cashTransactionFilter !== 'all') {
                const hasTransaction = !!sale.cashAccountId;
                if (cashTransactionFilter === 'linked' && !hasTransaction) return false;
                if (cashTransactionFilter === 'unlinked' && hasTransaction) return false;
            }

            // Category/Source filter
            if (categoryFilter !== 'all' && sale.source !== categoryFilter) {
                return false;
            }

            // Date filters
            const saleDate = new Date(sale.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (dateFilter) {
                case 'today':
                    const todayEnd = new Date(today);
                    todayEnd.setHours(23, 59, 59, 999);
                    if (saleDate < today || saleDate > todayEnd) return false;
                    break;

                case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayEnd = new Date(yesterday);
                    yesterdayEnd.setHours(23, 59, 59, 999);
                    if (saleDate < yesterday || saleDate > yesterdayEnd) return false;
                    break;

                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    if (saleDate < weekStart) return false;
                    break;

                case 'month':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    if (saleDate < monthStart) return false;
                    break;

                case 'custom':
                    if (dateRange.from && saleDate < dateRange.from) return false;
                    if (dateRange.to) {
                        const toEnd = new Date(dateRange.to);
                        toEnd.setHours(23, 59, 59, 999);
                        if (saleDate > toEnd) return false;
                    }
                    break;

                case 'specific':
                    if (specificDate) {
                        const specStart = new Date(specificDate);
                        specStart.setHours(0, 0, 0, 0);
                        const specEnd = new Date(specificDate);
                        specEnd.setHours(23, 59, 59, 999);
                        if (saleDate < specStart || saleDate > specEnd) return false;
                    }
                    break;
            }

            return true;
        });
    }, [sales, searchQuery, paymentFilter, cashTransactionFilter, categoryFilter, dateFilter, dateRange, specificDate]);

    return {
        searchQuery,
        setSearchQuery,
        paymentFilter,
        setPaymentFilter,
        cashTransactionFilter,
        setCashTransactionFilter,
        categoryFilter,
        setCategoryFilter,
        dateFilter,
        setDateFilter,
        dateRange,
        setDateRange,
        specificDate,
        setSpecificDate,
        isCustomRange,
        isSpecificDate,
        filteredSales
    };
}
