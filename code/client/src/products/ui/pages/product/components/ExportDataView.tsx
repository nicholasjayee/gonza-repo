"use client";

import React, { useState } from 'react';
import { Product } from '../../../../types';
import { FileText, Download, Printer, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportDataViewProps {
    products: Product[];
}

export const ExportDataView: React.FC<ExportDataViewProps> = ({ products }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [lastFormat, setLastFormat] = useState<'csv' | 'pdf' | null>(null);

    const handleCSVExport = () => {
        setIsExporting(true);
        setLastFormat('csv');

        const data = products.map(p => ({
            'ID': p.id,
            'Name': p.name,
            'Barcode': p.barcode || 'N/A',
            'SKU': p.sku || 'N/A',
            'Category': p.category?.name || 'Uncategorized',
            'Supplier': p.supplier?.name || 'N/A',
            'Cost Price': p.costPrice,
            'Selling Price': p.sellingPrice,
            'Stock': p.stock,
            'Min Stock': p.minStock,
            'Created At': new Date(p.createdAt).toLocaleDateString()
        }));

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setIsExporting(false), 1000);
    };

    const handlePDFExport = () => {
        setIsExporting(true);
        setLastFormat('pdf');

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text("Inventory Status Report", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Items: ${products.length}`, 14, 33);

        const tableBody = products.map((p, i) => [
            i + 1,
            p.name,
            p.barcode || '-',
            p.stock.toString(),
            `UGX ${p.sellingPrice.toLocaleString()}`,
            p.category?.name || '-'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['#', 'Product Name', 'Barcode', 'Stock', 'Price', 'Category']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { top: 40 },
        });

        doc.save(`inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);

        setTimeout(() => setIsExporting(false), 1000);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 bg-card border border-border rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Printer className="w-32 h-32 text-primary rotate-12" />
            </div>

            <div className="space-y-1 mb-8">
                <div className="flex items-center gap-2 text-primary">
                    <Download className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Data Hub</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight">Export Inventory</h1>
                <p className="text-muted-foreground text-sm">Download your product data for offline analysis or auditing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                {/* CSV Box */}
                <div
                    onClick={handleCSVExport}
                    className="group cursor-pointer p-8 bg-muted/30 border border-border rounded-3xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <FileText className="w-24 h-24" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Spreadsheet (CSV)</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                        Best for Excel, Google Sheets, or importing into other management systems.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <span>Generate CSV</span>
                        <Download className="w-3 h-3 transition-transform group-hover:translate-y-0.5" />
                    </div>
                </div>

                {/* PDF Box */}
                <div
                    onClick={handlePDFExport}
                    className="group cursor-pointer p-8 bg-muted/30 border border-border rounded-3xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Printer className="w-24 h-24" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <Printer className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Printable Report (PDF)</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                        Formatted document containing product names, barcodes, and current stock levels.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <span>Generate PDF</span>
                        <Download className="w-3 h-3 transition-transform group-hover:translate-y-0.5" />
                    </div>
                </div>
            </div>

            {isExporting && (
                <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center gap-3 animate-in zoom-in-95 duration-200">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <span className="text-xs font-bold text-primary italic">Preparing your {lastFormat?.toUpperCase()} file...</span>
                </div>
            )}

            {!isExporting && lastFormat && (
                <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600">Download complete!</span>
                </div>
            )}

            <div className="mt-12 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-indigo-900">Pro Feature: Custom Branding</h4>
                    <p className="text-[10px] text-indigo-700/70">Your store name and UGX currency are automatically applied to all PDF reports.</p>
                </div>
            </div>
        </div>
    );
};
