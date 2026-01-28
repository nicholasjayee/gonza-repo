"use client";

import React from 'react';

export default function PolicyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Simple Nav */}
            <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 backdrop-blur-md border-b border-border/50">
                <a href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground uppercase">GONZA</span>
                </a>
            </nav>

            <main className="flex-1 pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-black tracking-tight mb-8 italic"><span className="text-primary">PRIVACY</span> POLICY</h1>

                    <div className="space-y-8 text-muted-foreground leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">1. Data Collection</h2>
                            <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, and any other information you choose to provide.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">2. Use of Data</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect Gonza Systems and our users.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">3. Data Sharing</h2>
                            <p>We do not share your personal information with companies, organizations, or individuals outside of Gonza Systems except in the following cases: with your consent, for external processing, or for legal reasons.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">4. Security</h2>
                            <p>We work hard to protect Gonza Systems and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">5. Your Rights</h2>
                            <p>You have the right to access, update, or delete the personal information we have on you. You can do this at any time by logging into your account or contacting us directly.</p>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border px-6 py-12 bg-secondary/30">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <p className="text-xs font-bold opacity-50">&copy; 2026 GONZA SYSTEMS</p>
                    <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <a href="/" className="hover:text-primary transition-colors">Home</a>
                        <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
