"use client";

import React from 'react';
import { Expense } from '@/expenses/types';
import { Calendar, Tag, CreditCard, FileText, User, Clock, DollarSign, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '@/components/settings/api/SettingsContext';
import Image from 'next/image';

interface ExpenseDetailProps {
    expense: Expense;
    onClose: () => void;
}

export const ExpenseDetail: React.FC<ExpenseDetailProps> = ({ expense, onClose }) => {
    const { currency } = useSettings();

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-6 bg-muted/10 rounded-3xl border border-muted">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Amount</p>
                <div className="flex items-start gap-1 text-4xl font-black text-foreground">
                    <span className="text-xl mt-1 text-muted-foreground">{currency}</span>
                    {Number(expense.amount).toLocaleString()}
                </div>
                <span className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    {expense.paymentMethod || 'Cash'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                    </div>
                    <p className="font-medium">{format(new Date(expense.date), 'MMMM dd, yyyy')}</p>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Tag className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Category</span>
                    </div>
                    <p className="font-medium">{expense.category}</p>
                </div>

                <div className="space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <FileText className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Description</span>
                    </div>
                    <p className="font-medium leading-relaxed">{expense.description}</p>
                </div>

                {expense.reference && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <CreditCard className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Reference</span>
                        </div>
                        <p className="font-mono text-sm">{expense.reference}</p>
                    </div>
                )}

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Created At</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(expense.createdAt), 'MMM dd, HH:mm')}</p>
                </div>

                {expense.receiptImage && (
                    <div className="space-y-3 col-span-2">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <ImageIcon className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Receipt Copy</span>
                        </div>
                        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-muted bg-muted/5 group">
                            <Image
                                src={expense.receiptImage}
                                alt="Expense Receipt"
                                fill
                                className="object-contain"
                            />
                            <a
                                href={expense.receiptImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/90 dark:bg-black/90 text-foreground shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Full
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button
                    onClick={onClose}
                    className="w-full h-12 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform"
                >
                    Close Details
                </button>
            </div>
        </div>
    );
};
