"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Plus, Trash2, Package, Search, AlertCircle, FileUp, Sparkles, CheckCircle2, Barcode } from 'lucide-react';
import { getLowStockItemsAction, createRequisitionAction, updateRequisitionAction } from '@/inventory/api/controller';
import { getProductsAction, getProductAction } from '@/products/api/controller';
import { useScanner } from '@/products/hardware/utils/useScanner';
import { Product } from '@/products/types';
import { mapSpreadsheetHeaders } from '@/shared/utils/spreadsheet';
import { useMessage } from '@/shared/ui/Message';
import { RequisitionBulkUploadView } from '../components/RequisitionBulkUploadView';
import * as XLSX from 'xlsx';

interface RequisitionItem {
    id?: string;
    productName: string;
    sku?: string;
    quantity: number;
    currentStock?: number;
    minStock?: number;
    barcode?: string;
}

export default function CreateRequisitionPage({
    requisitionId,
    initialData
}: {
    requisitionId?: string,
    initialData?: any
}) {
    const router = useRouter();
    const { showMessage, MessageComponent } = useMessage();

    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [items, setItems] = useState<RequisitionItem[]>(initialData?.items || []);
    const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>(initialData?.priority || 'NORMAL');
    const [notes, setNotes] = useState(initialData?.notes || '');

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [loading, setLoading] = useState(false);

    // Scanner integration
    const handleBarcodeScan = async (barcode: string) => {
        try {
            const res = await getProductAction(barcode);
            if (res.success && res.data) {
                const product = res.data as Product;
                addItem(product);
                showMessage('success', `Added ${product.name} via barcode`);
            } else {
                showMessage('error', `Product with barcode ${barcode} not found`);
            }
        } catch (error) {
            console.error("Barcode scan error:", error);
        }
    };

    useScanner({ onScan: handleBarcodeScan });

    useEffect(() => {
        async function loadProducts() {
            const res = await getProductsAction();
            if (res.success) setProducts(res.data || []);
        }
        loadProducts();
    }, []);

    const handleAutoFill = async () => {
        setIsLoading(true);
        const res = await getLowStockItemsAction();
        if (res.success) {
            const lowStockItems = res.data.map((item: any) => ({
                productName: item.name,
                sku: item.sku,
                quantity: Math.max(1, item.minStock - item.stock + 5), // Suggest enough to pass min + buffer
                currentStock: item.stock,
                minStock: item.minStock
            }));

            // Merge with existing but avoid duplicates by SKU
            const existingSkus = new Set(items.map(i => i.sku));
            const newItems = lowStockItems.filter((i: any) => !existingSkus.has(i.sku));
            setItems([...items, ...newItems]);
        }
        setIsLoading(false);
    };

    const handleBulkItemsAdded = (newItems: any[]) => {
        setItems(prevItems => {
            const merged = [...prevItems];
            newItems.forEach(newItem => {
                const existingIdx = merged.findIndex(i => i.sku === newItem.sku && i.sku !== '');
                if (existingIdx > -1) {
                    merged[existingIdx] = {
                        ...merged[existingIdx],
                        quantity: merged[existingIdx].quantity + newItem.quantity
                    };
                } else {
                    merged.push(newItem);
                }
            });
            return merged;
        });
        showMessage('success', `Merged ${newItems.length} items from file`);
    };

    const addItem = (product: Product) => {
        if (items.find(i => i.sku === product.sku)) return;
        setItems([...items, {
            productName: product.name,
            sku: product.sku || '',
            quantity: 1,
            currentStock: product.stock,
            minStock: product.minStock
        }]);
        setSearchQuery('');
    };

    const removeItem = (sku: string) => {
        setItems(items.filter(i => i.sku !== sku));
    };

    const updateQuantity = (sku: string, qty: number) => {
        setItems(items.map(i => i.sku === sku ? { ...i, quantity: Math.max(1, qty) } : i));
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            setError("Please add at least one item to the requisition.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = {
            priority,
            notes,
            items: items.map(i => ({
                productName: i.productName,
                sku: i.sku,
                quantity: i.quantity
            }))
        };

        const res = requisitionId
            ? await updateRequisitionAction(requisitionId, payload)
            : await createRequisitionAction(payload);

        if (res.success) {
            setSuccess(true);
            showMessage('success', requisitionId ? 'Requisition updated successfully!' : 'Requisition created successfully!');
            setTimeout(() => {
                router.push('/inventory');
                router.refresh();
            }, 2000);
        } else {
            setError(res.error || "Failed to save requisition.");
        }
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black italic">Requisition Submitted!</h2>
                <p className="text-muted-foreground mt-2 font-medium">Redirecting to management list...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tight">New Requisition</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Request stock replenishment for your branch</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Item Selection */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Tool Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleAutoFill}
                            disabled={isLoading}
                            className="h-16 bg-primary/5 border border-primary/20 rounded-3xl flex items-center justify-center gap-3 group hover:bg-primary/10 transition-all"
                        >
                            <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
                            <div className="text-left">
                                <p className="text-xs font-black italic text-primary leading-none uppercase tracking-widest">Smart Auto-Fill</p>
                                <p className="text-[10px] font-bold text-primary/60">Suggest low stock items</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowBulkUpload(true)}
                            className="h-16 bg-muted/40 border border-border rounded-3xl flex items-center justify-center gap-3 hover:bg-muted/60 transition-all group"
                        >
                            <FileUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-left">
                                <p className="text-xs font-black italic text-foreground leading-none uppercase tracking-widest">Bulk Import</p>
                                <p className="text-[10px] font-bold text-muted-foreground">Preview & Merge Sheet</p>
                            </div>
                        </button>
                    </div>

                    {/* Scanner Helper Alert */}
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center gap-3 text-primary/80 animate-pulse">
                        <Barcode className="w-5 h-5" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Barcode Scanner Active. Simply scan any product to add it instantly.</p>
                    </div>

                    {/* Product Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Add individual items by searching name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-sm"
                        />
                        {searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-60 overflow-y-auto divide-y divide-border">
                                    {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addItem(product)}
                                            className="w-full p-4 hover:bg-muted/50 flex items-center justify-between transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                                    {product.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{product.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Stock: {product.stock} | SKU: {product.sku}</p>
                                                </div>
                                            </div>
                                            <Plus className="w-4 h-4 text-primary" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Requisition Table */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left font-sans">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Req. Qty</th>
                                    <th className="px-8 py-5 text-right w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {items.map((item) => (
                                    <tr key={item.sku} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-foreground">{item.productName}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">SKU: {item.sku}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {item.currentStock !== undefined && (
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.currentStock <= (item.minStock || 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        Stock: {item.currentStock}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-bold">Min: {item.minStock}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.sku || '', parseInt(e.target.value) || 0)}
                                                className="w-16 h-10 rounded-xl border border-border bg-transparent text-center font-black text-sm outline-none focus:border-primary transition-all"
                                            />
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => removeItem(item.sku || '')}
                                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <Package className="w-12 h-12" />
                                                <p className="text-sm font-bold italic">Use one of the tools above to add items to your request.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Meta & Submit */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6 sticky top-8">
                        <div>
                            <h3 className="text-lg font-black tracking-tight mb-1">Requisition Info</h3>
                            <p className="text-xs text-muted-foreground font-medium">Define the urgency and instructions</p>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block px-1">Priority Level</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p as any)}
                                        className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${priority === p
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'border-border text-muted-foreground hover:border-primary/30'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block px-1">Special Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any specific requirements or delivery instructions..."
                                className="w-full h-32 p-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium resize-none shadow-inner"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || items.length === 0}
                            className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-3xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50"
                        >
                            <Send className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isLoading ? 'animate-pulse' : ''}`} />
                            {isLoading ? 'Submitting...' : 'Send Requisition'}
                        </button>
                    </div>
                </div>
            </div>
            {showBulkUpload && (
                <RequisitionBulkUploadView
                    onClose={() => setShowBulkUpload(false)}
                    onItemsAdded={handleBulkItemsAdded}
                />
            )}
            {MessageComponent}
        </div>
    );
}
