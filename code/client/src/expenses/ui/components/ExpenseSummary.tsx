"use client";

import React from 'react';
import { Expense } from '@/expenses/types';
import { TrendingDown, Wallet, PieChart, ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/components/settings/api/SettingsContext';

interface ExpenseSummaryProps {
    expenses: Expense[];
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
    const { currency } = useSettings();
    const totalSpend = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const avgExpense = expenses.length > 0 ? totalSpend / expenses.length : 0;

    // Calculate top category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
        const cat = e.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
    });

    let topCategory = 'N/A';
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
        if (amount > topCategoryAmount) {
            topCategory = cat;
            topCategoryAmount = amount;
        }
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Spend */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Expenses</span>
                        <div className="flex items-center gap-1 text-primary">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-[10px] font-black tracking-tighter">Outflow</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1">{currency} {totalSpend.toLocaleString()}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{expenses.length} Records</p>
                </div>
            </div>

            {/* Top Category */}
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-orange-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600/60 mb-1">Top Category</span>
                        <div className="flex items-center gap-1 text-orange-600">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="text-[10px] font-black tracking-tighter">Highest Spend</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight mb-1 text-orange-600 truncate">{topCategory}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600/40">{currency} {topCategoryAmount.toLocaleString()}</p>
                </div>
            </div>

            {/* Average */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">Avg. Expense</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1 text-emerald-600">{currency} {Math.round(avgExpense).toLocaleString()}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/40">Per Transaction</p>
                </div>
            </div>
        </div>
    );
};
