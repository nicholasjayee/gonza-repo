import React from 'react';
import { Settings, Wallet } from 'lucide-react';
import { SaleSource, PaymentStatus, DiscountType } from '../../../types';

import { CashAccount } from '@/finance/types';

interface SaleDetailsSectionProps {
    source: SaleSource;
    onSourceChange: (value: SaleSource) => void;
    discount: number;
    onDiscountChange: (value: number) => void;
    discountType: DiscountType;
    onDiscountTypeChange: () => void;
    taxRate: number;
    onTaxRateChange: (value: number) => void;
    paymentStatus: PaymentStatus;
    onPaymentStatusChange: (value: PaymentStatus) => void;
    amountPaid: number;
    onAmountPaidChange: (value: number) => void;
    cashAccountId: string;
    onCashAccountChange: (value: string) => void;
    cashAccounts: CashAccount[];
    currency: string;
}

export const SaleDetailsSection: React.FC<SaleDetailsSectionProps> = ({
    source,
    onSourceChange,
    discount,
    onDiscountChange,
    discountType,
    onDiscountTypeChange,
    taxRate,
    onTaxRateChange,
    paymentStatus,
    onPaymentStatusChange,
    amountPaid,
    onAmountPaidChange,
    cashAccountId,
    onCashAccountChange,
    cashAccounts,
    currency
}) => {
    return (
        <div className="bg-card border border-border rounded-4xl p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4" /> Sale Info
            </h3>

            <div className="space-y-4">
                {/* Source */}
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Source</label>
                    <select
                        value={source}
                        onChange={(e) => onSourceChange(e.target.value as SaleSource)}
                        className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm"
                    >
                        <option value="WALK_IN">Walk-in</option>
                        <option value="PHONE">Phone</option>
                        <option value="ONLINE">Online</option>
                        <option value="REFERRAL">Referral</option>
                        <option value="RETURNING">Returning</option>
                    </select>
                </div>

                {/* Global Discount Input */}
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">
                        Global Discount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                            className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm font-bold"
                            placeholder="0"
                        />
                        <button
                            onClick={onDiscountTypeChange}
                            className="absolute right-1 top-1 h-8 px-2 bg-background border border-border rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-muted transition-colors"
                        >
                            {discountType === 'PERCENTAGE' ? '%' : currency}
                        </button>
                    </div>
                </div>

                {/* Tax Rate */}
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Tax Rate (%)</label>
                    <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                        className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm"
                        placeholder="0"
                    />
                </div>

                {/* Payment Status */}
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Payment Status</label>
                    <select
                        value={paymentStatus}
                        onChange={(e) => onPaymentStatusChange(e.target.value as PaymentStatus)}
                        className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm"
                    >
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="QUOTE">Quote (No Stock Deduction)</option>
                        <option value="INSTALLMENT">Installment</option>
                        <option value="PARTIAL">Partial</option>
                    </select>
                </div>

                {/* Amount Paid Input */}
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Amount Paid</label>
                    <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => onAmountPaidChange(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm font-bold text-emerald-600"
                        disabled={paymentStatus === 'PAID' || paymentStatus === 'UNPAID'}
                    />
                </div>

                {/* Cash Account Selector */}
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-primary" /> Destination Cash Account
                    </label>
                    <select
                        value={cashAccountId}
                        onChange={(e) => onCashAccountChange(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm font-bold"
                    >
                        <option value="">-- No Account (General) --</option>
                        {cashAccounts.filter(a => a.isActive || a.id === cashAccountId).map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.name} ({Number(acc.currentBalance).toLocaleString()} {currency})
                            </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                        The sale total will be credited to this account
                    </p>
                </div>
            </div>
        </div>
    );
};
