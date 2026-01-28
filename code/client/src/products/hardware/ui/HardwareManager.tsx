
"use client";

import React, { useState, useEffect } from 'react';
import { bluetoothPrinter } from '../utils/BluetoothPrinter';
import { Bluetooth, BluetoothOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function HardwareManager() {
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
    const [deviceName, setDeviceName] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const hasSaved = !!localStorage.getItem('gonza_preferred_printer_id');
            setIsSaved(hasSaved);

            if (bluetoothPrinter.isConnected()) {
                setStatus('connected');
                setDeviceName(bluetoothPrinter.getDeviceName());
            } else if (hasSaved) {
                setStatus('connecting');
                const name = await bluetoothPrinter.autoConnect();
                if (name) {
                    setStatus('connected');
                    setDeviceName(name);
                } else {
                    setStatus('disconnected');
                }
            }
        };
        init();
    }, []);

    const handleConnect = async () => {
        setStatus('connecting');
        setError(null);
        try {
            // 1. Try silent auto-connect first if we have a saved ID
            if (isSaved) {
                console.log("HardwareManager: Attempting silent resume...");
                const name = await bluetoothPrinter.autoConnect();
                if (name) {
                    setDeviceName(name);
                    setStatus('connected');
                    return;
                }
                console.log("HardwareManager: Silent resume failed, falling back to manual pair.");
            }

            // 2. Fallback to manual pair (shows browser picker)
            const name = await bluetoothPrinter.connect();
            setDeviceName(name);
            setStatus('connected');
            setIsSaved(true);
        } catch (err: any) {
            console.error("HardwareManager error:", err);
            setError(err.message || "Failed to connect to printer");
            setStatus('disconnected');
        }
    };

    const handleDisconnect = async () => {
        await bluetoothPrinter.disconnect();
        setStatus('disconnected');
        setDeviceName(null);
        setIsSaved(false);
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${status === 'connected' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted/50 text-muted-foreground'}`}>
                        {status === 'connected' ? <Bluetooth className="h-5 w-5" /> : status === 'connecting' ? <RefreshCw className="h-5 w-5 animate-spin" /> : <BluetoothOff className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold tracking-tight">Printer Hardware</h4>
                            {isSaved && <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Saved</span>}
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                            {status === 'connected' ? 'Bluetooth Direct' : status === 'connecting' ? 'Searching...' : 'System Default'}
                        </p>
                    </div>
                </div>

                {status === 'connected' ? (
                    <button
                        onClick={handleDisconnect}
                        className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                    >
                        Forget
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={status === 'connecting'}
                        className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {status === 'connecting' ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Bluetooth className="h-3 w-3" />}
                        {status === 'connecting' ? 'Syncing...' : 'Pair Printer'}
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${status === 'connected' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-700' : 'bg-muted/30 border-border text-muted-foreground'
                    }`}>
                    {status === 'connected' ? (
                        <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="truncate">Active: {deviceName}</span>
                        </>
                    ) : status === 'connecting' ? (
                        <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Connecting saved printer...</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Using browser fallback</span>
                        </>
                    )}
                </div>

                {error && (
                    <p className="text-[10px] text-rose-500 font-bold px-1">
                        ⚠️ {error}
                    </p>
                )}
            </div>
        </div>
    );
}
