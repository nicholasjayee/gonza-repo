"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    linkWhatsAppAction,
    getWhatsAppStatusAction,
    disconnectWhatsAppAction
} from '../../api/controller';
import { WhatsAppSession } from '../../types';

export default function ConnectWhatsAppPage() {
    const [waSession, setWaSession] = useState<WhatsAppSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        const userDataStr = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='))
            ?.split('=')[1];

        if (userDataStr) {
            try {
                const decodedData = decodeURIComponent(userDataStr);
                const user = JSON.parse(decodedData);
                setUserId(user.id);
            } catch (error) {
                console.error('Error parsing userData cookie:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (userId) fetchWhatsAppStatus();
    }, [userId]);

    const fetchWhatsAppStatus = async () => {
        if (!userId) return;
        const res = await getWhatsAppStatusAction(userId);
        if (res.success) {
            const newSession = res.data || null;

            // If status just changed to connected, show success message
            if (waSession?.status === 'connecting' && newSession?.status === 'connected') {
                setStatusMessage({ type: 'success', text: 'WhatsApp Connected Successfully!' });
            }

            setWaSession(newSession as any);
        }
    };

    // Polling when connecting
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (userId && waSession?.status === 'connecting') {
            interval = setInterval(fetchWhatsAppStatus, 5000); // Poll every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [userId, waSession?.status]);

    const handleLinkWA = async (type: 'qr' | 'pairing') => {
        if (!userId) return;
        if (!phoneNumber) {
            setStatusMessage({ type: 'error', text: 'Please enter your WhatsApp phone number.' });
            return;
        }

        setIsLoading(true);
        setStatusMessage(null);
        const res = await linkWhatsAppAction(userId, type, phoneNumber);
        if (res.success) {
            setWaSession((res.data as WhatsAppSession) || null);
            setStatusMessage({ type: 'success', text: 'Connection initiated.' });
        } else {
            setStatusMessage({ type: 'error', text: res.error || 'Connection failed.' });
        }
        setIsLoading(false);
    };

    const handleDisconnect = async () => {
        if (!userId) return;
        if (!confirm('Are you sure you want to unlink this account?')) return;
        setIsLoading(true);
        const res = await disconnectWhatsAppAction(userId);
        if (res.success) {
            setWaSession(res.data as any);
            setStatusMessage({ type: 'success', text: 'Account unlinked.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <header className="mb-12 space-y-4">
                <Link href="/messaging" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Messaging
                </Link>
                <div className="pt-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">WhatsApp Connection</h2>
                    <p className="text-sm text-muted-foreground mt-1">Link your business number to enable automated WhatsApp campaigns.</p>
                </div>
            </header>

            {statusMessage && (
                <div className={`mb-8 p-4 rounded-lg border text-sm font-medium animate-in slide-in-from-top-1 ${statusMessage.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' : 'bg-rose-500/5 border-rose-500/10 text-rose-600'
                    }`}>
                    {statusMessage.text}
                </div>
            )}

            {waSession?.status === 'connected' ? (
                <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-10 text-center space-y-8">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(16 185 129)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight text-foreground">Account Linked</h3>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] animate-pulse">Ready for Campaigns</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-background border border-border rounded-xl shadow-sm text-left">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Phone Number</p>
                                <p className="text-lg font-bold font-mono tracking-tighter text-foreground">{waSession.linkedPhoneNumber || '0788276076'}</p>
                            </div>
                            <div className="p-4 bg-background border border-border rounded-xl shadow-sm text-left">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Last Verified</p>
                                <p className="text-lg font-bold text-foreground">
                                    {waSession.updatedAt ? new Date(waSession.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={handleDisconnect}
                                className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:text-rose-600 transition-colors border-b border-rose-500/20 pb-1"
                            >
                                Disconnect Account
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <aside className="md:order-2 border border-border rounded-2xl bg-muted/20 p-8 flex flex-col items-center justify-center min-h-[400px]">
                        {waSession?.qrCode ? (
                            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                                    <div className="w-48 h-48 bg-foreground flex items-center justify-center overflow-hidden">
                                        {waSession.qrCode.startsWith('data:image') || waSession.qrCode.startsWith('http') ? (
                                            <img src={waSession.qrCode} alt="QR Code" className="w-full h-full object-contain p-2 bg-white" />
                                        ) : (
                                            <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                                <rect x="3" y="3" width="7" height="7"></rect>
                                                <rect x="14" y="3" width="7" height="7"></rect>
                                                <rect x="3" y="14" width="7" height="7"></rect>
                                                <path d="M14 14h3M14 17h3M14 20h3M17 14v6M20 14v6"></path>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 animate-pulse">Waiting for scan</p>
                            </div>
                        ) : waSession?.pairingCode ? (
                            <div className="text-center space-y-8 animate-in slide-in-from-bottom-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Code</span>
                                <div className="flex gap-2 justify-center flex-wrap">
                                    {waSession.pairingCode.replace('-', '').split('').map((char: string, i: number) => (
                                        <span key={i} className="w-10 h-14 bg-background border border-border shadow-sm rounded-lg flex items-center justify-center text-xl font-bold text-foreground">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium max-w-[200px]">Enter this on your device after selecting "Link with phone number".</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 opacity-30">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting interaction</p>
                            </div>
                        )}
                    </aside>

                    <section className="md:order-1 space-y-8">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground underline decoration-border decoration-2 underline-offset-8">Step 1: Identity</span>
                                <h3 className="text-sm font-bold text-foreground">WhatsApp Number</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">Enter your business WhatsApp number in international format (e.g., 256700000000).</p>
                                <input
                                    type="tel"
                                    placeholder="256708605335"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm font-mono focus:ring-1 focus:ring-foreground outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground lg:pt-4 block">Step 2: Connect</span>
                                <h3 className="text-sm font-bold text-foreground">Option A: Scan QR Code</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">Open WhatsApp on your phone, navigate to Linked Devices, and scan the generated code.</p>
                                <button
                                    onClick={() => handleLinkWA('qr')}
                                    disabled={isLoading}
                                    className="px-6 py-3 border border-foreground bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all disabled:opacity-30"
                                >
                                    {isLoading ? 'Wait...' : 'Generate QR'}
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-4 text-muted-foreground font-black tracking-widest">OR</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Option B</span>
                                <h3 className="text-sm font-bold text-foreground">Pairing Code</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">If you cannot scan a QR code, use an 8-character numeric-alpha code instead.</p>
                                <button
                                    onClick={() => handleLinkWA('pairing')}
                                    disabled={isLoading}
                                    className="px-6 py-3 border border-border text-foreground text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-muted transition-all disabled:opacity-30"
                                >
                                    Use Pairing Code
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
