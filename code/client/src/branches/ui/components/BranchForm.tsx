"use client";

import React, { useState } from 'react';
import { Branch } from '../../types';
import { Loader2, Save, X, Shield, Lock, Building2, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

interface BranchFormProps {
    initialData?: Partial<Branch>;
    onSubmit: (data: Omit<Branch, 'id' | 'adminId'>) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

export function BranchForm({ initialData, onSubmit, onCancel, isSubmitting }: BranchFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location: initialData?.location || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        type: initialData?.type || 'SUB',
        accessPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData as any);
    };

    const inputClasses = "w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium";
    const labelClasses = "text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-1.5 block px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                    <label className={labelClasses}>Branch Name</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Downtown Flagship"
                            required
                            className={`${inputClasses} pl-11`}
                        />
                    </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className={labelClasses}>Physical Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. 1st Floor, Oasis Mall, Kampala"
                            required
                            className={`${inputClasses} pl-11`}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className={labelClasses}>Branch Contact Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+256 700 000 000"
                            className={`${inputClasses} pl-11`}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className={labelClasses}>Branch Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="branch@gonza.com"
                            className={`${inputClasses} pl-11`}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className={labelClasses}>Hierarchy Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="SUB">Sub Branch (Standard)</option>
                        <option value="MAIN">Main Branch (Central Hub)</option>
                    </select>
                    <p className="text-[9px] text-muted-foreground px-1 italic">
                        Main branches can access data from all other branches.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <label className={labelClasses}>Access Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="password"
                            name="accessPassword"
                            value={formData.accessPassword}
                            onChange={handleChange}
                            placeholder={initialData ? "Leave empty to keep current" : "Set branch password"}
                            className={`${inputClasses} pl-11`}
                        />
                    </div>
                    <p className="text-[9px] text-muted-foreground px-1 italic">
                        Required for non-admin users to enter this branch.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-bold text-foreground/70 hover:bg-muted rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[160px] h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Branch</>
                    )}
                </button>
            </div>
        </form>
    );
}
