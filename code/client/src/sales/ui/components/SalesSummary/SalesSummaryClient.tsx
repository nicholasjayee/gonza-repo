"use client";

import React from 'react';
import { Sale } from '@/sales/types';
import { useSettings } from "@/settings/api/SettingsContext";
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SummaryCard } from './SummaryCard';

interface SalesSummaryClientProps {
    sales: Sale[];
}

export const SalesSummaryClient: React.FC<SalesSummaryClientProps> = ({ sales }) => {
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
            <SummaryCard
                icon={DollarSign}
                title="Total Sales"
                value={`${currency} ${totalRevenue.toLocaleString()}`}
                subtitle={`${filteredSales.length} Transactions`}
                subtitleIcon={ArrowUpRight}
                subtitleText="Gross"
                colorClass="bg-card"
                iconBgClass="bg-primary/10"
                iconColorClass="text-primary"
                subtitleColorClass="text-muted-foreground"
            />

            <SummaryCard
                icon={Wallet}
                title="Total Cost"
                value={`${currency} ${totalCost.toLocaleString()}`}
                subtitle="Inventory Value"
                subtitleIcon={ArrowDownRight}
                subtitleText="Expenses"
                colorClass="bg-orange-500/5 border-orange-500/10"
                iconBgClass="bg-orange-500/10"
                iconColorClass="text-orange-600"
                subtitleColorClass="text-orange-600"
            />

            <SummaryCard
                icon={TrendingUp}
                title="Net Profit"
                value={`${currency} ${totalProfit.toLocaleString()}`}
                subtitle="Pure Earnings"
                subtitleIcon={TrendingUp}
                subtitleText={`${profitMargin.toFixed(1)}% Margin`}
                colorClass="bg-emerald-500/5 border-emerald-500/10"
                iconBgClass="bg-emerald-500/10"
                iconColorClass="text-emerald-600"
                subtitleColorClass="text-emerald-600"
            />
        </div>
    );
};
