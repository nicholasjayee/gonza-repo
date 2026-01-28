'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { getProfitLossReportAction } from '@/finance/api/controller';
import { format } from 'date-fns';
import { FinanceFilters, FinanceFiltersState } from './FinanceFilters';

interface ProfitLossReport {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    grossMargin: number;
    totalExpenses: number;
    expensesByCategory: { category: string; amount: number }[];
    netProfit: number;
    netMargin: number;
}

export function ProfitLossTab() {
    const [report, setReport] = useState<ProfitLossReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState<FinanceFiltersState>({
        startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        datePreset: 'this-month'
    });

    const generateReport = async (tempFilters = filters) => {
        setIsLoading(true);
        const res = await getProfitLossReportAction(tempFilters.startDate, tempFilters.endDate);
        if (res.success && res.data) {
            setReport(res.data as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        generateReport();
    }, []);

    const handleFilterChange = (newFilters: FinanceFiltersState) => {
        setFilters(newFilters);
        // Auto-generate if it's a fixed preset
        if (newFilters.datePreset && newFilters.datePreset !== 'custom' && newFilters.datePreset !== 'specific') {
            generateReport(newFilters);
        }
    };

    const handleClearFilters = () => {
        const defaultFilters = {
            startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
            datePreset: 'this-month'
        };
        setFilters(defaultFilters);
        generateReport(defaultFilters);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <FinanceFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                />

                <div className="flex justify-end">
                    <button
                        onClick={() => generateReport()}
                        disabled={isLoading}
                        className="h-11 px-8 bg-foreground text-background font-bold text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-foreground/10 flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        {isLoading ? 'Syncing...' : 'Sync Report'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Generating report...</p>
                </div>
            ) : !report ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Select a date range and generate report</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Total Revenue"
                            value={report.totalRevenue}
                            icon={<DollarSign className="w-6 h-6" />}
                            color="blue"
                        />
                        <MetricCard
                            title="Gross Profit"
                            value={report.grossProfit}
                            subtitle={`${report.grossMargin.toFixed(1)}% margin`}
                            icon={<TrendingUp className="w-6 h-6" />}
                            color="green"
                        />
                        <MetricCard
                            title="Total Expenses"
                            value={report.totalExpenses}
                            icon={<TrendingDown className="w-6 h-6" />}
                            color="orange"
                        />
                        <MetricCard
                            title="Net Profit"
                            value={report.netProfit}
                            subtitle={`${report.netMargin.toFixed(1)}% margin`}
                            icon={report.netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            color={report.netProfit >= 0 ? "emerald" : "rose"}
                        />
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue & Cost */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Revenue Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total Sales</span>
                                    <span className="font-bold">{report.totalRevenue.toLocaleString()} UGX</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Cost of Goods</span>
                                    <span className="font-bold text-rose-600">-{report.totalCost.toLocaleString()} UGX</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between items-center">
                                    <span className="text-sm font-bold">Gross Profit</span>
                                    <span className="text-lg font-black text-emerald-600">{report.grossProfit.toLocaleString()} UGX</span>
                                </div>
                            </div>
                        </div>

                        {/* Expenses by Category */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Expenses by Category</h3>
                            {report.expensesByCategory.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No expenses in this period</p>
                            ) : (
                                <div className="space-y-2">
                                    {report.expensesByCategory.map((exp, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                                            <span className="text-sm font-medium">{exp.category}</span>
                                            <span className="font-bold">{exp.amount.toLocaleString()} UGX</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                                        <span className="text-sm font-bold">Total</span>
                                        <span className="text-lg font-black">{report.totalExpenses.toLocaleString()} UGX</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Net Profit Summary */}
                    <div className={`bg-gradient-to-br ${report.netProfit >= 0 ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'from-rose-500/10 to-rose-500/5 border-rose-500/20'} border rounded-3xl p-8`}>
                        <div className="text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Net Profit</p>
                            <p className={`text-5xl font-black mt-2 ${report.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {report.netProfit.toLocaleString()} UGX
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {report.netMargin.toFixed(2)}% net margin
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function MetricCard({ title, value, subtitle, icon, color }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
}) {
    const colorClasses = {
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600',
        green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-600',
        orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-600',
        emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-600',
        rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-600',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-2xl p-6`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
                <div className="opacity-60">{icon}</div>
            </div>
            <p className="text-2xl font-black">{value.toLocaleString()}</p>
            <p className="text-xs font-normal text-muted-foreground mt-1">UGX</p>
            {subtitle && <p className="text-xs font-bold mt-2">{subtitle}</p>}
        </div>
    );
}
