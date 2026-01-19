"use client";

import React from 'react';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-background font-sans">
            {/* Left Side: Branding/Visual (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-neutral-950 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-primary/40 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-blue-600/30 blur-[120px]" />
                </div>
                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">Gonza Systems</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            The future of enterprise <br />
                            <span className="text-primary italic">operations management.</span>
                        </h1>
                        <p className="text-neutral-400 mt-6 max-w-lg text-lg leading-relaxed">
                            Streamline your workflow with our advanced suite of business tools. Designed for reliability, scalability, and speed.
                        </p>
                    </div>
                    <div className="text-neutral-500 text-sm">
                        © 2026 Gonza Systems Global Ltd.
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden mb-12 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Gonza</span>
                    </div>

                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue.</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Corporate Email</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-0.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Secure Password</label>
                                <a href="/forgot-password" className="font-bold text-primary hover:text-primary/80 transition-colors">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm"
                            />
                        </div>

                        <button className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-neutral-900 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2">
                            Sign In to Portal
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground/70 font-bold tracking-widest">Or authenticate via</span></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button className="h-11 flex items-center justify-center gap-2.5 rounded-xl border border-border hover:bg-muted transition-all active:scale-[0.98] text-sm font-bold">
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Continue with Google
                        </button>
                    </div>

                    <p className="mt-12 text-center text-[13px] text-muted-foreground font-medium">
                        Don't have a corporate account? <a href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Establish one here</a>
                    </p>
                </div >
            </div >
        </div >
    );
}
