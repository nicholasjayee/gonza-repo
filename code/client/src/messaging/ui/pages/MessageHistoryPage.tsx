"use client";

import React, { useState, useEffect } from 'react';
import { getMessagesAction } from '../../api/controller';
import { Message } from '../../types';

export default function MessageHistoryPage() {
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

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
        if (userId) fetchHistory();
    }, [userId]);

    const fetchHistory = async () => {
        if (!userId) return;
        setIsLoading(true);
        const res = await getMessagesAction(userId);
        if (res.success) setHistory(res.data || []);
        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-emerald-500';
            case 'failed': return 'bg-rose-500';
            default: return 'bg-amber-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-border pb-6 gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Campaign History</h2>
                    <p className="text-sm text-muted-foreground">Detailed logs of all SMS and WhatsApp messages sent.</p>
                </div>
                <button
                    onClick={fetchHistory}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase tracking-widest border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    )}
                    Refresh
                </button>
            </header>

            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/60">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recipient</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Content</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading && history.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-5"><div className="h-4 bg-muted rounded-md w-full"></div></td>
                                    </tr>
                                ))
                            ) : history.length > 0 ? history.map(msg => (
                                <tr key={msg.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-foreground tracking-tight">{msg.recipient}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${msg.channel === 'whatsapp' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-blue-500/5 border-blue-500/20 text-blue-600'
                                            }`}>
                                            {msg.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm text-muted-foreground truncate max-w-xs font-medium group-hover:text-foreground transition-colors">{msg.content}</p>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(msg.status)}`}></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{msg.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-xs font-medium text-muted-foreground uppercase tracking-tighter">
                                        {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
