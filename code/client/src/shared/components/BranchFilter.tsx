"use client";

import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';

interface Branch {
    id: string;
    name: string;
}

interface BranchFilterProps {
    branches: Branch[];
    selectedBranchId: string | null;
    onBranchChange: (branchId: string | null) => void;
    label?: string;
}

export function BranchFilter({ branches, selectedBranchId, onBranchChange, label = "Branch Filter:" }: BranchFilterProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>

            <div className="relative flex-1 sm:flex-initial">
                <select
                    value={selectedBranchId || ''}
                    onChange={(e) => onBranchChange(e.target.value || null)}
                    className="h-10 w-full sm:w-auto pl-4 pr-10 bg-card border border-border rounded-xl font-medium text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:bg-muted/50"
                >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    );
}
