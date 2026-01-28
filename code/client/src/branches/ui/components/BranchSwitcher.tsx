"use server";

import React from 'react';
import { getBranchesAction } from '../../api/controller';
import { getActiveBranch } from '../../api/branchContext';
import { BranchSwitcherClient } from './BranchSwitcherClient';
import { Building2 } from 'lucide-react';

export async function BranchSwitcher() {
    const { success, data: branches } = await getBranchesAction();
    const { branchId: activeId } = await getActiveBranch();

    // If fetch failed or no branches, show fallback
    if (!success || !branches || branches.length === 0) {
        return (
            <div className="px-3 py-2 opacity-50">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No Branches</span>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 mb-4">
            <BranchSwitcherClient
                branches={branches}
                activeDetails={branches.find(b => b.id === activeId)}
            />
        </div>
    );
}
