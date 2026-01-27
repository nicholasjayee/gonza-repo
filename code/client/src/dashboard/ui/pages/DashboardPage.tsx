"use client";

import React, { useState, useEffect } from 'react';
import { getDashboardMetricsAction, getSubBranchesAction, getDashboardSummariesAction } from '@/dashboard/api/controller';
import { MetricCard } from '@/dashboard/ui/components/MetricCard';
import { BranchFilter } from '@/shared/components/BranchFilter';
import { RecentSalesWidget, LowStockWidget, RecentExpensesWidget, RecentCustomersWidget } from '@/dashboard/ui/components/SummaryWidgets';
import { DollarSign, ShoppingCart, Package, TrendingDown, Users, AlertTriangle, Loader2, Building2 } from 'lucide-react';
import { useSettings } from '@/settings/api/SettingsContext';
import Link from 'next/link';

interface DashboardMetrics {
    totalRevenue: number;
    salesCount: number;
    averageOrderValue: number;
    totalProducts: number;
    lowStockCount: number;
    totalInventoryValue: number;
    totalExpenses: number;
    expenseCount: number;
    topExpenseCategory: string;
    totalCustomers: number;
    newCustomers: number;
}

interface DashboardSummaries {
    recentSales: any[];
    lowStockProducts: any[];
    recentExpenses: any[];
    recentCustomers: any[];
}

interface Branch {
    id: string;
    name: string;
}

interface DashboardPageProps {
    branchType: 'MAIN' | 'SUB';
    branchName?: string;
}

