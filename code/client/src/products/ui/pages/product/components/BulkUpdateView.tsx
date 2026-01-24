"use client";

import React, { useState, useEffect } from 'react';
import { Product } from '../../../../types';
import { Save, Loader2, RefreshCw, AlertCircle, CheckCircle2, Search, Table, FileUp } from 'lucide-react';
import { updateProductAction } from '../../../../api/controller';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { mapSpreadsheetHeaders } from '../../../../../shared/utils/spreadsheet';

interface BulkUpdateViewProps {
    products: Product[];
    onComplete: () => void;
}

export const BulkUpdateView: React.FC<BulkUpdateViewProps> = ({ products, onComplete }) => {
    const [localData, setLocalData] = useState<any[]>([]);
    const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalData(products.map(p => ({
            id: p.id,
            name: p.name,
            sellingPrice: p.sellingPrice,
            costPrice: p.costPrice,
            stock: p.stock,
            minStock: p.minStock,
            barcode: p.barcode || ''
        })));
    }, [products]);

    const handleFieldChange = (id: string, field: string, value: any) => {
        setLocalData(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value };
            }
            return p;
        }));
        setChangedIds(prev => new Set(prev).add(id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        let success = 0;
        let failed = 0;

        for (const id of Array.from(changedIds)) {
            const item = localData.find(p => p.id === id);
            if (!item) continue;

            try {
                const formData = new FormData();
                if (item.sellingPrice !== undefined) formData.append('sellingPrice', item.sellingPrice.toString());
                if (item.costPrice !== undefined) formData.append('costPrice', item.costPrice.toString());
                if (item.stock !== undefined) formData.append('stock', item.stock.toString());
                if (item.minStock !== undefined) formData.append('minStock', item.minStock.toString());
                if (item.barcode !== undefined) formData.append('barcode', item.barcode);
                if (item.sku !== undefined) formData.append('sku', item.sku);

                const res = await updateProductAction(id, formData);
                if (res.success) success++;
                else failed++;
            } catch (e) {
                failed++;
            }
        }

        setIsSaving(false);
        setChangedIds(new Set());
        if (success > 0) onComplete();
    };

    const handleFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const processData = (csvData: any[]) => {
            const newChangedIds = new Set(changedIds);

            setLocalData(prev => prev.map(p => {
                const match = csvData.find((row: any) =>
                    (row.ID && p.id === row.ID) ||
                    (row.sku && p.sku === row.sku) ||
                    (row.barcode && p.barcode === row.barcode)
                ) as any;

                if (match) {
                    newChangedIds.add(p.id);
                    return {
                        ...p,
                        sellingPrice: match.sellingPrice !== undefined ? Number(match.sellingPrice) : p.sellingPrice,
                        costPrice: match.costPrice !== undefined ? Number(match.costPrice) : p.costPrice,
                        stock: match.stock !== undefined ? Number(match.stock) : p.stock,
                        minStock: match.minStock !== undefined ? Number(match.minStock) : p.minStock,
                        barcode: match.barcode !== undefined ? match.barcode : p.barcode,
                        sku: match.sku !== undefined ? match.sku : p.sku,
                    };
                }
                return p;
            }));
            setChangedIds(newChangedIds);
        };

        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processData(mapSpreadsheetHeaders(results.data));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            });
        } else {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const jsonData = XLSX.utils.sheet_to_json(ws);
                    processData(mapSpreadsheetHeaders(jsonData));
                } catch (err) {
                    console.error("Excel Update Error:", err);
                } finally {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };
            reader.readAsBinaryString(file);
        }
    };

    const filtered = localData.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery)
    );

    const inputClasses = "w-full bg-transparent outline-none border-b border-transparent focus:border-primary text-xs font-bold font-mono transition-all";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-2 bg-muted/30 border border-border rounded-2xl">
                <div className="relative flex-1 group max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for quick updates..."
                        className="w-full h-11 pl-11 pr-4 bg-transparent outline-none text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border"
                    >
                        <FileUp className="w-4 h-4" />
                        Update via Spreadsheet
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpdate} accept=".csv, .xlsx, .xls" className="hidden" />

                    {changedIds.size > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl">
                            <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                            <span className="text-[10px] font-bold text-primary italic">{changedIds.size} Pending Changes</span>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || changedIds.size === 0}
                        className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Product Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[150px]">Selling (UGX)</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[150px]">Cost (UGX)</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[100px]">Stock</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[100px]">Min</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[180px]">Barcode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filtered.map((p) => (
                                <tr key={p.id} className={`transition-colors ${changedIds.has(p.id) ? 'bg-primary/5' : 'hover:bg-muted/10'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold truncate max-w-[250px]">{p.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono">ID: {p.id.slice(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={p.sellingPrice}
                                            onChange={(e) => handleFieldChange(p.id, 'sellingPrice', Number(e.target.value))}
                                            className={inputClasses}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={p.costPrice}
                                            onChange={(e) => handleFieldChange(p.id, 'costPrice', Number(e.target.value))}
                                            className={inputClasses}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={p.stock}
                                            onChange={(e) => handleFieldChange(p.id, 'stock', Number(e.target.value))}
                                            className={`${inputClasses} text-indigo-600`}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={p.minStock}
                                            onChange={(e) => handleFieldChange(p.id, 'minStock', Number(e.target.value))}
                                            className={`${inputClasses} text-rose-500`}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={p.barcode}
                                            placeholder="Paste barcode..."
                                            onChange={(e) => handleFieldChange(p.id, 'barcode', e.target.value)}
                                            className={inputClasses}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
