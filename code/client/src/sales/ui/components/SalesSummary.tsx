"use client";

import React from 'react';
import { Sale } from '@/sales/types';
import { TrendingUp, CreditCard, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SalesSummaryProps {
    sales: Sale[];
}

import { useSettings } from "@/settings/api/SettingsContext";

export const SalesSummary: React.FC<SalesSummaryProps> = ({ sales }) => {
    const { currency } = useSettings();
    // Exclude QUOTES from calculations
    const filteredSales = sales.filter(s => s.paymentStatus !== 'QUOTE');

    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0);

    // Calculate total cost from items
    const totalCost = filteredSales.reduce((sum, s) => {
        const saleCost = s.items.reduce((itemSum, item) => itemSum + (Number(item.unitCost) * Number(item.quantity)), 0);
        return sum + saleCost;
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Sales</span>
                        <div className="flex items-center gap-1 text-emerald-500">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="text-[10px] font-black tracking-tighter">Gross</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1">{currency} {totalRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{filteredSales.length} Transactions</p>
                </div>
            </div>

            {/* Total Cost */}
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-orange-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600/60 mb-1">Total Cost</span>
                        <div className="flex items-center gap-1 text-orange-600">
                            <ArrowDownRight className="w-3 h-3" />
                            <span className="text-[10px] font-black tracking-tighter">Expenses</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1 text-orange-600">{currency} {totalCost.toLocaleString()}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600/40">Inventory Value</p>
                </div>
            </div>

            {/* Total Profit */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">Net Profit</span>
                        <div className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[10px] font-black tracking-tighter">{profitMargin.toFixed(1)}% Margin</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1 text-emerald-600">{currency} {totalProfit.toLocaleString()}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/40">Pure Earnings</p>
                </div>
            </div>
        </div>
    );
};
