"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavItem = ({ href, icon, label, badge, active }: { href: string; icon: React.ReactNode; label: string; badge?: string; active?: boolean }) => (
    <Link
        href={href}
        className={`flex items-center justify-between px-3 py-1.5 text-[13px] font-medium transition-all rounded-lg group ${active ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-500'
            }`}
    >
        <div className="flex items-center gap-2.5">
            <div className={`${active ? 'text-white' : 'text-muted-foreground group-hover:text-red-500'} transition-colors`}>
                {icon}
            </div>
            <span>{label}</span>
        </div>
        {badge && (
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${active ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
                {badge}
            </span>
        )}
    </Link>
);

export const Sidebar: React.FC = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-background border-r border-border flex flex-col z-50">
            <div className="h-14 flex items-center px-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-red-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm italic">A</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-red-600">Admin</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                <div>
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">Management</p>
                    <div className="space-y-0.5">
                        <NavItem active={pathname === "/"} href="/" label="Dashboard" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
                        <NavItem active={pathname === "/users"} href="/users" label="Users" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                        <NavItem active={pathname === "/analytics"} href="/analytics" label="Analytics" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
                        <NavItem active={pathname === "/settings"} href="/settings" label="Settings" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                    </div>
                </div>
            </nav>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 border-t border-border">
                <div className="flex items-center gap-2.5 px-2 py-1">
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/20 italic">SA</div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-bold truncate text-foreground">Super Admin</p>
                        <p className="text-[9px] text-red-600 truncate font-semibold uppercase tracking-tighter">System Root</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
