"use client";

import React, { useState, useEffect } from 'react';
import { initiateTopUpAction, getCreditBalanceAction } from '../../api/controller';
import { PaymentPoller } from '../../../lib/payment-poller';

export default function TopUpPage() {
    const [balance, setBalance] = useState<number | null>(null);
    const [amount, setAmount] = useState<string>('5000');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

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
                setUserInfo({ name: user.name, email: user.email });
                // If user has a linked phone number or session, we could pre-fill, 
                // but for now let's just fetch balance.
                fetchBalance(user.id);
            } catch (err) {
                console.error('Error parsing userData cookie:', err);
            }
        }
    }, []);

    const fetchBalance = async (id: string) => {
        const res = await getCreditBalanceAction(id);
        if (res.success) setBalance(res.data ?? 0);
    };

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !userInfo) return;

        if (!phoneNumber) {
            setError('Please provide a phone number for mobile payments.');
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log('[TopUpPage] Initiating top-up for user:', userId, 'amount:', amount);
        const res = await initiateTopUpAction({
            userId,
            amount: parseFloat(amount),
            description: `Credit Top-up - ${amount} UGX`,
            email: userInfo.email,
            name: userInfo.name,
            phoneNumber
        });
        console.log('[TopUpPage] Response from server:', res);

        if (res.success && res.data?.redirectUrl) {
            setIframeUrl(res.data.redirectUrl);
            // Start polling for payment status
            PaymentPoller.start();
        } else {
            setError(res.error || 'Failed to initiate payment.');
        }
        setIsLoading(false);
    };

    const packages = [
        { label: 'Starter', amount: '5000', credits: '50' },
        { label: 'Basic', amount: '10000', credits: '100' },
        { label: 'Pro', amount: '25000', credits: '250' },
        { label: 'Enterprise', amount: '50000', credits: '500' },
    ];

    if (iframeUrl) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Secure Payment</h2>
                        <p className="text-sm text-muted-foreground">Complete your transaction via PesaPal.</p>
                    </div>
                    <button
                        onClick={() => setIframeUrl(null)}
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                        ← Back
                    </button>
                </header>

                <div className="w-full h-[700px] border border-border rounded-2xl overflow-hidden bg-white">
                    <iframe
                        src={iframeUrl}
                        className="w-full h-full border-0"
                        title="PesaPal Payment"
                    />
                </div>
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                    Wait for the payment to complete. Your credits will be updated automatically.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                {/* Balance & Top-up Selection */}
                <div className="space-y-8">
                    <header className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Buy Credits</h2>
                        <p className="text-sm text-muted-foreground">Top up your account to launch campaigns. 1 Credit = 1 Message.</p>
                    </header>

                    <div className="p-6 bg-muted/30 rounded-2xl border border-border flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Balance</p>
                            <p className="text-3xl font-black">{balance !== null ? balance : '--'} <span className="text-sm font-bold text-muted-foreground">Credits</span></p>
                        </div>
                        <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center font-black text-xl">
                            $
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleInitiate} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Package</label>
                            <div className="grid grid-cols-2 gap-3">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.amount}
                                        type="button"
                                        onClick={() => setAmount(pkg.amount)}
                                        className={`p-4 rounded-xl border text-left transition-all ${amount === pkg.amount ? 'bg-foreground text-background border-foreground shadow-lg scale-[1.02]' : 'bg-background text-foreground border-border hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{pkg.label}</p>
                                        <p className="text-lg font-bold">{parseInt(pkg.amount).toLocaleString()} UGX</p>
                                        <p className="text-[10px] font-bold uppercase mt-1 opacity-70">{pkg.credits} Credits</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mobile Money Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                                placeholder="e.g. 256700000000"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Custom Amount (UGX)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="500"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                                placeholder="Enter amount..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !userId}
                            className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 disabled:opacity-30 transition-all text-sm uppercase tracking-widest shadow-xl shadow-foreground/10"
                        >
                            {isLoading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </form>
                </div>

                {/* FAQ / Info */}
                <div className="space-y-8 bg-muted/20 p-8 rounded-3xl border border-border/50">
                    <h3 className="text-sm font-black uppercase tracking-widest">Why Top up?</h3>
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                            <p className="text-sm text-muted-foreground leading-relaxed">Credits never expire. Buy now and use them anytime for SMS or WhatsApp campaigns.</p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                            <p className="text-sm text-muted-foreground leading-relaxed">Pay with Mobile Money (Airtel/MTN) or Visa/Mastercard via our secure PesaPal integration.</p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                            <p className="text-sm text-muted-foreground leading-relaxed">Transparent billing. Each message costs exactly 1 credit, only deducted upon successful send.</p>
                        </li>
                    </ul>

                    <div className="pt-6 border-t border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Supported Payments</p>
                        <div className="flex gap-4 grayscale opacity-40">
                            <div className="text-xs font-black tracking-tighter">VISA</div>
                            <div className="text-xs font-black tracking-tighter">MASTERCARD</div>
                            <div className="text-xs font-black tracking-tighter">MTN</div>
                            <div className="text-xs font-black tracking-tighter">AIRTEL</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
