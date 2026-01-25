import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { DiscountType } from '../../../types';

interface SaleSummarySectionProps {
    subtotal: number;
    discount: number;
    discountType: DiscountType;
    globalDiscountValue: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    balance: number;
    currency: string;
    isSubmitting: boolean;
    onSubmit: () => void;
    hasItems: boolean;
}

export const SaleSummarySection: React.FC<SaleSummarySectionProps> = ({
    subtotal,
    discount,
    discountType,
    globalDiscountValue,
    taxRate,
    taxAmount,
    total,
    amountPaid,
    balance,
    currency,
    isSubmitting,
    onSubmit,
    hasItems
}) => {
    return (
        <div className="bg-card border border-border rounded-4xl p-6 h-fit">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Summary</h3>
            <div className="space-y-4">
                <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-black">{currency} {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Discount ({discountType === 'PERCENTAGE' ? `${discount}%` : 'Flat'}):</span>
                    <span className="font-black text-orange-500">
                        - {currency} {globalDiscountValue.toLocaleString()}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                    <span className="font-black text-foreground">
                        + {currency} {taxAmount.toLocaleString()}
                    </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex justify-between text-lg items-center">
                    <span className="font-black">TOTAL:</span>
                    <span className="font-black text-primary">{currency} {total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-black text-emerald-500">
                        {currency} {amountPaid.toLocaleString()}
                    </span>
                </div>

                <div className="flex justify-between text-sm items-center pt-2">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={`font-black ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {currency} {balance.toLocaleString()}
                    </span>
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={isSubmitting || !hasItems}
                className="w-full h-14 mt-6 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Complete Sale</>}
            </button>
        </div>
    );
};
