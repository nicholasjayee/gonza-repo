"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Customer, CreateCustomerInput } from '../../types';
import { createCustomerAction, updateCustomerAction } from '../../api/controller';
import { useMessage } from '@/shared/ui/Message';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
    initialData?: Customer;
}

export function CustomerFormModal({ isOpen, onClose, onSuccess, initialData }: CustomerFormModalProps) {
    const { showMessage, MessageComponent } = useMessage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEdit = !!initialData;

    const [formData, setFormData] = useState<CreateCustomerInput>({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                phone: initialData.phone || '',
                email: initialData.email || '',
                address: initialData.address || '',
                city: initialData.city || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = isEdit
                ? await updateCustomerAction(initialData!.id, formData)
                : await createCustomerAction(formData);

            if (res.success && res.data) {
                showMessage('success', `Customer ${isEdit ? 'updated' : 'created'} successfully!`);
                onSuccess(res.data as Customer);
                setTimeout(onClose, 500);
            } else {
                showMessage('error', res.error || `Failed to ${isEdit ? 'update' : 'create'} customer`);
            }
        } catch (error) {
            console.error(error);
            showMessage('error', 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full h-11 px-4 pl-10 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium";
    const labelClasses = "text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1.5 block px-1";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
                                <User className="w-3 h-3" />
                                {isEdit ? 'Update Client' : 'New Client'}
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {isEdit ? 'Edit Customer' : 'Add Customer'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {MessageComponent}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className={labelClasses}>Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className={inputClasses}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelClasses}>Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className={inputClasses}
                                        placeholder="+256..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClasses}>Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className={inputClasses}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelClasses}>City / Region</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        value={formData.city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Kampala"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClasses}>Physical Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Street name..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClasses}>Notes / Important Info</label>
                            <div className="relative">
                                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className={`${inputClasses} h-24 py-3 pl-10 resize-none`}
                                    placeholder="Any additional details..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-12 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] h-12 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> {isEdit ? 'Update' : 'Save'} Customer</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