export default function DashboardPage({ branchType, branchName }: DashboardPageProps) {
    const { settings, currency } = useSettings();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [summaries, setSummaries] = useState<DashboardSummaries | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const activeBranch = branches.find(b => b.id === selectedBranchId);
    const dashboardTitle = branchType === 'MAIN'
        ? (activeBranch ? activeBranch.name : 'All Branches')
        : (branchName || settings.businessName || 'Dashboard');

    useEffect(() => {
        if (branchType === 'MAIN') {
            loadBranches();
        }
        loadDashboard();
    }, [branchType]);

    useEffect(() => {
        // Refresh dashboard when filter changes (only for MAIN)
        if (branchType === 'MAIN' && (branches.length > 0 || selectedBranchId !== null)) {
            loadDashboard();
        }
    }, [selectedBranchId]);

    const loadBranches = async () => {
        try {
            const branchesRes = await getSubBranchesAction();
            if (branchesRes.success && branchesRes.data) {
                setBranches(branchesRes.data as Branch[]);
            }
        } catch (error) {
            console.error("Failed to load branches:", error);
        }
    };

    const loadDashboard = async () => {
        setIsRefreshing(true);
        if (!metrics) setIsLoading(true);

        try {
            const [metricsRes, summariesRes] = await Promise.all([
                getDashboardMetricsAction(selectedBranchId || undefined),
                getDashboardSummariesAction(selectedBranchId || undefined)
            ]);

            if (metricsRes.success && metricsRes.data) {
                setMetrics(metricsRes.data as DashboardMetrics);
            }

            if (summariesRes.success && summariesRes.data) {
                setSummaries(summariesRes.data as DashboardSummaries);
            }
        } catch (error) {
            console.error("Failed to load dashboard:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    if (isLoading && !metrics) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            {branchType === 'MAIN' ? <Building2 className="w-5 h-5 text-primary" /> : <LayoutDashboard className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black italic tracking-tight">
                                {dashboardTitle}
                            </h1>
                            {isRefreshing && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        {branchType === 'MAIN'
                            ? (!selectedBranchId ? 'Company-wide metrics across all branches' : `Performance overview for ${activeBranch?.name}`)
                            : 'Your branch performance overview'}
                    </p>
                </div>

                {branchType === 'MAIN' && branches.length > 0 && (
                    <div className="bg-card border border-border p-3 rounded-2xl shadow-sm">
                        <BranchFilter
                            branches={branches}
                            selectedBranchId={selectedBranchId}
                            onBranchChange={setSelectedBranchId}
                        />
                    </div>
                )}
            </div>

            {metrics && (
                <>
                    {/* Sales Metrics */}
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Sales Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Total Revenue"
                                value={`${currency} ${metrics.totalRevenue.toLocaleString()}`}
                                icon={DollarSign}
                                subtitle={`${metrics.salesCount} transactions`}
                                iconColor="text-emerald-600"
                            />
                            <MetricCard
                                title="Sales Count"
                                value={metrics.salesCount.toLocaleString()}
                                icon={ShoppingCart}
                                subtitle="Completed orders"
                                iconColor="text-blue-600"
                            />
                            <MetricCard
                                title="Average Order"
                                value={`${currency} ${Math.round(metrics.averageOrderValue).toLocaleString()}`}
                                icon={TrendingDown}
                                subtitle="Per transaction"
                                iconColor="text-purple-600"
                            />
                        </div>
                    </div>

                    {/* Inventory & Customer Metrics */}
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Inventory & Customers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <MetricCard
                                title="Total Products"
                                value={metrics.totalProducts.toLocaleString()}
                                icon={Package}
                                subtitle="In inventory"
                                iconColor="text-indigo-600"
                            />
                            <MetricCard
                                title="Low Stock Items"
                                value={metrics.lowStockCount.toLocaleString()}
                                icon={AlertTriangle}
                                subtitle="Need restocking"
                                iconColor="text-orange-600"
                                bgColor={metrics.lowStockCount > 0 ? "bg-orange-500/5" : "bg-card"}
                            />
                            <MetricCard
                                title="Inventory Value"
                                value={`${currency} ${metrics.totalInventoryValue.toLocaleString()}`}
                                icon={DollarSign}
                                subtitle="Total stock value"
                                iconColor="text-emerald-600"
                            />
                            <MetricCard
                                title="Total Customers"
                                value={metrics.totalCustomers.toLocaleString()}
                                icon={Users}
                                subtitle={`${metrics.newCustomers} new (30d)`}
                                iconColor="text-pink-600"
                            />
                        </div>
                    </div>

                    {/* Expense Metrics */}
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Expenses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Total Expenses"
                                value={`${currency} ${metrics.totalExpenses.toLocaleString()}`}
                                icon={TrendingDown}
                                subtitle={`${metrics.expenseCount} transactions`}
                                iconColor="text-red-600"
                                bgColor="bg-red-500/5"
                            />
                            <div className="md:col-span-2 bg-card border border-border rounded-[2rem] p-6 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Top Expense Category</p>
                                    <h3 className="text-2xl font-black tracking-tight">{metrics.topExpenseCategory}</h3>
                                </div>
                                {branchType === 'SUB' && (
                                    <Link
                                        href="/expenses"
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                                    >
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Overview */}
                    {summaries && (
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">
                                {branchType === 'MAIN' ? 'Activity Highlights' : 'Recent Activity'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <RecentSalesWidget sales={summaries.recentSales} />
                                <LowStockWidget products={summaries.lowStockProducts} />
                                <RecentExpensesWidget expenses={summaries.recentExpenses} />
                                <RecentCustomersWidget customers={summaries.recentCustomers} />
                            </div>
                        </div>
                    )}

                    {/* Quick Actions (only for operational view) */}
                    {branchType === 'SUB' && (
                        <div className="bg-muted/30 border border-border rounded-[2rem] p-8">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link href="/sales/new" className="p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors text-center">
                                    <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-bold">New Sale</p>
                                </Link>
                                <Link href="/products" className="p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors text-center">
                                    <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-bold">Manage Products</p>
                                </Link>
                                <Link href="/expenses" className="p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors text-center">
                                    <TrendingDown className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-bold">Record Expense</p>
                                </Link>
                                <Link href="/customers" className="p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors text-center">
                                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-bold">View Customers</p>
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function LayoutDashboard({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect height="9" width="9" x="3" y="3" />
            <rect height="5" width="9" x="12" y="3" />
            <rect height="9" width="9" x="12" y="12" />
            <rect height="5" width="9" x="3" y="15" />
        </svg>
    )
}
