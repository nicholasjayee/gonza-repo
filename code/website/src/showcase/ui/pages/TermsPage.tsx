"use client";

import React from 'react';

export default function TermsPage() {
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
                    <h1 className="text-4xl font-black tracking-tight mb-8 italic"><span className="text-primary">TERMS</span> & CONDITIONS</h1>

                    <div className="space-y-8 text-muted-foreground leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                            <p>By accessing or using Gonza Systems, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">2. Use License</h2>
                            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Gonza Systems' website for personal, non-commercial transitory viewing only.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">3. Disclaimer</h2>
                            <p>The materials on Gonza Systems' website are provided on an 'as is' basis. Gonza Systems makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">4. Limitations</h2>
                            <p>In no event shall Gonza Systems or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Gonza Systems' website.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4">5. Governing Law</h2>
                            <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Gonza Systems operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
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
                        <a href="/policy" className="hover:text-primary transition-colors">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
