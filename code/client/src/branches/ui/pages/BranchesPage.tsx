import React from 'react';
import { getBranchesAction } from '../../api/controller';
import { BranchesClient } from '../components/BranchesClient';

export default async function BranchesPage() {
    const res = await getBranchesAction();
    const initialBranches = res.success ? res.data || [] : [];
    const activeType = res.activeType as 'MAIN' | 'SUB' | null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BranchesClient initialBranches={initialBranches} activeType={activeType} />
        </div>
    );
}

