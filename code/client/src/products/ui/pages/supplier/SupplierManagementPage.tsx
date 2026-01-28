"use client";

import React from 'react';
import { Supplier } from '../../../types';
import { SupplierCard } from './components/SupplierCard';
import { createSupplierAction, updateSupplierAction, getSuppliersAction } from '../../../api/controller';

export const SupplierManagement: React.FC = () => {
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const result = await getSuppliersAction();
        if (result.success) setSuppliers(result.data);
        setLoading(false);
    };

    React.useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (editingSupplier) {
            const result = await updateSupplierAction(editingSupplier.id, data);
            if (result.success) {
                setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? result.data : s));
                setIsFormOpen(false);
                setEditingSupplier(null);
            }
        } else {
            const result = await createSupplierAction(data);
            if (result.success) {
                setSuppliers([result.data, ...suppliers]);
                setIsFormOpen(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Suppliers</h2>
                    <p className="text-muted-foreground text-sm">Manage your product vendors and contact details.</p>
                </div>
                <button
                    onClick={() => { setEditingSupplier(null); setIsFormOpen(true); }}
                    className="h-10 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Supplier
                </button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border border-border rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-6">{editingSupplier ? 'Update Supplier' : 'New Supplier'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Supplier Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    defaultValue={editingSupplier?.name}
                                    placeholder="Acme Corp, Global Supplies, etc."
                                    className="w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Contact Person</label>
                                <input
                                    name="contactName"
                                    type="text"
                                    defaultValue={editingSupplier?.contactName || ''}
                                    placeholder="John Doe"
                                    className="w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={editingSupplier?.email || ''}
                                    placeholder="vendor@example.com"
                                    className="w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Phone Number</label>
                                <input
                                    name="phone"
                                    type="text"
                                    defaultValue={editingSupplier?.phone || ''}
                                    placeholder="+256 700 000 000"
                                    className="w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Physical Address</label>
                                <textarea
                                    name="address"
                                    defaultValue={editingSupplier?.address || ''}
                                    placeholder="Plot 12, Industrial Area, Kampala"
                                    className="w-full h-20 p-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="col-span-2 flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 h-11 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10 hover:bg-neutral-900 transition-all"
                                >
                                    {editingSupplier ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {suppliers.map(supplier => (
                        <SupplierCard
                            key={supplier.id}
                            supplier={supplier}
                            onEdit={(s) => { setEditingSupplier(s); setIsFormOpen(true); }}
                            onDelete={(id) => setSuppliers(suppliers.filter(s => s.id !== id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
