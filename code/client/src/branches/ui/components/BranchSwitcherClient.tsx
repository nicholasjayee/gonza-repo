"use client";

import React, { useState } from 'react';
import { Branch } from '../../types';
import { switchBranchAction } from '../../api/controller';
import { Building2, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BranchPasswordModal } from './BranchPasswordModal';

interface BranchSwitcherClientProps {
    branches: Branch[];
    activeDetails?: Branch;
}

export function BranchSwitcherClient({ branches, activeDetails }: BranchSwitcherClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; branch?: Branch }>({ isOpen: false });
    const router = useRouter();

    const activeBranch = activeDetails || branches[0];

    const performSwitch = async (branchId: string, type: 'MAIN' | 'SUB') => {
        setIsSwitching(true);
        const res = await switchBranchAction(branchId, type);
        if (res.success) {
            router.refresh();
        }
        setIsSwitching(false);
    };

    const handleSwitch = async (branch: Branch) => {
        setIsOpen(false);
        if (branch.id === activeBranch?.id) return;

        // If branch has a password, verify it first
        // NOTE: In a real app, we might check if the user is the Admin owner to skip this,
        // but for now, we enforce it if the password exists.
        if (branch.accessPassword) {
            setPasswordModal({ isOpen: true, branch });
            return;
        }

        await performSwitch(branch.id, branch.type);
    };

    return (
        <div className="relative">
            <BranchPasswordModal
                isOpen={passwordModal.isOpen}
                onClose={() => setPasswordModal({ isOpen: false })}
                onSuccess={() => {
                    if (passwordModal.branch) {
                        performSwitch(passwordModal.branch.id, passwordModal.branch.type);
                    }
                }}
                branchId={passwordModal.branch?.id || ''}
                branchName={passwordModal.branch?.name || ''}
            />

            <button
                disabled={isSwitching}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-card border border-border hover:border-primary/20 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                        {isSwitching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">
                            {activeBranch?.type === 'MAIN' ? 'HQ View' : 'Branch View'}
                        </p>
                        <p className="text-xs font-bold truncate text-foreground leading-tight">
                            {activeBranch?.name || "Select Branch"}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-1 max-h-64 overflow-y-auto space-y-0.5">
                            {branches.map(branch => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleSwitch(branch)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${branch.id === activeBranch?.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${branch.type === 'MAIN' ? 'bg-primary' : 'bg-orange-400'}`} />
                                        <span className="truncate max-w-[130px]">{branch.name}</span>
                                    </div>
                                    {branch.id === activeBranch?.id && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
