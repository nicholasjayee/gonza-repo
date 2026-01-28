"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '../../../types';
import { getProductAction, getProductHistoryAction } from '../../../api/controller';
import { ArrowLeft, Calendar, FileText, Package } from 'lucide-react';
import { ProductHistoryTable } from '../../components/ProductHistoryTable';

export const ProductHistoryPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [product, setProduct] = useState<Product | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [productRes, historyRes] = await Promise.all([
                    getProductAction(id),
                    getProductHistoryAction(id)
                ]);

                if (productRes.success) {
                    setProduct(productRes.data as unknown as Product);
                }
                if (historyRes.success) {
                    setHistory(historyRes.data as any[]);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Loading history...</p>
        </div>
    );

    if (!id) return <div className="p-10 text-center text-red-500">No product ID provided.</div>;
    if (!product) return <div className="p-10 text-center text-red-500">Product not found.</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/products/show?id=${id}`)}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground overflow-hidden h-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider truncate">{product.category?.name || "Uncategorized"}</span>
                            <span className="text-xs">/</span>
                            <span className="text-[10px] font-medium truncate">{product.sku || product.id}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            {product.name}
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">History Log</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-muted/20 border border-border rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Current Stock</p>
                        <p className="text-xl font-black">{product.stock} Units</p>
                    </div>
                </div>
                <div className="p-6 bg-muted/20 border border-border rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Total Events</p>
                        <p className="text-xl font-black">{history.length} Records</p>
                    </div>
                </div>
                <div className="p-6 bg-muted/20 border border-border rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Last Updated</p>
                        <p className="text-xl font-black">{new Date(product.updatedAt || product.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <ProductHistoryTable history={history} />
        </div>
    );
};
