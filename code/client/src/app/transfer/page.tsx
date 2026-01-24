"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Plus, Trash2, Package, Store, MapPin, Search, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getBranchesAction } from '@/branches/api/controller';
import { getProductsAction } from '@/products/api/controller';
import { initiateTransferAction } from '@/inventory/api/transfer-controller';
import { Product } from '@/products/types';
import { Branch } from '@/branches/types';

interface TransferItem {
    product: Product;
    quantity: number;
}

export default function TransferPage() {
    const router = useRouter();

    // Data states
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [sourceBranchId, setSourceBranchId] = useState<string>('');
    const [targetBranchId, setTargetBranchId] = useState<string>('');

    // Current transfer state
    const [items, setItems] = useState<TransferItem[]>([]);
    const [notes, setNotes] = useState('');

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [branchRes, productRes] = await Promise.all([
                getBranchesAction(),
                getProductsAction()
            ]);

            if (branchRes.success) {
                setBranches(branchRes.data || []);
                setSourceBranchId(branchRes.activeId || '');
            }
            if (productRes.success) {
                setProducts(productRes.data || []);
            }
        }
        loadData();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItem = (product: Product) => {
        const existing = items.find(i => i.product.id === product.id);
        if (existing) {
            updateQuantity(product.id, existing.quantity + 1);
        } else {
            setItems([...items, { product, quantity: 1 }]);
        }
    };

    const removeItem = (productId: string) => {
        setItems(items.filter(i => i.product.id !== productId));
    };

    const updateQuantity = (productId: string, qty: number) => {
        setItems(items.map(i => {
            if (i.product.id === productId) {
                // Cant transfer more than available
                const finalQty = Math.max(1, Math.min(qty, i.product.stock));
                return { ...i, quantity: finalQty };
            }
            return i;
        }));
    };

    const handleTransfer = async () => {
        if (!targetBranchId) {
            setError("Please select a destination branch.");
            return;
        }
        if (items.length === 0) {
            setError("Please add at least one item to transfer.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const transferData = items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity
        }));

        const res = await initiateTransferAction(targetBranchId, transferData, notes);

        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/products');
                router.refresh();
            }, 2000);
        } else {
            setError(res.error || "Transfer failed.");
        }
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black italic">Transfer Successful!</h2>
                <p className="text-muted-foreground mt-2 font-medium">Redirecting you to inventory...</p>
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
                        <h1 className="text-4xl font-black italic tracking-tight">Stock Transfer</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Move inventory between your store locations</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Configuration & Selection */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Branch Selection Card */}
                    <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block px-1">Source Location (From)</label>
                                <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-2xl opacity-60">
                                    <Store className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-bold text-sm">{branches.find(b => b.id === sourceBranchId)?.name || 'Loading...'}</p>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Active Branch</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center md:pt-6">
                                <ChevronRight className="w-6 h-6 text-muted-foreground/30 rotate-90 md:rotate-0" />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block px-1">Destination Location (To)</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <select
                                        value={targetBranchId}
                                        onChange={(e) => setTargetBranchId(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm appearance-none"
                                    >
                                        <option value="">Select Destination Branch</option>
                                        {branches.filter(b => b.id !== sourceBranchId).map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name} ({branch.location})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU to transfer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-sm"
                            />
                        </div>

                        {searchQuery && (
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="max-h-60 overflow-y-auto divide-y divide-border">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                addItem(product);
                                                setSearchQuery('');
                                            }}
                                            className="w-full p-4 hover:bg-muted/50 flex items-center justify-between transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                                    {product.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{product.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Stock: {product.stock} | SKU: {product.sku}</p>
                                                </div>
                                            </div>
                                            <Plus className="w-4 h-4 text-primary" />
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic text-sm">No products found matching your search.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transfer List */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Stock</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Transfer Qty</th>
                                    <th className="px-8 py-5 text-right w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {items.map((item) => (
                                    <tr key={item.product.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-foreground">{item.product.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">SKU: {item.product.sku}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-xs">{item.product.stock} Units</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                                    className="w-12 text-center font-black text-sm bg-transparent outline-none"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <Package className="w-12 h-12" />
                                                <p className="text-sm font-bold italic">No items added to this transfer yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Summary & Action */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6 sticky top-8">
                        <div>
                            <h3 className="text-lg font-black tracking-tight mb-1">Transfer Summary</h3>
                            <p className="text-xs text-muted-foreground font-medium">Verify all details before proceeding</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Total Items</span>
                                <span className="font-black text-lg">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Unique Products</span>
                                <span className="font-black text-lg">{items.length}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block px-1">Transfer Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Purpose of this transfer..."
                                className="w-full h-32 p-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium resize-none"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleTransfer}
                            disabled={isLoading || items.length === 0 || !targetBranchId}
                            className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-3xl hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                        >
                            <Send className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isLoading ? 'animate-pulse' : ''}`} />
                            {isLoading ? 'Processing...' : 'Complete Transfer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
