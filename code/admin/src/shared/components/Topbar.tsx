"use client";

import React from 'react';

export const Topbar: React.FC = () => {
    return (
        <header className="h-16 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-8 justify-between z-40">
            <div className="flex items-center gap-4">
                <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-foreground leading-none">Administration Terminal</h2>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">Node: gonza-srv-01</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider leading-none">Live System Monitor</span>
                </div>

                <div className="h-8 w-px bg-border mx-2"></div>

                <button className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">SA</div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold leading-none">Admin Root</p>
                        <p className="text-[10px] text-muted-foreground mt-1 lowercase">security-tier-1</p>
                    </div>
                </button>
            </div>
        </header>
    );
};

