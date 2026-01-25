"use client";

import React, { useState } from 'react';
import { switchBranchAction } from '../../api/controller';
import { useRouter } from 'next/navigation';
import { BranchPasswordModal } from './BranchPasswordModal';
import { Branch } from '../../types';

interface ClientOnboardingGuardProps {
    branchToUnlock: Branch;
}

export function ClientOnboardingGuard({ branchToUnlock }: ClientOnboardingGuardProps) {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const handlePasswordSuccess = async () => {
        // Explicitly set this branch as active now that password is verified
        await switchBranchAction(branchToUnlock.id, branchToUnlock.type);
        setIsOpen(false);
        router.refresh();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-100 bg-background flex flex-col items-center justify-center gap-4 filter blur-sm">
                {/* Background blurred or blocked */}
            </div>
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <BranchPasswordModal
                    isOpen={true}
                    // Don't allow closing - must enter password or logout (reload)
                    onClose={() => { }}
                    onSuccess={handlePasswordSuccess}
                    branchId={branchToUnlock.id}
                    branchName={branchToUnlock.name}
                />
            </div>
        </>
    );
}
