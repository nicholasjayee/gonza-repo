"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { label: 'Compose', href: '/messaging' },
        { label: 'History', href: '/messaging/history' },
        { label: 'Connection', href: '/messaging/connect' },
        { label: 'Top Up', href: '/messaging/topup' },
    ];

    const [status, setStatus] = React.useState<'connected' | 'disconnected' | 'connecting' | null>(null);
    const [userName, setUserName] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchStatus = async () => {
            const userDataStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('userData='))
                ?.split('=')[1];

            if (userDataStr) {
                try {
                    const decodedData = decodeURIComponent(userDataStr);
                    const user = JSON.parse(decodedData);
                    setUserName(user.name);
                    const res = await (await import('../../messaging/api/controller')).getWhatsAppStatusAction(user.id);
                    if (res.success) setStatus(res.data?.status || 'disconnected');
                } catch (e) {
                    console.error("Layout status fetch error:", e);
                }
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Background polling
        return () => clearInterval(interval);
    }, []);

    // Faster polling when connecting
    React.useEffect(() => {
        if (status !== 'connecting') return;

        const fetchStatus = async () => {
            const userDataStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('userData='))
                ?.split('=')[1];

            if (userDataStr) {
                try {
                    const decodedData = decodeURIComponent(userDataStr);
                    const user = JSON.parse(decodedData);
                    const res = await (await import('../../messaging/api/controller')).getWhatsAppStatusAction(user.id);
                    if (res.success) setStatus(res.data?.status || 'disconnected');
                } catch (e) { }
            }
        };

        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [status]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            {/* Sub-Navigation */}
            <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar flex-1 h-full">
                            <h1 className="text-sm font-black uppercase tracking-widest flex-shrink-0">Messaging</h1>
                            <div className="flex gap-1 h-full">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`relative flex items-center px-4 text-[11px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {item.label}
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground animate-in fade-in slide-in-from-bottom-1" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
                            {userName && (
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    User <span className="text-foreground ml-1">{userName}</span>
                                </div>
                            )}
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${status === 'connected' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border bg-muted/30'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' :
                                    status === 'connecting' ? 'bg-amber-500 animate-bounce' : 'bg-muted-foreground'
                                    }`}></span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'connected' ? 'text-emerald-600' : 'text-muted-foreground'
                                    }`}>
                                    WhatsApp {status === 'connected' ? 'Active' : status === 'connecting' ? 'Syncing...' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}
