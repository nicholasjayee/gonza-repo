"use client";

import { useState } from 'react';
import { CustomerTable } from '../components/CustomerTable';
import { UserPlus, Search, Users, ExternalLink } from 'lucide-react';
import { HardwareManager } from '@/products/hardware/ui/HardwareManager';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { useCustomerData } from '../hooks/useCustomerData';

export default function CustomersPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { refresh } = useCustomerData();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 flex-1">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-primary">
                            <Users className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-[0.15em]">Relationship Manager</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">Customer Directory</h1>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Manage your client relationships, track purchase history and lifetime value.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                    >
                        <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 p-2 bg-muted/30 border border-border rounded-2xl shadow-inner-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search customers by name, email or phone..."
                        className="w-full h-12 pl-11 pr-4 bg-transparent outline-none text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="h-8 w-px bg-border mx-2"></div>
                <div className="pr-4">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block leading-none mb-1">Database Status</span>
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Sync
                    </span>
                </div>
            </div>

            <CustomerTable searchQuery={searchQuery} />

            <CustomerFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    // The table inside will refresh via its own useCustomerData if we're not careful
                    // but since they share the same backend, a window reload or better yet 
                    // a shared state/revalidation would be better.
                    // For now, CustomerTable has its own refresh.
                    window.location.reload();
                }}
            />
        </div>
    );
}
