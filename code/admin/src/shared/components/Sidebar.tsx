"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Context Logic ---
interface SidebarContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    toggle: () => void;
    close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    useEffect(() => {
        close();
    }, [pathname]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle, close }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

// --- Sidebar Component ---

const NavItem = ({ href, icon, label, badge, active }: { href: string; icon: React.ReactNode; label: string; badge?: string; active?: boolean }) => (
    <Link
        href={href}
        className={`flex items-center justify-between px-3 py-1.5 text-[13px] font-medium transition-all rounded-lg group ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
    >
        <div className="flex items-center gap-2.5">
            <div className={`${active ? 'text-white' : 'text-muted-foreground group-hover:text-primary'} transition-colors`}>
                {icon}
            </div>
            <span>{label}</span>
        </div>
        {badge && (
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${active ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                {badge}
            </span>
        )}
    </Link>
);

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
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

    // Avoid hydration mismatch by rendering a consistent state initially
    const sidebarClasses = `fixed left-0 top-0 h-screen w-56 bg-background border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${mounted && isOpen ? 'translate-x-0' : '-translate-x-full'
        }`;

    return (
        <>
            {/* Mobile Backdrop */}
            {mounted && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-all duration-300"
                    onClick={close}
                />
            )}

            <aside className={sidebarClasses}>
                <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">Management</p>
                        <div className="space-y-0.5">
                            <NavItem active={pathname === "/"} href="/" label="Dashboard" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
                            <NavItem active={pathname === "/users"} href="/users" label="Users" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                        </div>
                    </div>
                </nav>

                <div className="p-3 bg-muted/20 border-t border-border">
                    <div className="flex items-center gap-2.5 px-2 py-1">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {mounted && user ? (
                                getInitials(user.name)
                            ) : (
                                <div className="w-3.5 h-3.5 bg-primary/30 rounded-full animate-pulse" />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                            {mounted && user ? (
                                <>
                                    <p className="text-[11px] font-bold truncate text-foreground">{user.name}</p>
                                    <p className="text-[9px] text-muted-foreground truncate">{user.email}</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-2.5 w-16 bg-muted rounded animate-pulse mb-1" />
                                    <div className="h-2 w-20 bg-muted rounded animate-pulse" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
