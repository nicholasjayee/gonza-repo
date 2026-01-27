"use client";

import React, { useState, useEffect } from 'react';
import { MoneyInput } from "@/shared/ui/MoneyInput";
import { Loader2, Save, X, Sparkles, Image as ImageIcon, Plus } from "lucide-react";
import { lookupBarcodeAction, getCategoriesAction, getSuppliersAction, getProductAction } from '@/products/api/controller';
import { useMessage } from '@/shared/ui/Message';
import { useScanner } from '@/products/hardware/utils/useScanner';
import { Category, Supplier } from '../../../../types';

interface ProductFormProps {
    initialData?: any;
    onSubmit: (formData: FormData, printOnSave: boolean) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

export function ProductForm({ initialData, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        sellingPrice: initialData?.sellingPrice || 0,
        costPrice: initialData?.costPrice || 0,
        initialStock: initialData?.initialStock || 0,
        minStock: initialData?.minStock || 0,
        stock: initialData?.stock || 0,
        barcode: initialData?.barcode || '',
        sku: initialData?.sku || '',
        categoryId: initialData?.categoryId || '',
        supplierId: initialData?.supplierId || '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [printOnSave, setPrintOnSave] = useState(true);
    const { showMessage, MessageComponent } = useMessage();

    const [isLoaded, setIsLoaded] = useState(false);
    const STORAGE_KEY = 'gz-product-form-draft';

    // Load draft on mount
    useEffect(() => {
        if (!initialData?.id) { // Only for new products
            const savedDraft = localStorage.getItem(STORAGE_KEY);
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Error parsing product draft:", e);
                }
            }
        }
        setIsLoaded(true);
    }, [initialData?.id]);

