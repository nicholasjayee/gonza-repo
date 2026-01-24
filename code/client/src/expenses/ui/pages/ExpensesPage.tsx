"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/expenses/types';
import { getExpensesAction, deleteExpenseAction, deleteBulkExpensesAction, updateBulkExpensesAction } from '@/expenses/api/controller';
import { ExpenseList } from '../components/ExpenseList';
import { ExpenseFilters, ExpenseFiltersState } from '../components/ExpenseFilters';
import { ExpenseSummary } from '../components/ExpenseSummary';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseDetail } from '../components/ExpenseDetail';
import { BulkExpenseUpload } from '../components/BulkExpenseUpload';
import { useMessage } from '@/shared/ui/Message';
import { Plus, Download, FileSpreadsheet, Briefcase, Loader2, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

import { BranchFilter } from '@/shared/components/BranchFilter';

interface ExpensesPageProps {
    initialBranchType?: string;
    initialBranches?: { id: string; name: string }[];
}

export default function ExpensesPage({ initialBranchType, initialBranches = [] }: ExpensesPageProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [filters, setFilters] = useState<ExpenseFiltersState>({
        minAmount: 0,
        maxAmount: 0,
        startDate: '',
        endDate: '',
        category: '',
        datePreset: ''
    });

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'bulkImport' | 'bulkUpdate' | 'view' | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

    const { showMessage, MessageComponent } = useMessage();

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        // Clean filters
        const cleanFilters: any = {};
        if (filters.startDate) cleanFilters.startDate = filters.startDate;
        if (filters.endDate) cleanFilters.endDate = filters.endDate;
        if (filters.minAmount > 0) cleanFilters.minAmount = Number(filters.minAmount);
        if (filters.maxAmount > 0) cleanFilters.maxAmount = Number(filters.maxAmount);
        if (filters.category) cleanFilters.category = filters.category;
        if (selectedBranchId) cleanFilters.filterBranchId = selectedBranchId;

        const res = await getExpensesAction(cleanFilters);
        if (res.success) {
            setExpenses(res.data || []);
        } else {
            showMessage('error', res.error || 'Failed to fetch expenses');
        }
        setIsLoading(false);
    }, [filters, showMessage, selectedBranchId]);

    useEffect(() => {
        fetchExpenses();
    }, [filters.datePreset, filters.startDate, filters.endDate, filters.category, fetchExpenses]);
    // Trigger fetch on filter change

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        const res = await deleteExpenseAction(id);
        if (res.success) {
            showMessage('success', 'Expense deleted');
            fetchExpenses();
        } else {
            showMessage('error', res.error || 'Failed to delete expense');
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Expense Report", 14, 22);

        const tableData = expenses.map(e => [
            format(new Date(e.date), 'yyyy-MM-dd'),
            e.description,
            e.category,
            Number(e.amount).toLocaleString(),
            e.reference || '-'
        ]);

        autoTable(doc, {
            head: [['Date', 'Description', 'Category', 'Amount', 'Reference']],
            body: tableData,
            startY: 30,
        });

        doc.save(`expenses_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    };

    const handleExportCSV = () => {
        const headers = ["ID,Date,Description,Category,Amount,Reference"];
        const rows = expenses.map(e => [
            e.id,
            format(new Date(e.date), 'yyyy-MM-dd'),
            `"${e.description.replace(/"/g, '""')}"`,
            e.category,
            e.amount,
            e.reference || ''
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `expenses_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = (ids: string[]) => {
        setSelectedIds(ids);
    };

    const handleBulkDeleteSelected = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} expenses?`)) return;

        setIsLoading(true);
        const res = await deleteBulkExpensesAction(selectedIds);
        if (res.success) {
            showMessage('success', `${selectedIds.length} expenses deleted`);
            setSelectedIds([]);
            fetchExpenses();
        } else {
            showMessage('error', res.error || 'Failed to delete expenses');
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-20">
            {MessageComponent}

            {/* Header & Actions Toolbar */}
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Finance</h4>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground/90">
                        Expense <span className="text-primary italic">Tracking</span>
                    </h1>
                </div>

                <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center bg-card p-2 rounded-3xl border border-border shadow-sm">
                    {/* Branch Filter for Main Branches */}
                    <div className="flex items-center gap-2 px-2">
                        {initialBranchType === 'MAIN' && initialBranches.length > 0 && (
                            <BranchFilter
                                branches={initialBranches}
                                selectedBranchId={selectedBranchId}
                                onBranchChange={setSelectedBranchId}
                            />
                        )}
                    </div>

                    {/* Global Actions Group */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <button
                            onClick={handleExportCSV}
                            className="h-10 px-4 bg-background border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                            title="Export CSV"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="h-10 px-4 bg-background border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                            title="Export PDF"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                            onClick={() => { setModalMode('bulkImport'); }}
                            className="h-10 px-5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Import
                        </button>
                        <button
                            onClick={() => { setModalMode('bulkUpdate'); }}
                            className="h-10 px-5 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Update
                        </button>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDeleteSelected}
                                className="h-10 px-5 bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap animate-in fade-in slide-in-from-right-2"
                            >
                                <X className="w-4 h-4" />
                                Delete ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => { setEditingExpense(undefined); setModalMode('create'); }}
                            className="h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            New Expense
                        </button>
                    </div>
                </div>
            </div>

            <ExpenseSummary expenses={expenses} />

            <ExpenseFilters
                filters={filters}
                onChange={(f) => setFilters(f)}
                onClear={() => setFilters({ minAmount: 0, maxAmount: 0, startDate: '', endDate: '', category: '', datePreset: '' })}
            />

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 bg-card border border-border rounded-[2.5rem]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Expenses...</p>
                </div>
            ) : (
                <ExpenseList
                    expenses={expenses}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onSelectAll={handleSelectAll}
                    onEdit={(e) => { setEditingExpense(e); setModalMode('edit'); }}
                    onView={(e) => { setEditingExpense(e); setModalMode('view'); }}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal Overlay */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black italic tracking-tight">
                                    {modalMode === 'bulkImport' ? 'Bulk Import' :
                                        modalMode === 'bulkUpdate' ? 'Bulk Update' :
                                            modalMode === 'edit' ? 'Edit Expense' :
                                                modalMode === 'view' ? 'Expense Details' : 'New Expense'}
                                </h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {modalMode === 'bulkImport' ? 'Import New Records from CSV/Excel' :
                                        modalMode === 'bulkUpdate' ? 'Update Existing Records by ID' :
                                            modalMode === 'view' ? 'Transaction Information' : 'Financial Record'}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalMode(null)}
                                className="p-2 hover:bg-muted rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            {(modalMode === 'bulkImport' || modalMode === 'bulkUpdate') ? (
                                <BulkExpenseUpload
                                    mode={modalMode === 'bulkImport' ? 'import' : 'update'}
                                    onSuccess={() => { setModalMode(null); fetchExpenses(); }}
                                    onCancel={() => setModalMode(null)}
                                />
                            ) : modalMode === 'create' || modalMode === 'edit' ? (
                                <ExpenseForm
                                    initialData={editingExpense}
                                    onSuccess={() => { setModalMode(null); fetchExpenses(); }}
                                    onCancel={() => setModalMode(null)}
                                />
                            ) : (
                                <ExpenseDetail
                                    expense={editingExpense!}
                                    onClose={() => setModalMode(null)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
