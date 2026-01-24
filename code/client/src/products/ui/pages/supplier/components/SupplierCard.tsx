"use client";

import React from 'react';
import { Supplier } from '../../../../types';
import { deleteSupplierAction } from '../../../../api/controller';

interface SupplierCardProps {
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onEdit, onDelete }) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${supplier.name}"?`)) return;
        setIsDeleting(true);
        try {
            const result = await deleteSupplierAction(supplier.id);
            if (result.success) {
                onDelete(supplier.id);
            } else {
                alert(result.error);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative bg-background/50 backdrop-blur-sm border border-border rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(supplier)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-blue-500 transition-colors">{supplier.name}</h3>

            <div className="space-y-2 mt-3">
                {supplier.email && (
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {supplier.email}
                    </div>
                )}
                {supplier.phone && (
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {supplier.phone}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-background flex items-center justify-center text-[8px] font-bold text-blue-500">S</div>
                    <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary">P</div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                    {supplier.contactName || 'No contact specified'}
                </span>
            </div>
        </div>
    );
};
