"use client";

import React, { useState } from 'react';
import { Expense } from '@/expenses/types';
import { createExpenseAction, updateExpenseAction } from '@/expenses/api/controller';
import { useMessage } from '@/shared/ui/Message';
import { Save, Loader2 } from 'lucide-react';
import { useSettings } from '@/settings/api/SettingsContext';

interface ExpenseFormProps {
    initialData?: Expense;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const { currency } = useSettings();
    const [formData, setFormData] = useState({
        amount: initialData?.amount || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Other',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reference: initialData?.reference || '',
        paymentMethod: initialData?.paymentMethod || 'Cash'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            amount: Number(formData.amount),
            date: new Date(formData.date)
        };

        let res;
        if (initialData) {
            res = await updateExpenseAction(initialData.id, payload);
        } else {
            res = await createExpenseAction(payload);
        }

        if (res.success) {
            showMessage('success', `Expense ${initialData ? 'updated' : 'created'} successfully`);
            setTimeout(() => onSuccess(), 1000);
        } else {
            showMessage('error', res.error || 'Operation failed');
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium";
    const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5 block px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {MessageComponent}

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Amount ({currency})</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                        min="0"
                    />
                </div>
                <div>
                    <label className={labelClasses}>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Description</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                    placeholder="e.g., Office Rent, Cleaning Supplies"
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="Rent">Rent</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Restock">Restock</option>
                        <option value="Transport">Transport</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Payment Method</label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClasses}>Reference (Optional)</label>
                <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Receipt No, Transaction ID"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {initialData ? 'Update Expense' : 'Save Expense'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
