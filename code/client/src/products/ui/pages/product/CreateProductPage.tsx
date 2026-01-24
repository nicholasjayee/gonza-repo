"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductForm } from './components/ProductForm';
import { PackagePlus, ArrowLeft } from 'lucide-react';
import { createProductAction } from '../../../api/controller';
import { printBarcode } from '@/products/hardware/utils/print';
import { useMessage } from '@/shared/ui/Message';

export const CreateProductPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

    const initialBarcode = searchParams.get('barcode') || '';

    const handleSubmit = async (data: any, printOnSave: boolean) => {
        setIsSubmitting(true);
        try {
            const res = await createProductAction(data);
            if (res.success && res.data) {
                if (printOnSave) {
                    await printBarcode({ ...res.data, price: (res.data as any).sellingPrice });
                }
                router.push('/products');
            } else {
                throw new Error(res.error || "Failed to create product");
            }
        } catch (error: any) {
            console.error("Error creating product:", error);
            showMessage('error', error.message || "Failed to create product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <PackagePlus className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">New Entry</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Add New Product</h1>
                </div>
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500">
                <ProductForm
                    initialData={{ barcode: initialBarcode }}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};
