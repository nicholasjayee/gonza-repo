"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '../../../types';
import { BarcodeLabel } from './components/BarcodeLabel';
import { getProductAction, deleteProductAction } from '../../../api/controller';
import { ArrowLeft, Edit3, Trash2, Package, Tag, Layers, Database, Calendar, FileText } from 'lucide-react';
import { useSettings } from '@/settings/api/SettingsContext';

export const ProductDetailsPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { currency } = useSettings();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        getProductAction(id)
            .then(res => {
                if (res.success) {
                    setProduct(res.data as unknown as Product);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleDelete = async () => {
        if (!product?.id) return;
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await deleteProductAction(product.id);
            if (res.success) {
                router.push('/products');
            } else {
                alert(res.error || "Failed to delete product");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete product");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Loading details...</p>
        </div>
    );

    if (!id) return <div className="p-10 text-center text-red-500">No product ID provided.</div>;
    if (!product) return <div className="p-10 text-center text-red-500">Product not found.</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/products')}
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
                        <h1 className="text-3xl font-black tracking-tight">{product.name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/products/history?id=${product.id}`)}
                        className="px-5 py-2.5 text-sm font-bold text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-all flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        History
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                    <button
                        onClick={() => router.push(`/products/edit?id=${product.id}`)}
                        className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2"
                    >
                        <Edit3 className="h-4 w-4" />
                        Edit Product
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl relative overflow-hidden">
                            <Tag className="absolute -right-4 -top-4 h-24 w-24 text-primary/10 -rotate-12" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Selling Price</p>
                            <p className="text-3xl font-black text-primary">{currency} {product.sellingPrice.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-muted/30 border border-border rounded-3xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Cost Price</p>
                            <p className="text-3xl font-black text-foreground/80">{currency} {product.costPrice.toLocaleString()}</p>
                            <p className="text-[10px] mt-2 font-medium text-emerald-500">
                                Margin: {product.sellingPrice > 0 ? (((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border pb-4">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Product Description</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {product.description || "No description provided for this product."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                            <Database className="h-3.5 w-3.5 text-muted-foreground mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Stock Level</p>
                            <p className="font-bold text-sm tracking-tight">{product.stock} Units</p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                            <Database className="h-3.5 w-3.5 text-orange-500 mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Min Stock</p>
                            <p className="font-bold text-sm tracking-tight">{product.minStock} Units</p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Added On</p>
                            <p className="font-bold text-sm tracking-tight">{new Date(product.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                            <Package className="h-3.5 w-3.5 text-muted-foreground mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Initial Stock</p>
                            <p className="font-bold text-sm tracking-tight">{product.initialStock} Units</p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                            <Package className="h-3.5 w-3.5 text-muted-foreground mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">SKU</p>
                            <p className="font-bold text-sm tracking-tight">{product.sku || "N/A"}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {product.image && (
                        <div className="rounded-3xl overflow-hidden border border-border shadow-sm">
                            <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
                        </div>
                    )}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider px-2">Barcode Label</h3>
                        <BarcodeLabel
                            value={product.barcode || "NO-BARCODE"}
                            name={product.name}
                            price={product.sellingPrice}
                        />
                    </div>

                    <div className="p-6 bg-muted/30 border border-dashed border-border rounded-3xl text-center space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Internal Slug</p>
                        <code className="text-[10px] bg-background px-2 py-1 rounded border border-border">{product.slug || "no-slug"}</code>
                    </div>
                </div>
            </div>
        </div >
    );
};