    // Save draft on change
    useEffect(() => {
        if (!initialData?.id && isLoaded) {
            // Don't save image preview to localStorage (too large)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData, initialData?.id, isLoaded]);

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    useEffect(() => {
        const fetchMeta = async () => {
            const [catRes, supRes] = await Promise.all([
                getCategoriesAction(),
                getSuppliersAction()
            ]);
            if (catRes.success) setCategories(catRes.data);
            if (supRes.success) setSuppliers(supRes.data);
        };
        fetchMeta();
    }, []);

    useScanner({
        onScan: (code) => handleLookup(code),
        enabled: !isLookingUp
    });

    async function handleLookup(code: string) {
        setIsLookingUp(true);
        try {
            // 1. Check local inventory first
            const localRes = await getProductAction(code);
            if (localRes.success && localRes.data) {
                const item = localRes.data as any;
                setFormData(prev => ({
                    ...prev,
                    barcode: code,
                    name: item.name || prev.name,
                    slug: item.slug || prev.slug,
                    description: item.description || prev.description,
                    sellingPrice: item.sellingPrice ?? prev.sellingPrice,
                    costPrice: item.costPrice ?? prev.costPrice,
                    initialStock: item.stock ?? prev.initialStock,
                    minStock: item.minStock ?? prev.minStock,
                    categoryId: item.categoryId || prev.categoryId,
                    supplierId: item.supplierId || prev.supplierId,
                    sku: item.sku || prev.sku
                }));
                if (item.image) setImagePreview(item.image);
                showMessage('success', `Found existing product in local inventory: ${item.name}`);
                return;
            }

            // 2. Fallback to global lookup
            const res = await lookupBarcodeAction(code);
            if (res.success && res.data) {
                const { name, description } = res.data;
                setFormData(prev => ({
                    ...prev,
                    barcode: code,
                    name: name || prev.name,
                    description: description || prev.description
                }));
                showMessage('success', `Found details in global database: ${name}`);
            } else {
                setFormData(prev => ({ ...prev, barcode: code }));
                showMessage('info', 'Barcode scanned. No results found locally or globally.');
            }
        } catch (err) {
            setFormData(prev => ({ ...prev, barcode: code }));
        } finally {
            setIsLookingUp(false);
        }
    }

    // Auto-generate slug, SKU, and Barcode
    useEffect(() => {
        setFormData(prev => {
            const updates: any = {};
            if (!initialData?.slug && prev.name && (!prev.slug || prev.slug.length < 3)) {
                const baseSlug = prev.name.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                const rand = Math.random().toString(36).substring(2, 6);
                updates.slug = `${baseSlug}-${rand}`;
            }
            if (!initialData?.sku && !prev.sku && prev.name) {
                const year = new Date().getFullYear().toString().slice(-2);
                const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
                updates.sku = `GZ-${year}-${rand}`;
            }
            if (!initialData?.barcode && !prev.barcode && prev.name) {
                // Generate a simple 12-digit numeric barcode
                const timestamp = Date.now().toString().slice(-8);
                const rand = Math.floor(1000 + Math.random() * 9000).toString();
                updates.barcode = timestamp + rand;
            }
            // For new products, sync current stock with initial stock
            if (!initialData?.id && prev.initialStock !== undefined) {
                updates.stock = prev.initialStock;
            }
            if (Object.keys(updates).length > 0) return { ...prev, ...updates };
            return prev;
        });
    }, [formData.name, formData.initialStock, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, String(value));
        });
        if (imageFile) data.append('image', imageFile);

        try {
            await onSubmit(data, printOnSave);
            clearDraft();
        } catch (error) {
            console.error("Form submission error:", error);
        }
    };

    const inputClasses = "w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium";
    const labelClasses = "text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5 block px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto p-10 bg-card border border-border rounded-[2.5rem] shadow-sm relative overflow-hidden">
            {MessageComponent}

            {isLookingUp && (
                <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl shadow-2xl scale-110">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-sm font-bold text-foreground">Fetching Details...</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Image Section */}
                <div className="md:col-span-1 space-y-4">
                    <label className={labelClasses}>Product Image</label>
                    <div className="relative aspect-square rounded-3xl bg-muted/30 border-2 border-dashed border-border overflow-hidden group hover:border-primary/50 transition-colors">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                                <ImageIcon className="w-10 h-10" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Upload or Drop Image</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <p className="text-[9px] text-muted-foreground text-center">Images are stored in Cloudflare R2 bucket.</p>
                </div>

                {/* Info Section */}
                <div className="md:col-span-2 space-y-5">
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Product Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Premium Coffee Beans"
                            required
                            className={inputClasses}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelClasses}>Category</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClasses}>Supplier</label>
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelClasses}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description..."
                            rows={2}
                            className={`${inputClasses} py-3 h-auto min-h-[80px] resize-none`}
                        />
                    </div>
                </div>

                {/* Finance & Stock Section */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Selling Price</label>
                        <MoneyInput
                            value={formData.sellingPrice}
                            onChange={(val) => setFormData(prev => ({ ...prev, sellingPrice: val }))}
                            className="h-11 font-bold text-lg rounded-xl"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Cost Price</label>
                        <MoneyInput
                            value={formData.costPrice}
                            onChange={(val) => setFormData(prev => ({ ...prev, costPrice: val }))}
                            className="h-11 rounded-xl"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Initial Stock</label>
                        <input
                            name="initialStock"
                            type="number"
                            value={formData.initialStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, initialStock: parseInt(e.target.value) || 0 }))}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Min. Stock Level</label>
                        <input
                            name="minStock"
                            type="number"
                            value={formData.minStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                            className={`${inputClasses} border-orange-500/20 bg-orange-500/5 text-orange-600`}
                        />
                    </div>
                </div>

            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={printOnSave}
                        onChange={(e) => setPrintOnSave(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">Print Label</span>
                        <span className="text-[9px] text-muted-foreground/60 leading-none">After saving</span>
                    </div>
                </label>

                <div className="flex items-center gap-3">
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
                        className="min-w-[180px] h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Product</>}
                    </button>
                </div>
            </div>
        </form >
    );
}

