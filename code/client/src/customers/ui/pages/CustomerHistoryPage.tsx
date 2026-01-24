"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerAction } from '@/customers/api/controller';
import { getSalesByCustomerAction } from '@/sales/api/controller';
import { Customer } from '@/customers/types';
import { Sale } from '@/sales/types';
import { ArrowLeft, User, Receipt, Calendar, CreditCard, ChevronRight, Search, Download, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { CustomerStatementTab } from '../components/CustomerStatementTab';

export const CustomerHistoryPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [activeTab, setActiveTab] = useState<'logs' | 'statement'>('logs');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            setLoading(true);
            try {
                const [custRes, salesRes] = await Promise.all([
                    getCustomerAction(id!),
                    getSalesByCustomerAction(id!)
                ]);

                if (custRes.success && custRes.data) setCustomer(custRes.data as Customer);
                if (salesRes.success && salesRes.data) setSales(salesRes.data as unknown as Sale[]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    const filteredSales = sales.filter(sale =>
        sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Loading transaction logs...</p>
        </div>
    );

    if (!customer) return <div className="p-10 text-center text-red-500">Customer not found.</div>;

    const totalSpent = sales.reduce((sum, s) => sum + Number(s.total), 0);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <User className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer History</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">{customer.name}</h1>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all relative ${activeTab === 'logs'
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5" />
                        Transaction Logs
                    </div>
                    {activeTab === 'logs' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('statement')}
                    className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all relative ${activeTab === 'statement'
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Account Statement
                    </div>
                    {activeTab === 'statement' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            {activeTab === 'logs' ? (
                <>
                    {/* Summary Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 bg-primary text-white p-6 rounded-[2rem] shadow-lg shadow-primary/20">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Lifetime Value</p>
                            <p className="text-2xl font-black">UGX {totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="md:col-span-3 bg-card border border-border p-2 rounded-[2rem] flex items-center gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by sale number or status..."
                                    className="w-full h-12 bg-transparent pl-12 pr-4 outline-none text-sm font-medium"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <button className="h-12 px-6 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date & Time</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Total Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Payment</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-primary">#{sale.saleNumber}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Source: {sale.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs text-foreground">{format(new Date(sale.date), 'MMM dd, yyyy')}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(sale.date), 'hh:mm a')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex -space-x-2">
                                                {sale.items.slice(0, 3).map((item, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-lg bg-muted border-2 border-card flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm" title={item.productName}>
                                                        {item.productName.substring(0, 1)}
                                                    </div>
                                                ))}
                                                {sale.items.length > 3 && (
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 border-2 border-card flex items-center justify-center text-[8px] font-black text-primary shadow-sm">
                                                        +{sale.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-sm text-foreground">UGX {Number(sale.total).toLocaleString()}</span>
                                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Paid: {Number(sale.amountPaid).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${sale.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' :
                                                sale.paymentStatus === 'UNPAID' ? 'bg-rose-500/10 text-rose-600' :
                                                    'bg-orange-500/10 text-orange-600'
                                                }`}>
                                                {sale.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link
                                                href={`/sales/show?id=${sale.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-primary hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                View
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <Receipt className="w-12 h-12" />
                                                <p className="text-sm font-bold italic">No transactions match your search criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <CustomerStatementTab customerId={customer.id} />
            )}
        </div>
    );
};
