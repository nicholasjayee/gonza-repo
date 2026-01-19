"use client";

import React from 'react';
import { env } from "@gonza/shared/config/env";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";


const Hero = () => (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 opacity-30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

        <div className="mx-auto max-w-[1200px] px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-8 animate-fade-in-up backdrop-blur-md">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                <span className="text-[11px] font-medium text-white/80 tracking-wide">Gonza 4.0 is now available</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-medium tracking-tight text-white md:text-7xl lg:text-[5.5rem] leading-[1.05] mb-8 animate-fade-in-up [animation-delay:200ms]">
                The standard for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">modern business.</span>
            </h1>

            <p className="mx-auto max-w-xl text-lg text-white/50 leading-relaxed mb-10 animate-fade-in-up [animation-delay:400ms]">
                Gonza streamlines your entire operation. Manage sales, inventory, and analytics with a system designed for high-performance teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
                <a href={`${env.AUTH_URL}/signup`} className="h-12 px-8 rounded-full bg-white text-black font-medium text-sm flex items-center gap-2 hover:bg-white/90 transition-all active:scale-[0.98]">
                    Start Enterprise Trial
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </a>
                <a href="#features" className="h-12 px-8 rounded-full bg-white/5 text-white border border-white/10 font-medium text-sm flex items-center hover:bg-white/10 transition-all">
                    Explore Features
                </a>
            </div>

            {/* Simulated 3D Dashboard Interface */}
            <div className="mt-20 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl animate-fade-in-up [animation-delay:800ms] group perspective-[2000px]">
                {/* Glow behind dashboard */}
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent blur-2xl opacity-20 -z-10" />

                <div className="rounded-xl border border-white/5 bg-[#0A0A0A] overflow-hidden aspect-[16/10] relative transform transition-transform duration-700 hover:scale-[1.01] hover:rotate-x-1 shadow-2xl">
                    {/* Fake UI Header */}
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        </div>
                        <div className="ml-4 h-4 w-32 rounded-full bg-white/5" />
                    </div>
                    {/* Fake UI Body */}
                    <div className="p-6 md:p-8 grid grid-cols-4 gap-6 h-full">
                        <div className="col-span-1 border-r border-white/5 pr-6 space-y-4 hidden md:block">
                            <div className="h-8 w-full rounded bg-white/5 mb-6" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-3 opacity-50">
                                    <div className="w-4 h-4 rounded bg-white/20" />
                                    <div className="h-3 w-20 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                        <div className="col-span-4 md:col-span-3 space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-2">
                                    <div className="h-3 w-24 rounded bg-white/10" />
                                    <div className="h-8 w-48 rounded bg-white/10" />
                                </div>
                                <div className="h-8 w-24 rounded bg-primary/20" />
                            </div>
                            <div className="h-48 w-full rounded-lg bg-gradient-to-b from-white/5 to-transparent border border-white/5 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-4 pb-0 gap-2">
                                    {[30, 45, 35, 60, 50, 70, 55, 80, 65, 85, 75, 90, 60, 70].map((h, i) => (
                                        <div key={i} className="w-full bg-primary/30 rounded-t-sm hover:bg-primary/50 transition-colors" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 rounded-lg bg-white/5 border border-white/5 p-4 space-y-3">
                                        <div className="h-8 w-8 rounded bg-white/10" />
                                        <div className="h-3 w-16 rounded bg-white/10" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const Clients = () => (
    <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-[1200px] px-6">
            <p className="text-center text-sm font-medium text-white/30 mb-8">Powering next-generation companies</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale mix-blend-screen">
                {['Acme Corp', 'GlobalBank', 'Nebula', 'Velocity', 'Orbit'].map((logo) => (
                    <span key={logo} className="text-xl font-bold font-serif tracking-widest text-white">{logo}</span>
                ))}
            </div>
        </div>
    </section>
);

const BentoGrid = () => (
    <section id="features" className="py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
            <div className="mb-20">
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-6">Designed for speed. <br /><span className="text-white/40">Built for scale.</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Large Card */}
                <div className="md:col-span-2 row-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -mr-20 -mt-20 transition-opacity opacity-50 group-hover:opacity-80" />
                    <div className="relative z-10">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-2xl font-medium text-white mb-4">Real-time Sync Engine</h3>
                        <p className="text-white/50 max-w-sm mb-12">Changes propagate instantly across all connected clients. No refresh required. Experience true real-time collaboration.</p>

                        <div className="w-full h-64 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="grid grid-cols-2 gap-4 p-8 w-full max-w-md opacity-80">
                                <div className="h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse" />
                                <div className="h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:100ms]" />
                                <div className="h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:200ms]" />
                                <div className="h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Small Card 1 */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                    <h3 className="text-xl font-medium text-white mb-2">Global Inventory</h3>
                    <p className="text-white/50 text-sm mb-8">Track assets across unlimited locations.</p>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/20 group-hover:text-primary/50 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                    </div>
                </div>

                {/* Small Card 2 */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                    <h3 className="text-xl font-medium text-white mb-2">Bank-Grade Security</h3>
                    <p className="text-white/50 text-sm mb-8">AES-256 encryption for all data at rest.</p>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/20 group-hover:text-emerald-500/50 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    </section>
);


const Workflow = () => (
    <section className="py-24 border-t border-white/5 relative bg-white/[0.02]">
        <div className="mx-auto max-w-[1200px] px-6">
            <h3 className="text-2xl font-medium text-white mb-12 text-center">Engineered for control</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

                {[
                    { title: 'Connect', desc: 'Link your existing data sources in seconds with our universal API.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
                    { title: 'Standardize', desc: 'Our engine automatically normalizes data into a unified schema.', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
                    { title: 'Visualize', desc: 'Gain instant insights with programmable dashboards.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z' }
                ].map((step, i) => (
                    <div key={step.title} className="relative z-10 bg-black border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-colors">
                        <div className="h-12 w-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} /></svg>
                        </div>
                        <h4 className="text-xl font-medium text-white mb-3">{step.title}</h4>
                        <p className="text-white/50 text-sm font-sans leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const Stats = () => (
    <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                {[
                    { label: 'Uptime', value: '99.99%' },
                    { label: 'Transactions', value: '$500M+' },
                    { label: 'Countries', value: '120+' },
                    { label: 'Latency', value: '<50ms' },
                ].map((stat) => (
                    <div key={stat.label}>
                        <div className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-2">{stat.value}</div>
                        <div className="text-sm text-white/40 font-sans uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const Quote = () => (
    <section className="py-32 px-6">
        <div className="mx-auto max-w-4xl text-center">
            <div className="mb-10 flex justify-center text-primary">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
            </div>
            <blockquote className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight mb-10">
                "Gonza completely transformed how we view our inventory data. It's not just a tool; it's the specialized nervous system of our entire logistics operation."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/20" />
                <div className="text-left">
                    <div className="text-white font-medium">Sarah Jenkins</div>
                    <div className="text-white/40 text-sm">CTO, Nebula Logistics</div>
                </div>
            </div>
        </div>
    </section>
);

const HomePage = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            <Navbar />
            <Hero />
            <Clients />
            <BentoGrid />
            <Workflow />
            <Stats />
            <Quote />
            <Footer />
        </div>
    );
}

export default HomePage;
