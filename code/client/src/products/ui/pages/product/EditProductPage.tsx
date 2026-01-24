"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductForm } from './components/ProductForm';
import { Product } from '../../../types';
import { Edit3, ArrowLeft } from 'lucide-react';
import { getProductAction, updateProductAction } from '../../../api/controller';
import { printBarcode } from '@/products/hardware/utils/print';
import { useMessage } from '@/shared/ui/Message';

export const EditProductPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

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

    const handleSubmit = async (data: any, printOnSave: boolean) => {
        if (!product?.id) return;
        setIsSubmitting(true);
        try {
            const res = await updateProductAction(product.id, data);
            if (res.success && res.data) {
                if (printOnSave) {
                    await printBarcode({ ...res.data, price: (res.data as any).sellingPrice });
                }
                router.push(`/products/show?id=${product.id}`);
            } else {
                showMessage('error', res.error || "Failed to update product");
            }
        } catch (error: any) {
            console.error("Error updating product:", error);
            showMessage('error', error.message || "Failed to update product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Loading data...</p>
        </div>
    );

    if (!id) return <div className="p-10 text-center text-red-500">No product ID provided.</div>;
    if (!product) return <div className="p-10 text-center text-red-500">Product not found.</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
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
                    <h1 className="text-3xl font-black tracking-tight">Modify {product.name}</h1>
                </div>
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500">
                <ProductForm
                    initialData={product as any}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};
