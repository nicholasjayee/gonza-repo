"use client";

import React from 'react';

export default function ForgotPasswordPage() {
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
                            Security is our <br />
                            <span className="text-primary italic">top priority.</span>
                        </h1>
                        <p className="text-neutral-400 mt-6 max-w-lg text-lg leading-relaxed">
                            Recover your access safely. We follow industry-leading security protocols to ensure your corporate data remains protected.
                        </p>
                    </div>
                    <div className="text-neutral-500 text-sm">
                        © 2026 Gonza Systems Global Ltd.
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 text-left">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden mb-12 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Gonza</span>
                    </div>

                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Forgot Password?</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Enter your email and we'll send reset instructions.</p>
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

                        <button className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-neutral-900 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2">
                            Send Reset Instructions
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[13px] text-muted-foreground font-medium">
                        Remembered your password? <a href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Back to sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
