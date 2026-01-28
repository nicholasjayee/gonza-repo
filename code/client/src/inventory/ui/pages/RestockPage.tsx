"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Search, Barcode, Send, CheckCircle2, AlertCircle, ShoppingCart, User, Package, DollarSign } from 'lucide-react';
import { getProductsAction, getSuppliersAction } from '@/products/api/controller';
import { batchRestockAction } from '@/inventory/api/controller';
import { Product, Supplier } from '@/products/types';
import { useScanner } from '@/products/hardware/utils/useScanner';
import { useMessage } from '@/shared/ui/Message';
import { RestockBulkUploadView } from '../components/RestockBulkUploadView';
import { FileUp, TrendingUp, Zap } from 'lucide-react';

interface RestockItem {
    productId: string;
    productName: string;
    sku?: string;
    quantity: number;
    costPrice: number;
    barcode?: string;
}

export default function RestockPage() {
    const router = useRouter();
    const { showMessage, MessageComponent } = useMessage();

    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const [prodRes, suppRes] = await Promise.all([
                getProductsAction(),
                getSuppliersAction()
            ]);
            if (prodRes.success) setProducts(prodRes.data || []);
            if (suppRes.success) setSuppliers(suppRes.data || []);
        }
        loadData();
    }, []);

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            addItem(product);
            showMessage('success', `Added ${product.name} via barcode`);
        } else {
            showMessage('error', `Product with barcode ${barcode} not found`);
        }
    };

    useScanner({ onScan: handleBarcodeScan });

    const handleBulkItemsAdded = (newItems: any[]) => {
        setRestockItems(prev => {
            const merged = [...prev];
            newItems.forEach(newItem => {
                const product = products.find(p =>
                    (newItem.sku && p.sku === newItem.sku) ||
                    (p.name.toLowerCase() === newItem.productName.toLowerCase())
                );

                if (product) {
                    const existingIdx = merged.findIndex(i => i.productId === product.id);
                    if (existingIdx > -1) {
                        merged[existingIdx] = {
                            ...merged[existingIdx],
                            quantity: merged[existingIdx].quantity + newItem.quantity
                        };
                    } else {
                        merged.push({
                            productId: product.id,
                            productName: product.name,
                            sku: product.sku || undefined,
                            quantity: newItem.quantity,
                            costPrice: product.costPrice || 0,
                            barcode: product.barcode || undefined
                        });
                    }
                }
            });
            return merged;
        });
        showMessage('success', `Merged ${newItems.length} items from sheet`);
    };

    const addItem = (product: Product) => {
        setRestockItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                sku: product.sku || undefined,
                quantity: 1,
                costPrice: product.costPrice || 0,
                barcode: product.barcode || undefined
            }];
        });
        setSearchQuery('');
    };

    const removeItem = (productId: string) => {
        setRestockItems(restockItems.filter(i => i.productId !== productId));
    };

    const updateQuantity = (productId: string, qty: number) => {
        setRestockItems(restockItems.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));
    };

    const totalCost = restockItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    const handleSubmit = async () => {
        if (restockItems.length === 0) {
            setError("Please add at least one item to restock.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const res = await batchRestockAction({
            supplierId: selectedSupplierId || null,
            items: restockItems.map(i => ({
                productId: i.productId,
                quantity: i.quantity
            }))
        });

        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/inventory');
                router.refresh();
            }, 2000);
        } else {
            setError(res.error || "Failed to update restock.");
        }
        setIsSubmitting(false);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black italic tracking-tight">Stock Replenished!</h2>
                <p className="text-muted-foreground mt-2 font-medium">Inventory levels updated successfully.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tight">Batch Restock</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Efficiently update stock levels across multiple items</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Product Selection */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Tool Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-[2rem] flex items-center justify-between group overflow-hidden relative h-20">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary animate-pulse">
                                    <Barcode className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black italic uppercase tracking-widest text-primary">Scanner Active</h3>
                                    <p className="text-[10px] font-bold text-primary/60">Ready for instant entry</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBulkUpload(true)}
                            className="bg-muted/40 border border-border rounded-[2rem] p-4 flex items-center gap-4 hover:bg-muted/60 transition-all h-20"
                        >
                            <div className="w-10 h-10 bg-muted-foreground/10 rounded-xl flex items-center justify-center text-muted-foreground">
                                <FileUp className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xs font-black italic uppercase tracking-widest">Bulk Import</h3>
                                <p className="text-[10px] font-bold text-muted-foreground">Preview & Merge Sheet</p>
                            </div>
                        </button>
                    </div>

                    {/* Product Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Manually add items by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-sm"
                        />
                        {searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-60 overflow-y-auto divide-y divide-border">
                                    {products.filter(p =>
                                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addItem(product)}
                                            className="w-full p-4 hover:bg-muted/50 flex items-center justify-between transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                                    {product.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{product.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SKU: {product.sku} • Stock: {product.stock}</p>
                                                </div>
                                            </div>
                                            <Plus className="w-4 h-4 text-primary" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Restock Table */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left font-sans">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Batch Qty</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Unit Cost</th>
                                    <th className="px-8 py-5 text-right w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {restockItems.map((item) => (
                                    <tr key={item.productId} className="hover:bg-muted/10 transition">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-black text-sm text-foreground">{item.productName}</span>
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{item.sku || 'No SKU'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                                className="w-20 h-10 rounded-xl border border-border bg-background text-center font-black text-sm outline-none focus:border-primary transition-all ring-offset-background"
                                            />
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col text-right">
                                                <span className="text-xs font-black">UGX {item.costPrice.toLocaleString()}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Sub: {(item.costPrice * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => removeItem(item.productId)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {restockItems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30 group">
                                                <Package className="w-16 h-16 group-hover:scale-110 transition-transform" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black italic">No Items to Restock</p>
                                                    <p className="text-xs font-medium">Scan barcodes or use search to build your batch.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Summary & Submit */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card border border-border rounded-[3rem] p-10 shadow-sm space-y-8 sticky top-8">
                        <div>
                            <h3 className="text-xl font-black italic tracking-tight mb-2">Restock Summary</h3>
                            <p className="text-xs text-muted-foreground font-medium">Finalize and commit batch to inventory</p>
                        </div>

                        {/* Supplier Picker */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                                <User className="w-3 h-3" />
                                Source Supplier (Optional)
                            </label>
                            <select
                                value={selectedSupplierId}
                                onChange={(e) => setSelectedSupplierId(e.target.value)}
                                className="w-full h-14 px-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                            >
                                <option value="">Internal Adjustment / Unknown</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Totals */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Units</span>
                                <span className="text-sm font-black">{restockItems.reduce((s, i) => s + i.quantity, 0)} Items</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Total Cost</p>
                                    <p className="text-2xl font-black italic text-primary">UGX {totalCost.toLocaleString()}</p>
                                </div>
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || restockItems.length === 0}
                            className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-3xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group disabled:opacity-50 active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Commit Restock Batch
                                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {showBulkUpload && (
                <RestockBulkUploadView
                    onClose={() => setShowBulkUpload(false)}
                    onItemsAdded={handleBulkItemsAdded}
                />
            )}
            {MessageComponent}
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <div className={`border-2 border-t-white/30 border-white rounded-full animate-spin ${className}`} />;
}
