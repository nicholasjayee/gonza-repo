"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, FileText, Type } from 'lucide-react';
import { MessageTemplate, CreateTemplateInput } from '../../types';
import { createTemplateAction, updateTemplateAction } from '../../api/controller';
import { useMessage } from '@/shared/ui/Message';

interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (template: MessageTemplate) => void;
    initialData?: MessageTemplate;
    userId: string;
}

export function TemplateFormModal({ isOpen, onClose, onSuccess, initialData, userId }: TemplateFormModalProps) {
    const { showMessage, MessageComponent } = useMessage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEdit = !!initialData;

    const [formData, setFormData] = useState<CreateTemplateInput>({
        name: '',
        content: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                content: initialData.content
            });
        } else {
            setFormData({
                name: '',
                content: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = isEdit
                ? await updateTemplateAction(initialData!.id, formData)
                : await createTemplateAction(userId, formData);

            if (res.success && res.data) {
                showMessage('success', `Template ${isEdit ? 'updated' : 'created'} successfully!`);
                onSuccess(res.data as MessageTemplate);
                setTimeout(onClose, 800);
            } else {
                showMessage('error', res.error || `Failed to ${isEdit ? 'update' : 'create'} template`);
            }
        } catch (error) {
            console.error(error);
            showMessage('error', 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-card border border-border rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
                                <FileText className="w-3 h-3" />
                                {isEdit ? 'Update Template' : 'New Template'}
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {isEdit ? 'Edit Template' : 'Add Template'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {MessageComponent}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1.5 block px-1">Template Name</label>
                            <div className="relative">
                                <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-4 pl-11 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-bold"
                                    placeholder="e.g., Welcome Message"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1.5 block px-1">Message Content</label>
                            <div className="relative">
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full h-40 px-4 py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium resize-none"
                                    placeholder="Type your template message here..."
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground px-1 italic">
                                Tip: Keep it concise for better engagement.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-12 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] h-12 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> {isEdit ? 'Update' : 'Save'} Template</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
