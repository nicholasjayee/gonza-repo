'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { CashAccountsTab } from '../components/CashAccountsTab';
import { ProfitLossTab } from '../components/ProfitLossTab';

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<'accounts' | 'profitloss'>('accounts');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight">Finance</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                        Manage cash accounts and view financial reports
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all relative ${activeTab === 'accounts'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Cash Accounts
                    </div>
                    {activeTab === 'accounts' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('profitloss')}
                    className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all relative ${activeTab === 'profitloss'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Profit & Loss
                    </div>
                    {activeTab === 'profitloss' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'accounts' ? <CashAccountsTab /> : <ProfitLossTab />}
            </div>
        </div>
    );
}
