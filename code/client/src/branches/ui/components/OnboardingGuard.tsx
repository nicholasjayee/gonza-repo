"use client";

import React, { useEffect, useState } from 'react';
import { getBranchesAction, switchBranchAction } from '../../api/controller';
import { useRouter, usePathname } from 'next/navigation';
import { BranchPasswordModal } from './BranchPasswordModal';
import { Branch } from '../../types';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const [isChecking, setIsChecking] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [passwordPrompt, setPasswordPrompt] = useState<{ isOpen: boolean; branch?: Branch }>({ isOpen: false });
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const checkBranches = async () => {
            // Already on setup or branches page? Don't redirect loop.
            if (pathname?.includes('/branches/setup')) {
                setIsChecking(false);
                return;
            }

            const res = await getBranchesAction();
            if (res.success && res.data && res.data.length === 0) {
                router.push('/branches/setup');
            } else {
                // Check if we need to enforce password on initial login or new session
                const activeId = res.activeId;
                const isVerified = res.isVerified;
                const branches = res.data || [];

                // MANDATORY VERIFICATION: If not verified in this session, find the branch to prompt for
                if (!isVerified && branches.length > 0) {
                    // 1. Try last active branch (Intent)
                    // 2. Try User's assigned branch (to be implemented later if needed)
                    // 3. Try MAIN branch
                    // 4. Try first branch
                    const branchToUnlock = branches.find((b: Branch) => b.id === activeId)
                        || branches.find((b: Branch) => b.type === 'MAIN')
                        || branches[0];

                if (branchToUnlock.accessPassword) {
                        setPasswordPrompt({ isOpen: true, branch: branchToUnlock });
                        return;
                    } else {
                        // Auto-select/verify if no password is required
                        await switchBranchAction(branchToUnlock.id, branchToUnlock.type);
                        // Refresh to ensure cookies are picked up by server components immediately if needed
                         router.refresh(); 
                    }
                }

                setIsChecking(false);
            }
        };

        checkBranches();
    }, [pathname, router, mounted]);

    const handlePasswordSuccess = async () => {
        if (passwordPrompt.branch) {
            // Explicitly set this branch as active now that password is verified
            await switchBranchAction(passwordPrompt.branch.id, passwordPrompt.branch.type);
            setPasswordPrompt({ isOpen: false });
            setIsChecking(false);
            router.refresh();
        }
    };

    if (!mounted) return null;

    if (passwordPrompt.isOpen && passwordPrompt.branch) {
        return (
            <>
                <div className="fixed inset-0 z-100 bg-background flex flex-col items-center justify-center gap-4 filter blur-sm">
                    {/* Background blurred or blocked */}
                </div>
                <div className="fixed inset-0 z-101 flex items-center justify-center p-4">
                    <BranchPasswordModal
                        isOpen={true}
                        // Don't allow closing - must enter password or logout (reload)
                        onClose={() => { }}
                        onSuccess={handlePasswordSuccess}
                        branchId={passwordPrompt.branch.id}
                        branchName={passwordPrompt.branch.name}
                    />
                </div>
            </>
        );
    }

    if (isChecking) {
        return (
            <div className="fixed inset-0 z-100 bg-background flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                    Authenticating Environment...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
