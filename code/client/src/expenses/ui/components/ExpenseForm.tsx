"use client";

import React, { useState } from 'react';
import { Expense } from '@/expenses/types';
import { createExpenseAction, updateExpenseAction } from '@/expenses/api/controller';
import { useMessage } from '@/shared/ui/Message';
import { Save, Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useSettings } from '@/settings/api/SettingsContext';
import Image from 'next/image';

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
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.receiptImage || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        // If we are editing, we might need a way to track if the user wants to DELETE the existing image.
        // For now, let's just assume if they don't upload a new one, the old one stays UNLESS we explicitly handle deletion.
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
        });

        if (selectedImage) {
            data.append('receiptImage', selectedImage);
        }

        let res;
        if (initialData) {
            res = await updateExpenseAction(initialData.id, data);
        } else {
            res = await createExpenseAction(data);
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

            <div className="space-y-3">
                <label className={labelClasses}>Receipt Image (Optional)</label>
                {imagePreview ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border bg-muted/20 group">
                        <Image
                            src={imagePreview}
                            alt="Receipt preview"
                            fill
                            className="object-contain"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-red-500 text-white shadow-lg hover:scale-110 transition-transform"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <p className="mb-2 text-sm font-bold text-foreground">Click to upload receipt</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">PNG, JPG or WEBP</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </label>
                )}
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
