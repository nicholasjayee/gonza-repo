"use client";

import React from 'react';
import { useSidebar } from '@/shared/components/Sidebar';
import { ThemeToggle } from './ThemeToggle';

export const Topbar: React.FC = () => {
    const { toggle } = useSidebar();

    return (
        <header className="h-16 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 md:px-8 justify-between z-40">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                    className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
                    onClick={toggle}
                >
                    <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="relative w-full max-w-md group hidden sm:block">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for orders, items..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors relative">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>
                <div className="h-8 w-px bg-border mx-2"></div>
                <ThemeToggle />
                <div className="h-8 w-px bg-border mx-2"></div>
                <button className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">JD</div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold leading-none">John Doe</p>
                        <p className="text-[10px] text-muted-foreground mt-1 lowercase">client-portal</p>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

