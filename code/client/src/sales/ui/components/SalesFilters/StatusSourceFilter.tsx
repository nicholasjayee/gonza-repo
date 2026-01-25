import React from 'react';
import { CreditCard } from 'lucide-react';
import { SalesFiltersState } from './types';

interface StatusSourceFilterProps {
    filters: SalesFiltersState;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const StatusSourceFilter: React.FC<StatusSourceFilterProps> = ({ filters, onChange }) => {
    const inputClasses = "w-full h-10 px-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-xs font-medium";
    const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5 block px-1";

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <CreditCard className="w-3 h-3 text-muted-foreground" />
                <span className={labelClasses.replace("mb-1.5", "")}>Payment & Source</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <select
                    name="paymentStatus"
                    value={filters.paymentStatus}
                    onChange={onChange}
                    className={inputClasses}
                >
                    <option value="">Status</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="QUOTE">Quote</option>
                    <option value="INSTALLMENT">Installment</option>
                </select>
                <select
                    name="source"
                    value={filters.source}
                    onChange={onChange}
                    className={inputClasses}
                >
                    <option value="">Source</option>
                    <option value="WALK_IN">Walk-in</option>
                    <option value="PHONE">Phone</option>
                    <option value="ONLINE">Online</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="RETURNING">Returning</option>
                </select>
            </div>
        </div>
    );
};
