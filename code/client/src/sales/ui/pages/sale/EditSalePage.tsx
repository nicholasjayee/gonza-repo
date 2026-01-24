"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SaleForm } from '../../components/SaleForm';
import { Sale } from '../../../types';
import { Edit3, ArrowLeft } from 'lucide-react';
import { getSaleAction } from '../../../api/controller';
import { useMessage } from '@/shared/ui/Message';

export const EditSalePage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const { showMessage, MessageComponent } = useMessage();

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        getSaleAction(id)
            .then(res => {
                if (res.success) {
                    setSale(res.data as unknown as Sale);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Loading sale data...</p>
        </div>
    );

    if (!id) return <div className="p-10 text-center text-red-500">No sale ID provided.</div>;
    if (!sale) return <div className="p-10 text-center text-red-500">Sale not found.</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {MessageComponent}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                        <Edit3 className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Editor Mode</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Edit Sale <span className="text-muted-foreground/40 text-sm font-bold">#{sale.saleNumber}</span>
                    </h1>
                </div>
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500">
                <SaleForm initialData={sale} />
            </div>
        </div>
    );
};
