"use client";

import React from 'react';
import { Expense } from '@/expenses/types';
import { Edit2, Trash2, Calendar, Tag, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '@/settings/api/SettingsContext';

interface ExpenseListProps {
    expenses: Expense[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onSelectAll: (ids: string[]) => void;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    onView: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
    expenses,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    onEdit,
    onDelete,
    onView
}) => {
    const { currency } = useSettings();
    if (expenses.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-muted-foreground">No Expenses Found</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-2">
                    Add a new expense or upload a bulk sheet to get started.
                </p>
            </div>
        );
    }

    const allSelected = expenses.length > 0 && selectedIds.length === expenses.length;

    return (
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/20">
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => onSelectAll(e.target.checked ? expenses.map(e => e.id) : [])}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {expenses.map((expense) => {
                            const isSelected = selectedIds.includes(expense.id);
                            return (
                                <tr key={expense.id} className={`group hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(expense.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">
                                                {format(new Date(expense.date), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold truncate max-w-[200px]">{expense.description}</p>
                                        {expense.reference && (
                                            <p className="text-[10px] text-muted-foreground font-mono">Ref: {expense.reference}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold">
                                            <Tag className="w-3 h-3" />
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black font-mono">
                                            {currency} {Number(expense.amount).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onView(expense)}
                                                className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-xl transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => onEdit(expense)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(expense.id)}
                                                className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
