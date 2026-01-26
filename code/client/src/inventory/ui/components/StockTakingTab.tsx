"use client";

import React, { useState, useEffect } from 'react';
import { Scan, Package, Trash2, ArrowRightLeft, AlertCircle, Info } from 'lucide-react';
import { useScanner } from '@/products/hardware/utils/useScanner';
import { getProductByBarcodeForStockTakeAction, getProductByIdForStockTakeAction } from '../../api/controller';
import { getProductsAction } from '@/products/api/controller';
import { Product } from '@/products/types';
import { useMessage } from '@/shared/ui/Message';
import { Search, Plus, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface StockTakeItem {
    id: string;
    name: string;
    barcode: string;
    initialStock: number;
    recordedStock: number;
    totalSold: number;
    physicalStock: number;
    variation: number;
}

export function StockTakingTab() {
    const { showMessage, MessageComponent } = useMessage();
    const [scannedItems, setScannedItems] = useState<StockTakeItem[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [lastBarcode, setLastBarcode] = useState<string>("");

    // Manual search state
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleScan = async (barcode: string) => {
        setLastBarcode(barcode);

        // Check if already in list
        if (scannedItems.find(item => item.barcode === barcode)) {
            showMessage("info", "Product already in stock take list");
            return;
        }

        try {
            const res = await getProductByBarcodeForStockTakeAction(barcode);
            if (res.success && res.data) {
                const data = res.data;
                const newItem: StockTakeItem = {
                    id: data.id,
                    name: data.name,
                    barcode: data.barcode || "NO BARCODE",
                    initialStock: data.initialStock,
                    recordedStock: data.recordedStock,
                    totalSold: data.totalSold,
                    physicalStock: data.recordedStock, // Default to recorded
                    variation: 0,
                };
                setScannedItems(prev => [newItem, ...prev]);
                showMessage("success", `Added: ${data.name}`);
            } else {
                showMessage("error", res.error || "Product not found");
            }
        } catch (error) {
            showMessage("error", "Failed to fetch product details");
        }
    };

    const handleProductSearch = async (query: string) => {
        setProductSearch(query);
        if (query.length > 1) {
            setIsSearching(true);
            try {
                const res = await getProductsAction();
                if (res.success) {
                    const filtered = (res.data as Product[] || []).filter(p =>
                        p.name.toLowerCase().includes(query.toLowerCase()) ||
                        p.barcode?.includes(query) ||
                        p.sku?.includes(query)
                    );
                    setProductResults(filtered.slice(0, 8));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setProductResults([]);
        }
    };

    const addProductManually = async (product: Product) => {
        if (scannedItems.find(item => item.id === product.id)) {
            showMessage("info", "Product already in stock take list");
            setProductSearch('');
            setProductResults([]);
            return;
        }

        try {
            const res = await getProductByIdForStockTakeAction(product.id);
            if (res.success && res.data) {
                const data = res.data;
                const newItem: StockTakeItem = {
                    id: data.id,
                    name: data.name,
                    barcode: data.barcode || "NO BARCODE",
                    initialStock: data.initialStock,
                    recordedStock: data.recordedStock,
                    totalSold: data.totalSold,
                    physicalStock: data.recordedStock,
                    variation: 0,
                };
                setScannedItems(prev => [newItem, ...prev]);
                showMessage("success", `Added: ${data.name}`);
            }
        } catch (error) {
            showMessage("error", "Failed to add product");
        }
        setProductSearch('');
        setProductResults([]);
    };

    const handleCompleteStockTake = () => {
        if (scannedItems.length === 0) return;

        const doc = new jsPDF();
        const dateStr = format(new Date(), 'yyyy-MM-dd HH:mm');

        // Header
        doc.setFontSize(20);
        doc.text("Stock Taking Report", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${dateStr}`, 14, 30);

        // Summary Stats
        const totalItems = scannedItems.length;
        const totalVariations = scannedItems.reduce((sum, item) => sum + Math.abs(item.variation), 0);
        const positiveVariations = scannedItems.filter(i => i.variation > 0).length;
        const negativeVariations = scannedItems.filter(i => i.variation < 0).length;

        doc.setFontSize(12);
        doc.text("Summary", 14, 45);
        doc.setFontSize(10);
        doc.text(`Total Unique Items: ${totalItems}`, 14, 52);
        doc.text(`Items with Discrepancies: ${positiveVariations + negativeVariations}`, 14, 58);
        doc.text(`Total Variation Units (Abs): ${totalVariations}`, 14, 64);

        // Table
        autoTable(doc, {
            startY: 75,
            head: [['Product', 'Barcode', 'Recorded', 'Physical', 'Variation']],
            body: scannedItems.map(item => [
                item.name,
                item.barcode,
                item.recordedStock,
                item.physicalStock,
                {
                    content: `${item.variation > 0 ? '+' : ''}${item.variation}`,
                    styles: { textColor: item.variation === 0 ? [0, 0, 0] : item.variation > 0 ? [37, 99, 235] : [225, 29, 72] }
                }
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 9 }
        });

        doc.save(`stock_take_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
        showMessage("success", "Stock take report generated successfully");
    };

    useScanner({
        onScan: handleScan,
        enabled: true
    });

    const updatePhysicalStock = (id: string, value: number) => {
        setScannedItems(prev => prev.map(item => {
            if (item.id === id) {
                const physicalStock = isNaN(value) ? 0 : value;
                return {
                    ...item,
                    physicalStock,
                    variation: physicalStock - item.recordedStock
                };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setScannedItems(prev => prev.filter(item => item.id !== id));
    };

    const clearAll = () => {
        if (confirm("Clear all scanned items?")) {
            setScannedItems([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 px-6 py-4 rounded-3xl">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center animate-pulse">
                        <Scan className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black italic text-lg leading-tight">Barcode Scanner Active</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            Scan items to add them to the stock take report
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={clearAll}
                        disabled={scannedItems.length === 0}
                        className="h-14 px-8 bg-muted hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all border border-border flex items-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Reset List
                    </button>
                    {/* Placeholder for saving/submitting stock take */}
                    <button
                        onClick={handleCompleteStockTake}
                        disabled={scannedItems.length === 0}
                        className="h-14 px-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <FileDown className="w-4 h-4" />
                        Complete Stock Take
                    </button>
                </div>
            </div>

            {/* Manual Entry Section */}
            <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative z-50">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search product by name, SKU or barcode to add manually..."
                            value={productSearch}
                            onChange={(e) => handleProductSearch(e.target.value)}
                            className="w-full h-14 pl-12 pr-6 bg-muted/30 border border-border rounded-2xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />

                        {productResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {productResults.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addProductManually(product)}
                                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 group"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black">
                                                {product.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm group-hover:text-primary transition-colors">{product.name}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase">{product.sku} | {product.barcode}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground">Stock: {product.stock}</span>
                                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {scannedItems.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-border p-20 rounded-[3rem] flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-muted/30 rounded-[2rem] flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-muted-foreground opacity-40" />
                    </div>
                    <h4 className="text-2xl font-black italic mb-2 tracking-tight">Ready for Scanning</h4>
                    <p className="text-sm text-muted-foreground max-w-sm font-medium">
                        The system is listening for barcode scanner input. Scan any item to start comparing recorded vs physical stock.
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Initial Stock</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Items Sold</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Recorded Stock</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Physical Stock</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Variation</th>
                                    <th className="px-8 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {scannedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black">
                                                    {item.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{item.name}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{item.barcode}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center font-bold">{item.initialStock}</td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase">
                                                {item.totalSold} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center font-bold text-primary">{item.recordedStock}</td>
                                        <td className="px-6 py-6 text-center">
                                            <input
                                                type="number"
                                                value={item.physicalStock}
                                                onChange={(e) => updatePhysicalStock(item.id, parseInt(e.target.value))}
                                                className="w-20 h-10 bg-muted/50 border border-border rounded-xl text-center font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 mx-auto w-fit ${item.variation === 0
                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                : item.variation > 0
                                                    ? 'bg-blue-500/10 text-blue-600'
                                                    : 'bg-rose-500/10 text-rose-600'
                                                }`}>
                                                <ArrowRightLeft className="w-3 h-3" />
                                                {item.variation > 0 ? '+' : ''}{item.variation}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2.5rem] flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h5 className="text-sm font-black italic text-blue-900/80">Understanding Variations</h5>
                    <p className="text-xs font-medium text-blue-700/70 leading-relaxed italic">
                        Recorded stock is calculated based on initial stock and processed sales.
                        A <span className="text-rose-600 font-bold">negative variation</span> means physical stock is missing, while a
                        <span className="text-blue-600 font-bold"> positive variation</span> indicates extra items found that aren't in system records.
                    </p>
                </div>
            </div>
            {MessageComponent}
        </div>
    );
}
