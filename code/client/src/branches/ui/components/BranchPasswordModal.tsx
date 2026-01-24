"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { verifyBranchPasswordAction } from '../../api/controller';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

interface BranchPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    branchId: string;
    branchName: string;
}

export function BranchPasswordModal({ isOpen, onClose, onSuccess, branchId, branchName }: BranchPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset password when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const res = await verifyBranchPasswordAction(branchId, password);

        if (res.success && res.isValid) {
            onSuccess();
            onClose();
        } else {
            setError('Incorrect password. Access denied.');
        }

        setIsLoading(false);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground">
                            Restricted Access
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground mt-2">
                            Enter the access password for <br />
                            <span className="text-foreground font-bold">{branchName}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoFocus
                                autoComplete="new-password"
                                className="w-full h-14 text-center text-2xl tracking-widest font-black rounded-xl bg-muted/50 border border-border focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-muted-foreground/20"
                            />
                            {error && (
                                <p className="text-[11px] font-bold text-red-500 animate-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-12 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !password}
                                className="h-12 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Unlock <ArrowRight className="w-3 h-3" /></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
