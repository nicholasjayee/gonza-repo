"use client";

import React from 'react';
import { Branch } from '../../types';
import { MapPin, Phone, Mail, Shield, Building2, ChevronRight, Lock, Unlock, MoreVertical } from 'lucide-react';

interface BranchListProps {
    branches: Branch[];
    onEdit: (branch: Branch) => void;
    onDelete: (id: string) => void;
}

export function BranchList({ branches, onEdit, onDelete }: BranchListProps) {
    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Branch Info</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location & Contact</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hierarchy</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {branches.map((branch) => (
                            <tr key={branch.id} className="hover:bg-muted/10 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-2xl ${branch.type === 'MAIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                {branch.name}
                                                {branch.accessPassword ? <Lock className="w-3 h-3 text-secondary" /> : <Unlock className="w-3 h-3 text-primary" />}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground font-medium">ID: {branch.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{branch.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                                            {branch.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {branch.phone}</span>}
                                            {branch.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {branch.email}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${branch.type === 'MAIN'
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-muted/50 text-muted-foreground border border-border'
                                        }`}>
                                        {branch.type} BRANCH
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(branch)}
                                            className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-primary transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(branch.id)}
                                            className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-all"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {branches.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/30 mb-2">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground">No branches found</h4>
                                        <p className="text-xs text-muted-foreground">Create your first branch to start operations.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
