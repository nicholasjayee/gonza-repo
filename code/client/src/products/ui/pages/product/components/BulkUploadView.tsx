"use client";

import React, { useState, useRef } from 'react';
import { FileUp, Trash2, CheckCircle2, AlertCircle, Loader2, Table, Download } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { createProductAction, updateProductAction } from '../../../../api/controller';
import { Product } from '../../../../types';
import { mapSpreadsheetHeaders } from '../../../../../shared/utils/spreadsheet';

interface BulkUploadViewProps {
    products: Product[];
    onComplete: () => void;
}

export const BulkUploadView: React.FC<BulkUploadViewProps> = ({ products, onComplete }) => {
    const [data, setData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: number, failed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const reader = new FileReader();

        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setData(mapSpreadsheetHeaders(results.data));
                    setIsParsing(false);
                    setResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
                error: (err) => {
                    console.error("CSV Parse Error:", err);
                    setIsParsing(false);
                }
            });
        } else {
            // Excel Handling
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const jsonData = XLSX.utils.sheet_to_json(ws);
                    setData(mapSpreadsheetHeaders(jsonData));
                    setIsParsing(false);
                    setResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                } catch (err) {
                    console.error("Excel Parse Error:", err);
                    setIsParsing(false);
                }
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleCommit = async () => {
        setIsSubmitting(true);
        let successCount = 0;
        let failedCount = 0;

        for (const item of data) {
            try {
                // Determine if it's an update or create
                const existing = products.find(p =>
                    (item.ID && p.id === item.ID) ||
                    (item.sku && p.sku === item.sku) ||
                    (item.barcode && p.barcode === item.barcode)
                );

                const formData = new FormData();
                if (item.name) formData.append('name', item.name);
                if (item.sellingPrice !== undefined && item.sellingPrice !== null) formData.append('sellingPrice', item.sellingPrice);
                if (item.costPrice !== undefined && item.costPrice !== null) formData.append('costPrice', item.costPrice);
                if (item.stock !== undefined && item.stock !== null) formData.append('stock', item.stock);
                if (item.barcode) formData.append('barcode', String(item.barcode));
                if (item.sku) formData.append('sku', String(item.sku));
                if (item.description) formData.append('description', item.description);

                let res;
                if (existing) {
                    res = await updateProductAction(existing.id, formData);
                } else {
                    // For new products, use initialStock
                    if (item.stock !== undefined && item.stock !== null) formData.append('initialStock', item.stock);
                    res = await createProductAction(formData);
                }

                if (res.success) successCount++;
                else failedCount++;
            } catch (e) {
                failedCount++;
            }
        }

        setResult({ success: successCount, failed: failedCount });
        setIsSubmitting(false);
        if (successCount > 0) {
            setTimeout(() => onComplete(), 2000);
        }
    };

    const clear = () => {
        setData([]);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadTemplate = () => {
        const headers = ['name', 'sellingPrice', 'costPrice', 'stock', 'description'];
        const sampleRow = ['Sample Product', '10000', '5000', '50', 'A premium samples product'];
        const csv = Papa.unparse([headers, sampleRow]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'gonza_upload_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <FileUp className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Bulk Loader</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Spreadsheet Batch Upload</h1>
                        <p className="text-muted-foreground text-sm">Upload an Excel or CSV file to create or update multiple products at once.</p>
                    </div>
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border"
                    >
                        <Download className="w-4 h-4" />
                        Download Template (CSV)
                    </button>
                </div>

                {data.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-[2rem] p-12 text-center group hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <div className="h-20 w-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                            <FileUp className="w-10 h-10 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Drop your Excel/CSV here</h3>
                        <p className="text-sm text-muted-foreground italic mb-6">Or click to browse files from your computer</p>
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                            Select File
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls" className="hidden" />
                        <div className="mt-8 grid grid-cols-3 gap-8 text-left max-w-2xl mx-auto border-t border-border/50 pt-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">Requirements</h4>
                                <p className="text-[9px] text-muted-foreground leading-relaxed">Headers: <b className="text-foreground">name, sellingPrice, costPrice</b> are essential for new products.</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">Smart Tracking</h4>
                                <p className="text-[9px] text-muted-foreground leading-relaxed">System automatically generates unique <b className="text-foreground">Barcodes and SKUs</b> for every new item.</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">Existing Items</h4>
                                <p className="text-[9px] text-muted-foreground leading-relaxed">Include the <b className="text-foreground">ID</b> in your file to update existing products instead of creating new ones.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center font-black">
                                    {data.length}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black italic">Rows detected in file</h4>
                                    <p className="text-[10px] text-muted-foreground">Verify the data below before clicking Commit.</p>
                                </div>
                            </div>
                            <button onClick={clear} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="border border-border rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-background border-b border-border z-10">
                                    <tr>
                                        {Object.keys(data[0] || {}).map(key => (
                                            <th key={key} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {data.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-muted/10">
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="px-4 py-3 text-xs font-medium truncate max-w-[150px]">{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    {data.length > 10 && (
                                        <tr className="bg-muted/5">
                                            <td colSpan={Object.keys(data[0]).length} className="px-4 py-2 text-center text-[10px] font-bold text-muted-foreground">
                                                + {data.length - 10} more rows...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6">
                            <button
                                onClick={handleCommit}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Commit Batch Entry
                            </button>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="mt-8 p-6 rounded-3xl border animate-in slide-in-from-bottom-2 duration-300 grid grid-cols-2 gap-6 bg-background">
                        <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                            <span className="text-3xl font-black text-emerald-600">{result.success}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 font-mono">Successfully Created</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                            <span className="text-3xl font-black text-rose-600">{result.failed}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600/60 font-mono">Entries Failed</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
