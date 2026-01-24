
"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    type = 'danger'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: 'bg-rose-600 hover:bg-rose-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        info: 'bg-primary hover:bg-primary/90'
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="w-full max-w-[360px] bg-card border border-border/50 rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 ease-out">
                <div className="text-center space-y-3 mb-8">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-2">
                        {description}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full py-3 text-sm font-bold text-white rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 ${typeStyles[type]}`}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}
