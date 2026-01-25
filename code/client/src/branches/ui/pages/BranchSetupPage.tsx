import React from 'react';
import { BranchSetupClient } from '../components/BranchSetupClient';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';

export default function BranchSetupPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Initial System Setup</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight leading-tight">
                        Welcome to <span className="text-primary italic">Gonza</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto">
                        To activate your dashboard, you first need to establish your <span className="text-foreground font-bold">Main Branch</span>. This will serve as your global command center.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
                        <Building2 className="w-32 h-32 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <BranchSetupClient />
                    </div>

                    <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                            Everything starts here. Your Main Branch can manage all future sub-locations and access centralized reports across your entire business network.
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">
                    Gonza Business Operating System &copy; 2026
                </p>
            </div>
        </div>
    );
}
