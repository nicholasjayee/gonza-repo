"use client";

import React, { useState } from 'react';
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

    // Reset password when modal opens/closes - Handled by parent conditional rendering now
    // useEffect(() => {
    //     if (!isOpen) {
    //         setPassword('');
    //         setError('');
    //     }
    // }, [isOpen]);

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
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card border border-border rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary mb-2">
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
                                className="w-full h-14 text-center text-2xl tracking-widest font-black rounded-xl bg-muted/50 border border-border focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-muted-foreground/20"
                            />
                            {error && (
                                <p className="text-[11px] font-bold text-destructive animate-in slide-in-from-top-1">
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
                                className="h-12 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
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
