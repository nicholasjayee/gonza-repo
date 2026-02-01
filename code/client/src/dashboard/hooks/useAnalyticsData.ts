"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sale, AnalyticsData } from '@/dashboard/types';
import { 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  isSameDay
} from 'date-fns';
import { getExpenses } from '@/dashboard/api/actions';

interface UseAnalyticsDataProps {
  sales: Sale[];
  dateFilter: string;
  dateRange: { from: Date | undefined; to: Date | undefined; };
  specificDate?: Date | undefined;
  isCustomRange: boolean;
  isSpecificDate?: boolean;
  branchId?: string;
}

export function useAnalyticsData({ sales, dateFilter, dateRange, specificDate, isCustomRange, isSpecificDate, branchId }: UseAnalyticsDataProps) {
  const [expenses, setExpenses] = useState<number>(0);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expensesData, setExpensesData] = useState<Array<{date: string, amount: number}>>([]);

  // Memoize the expensive calculations
  const calculateSaleTotals = useCallback((sale: Sale) => {
    // Calculate total sale price after discounts (same logic as revenue calculation)
    const totalSalePrice = sale.items && Array.isArray(sale.items) 
      ? sale.items.reduce((sum, item) => {
          const subtotal = item.price * item.quantity;
          const discountAmount = item.discountType === 'amount' 
            ? (item.discountAmount || 0)
            : (subtotal * (item.discountPercentage || 0)) / 100;
          return sum + (subtotal - discountAmount);
        }, 0)
      : 0;
    
    const totalCost = sale.items && Array.isArray(sale.items)
      ? sale.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0)
      : 0;
      
    return { totalSalePrice, totalCost };
  }, []);

  // Memoize date filtering function
  const matchesDateFilter = useCallback((saleDate: Date): boolean => {
    // Validate the sale date
    if (isNaN(saleDate.getTime())) {
      return false;
    }
    
    if (dateFilter === 'all') return true;
    
    if (dateFilter === 'custom' && isCustomRange) {
      if (dateRange.from && dateRange.to) {
        return isWithinInterval(saleDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        });
      }
      return true;
    }

    if (dateFilter === 'specific' && isSpecificDate) {
      if (specificDate) {
        return isSameDay(saleDate, specificDate);
      }
      return true;
    }
    
    const today = new Date();
    
    switch(dateFilter) {
      case 'today':
        return isWithinInterval(saleDate, {
          start: startOfDay(today),
          end: endOfDay(today)
        });
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return isWithinInterval(saleDate, {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        });
      case 'this-week':
        return isWithinInterval(saleDate, {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 })
        });
      case 'last-week':
        const lastWeekStart = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
        const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        return isWithinInterval(saleDate, {
          start: lastWeekStart,
          end: lastWeekEnd
        });
      case 'this-month':
        return isWithinInterval(saleDate, {
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
      case 'last-month':
        const lastMonth = subMonths(today, 1);
        return isWithinInterval(saleDate, {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        });
      case 'this-year':
        return isWithinInterval(saleDate, {
          start: startOfYear(today),
          end: endOfYear(today)
        });
      default:
        return true;
    }
  }, [dateFilter, isCustomRange, isSpecificDate, dateRange, specificDate]);

  // Memoize filtered sales calculation
  const filteredSalesData = useMemo(() => {
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return matchesDateFilter(saleDate);
    });
    
    return {
      all: filtered,
      nonQuotes: filtered.filter(sale => sale.paymentStatus !== 'Quote')
    };
  }, [sales, matchesDateFilter]);

  // Memoize analytics data calculation
  const analyticsData = useMemo((): AnalyticsData => {
    return filteredSalesData.nonQuotes.reduce((acc, sale) => {
      const { totalSalePrice, totalCost } = calculateSaleTotals(sale);
      // Calculate profit from actual revenue and cost to handle old sales correctly
      const actualProfit = totalSalePrice - totalCost;
      
      return {
        totalSales: acc.totalSales + totalSalePrice,
        totalProfit: acc.totalProfit + actualProfit,
        totalCost: acc.totalCost + totalCost,
        paidSalesCount: acc.paidSalesCount + (sale.paymentStatus === 'Paid' ? 1 : 0),
        pendingSalesCount: acc.pendingSalesCount + (sale.paymentStatus === 'NOT PAID' ? 1 : 0),
      };
    }, {
      totalSales: 0,
      totalProfit: 0,
      totalCost: 0,
      paidSalesCount: 0,
      pendingSalesCount: 0,
    });
  }, [filteredSalesData.nonQuotes, calculateSaleTotals]);

  // Memoize bar chart data
  const barChartData = useMemo(() => [
    { name: 'Total Sales', amount: analyticsData.totalSales },
    { name: 'Total Cost', amount: analyticsData.totalCost },
    { name: 'Total Expenses', amount: expenses },
    { name: 'Total Profit', amount: analyticsData.totalProfit },
  ], [analyticsData, expenses]);

  // Memoize recent sales calculation
  const recentSales = useMemo(() => {
    return [...filteredSalesData.all]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [filteredSalesData.all]);

  // Memoize non-quote sales count
  const nonQuoteSalesCount = useMemo(() => {
    return filteredSalesData.nonQuotes.length;
  }, [filteredSalesData.nonQuotes]);

  // Fetch expenses data based on the current date filter and business location
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoadingExpenses(true);
      try {
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        
        // Determine date range for fetching
        if (isCustomRange && dateRange.from && dateRange.to) {
          startDate = dateRange.from;
          endDate = dateRange.to;
        } else if (isSpecificDate && specificDate) {
          startDate = startOfDay(specificDate);
          endDate = endOfDay(specificDate);
        } else if (dateFilter !== 'all') {
          const today = new Date();
          
          switch (dateFilter) {
            case 'today':
              startDate = startOfDay(today);
              endDate = endOfDay(today);
              break;
            case 'yesterday':
              const yesterday = subDays(today, 1);
              startDate = startOfDay(yesterday);
              endDate = endOfDay(yesterday);
              break;
            case 'this-week':
              startDate = startOfWeek(today, { weekStartsOn: 1 });
              endDate = endOfWeek(today, { weekStartsOn: 1 });
              break;
            case 'last-week':
              const lastWeekStart = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
              startDate = lastWeekStart;
              endDate = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
              break;
            case 'this-month':
              startDate = startOfMonth(today);
              endDate = endOfMonth(today);
              break;
            case 'last-month':
              const lastMonth = subMonths(today, 1);
              startDate = startOfMonth(lastMonth);
              endDate = endOfMonth(lastMonth);
              break;
            case 'this-year':
              startDate = startOfYear(today);
              endDate = endOfYear(today);
              break;
          }
        }
        
        const data = await getExpenses(startDate, endDate, branchId);
        
        const totalExpenses = data ? data.reduce((sum, expense) => sum + Number(expense.amount), 0) : 0;
        setExpenses(totalExpenses);
        
        // Format expenses for chart
        const formattedExpenses = data.map(expense => ({
          date: new Date(expense.date).toISOString(),
          amount: Number(expense.amount)
        }));
        setExpensesData(formattedExpenses);
        
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setIsLoadingExpenses(false);
      }
    };
    
    fetchExpenses();
  }, [dateFilter, isCustomRange, isSpecificDate, dateRange.from, dateRange.to, specificDate, branchId]);

  return {
    filteredSales: filteredSalesData.all,
    nonQuoteSales: filteredSalesData.nonQuotes,
    analyticsData,
    barChartData,
    recentSales,
    nonQuoteSalesCount,
    expenses,
    expensesData,
    isLoadingExpenses
  };
}
