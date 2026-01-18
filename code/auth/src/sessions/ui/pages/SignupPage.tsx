"use client";

import React from 'react';

export default function SignupPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background overflow-hidden">
            {/* Background and Layout reused */}
            <div className="absolute top-0 -z-10 h-full w-full">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="w-full max-w-md animate-fade-in group">
                <div className="flex flex-col items-center mb-10">
                    <div className="h-12 w-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 flex items-center justify-center mb-4 active:scale-95 transition-transform cursor-pointer">
                        <span className="text-white font-bold text-2xl">G</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Create Account</h2>
                    <p className="text-muted-foreground mt-2 text-center text-sm">Join Gonza Systems and start reaching your customers today</p>
                </div>

                <div className="relative glass rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:shadow-primary/5 border-border/50">
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Full Name</label>
                            <input type="text" placeholder="John Doe" className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Email Address</label>
                            <input type="email" placeholder="name@company.com" className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Password</label>
                            <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50" />
                        </div>

                        <button className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 capitalize">
                            Sign Up
                        </button>
                    </form>

                    {/* Socials & Footer */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-muted-foreground glass rounded-full py-0.5">Or continue with</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="h-11 flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary transition-colors active:scale-95">Google</button>
                        <button className="h-11 flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary transition-colors active:scale-95">GitHub</button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Already have an account? <a href="/login" className="font-bold text-primary hover:underline ml-1">Log in here</a>
                </p>
            </div>
        </div>
    );
}
