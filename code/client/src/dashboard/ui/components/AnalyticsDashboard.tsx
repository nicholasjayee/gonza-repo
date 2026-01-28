'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Sale, BusinessSettings, Product } from '@/dashboard/types';
import { useAnalyticsData } from '@/dashboard/hooks/useAnalyticsData';
import { formatNumber } from '@/dashboard/utils';
import DateRangeFilter from './analytics/DateRangeFilter';
import AnalyticsCards from './analytics/AnalyticsCards';
import FinancialOverview from './analytics/FinancialOverview';
import RecentSalesTable from './analytics/RecentSalesTable';
import SalesPerformanceChart from './analytics/SalesPerformanceChart';

interface AnalyticsDashboardProps {
  sales: Sale[];
  products: Product[];
  currency?: string;
  branchId?: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Your Business Name',
  businessAddress: 'Your Business Address',
  businessPhone: '(123) 456-7890',
  businessEmail: 'support@yourbusiness.com',
  businessLogo: '',
  currency: 'UGX',
};

const AnalyticsDashboard = memo<AnalyticsDashboardProps>(({ sales, products, currency = 'UGX', branchId }) => {
  const [settings, setSettings] = useState<BusinessSettings>({...DEFAULT_SETTINGS, currency});
  const [dateFilter, setDateFilter] = useState('this-month');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined; }>({
    from: undefined,
    to: undefined,
  });
  const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [isSpecificDate, setIsSpecificDate] = useState(false);

  // Memoize inventory value calculation
  const inventoryValue = useMemo(() => {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, product) => sum + (product.costPrice * product.quantity), 0);
  }, [products]);

  // Memoize settings update
  const memoizedSettings = useMemo(() => {
    const baseSettings = {...DEFAULT_SETTINGS, currency};
    // In a real app, we might fetch settings from DB or local storage
    // For now, just use defaults + currency prop
    return baseSettings;
  }, [currency]);

  useEffect(() => {
    setSettings(memoizedSettings);
  }, [memoizedSettings]);

  // Memoize date filter handlers
  const handleDateFilterChange = useMemo(() => (value: string) => {
    setDateFilter(value);
    if (value === 'custom') {
      setIsCustomRange(true);
      setIsSpecificDate(false);
      setSpecificDate(undefined);
    } else if (value === 'specific') {
      setIsSpecificDate(true);
      setIsCustomRange(false);
      setDateRange({ from: undefined, to: undefined });
    } else {
      setIsCustomRange(false);
      setIsSpecificDate(false);
      setDateRange({ from: undefined, to: undefined });
      setSpecificDate(undefined);
    }
  }, []);

  const handleRangeSelect = useMemo(() => (range: { from: Date | undefined; to: Date | undefined; }) => {
    setDateRange(range);
    if (range.from && range.to) {
      setIsCustomRange(true);
      setDateFilter('custom');
    }
  }, []);

  const handleSpecificDateChange = useMemo(() => (date: Date | undefined) => {
    setSpecificDate(date);
    if (date) {
      setIsSpecificDate(true);
      setDateFilter('specific');
    }
  }, []);

  const { analyticsData, barChartData, recentSales, nonQuoteSalesCount, expenses, expensesData } = useAnalyticsData({
    sales,
    dateFilter,
    dateRange,
    specificDate,
    isCustomRange,
    isSpecificDate,
    branchId
  });

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${formatNumber(value)}`;
  };

  return (
    <div className="space-y-6 w-full">
      <DateRangeFilter
        dateFilter={dateFilter}
        dateRange={dateRange}
        specificDate={specificDate}
        isCustomRange={isCustomRange}
        isSpecificDate={isSpecificDate}
        onDateFilterChange={handleDateFilterChange}
        onDateRangeChange={handleRangeSelect}
        onSpecificDateChange={handleSpecificDateChange}
      />

      <AnalyticsCards 
        analyticsData={analyticsData} 
        nonQuoteSalesCount={nonQuoteSalesCount}
        currency={settings.currency}
        expenses={expenses}
        inventoryValue={inventoryValue}
      />
      
      <SalesPerformanceChart 
        sales={sales} 
        formatCurrency={formatCurrency} 
        dateFilter={dateFilter}
        dateRange={dateRange}
        isCustomRange={isCustomRange}
        expensesData={expensesData}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3">
          <FinancialOverview 
            data={barChartData}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
      
      <RecentSalesTable recentSales={recentSales} currency={settings.currency} />
    </div>
  );
});

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;
