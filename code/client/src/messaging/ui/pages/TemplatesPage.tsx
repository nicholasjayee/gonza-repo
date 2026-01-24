"use client";

import React, { useState, useEffect } from 'react';
import { getTemplatesAction, deleteTemplateAction } from '../../api/controller';
import { MessageTemplate } from '../../types';
import { FileText, Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { TemplateFormModal } from '../components/TemplateFormModal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const userDataStr = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='))
            ?.split('=')[1];

        if (userDataStr) {
            try {
                const decodedData = decodeURIComponent(userDataStr);
                const user = JSON.parse(decodedData);
                setUserId(user.id);
            } catch (error) {
                console.error('Error parsing userData cookie:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (userId) fetchTemplates();
    }, [userId]);

    const fetchTemplates = async () => {
        if (!userId) return;
        setIsLoading(true);
        const res = await getTemplatesAction(userId);
        if (res.success) setTemplates(res.data || []);
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteTemplateAction(templateToDelete.id);
            if (res.success) {
                setTemplates(templates.filter(t => t.id !== templateToDelete.id));
                setTemplateToDelete(null);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 border-b border-border pb-6 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
                        <FileText className="w-3 h-3" />
                        Messaging Module
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Message Templates</h2>
                    <p className="text-sm text-muted-foreground">Create and reuse messages to save time.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedTemplate(null);
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </button>
            </header>

            <div className="flex items-center gap-4 mb-8 p-2 bg-muted/20 border border-border rounded-2xl shadow-inner-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        className="w-full h-12 bg-transparent pl-12 pr-4 outline-none text-sm font-medium"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && templates.length === 0 ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-[2rem] p-6 animate-pulse space-y-4">
                            <div className="h-6 bg-muted rounded-xl w-3/4"></div>
                            <div className="h-20 bg-muted rounded-xl w-full"></div>
                        </div>
                    ))
                ) : filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                        <div key={template.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-base tracking-tight text-foreground">{template.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                        Last updated {new Date(template.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setTemplateToDelete(template)}
                                        className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-2xl p-4 flex-1 mb-4">
                                <p className="text-xs text-muted-foreground line-clamp-5 font-medium leading-relaxed italic">
                                    "{template.content}"
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                <span>{template.content.length} characters</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    Reusable
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-card border border-border rounded-[3rem]">
                        <div className="flex flex-col items-center gap-4 opacity-30 italic">
                            <FileText className="w-16 h-16" />
                            <div>
                                <p className="text-lg font-black uppercase tracking-[0.2em] mb-1">No Templates found</p>
                                <p className="text-sm font-medium">Create your first template to get started.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {userId && (
                <TemplateFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchTemplates}
                    initialData={selectedTemplate || undefined}
                    userId={userId}
                />
            )}

            <ConfirmDialog
                isOpen={!!templateToDelete}
                title="Delete Template?"
                description={`This will permanently remove the "${templateToDelete?.name}" template.`}
                confirmText="Delete Template"
                onConfirm={handleDelete}
                onCancel={() => setTemplateToDelete(null)}
                isLoading={isDeleting}
            />
        </div>
    );
}
