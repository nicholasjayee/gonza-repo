"use client";

import React from 'react';

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 -z-10 h-full w-full">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="w-full max-w-md animate-fade-in group">
                <div className="flex flex-col items-center mb-10">
                    <div className="h-12 w-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 flex items-center justify-center mb-4 active:scale-95 transition-transform cursor-pointer">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Set New Password</h2>
                    <p className="text-muted-foreground mt-2 text-center text-sm">Must be at least 8 characters.</p>
                </div>

                <div className="relative glass rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:shadow-primary/5 border-border/50">
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">New Password</label>
                            <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Confirm Password</label>
                            <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50" />
                        </div>

                        <button className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 capitalize">
                            Reset Password
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    <a href="/login" className="font-bold text-primary hover:underline ml-1">Back to login</a>
                </p>
            </div>
        </div>
    );
}
