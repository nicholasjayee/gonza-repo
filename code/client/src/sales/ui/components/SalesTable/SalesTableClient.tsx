"use client";

import React from 'react';
import { Sale } from '@/sales/types';
import { format } from 'date-fns';
import { Eye, FileText, Printer, Trash2, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { deleteSaleAction } from '@/sales/api/controller';
import { printSaleReceipt } from '@/products/hardware/utils/print';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/settings/api/SettingsContext';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface SalesTableClientProps {
    sales: Sale[];
}

export const SalesTableClient: React.FC<SalesTableClientProps> = ({ sales }) => {
    const router = useRouter();
    const { currency } = useSettings();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sale?')) return;
        const res = await deleteSaleAction(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error || 'Failed to delete sale');
        }
    };

    if (sales.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No sales found</h3>
                <p className="text-muted-foreground">Get started by creating a new sale.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-4xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Sale #</th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                            <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Items</th>
                            <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Total</th>
                            <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {sales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-sm">{sale.saleNumber}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {format(new Date(sale.date), 'MMM d, yyyy')}
                                    </span>
                                    <p className="text-xs text-muted-foreground/60">
                                        {format(new Date(sale.date), 'h:mm a')}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm">{sale.customerName}</p>
                                    {sale.customerPhone && (
                                        <p className="text-xs text-muted-foreground">{sale.customerPhone}</p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-muted text-xs font-bold">
                                        {sale.items.length}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <PaymentStatusBadge status={sale.paymentStatus} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="font-black text-sm">{currency} {sale.total.toLocaleString()}</p>
                                    {sale.balance > 0 && (
                                        <p className="text-xs text-red-500 font-bold">Bal: {sale.balance.toLocaleString()}</p>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => printSaleReceipt(sale)}
                                            className="p-2 rounded-lg hover:bg-white text-muted-foreground hover:text-orange-500 transition-colors shadow-none hover:shadow-sm"
                                            title="Print Receipt"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        <Link
                                            href={`/sales/edit?id=${sale.id}`}
                                            className="p-2 rounded-lg hover:bg-white text-muted-foreground hover:text-primary transition-colors shadow-none hover:shadow-sm"
                                            title="Edit Sale"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/sales/show?id=${sale.id}`}
                                            className="p-2 rounded-lg hover:bg-white text-muted-foreground hover:text-emerald-500 transition-colors shadow-none hover:shadow-sm"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(sale.id)}
                                            className="p-2 rounded-lg hover:bg-white text-muted-foreground hover:text-red-500 transition-colors shadow-none hover:shadow-sm"
                                            title="Delete Sale"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
