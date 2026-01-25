import React from 'react';
import { Search, User } from 'lucide-react';
import { Customer } from '@/customers/types';

interface CustomerSectionProps {
    customerSearch: string;
    onSearch: (query: string) => void;
    onSelect: (customer: Customer) => void;
    phone: string;
    onPhoneChange: (value: string) => void;
    address: string;
    onAddressChange: (value: string) => void;
    results: Customer[];
    onClearResults: () => void;
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({
    customerSearch,
    onSearch,
    onSelect,
    phone,
    onPhoneChange,
    address,
    onAddressChange,
    results,
    onClearResults
}) => {
    return (
        <div className="bg-card border border-border rounded-4xl p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Information
            </h3>

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search or create customer..."
                        className="w-full h-12 px-4 pl-11 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                    {results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto z-10">
                            {results.map(customer => (
                                <button
                                    key={customer.id}
                                    onClick={() => {
                                        onSelect(customer);
                                        onClearResults();
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                                >
                                    <p className="font-bold text-sm">{customer.name}</p>
                                    {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="Phone (optional)"
                        className="h-10 px-3 rounded-lg bg-muted/30 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                    />
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        placeholder="Address (optional)"
                        className="h-10 px-3 rounded-lg bg-muted/30 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                    />
                </div>
            </div>
        </div>
    );
};
