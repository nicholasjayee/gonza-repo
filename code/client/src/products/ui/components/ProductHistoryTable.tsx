"use client";

import React from 'react';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, RefreshCw, ShoppingCart, Tag, AlertCircle } from 'lucide-react';

interface ProductHistory {
    id: string;
    type: 'SALE' | 'RETURN_IN' | 'RESTOCK' | 'ADJUSTMENT' | 'PRICE_CHANGE' | 'COST_CHANGE' | 'CREATED' | 'STOCK_TAKE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
    quantityChange: number;
    oldStock: number;
    newStock: number;
    oldPrice?: number;
    newPrice?: number;
    oldCost?: number;
    newCost?: number;
    reason?: string;
    createdAt: Date | string;
    user: {
        name: string | null;
        email: string | null;
    };
}

interface ProductHistoryTableProps {
    history: ProductHistory[];
}

export const ProductHistoryTable: React.FC<ProductHistoryTableProps> = ({ history }) => {
    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No history events found for this product.
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border text-left">
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Event</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Date & User</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Change</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Stock Impact</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {history.map((event) => (
                            <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                    <EventBadge type={event.type} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">
                                            {format(new Date(event.createdAt), 'MMM d, yyyy h:mm a')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            by {event.user.name || 'Unknown'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <ChangeDisplay event={event} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {event.quantityChange !== 0 && (
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-black ${event.quantityChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {event.quantityChange > 0 ? '+' : ''}{event.quantityChange}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {event.oldStock} → {event.newStock}
                                            </span>
                                        </div>
                                    )}
                                    {event.quantityChange === 0 && (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                                    {event.reason || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function EventBadge({ type }: { type: ProductHistory['type'] }) {
    const config = {
        SALE: { icon: ShoppingCart, color: 'text-blue-500 bg-blue-500/10', label: 'Sale' },
        RETURN_IN: { icon: RefreshCw, color: 'text-orange-500 bg-orange-500/10', label: 'Return' },
        RESTOCK: { icon: ArrowUp, color: 'text-emerald-500 bg-emerald-500/10', label: 'Restock' },
        ADJUSTMENT: { icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/10', label: 'Adjustment' },
        PRICE_CHANGE: { icon: Tag, color: 'text-purple-500 bg-purple-500/10', label: 'Price Change' },
        COST_CHANGE: { icon: Tag, color: 'text-pink-500 bg-pink-500/10', label: 'Cost Change' },
        CREATED: { icon: Tag, color: 'text-gray-500 bg-gray-500/10', label: 'Created' },
        STOCK_TAKE: { icon: AlertCircle, color: 'text-indigo-500 bg-indigo-500/10', label: 'Stock Take' },
        TRANSFER_IN: { icon: ArrowDown, color: 'text-teal-500 bg-teal-500/10', label: 'Transfer In' },
        TRANSFER_OUT: { icon: ArrowUp, color: 'text-amber-500 bg-amber-500/10', label: 'Transfer Out' },
    };

    const style = config[type] || config.CREATED;
    const Icon = style.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${style.color}`}>
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-wider">{style.label}</span>
        </div>
    );
}

function ChangeDisplay({ event }: { event: ProductHistory }) {
    if (event.type === 'PRICE_CHANGE') {
        return (
            <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground line-through decoration-red-500">
                    {event.oldPrice?.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-emerald-500">
                    {event.newPrice?.toLocaleString()}
                </span>
            </div>
        );
    }
    if (event.type === 'COST_CHANGE') {
        return (
            <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground line-through decoration-red-500">
                    {event.oldCost?.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-emerald-500">
                    {event.newCost?.toLocaleString()}
                </span>
            </div>
        );
    }
    return <span className="text-xs text-muted-foreground">-</span>;
}
