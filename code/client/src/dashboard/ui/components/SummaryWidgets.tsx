"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, AlertTriangle, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '@/settings/api/SettingsContext';

interface RecentSale {
    id: string;
    saleNumber: string;
    customerName: string;
    total: number;
    date: Date;
    paymentStatus: string;
}

interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
    minStock: number;
    sellingPrice: number;
}

interface RecentExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: Date;
}

interface RecentCustomer {
    id: string;
    name: string;
    phone: string | null;
    createdAt: Date;
}

export function RecentSalesWidget({ sales }: { sales: RecentSale[] }) {
    const { currency } = useSettings();

    return (
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest">Recent Sales</h3>
                <Link href="/sales" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {sales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No sales yet</p>
                ) : (
                    sales.map(sale => (
                        <Link
                            key={sale.id}
                            href={`/sales/show?id=${sale.id}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{sale.customerName}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(sale.date), 'MMM d, h:mm a')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sm">{currency} {sale.total.toLocaleString()}</p>
                                <span className={`text-[10px] font-bold uppercase ${sale.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-orange-500'
                                    }`}>
                                    {sale.paymentStatus}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export function LowStockWidget({ products }: { products: LowStockProduct[] }) {
    const { currency } = useSettings();

    return (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-orange-600">Low Stock Alert</h3>
                </div>
                <Link href="/inventory" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                    Restock <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">All products well stocked!</p>
                ) : (
                    products.map(product => (
                        <Link
                            key={product.id}
                            href={`/products/show?id=${product.id}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-500/10 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{product.name}</p>
                                <p className="text-xs text-orange-600">
                                    Stock: {product.stock} / Min: {product.minStock}
                                </p>
                            </div>
                            <Package className="w-5 h-5 text-orange-600" />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export function RecentExpensesWidget({ expenses }: { expenses: RecentExpense[] }) {
    const { currency } = useSettings();

    return (
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest">Recent Expenses</h3>
                <Link href="/expenses" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded</p>
                ) : (
                    expenses.map(expense => (
                        <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{expense.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-muted rounded text-muted-foreground">
                                        {expense.category}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(expense.date), 'MMM d')}
                                    </span>
                                </div>
                            </div>
                            <p className="font-black text-sm text-red-600">-{currency} {expense.amount.toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function RecentCustomersWidget({ customers }: { customers: RecentCustomer[] }) {
    return (
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest">Recent Customers</h3>
                <Link href="/customers" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {customers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No customers yet</p>
                ) : (
                    customers.map(customer => (
                        <Link
                            key={customer.id}
                            href={`/customers/show?id=${customer.id}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{customer.name}</p>
                                {customer.phone && (
                                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(customer.createdAt), 'MMM d')}
                            </span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
