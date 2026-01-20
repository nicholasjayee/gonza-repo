"use client";

import React from 'react';
import { useSidebar } from '@/shared/components/Sidebar';
import { ThemeToggle } from './ThemeToggle';

export const Topbar: React.FC = () => {
    const { toggle } = useSidebar();

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [user, setUser] = React.useState<{ name: string; email: string; role: string } | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const userDataStr = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='))
            ?.split('=')[1];

        if (userDataStr) {
            try {
                const decodedData = decodeURIComponent(userDataStr);
                setUser(JSON.parse(decodedData));
            } catch (error) {
                console.error('Error parsing userData cookie:', error);
            }
        }
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

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
                        placeholder="Search for users, analytics, logs..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">Live Monitor</span>
                </div>

                <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors relative">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </button>

                <div className="h-8 w-px bg-border mx-2"></div>
                <ThemeToggle />
                <div className="h-8 w-px bg-border mx-2"></div>

                <div className="relative">
                    <button
                        className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                            {mounted && user ? (
                                getInitials(user.name)
                            ) : (
                                <div className="w-4 h-4 bg-primary-foreground/30 rounded animate-pulse" />
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            {mounted && user ? (
                                <>
                                    <p className="text-xs font-bold leading-none">{user.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 lowercase">{user.email}</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-2.5 w-20 bg-muted rounded animate-pulse mb-1.5" />
                                    <div className="h-2 w-24 bg-muted rounded animate-pulse" />
                                </>
                            )}
                        </div>
                        <svg className={`w-4 h-4 text-muted-foreground ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                <div className="px-4 py-2 border-b border-border mb-1 sm:hidden">
                                    <p className="text-xs font-bold">{user ? user.name : 'Admin Root'}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user ? user.email : 'admin@gonza.com'}</p>
                                </div>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    System Settings
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Security Logs
                                </button>
                                <div className="border-t border-border mt-1 pt-1">
                                    <button
                                        onClick={() => {
                                            window.location.href = process.env.NEXT_PUBLIC_AUTH_URL ? `${process.env.NEXT_PUBLIC_AUTH_URL}/logout` : 'http://localhost:3001/logout';
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

