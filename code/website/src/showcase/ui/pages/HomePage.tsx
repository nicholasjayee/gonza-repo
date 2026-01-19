"use client";

import React from 'react';
import { env } from "@gonza/shared/config/env";

const Nav = () => (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 backdrop-blur-xl border-b border-border/40 bg-background/60">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                <span className="text-white font-bold text-xl uppercase">G</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground uppercase">GONZA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Operations</a>
            <a href="/policy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
        </div>
        <div className="flex items-center gap-4">
            <a href={env.AUTH_URL} className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Sign In</a>
            <a href={env.CLIENT_URL} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">Get Started</a>
        </div>
    </nav>
);

const Footer = () => (
    <footer className="border-t border-border px-6 py-20 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xs uppercase">G</span>
                        </div>
                        <span className="font-black tracking-tighter uppercase text-xl">GONZA SYSTEMS</span>
                    </div>
                    <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                        The ultimate all-in-one business management platform. Built to scale operations, manage sales, and optimize inventory with absolute precision.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-foreground">Platform</h4>
                    <div className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
                        <a href={env.CLIENT_URL} className="hover:text-primary transition-colors">Client Portal</a>
                        <a href={env.ADMIN_URL} className="hover:text-primary transition-colors">Admin Terminal</a>
                        <a href={env.AUTH_URL} className="hover:text-primary transition-colors">Authentication</a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-foreground">Legal</h4>
                    <div className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
                        <a href="/policy" className="hover:text-primary transition-colors italic">Privacy Policy</a>
                        <a href="/terms" className="hover:text-primary transition-colors italic">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors italic">Cookie Policy</a>
                    </div>
                </div>
            </div>
            <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">&copy; 2026 GONZA SYSTEMS. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6 opacity-30 grayscale contrast-150">
                    <span className="text-xs font-black italic uppercase">ERP-Standard</span>
                    <span className="text-xs font-black italic uppercase">Inventory Link</span>
                    <span className="text-xs font-black italic uppercase">PCI-DSS</span>
                </div>
            </div>
        </div>
    </footer>
);

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col overflow-hidden bg-background">
            <Nav />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative px-6 pt-40 pb-24 md:pt-56 md:pb-40 lg:pt-64 lg:pb-56 flex flex-col items-center text-center">
                    <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-[0.05] dark:opacity-[0.1]" />

                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary mb-10 animate-fade-in shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        V4 Enterprise Ledger is Now Online
                    </div>

                    <h1 className="max-w-5xl text-6xl font-[900] tracking-tighter text-foreground md:text-8xl lg:text-[9rem] leading-[0.9] mb-10 italic uppercase">
                        Master your <br /><span className="gradient-text">Business</span>
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground md:text-xl font-medium leading-relaxed mb-12 opacity-80">
                        Unify your operations. Scale your growth. Gonza Systems provides the high-performance infrastructure for sales, inventory, and global business management.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <a href={env.CLIENT_URL} className="h-16 flex items-center justify-center rounded-2xl bg-primary px-10 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/30 hover:scale-110 hover:shadow-primary/40 transition-all active:scale-95">
                            Launch Dashboard
                        </a>
                        <a href={env.ADMIN_URL} className="h-16 flex items-center justify-center rounded-2xl border border-border bg-background/50 backdrop-blur-sm px-10 text-xs font-black uppercase tracking-[0.2em] text-foreground hover:bg-secondary transition-all">
                            Kernel Access
                        </a>
                    </div>

                    {/* Dynamic Visual Element (Simulated Graph/Grid) */}
                    <div className="mt-32 w-full max-w-6xl p-4 glass rounded-[3rem] border-primary/10 shadow-3xl relative animate-float">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 scale-90" />
                        <div className="aspect-video w-full rounded-[2.5rem] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden border border-white/5 relative">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-20 w-3 rounded-full bg-primary/60" style={{ opacity: `${i * 0.2}` }} />
                                    ))}
                                </div>
                                <p className="font-black text-white/40 uppercase tracking-[0.5em] text-[10px]">Real-time Transaction Ledger</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value Prop Section */}
                <section id="features" className="px-6 py-40 bg-zinc-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase mb-8">Engineered for <span className="text-primary italic">Absolute</span> Control.</h2>
                                <p className="text-lg text-white/60 leading-relaxed mb-12 font-medium">We've engineered Gonza Systems to handle complex business logic with sub-millisecond precision. Our vertical slice architecture ensures complete data integrity and maximum scalability.</p>
                                <div className="space-y-6">
                                    {[
                                        "Unified Sales & Finance Tracking",
                                        "Automated Inventory Rebalancing",
                                        "Advanced Branch Operations",
                                        "Cross-Module Security Protocol"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="font-bold text-sm uppercase tracking-widest text-white/80">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="aspect-square rounded-3xl bg-primary/10 border border-primary/20 p-8 flex flex-col justify-end group hover:bg-primary/20 transition-all cursor-crosshair">
                                    <span className="text-3xl font-black mb-2 italic">100%</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Data Accuracy</span>
                                </div>
                                <div className="aspect-square rounded-3xl bg-zinc-900 border border-white/5 p-8 flex flex-col justify-end translate-y-12">
                                    <span className="text-3xl font-black mb-2 italic">Global</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Multi-Branch</span>
                                </div>
                                <div className="aspect-square rounded-3xl bg-zinc-900 border border-white/5 p-8 flex flex-col justify-end">
                                    <span className="text-3xl font-black mb-2 italic">Secure</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Audit Trails</span>
                                </div>
                                <div className="aspect-square rounded-3xl bg-primary/10 border border-primary/20 p-8 flex flex-col justify-end translate-y-12 group hover:bg-primary/20 transition-all cursor-crosshair">
                                    <span className="text-3xl font-black mb-2 italic">ERP</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Integration Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-40">
                    <div className="max-w-6xl mx-auto rounded-[3rem] bg-background border border-border p-12 md:p-24 text-center relative overflow-hidden shadow-3xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] -ml-48 -mb-48" />
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase mb-8">Optimize your <span className="gradient-text">Operations</span>.</h2>
                        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">Join the elite businesses leveraging Gonza Systems for their mission-critical management.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <a href={env.CLIENT_URL} className="h-16 flex items-center justify-center rounded-2xl bg-foreground text-background px-10 text-xs font-black uppercase tracking-[0.2em] transform hover:scale-105 transition-all active:scale-95 shadow-2xl">
                                Deploy System
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
