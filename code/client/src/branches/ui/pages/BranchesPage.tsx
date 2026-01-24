"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BranchList } from '../components/BranchList';
import { BranchForm } from '../components/BranchForm';
import { getBranchesAction, createBranchAction, updateBranchAction, deleteBranchAction } from '../../api/controller';
import { Branch } from '../../types';
import { Plus, Building2, LayoutGrid, List, Search, Loader2, X } from 'lucide-react';
import { useMessage } from '@/shared/ui/Message';

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

    const [activeType, setActiveType] = useState<'MAIN' | 'SUB' | null>(null);

    const fetchBranches = useCallback(async () => {
        setIsLoading(true);
        const res = await getBranchesAction();
        if (res.success) {
            setBranches(res.data || []);
            setActiveType(res.activeType as any);
        } else {
            showMessage('error', res.error || 'Failed to fetch branches');
        }
        setIsLoading(false);
    }, [showMessage]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleCreate = async (data: Omit<Branch, 'id' | 'adminId'>) => {
        setIsSubmitting(true);
        const res = await createBranchAction(data);
        if (res.success) {
            showMessage('success', 'Branch created successfully');
            setIsFormOpen(false);
            fetchBranches();
        } else {
            showMessage('error', res.error || 'Failed to create branch');
        }
        setIsSubmitting(false);
    };

    const handleUpdate = async (data: any) => {
        if (!editingBranch) return;
        setIsSubmitting(true);
        const res = await updateBranchAction(editingBranch.id, data);
        if (res.success) {
            showMessage('success', 'Branch updated successfully');
            setEditingBranch(undefined);
            fetchBranches();
        } else {
            showMessage('error', res.error || 'Failed to update branch');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this branch? All associated data will be affected.')) return;
        const res = await deleteBranchAction(id);
        if (res.success) {
            showMessage('success', 'Branch deleted');
            fetchBranches();
        } else {
            showMessage('error', res.error || 'Failed to delete branch');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {MessageComponent}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Operations</h4>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground/90">
                        Branch <span className="text-primary italic">Network</span>
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium max-w-md">
                        Manage your store locations, set access controls, and monitor multi-branch data isolation.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {activeType === 'MAIN' && (
                        <button
                            onClick={() => {
                                setEditingBranch(undefined);
                                setIsFormOpen(true);
                            }}
                            className="h-12 px-6 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Branch
                        </button>
                    )}
                </div>
            </div>

            {/* Stats/Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-6 rounded-[2rem] space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Branches</p>
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-black">{branches.length}</span>
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 bg-card border border-border rounded-[2.5rem]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Network...</p>
                </div>
            ) : (
                <BranchList
                    branches={branches}
                    onEdit={(b) => {
                        setEditingBranch(b);
                        setIsFormOpen(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black italic tracking-tight">
                                        {editingBranch ? 'Edit' : 'Create'} <span className="text-primary">Branch</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Branch Configuration
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setEditingBranch(undefined);
                                    }}
                                    className="p-2 hover:bg-muted rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <BranchForm
                                initialData={editingBranch}
                                onSubmit={editingBranch ? handleUpdate : handleCreate}
                                onCancel={() => {
                                    setIsFormOpen(false);
                                    setEditingBranch(undefined);
                                }}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

