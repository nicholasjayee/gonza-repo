"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteSaleAction } from '@/sales/api/controller';

interface DeleteSaleButtonProps {
    saleId: string;
}

export const DeleteSaleButton: React.FC<DeleteSaleButtonProps> = ({ saleId }) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this sale? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await deleteSaleAction(saleId);
            if (res.success) {
                router.push('/sales');
            } else {
                alert(res.error || "Failed to delete sale");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete sale");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20 flex items-center gap-2"
        >
            <Trash2 className="h-4 w-4" />
            Delete
        </button>
    );
};
