"use client";

import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, Check } from 'lucide-react';
import Papa from 'papaparse';
import { read, utils } from 'xlsx';
import { uploadBulkExpensesAction, bulkUpdateExpensesAction, bulkDeleteExpensesAction } from '@/expenses/api/controller';
import { useMessage } from '@/shared/ui/Message';

interface BulkExpenseUploadProps {
    mode: 'import' | 'update' | 'delete';
    onSuccess: () => void;
    onCancel: () => void;
}

export const BulkExpenseUpload: React.FC<BulkExpenseUploadProps> = ({ mode, onSuccess, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

    const processData = (data: any[]) => {
        // Fix for serialization error: Ensure all items are plain objects
        // This strips any prototypes or hidden methods from library outputs (PapaParse/XLSX)
        const sanitized = data.map(item => {
            const normalized: any = {};
            Object.keys(item).forEach(key => {
                normalized[key.toLowerCase()] = item[key];
            });
            return normalized;
        });

        setParsedData(sanitized);
        setPreview(sanitized.slice(0, 5));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);

            const fileExt = selected.name.split('.').pop()?.toLowerCase();

            if (fileExt === 'csv') {
                Papa.parse(selected, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        processData(results.data);
                    },
                    error: (error) => {
                        showMessage('error', 'Failed to parse CSV file');
                    }
                });
            } else if (fileExt === 'xlsx' || fileExt === 'xls') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = e.target?.result;
                    if (data) {
                        try {
                            const workbook = read(data, { type: 'array' });
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];
                            const json = utils.sheet_to_json(worksheet);
                            processData(json);
                        } catch (err) {
                            showMessage('error', 'Failed to parse Excel file');
                        }
                    }
                };
                reader.readAsArrayBuffer(selected);
            } else {
                showMessage('error', 'Unsupported file type. Please use CSV or Excel.');
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file || parsedData.length === 0) return;

        setIsUploading(true);

        console.log(`[BulkExpenseUpload] Mode: ${mode}`);
        console.log(`[BulkExpenseUpload] Data sample:`, parsedData.slice(0, 2));

        // Call appropriate action based on mode
        let res;
        if (mode === 'import') {
            console.log('[BulkExpenseUpload] Calling uploadBulkExpensesAction');
            res = await uploadBulkExpensesAction(parsedData);
        } else if (mode === 'update') {
            console.log('[BulkExpenseUpload] Calling bulkUpdateExpensesAction');
            res = await bulkUpdateExpensesAction(parsedData);
        } else {
            console.log('[BulkExpenseUpload] Calling bulkDeleteExpensesAction');
            res = await bulkDeleteExpensesAction(parsedData);
        }

        console.log('[BulkExpenseUpload] Response:', res);

        if (res.success) {
            const action = mode === 'import' ? 'imported' : mode === 'update' ? 'updated' : 'deleted';
            showMessage('success', `Successfully ${action} ${res.count} expenses`);
            setTimeout(() => onSuccess(), 1500);
        } else {
            showMessage('error', res.error || `${mode} failed`);
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {MessageComponent}

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/20 transition-colors relative">
                <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {file ? <FileSpreadsheet className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className="font-bold text-sm">
                            {file ? file.name : "Click to upload file"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV or Excel (.xlsx, .xls)"}
                        </p>
                    </div>
                </div>
            </div>

            {preview.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Preview (First 5) {mode === 'update' && '- ID Required'}
                    </h4>
                    <div className="space-y-2">
                        {preview.map((row: any, i) => (
                            <div key={i} className="text-xs p-2 bg-background rounded-lg border border-border">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        {row.id && <div className="font-mono text-[10px] text-blue-600 mb-1">ID: {row.id}</div>}
                                        {row.description && <div className="font-medium truncate">{row.description}</div>}
                                        {!row.description && row.id && <div className="text-muted-foreground italic">Updating record</div>}
                                    </div>
                                    <div className="flex gap-3 text-muted-foreground flex-shrink-0">
                                        {row.category && <span>{row.category}</span>}
                                        {row.amount && <span className="font-mono font-bold text-foreground">{row.amount}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isUploading}
                    className="flex-1 h-12 rounded-xl border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading || parsedData.length === 0}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Import {file ? "Expenses" : ""}
                        </>
                    )}
                </button>
            </div>

            <div className="flex justify-between items-center bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                <div className="text-[10px] text-muted-foreground">
                    <p className="font-bold mb-1 text-blue-600">Format Guide (CSV/Excel):</p>
                    <p>Required Headers: <code>amount</code>, <code>description</code>, <code>category</code>, <code>date</code></p>
                    <p className="mt-1 opacity-70">To update existing: include the <code>id</code> column.</p>
                </div>
                <button
                    onClick={() => {
                        const headers = "id,amount,description,category,date,paymentMethod,reference";
                        const example = ",50000,Office Supplies,Other,2024-01-24,Cash,REC-001";
                        const csvContent = "data:text/csv;charset=utf-8," + [headers, example].join('\n');
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "expenses_template.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                >
                    <FileSpreadsheet className="w-3 h-3" />
                    Download CSV Template
                </button>
            </div>
        </div>
    );
};
