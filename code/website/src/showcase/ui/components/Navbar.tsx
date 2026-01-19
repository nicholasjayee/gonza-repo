"use client";

import React from 'react';
import { env } from "@gonza/shared/config/env";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
            <div className="flex items-center gap-2.5 group cursor-pointer">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-white/20 to-white/5 shadow-inner border border-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-white font-bold text-sm z-10">G</span>
                </div>
                <span className="text-sm font-medium text-white/90 tracking-tight">Gonza</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                {['Features', 'Method', 'Customers', 'Pricing'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors duration-200">
                        {item}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <a href={env.AUTH_URL} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">Log in</a>
                <a href={`${env.AUTH_URL}/signup`} className="group relative flex h-8 items-center justify-center rounded-full bg-white px-4 text-[13px] font-medium text-black transition-all hover:bg-white/90">
                    <span className="relative z-10 flex items-center gap-1">
                        Sign Up
                        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </a>
            </div>
        </div>
    </nav>
);
