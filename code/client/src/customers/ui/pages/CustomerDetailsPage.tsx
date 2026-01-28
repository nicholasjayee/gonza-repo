"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerAction } from '@/customers/api/controller';
import { getSalesByCustomerAction } from '@/sales/api/controller';
import { Customer } from '@/customers/types';
import { Sale } from '@/sales/types';
import { ArrowLeft, User, Mail, Phone, MapPin, Receipt, Calendar, CreditCard, TrendingUp, ChevronRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export const CustomerDetailsPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Retrieving customer history...</p>
        </div>
    );

    if (!customer) return <div className="p-10 text-center text-red-500">Customer not found.</div>;

    const totalSpent = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalPaid = sales.reduce((sum, s) => sum + Number(s.amountPaid), 0);
    const totalBalance = sales.reduce((sum, s) => sum + Number(s.balance), 0);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer Profile</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">{customer.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-black text-2xl mb-6">
                            {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{customer.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{customer.phone || 'No phone provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{customer.address}, {customer.city}</span>
                            </div>
                            <div className="pt-4 border-t border-border mt-4">
                                <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mb-1">Lifetime Notes</p>
                                <p className="text-sm text-foreground/80 leading-relaxed italic">
                                    {customer.notes || 'No notes available for this customer.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary/70">Total Purchases</span>
                            <span className="text-lg font-black text-primary">{sales.length}</span>
                        </div>
                        <div className="h-px bg-primary/10" />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary/70">Member Since</span>
                            <span className="text-xs font-bold">{format(new Date(customer.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content (History) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LTV (Total Spent)</span>
                            </div>
                            <p className="text-xl font-black">UGX {totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</span>
                            </div>
                            <p className="text-xl font-black text-blue-600">UGX {totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm border-orange-500/20 bg-orange-500/5">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600/60">Outstanding Balance</span>
                            </div>
                            <p className="text-xl font-black text-orange-600">UGX {totalBalance.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Purchase History Summary */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-xl flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-primary" />
                                Purchase History
                            </h3>
                            <Link
                                href={`/customers/history?id=${customer.id}`}
                                className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Dedicated History
                            </Link>
                        </div>

                        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sale #</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {sales.slice(0, 5).map((sale) => (
                                        <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-sm">#{sale.saleNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-xs">{format(new Date(sale.date), 'MMM dd, yyyy')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-sm text-foreground">UGX {Number(sale.total).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/sales/show?id=${sale.id}`}
                                                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all inline-block"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {sales.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                                                No purchase history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mock missing icon
const Clock = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
