"use client";

import React, { useState, useRef } from 'react';
import { FileUp, Trash2, CheckCircle2, AlertCircle, Loader2, Table, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { mapSpreadsheetHeaders } from '@/shared/utils/spreadsheet';

interface RequisitionBulkUploadViewProps {
    onItemsAdded: (items: any[]) => void;
    onClose: () => void;
}

export const RequisitionBulkUploadView: React.FC<RequisitionBulkUploadViewProps> = ({ onItemsAdded, onClose }) => {
    const [data, setData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(ws);

                const mappedData = mapSpreadsheetHeaders(jsonData);
                const importedItems = mappedData.map((row: any) => ({
                    productName: row.name || row.productName || 'Unknown Product',
                    sku: row.sku || '',
                    quantity: parseInt(row.stock || row.quantity) || 1
                }));

                setData(importedItems);
                setIsParsing(false);
            } catch (err) {
                console.error("Parse Error:", err);
                setIsParsing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleMerge = () => {
        onItemsAdded(data);
        onClose();
    };

    const downloadTemplate = () => {
        const headers = ["Product Name", "SKU", "Quantity"];
        const rows = [
            ["Example Product", "SKU123", "10"],
            ["Another Product", "SKU456", "5"]
        ];

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "requisition_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-border flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <FileUp className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Bulk Requisition Loader</span>
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tight text-foreground">Preview & Merge Request</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border"
                        >
                            <Download className="w-4 h-4" />
                            Download Template
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {data.length === 0 ? (
                        <div
                            className="border-2 border-dashed border-border rounded-[2rem] p-12 text-center group hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="h-20 w-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                                {isParsing ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <FileUp className="w-10 h-10 text-muted-foreground group-hover:text-primary" />}
                            </div>
                            <h3 className="text-lg font-bold mb-2">Drop your Requisition file here</h3>
                            <p className="text-sm text-muted-foreground italic mb-6">Excel or CSV files are supported</p>
                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                                Select File
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls" className="hidden" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center font-black">
                                        {data.length}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black italic">Items detected in file</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Verify and click "Merge Items" to add to request</p>
                                    </div>
                                </div>
                                <button onClick={() => setData([])} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="border border-border rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto shadow-inner">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-background border-b border-border z-10">
                                        <tr className="bg-muted/30">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">SKU</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {data.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-foreground">{row.productName}</td>
                                                <td className="px-6 py-4 text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{row.sku}</td>
                                                <td className="px-6 py-4 text-xs font-black text-center">{row.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMerge}
                                    className="px-8 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Merge Items into Requisition
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
