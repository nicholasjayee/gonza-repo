"use client";

import React from 'react';
import Link from 'next/link';
import { Package, AlertTriangle, XCircle, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { InventoryStats } from '@/inventory/api/inventory-analytics-service';
import { useSettings } from '@/settings/api/SettingsContext';

interface InventoryDashboardProps {
    stats: InventoryStats;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ stats }) => {
    const { currency } = useSettings();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Products</p>
                            <h3 className="text-4xl font-black italic tracking-tighter">{stats.totalProducts.toLocaleString()}</h3>
                            <p className="text-[10px] font-bold text-primary uppercase">Active Inventory</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-orange-500/5 border border-orange-500/10 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/60 font-bold">Low Stock Alert</p>
                            <h3 className="text-4xl font-black italic tracking-tighter text-orange-600">{stats.lowStockCount.toLocaleString()}</h3>
                            <p className="text-[10px] font-bold text-orange-500/80 uppercase">Needs Attention</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600/60 font-bold">Out of Stock</p>
                            <h3 className="text-4xl font-black italic tracking-tighter text-rose-600">{stats.outOfStockCount.toLocaleString()}</h3>
                            <p className="text-[10px] font-bold text-rose-500/80 uppercase">Critical Depletion</p>
                        </div>
                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Valuation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-card border border-border p-10 rounded-[3rem] shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black italic tracking-tight">Stock Valuation</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Financial Overview of current inventory</p>
                        </div>
                        <PieChart className="w-6 h-6 text-primary opacity-30" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Cost Value</p>
                                <p className="text-4xl font-black italic text-foreground tracking-tighter">{currency} {stats.totalCostValue.toLocaleString()}</p>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-muted-foreground/20 rounded-full" style={{ width: '100%' }} />
                                </div>
                            </div>
                            <p className="text-[10px] leading-relaxed text-muted-foreground font-medium pr-4">
                                This represents the total amount spent to acquire all items currently in your stock.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Total Selling Value</p>
                                <p className="text-4xl font-black italic text-emerald-600 tracking-tighter">{currency} {stats.totalSellingValue.toLocaleString()}</p>
                                <div className="w-full h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                                </div>
                            </div>
                            <div className="bg-emerald-500/5 p-4 rounded-2xl flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-emerald-700">Estimated Profit</span>
                                <span className="text-sm font-black text-emerald-600">+ {currency} {stats.potentialProfit.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-primary text-white p-10 rounded-[3rem] shadow-xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mb-32 -mr-32 transition-transform group-hover:scale-110 duration-700" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black italic leading-tight">Quick Requisition</h4>
                            <p className="text-xs font-medium text-white/70">Need more stock? Submit a formal request to your supplier or main branch instantly.</p>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8">
                        <Link href="/inventory/requisitions/create" className="w-full h-14 bg-white text-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-3">
                            Start Requisition
                            <Package className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
