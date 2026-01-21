"use client";

import React, { useState, useEffect } from 'react';
import { sendMessageAction, getUploadUrlAction, getCreditBalanceAction } from '../../api/controller';
import { MessageChannel } from '../../types';

export default function ComposeMessagePage() {
    const [channels, setChannels] = useState<MessageChannel[]>(['sms']);
    const [recipients, setRecipients] = useState('');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [creditBalance, setCreditBalance] = useState<number | null>(null);

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

                // Fetch credit balance
                getCreditBalanceAction(user.id).then(res => {
                    if (res.success) {
                        setCreditBalance(res.data);
                    }
                });
            } catch (error) {
                console.error('Error parsing userData cookie:', error);
            }
        }
    }, []);

    const handleChannelToggle = (channel: MessageChannel) => {
        if (channels.includes(channel)) {
            if (channels.length > 1) setChannels(channels.filter(c => c !== channel));
        } else {
            setChannels([...channels, channel]);
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage(null);

        const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r !== '');

        let finalChannel: MessageChannel = 'sms';
        if (channels.includes('sms') && channels.includes('whatsapp')) finalChannel = 'both';
        else if (channels.includes('whatsapp')) finalChannel = 'whatsapp';

        if (!userId) {
            setStatusMessage({ type: 'error', text: 'Authentication required.' });
            setIsLoading(false);
            return;
        }

        let finalMediaUrl = undefined;

        if (mediaFile) {
            setStatusMessage({ type: 'success', text: 'Uploading media to Cloudflare R2...' });
            try {
                // 1. Get pre-signed URL
                const uploadRes = await getUploadUrlAction(mediaFile.name, mediaFile.type);
                if (!uploadRes.success || !uploadRes.data) {
                    throw new Error(uploadRes.error || 'Failed to get upload URL');
                }

                const { uploadUrl, publicUrl } = uploadRes.data;
                console.log('[R2] Attempting upload to:', uploadUrl);

                // 2. Upload to R2 directly from browser
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: mediaFile,
                    headers: {
                        'Content-Type': mediaFile.type,
                    },
                }).catch(err => {
                    console.error('[R2] Fetch Error (likely CORS or Network):', err);
                    throw new Error(`Connection failed. Check your R2 CORS settings. (${err.message})`);
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error('[R2] Upload Response Error:', uploadResponse.status, errorText);
                    throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
                }

                finalMediaUrl = publicUrl;
                console.log('[R2] Upload successful:', finalMediaUrl);
            } catch (error: any) {
                setStatusMessage({ type: 'error', text: `Upload failed: ${error.message}` });
                setIsLoading(false);
                return;
            }
        }

        const res = await sendMessageAction({
            userId,
            recipients: recipientList,
            content,
            channel: finalChannel,
            mediaUrl: finalMediaUrl,
        });

        if (res.success) {
            setStatusMessage({ type: 'success', text: `Campaign launched to ${recipientList.length} contact(s).` });
            setContent('');
            setRecipients('');
            setMediaFile(null);
            setMediaPreview(null);

            // Refresh credit balance
            if (userId) {
                getCreditBalanceAction(userId).then(balanceRes => {
                    if (balanceRes.success) {
                        setCreditBalance(balanceRes.data);
                    }
                });
            }
        } else {
            setStatusMessage({ type: 'error', text: res.error || 'Failed to send campaign.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Form Area */}
                <div className="lg:col-span-7 space-y-8">
                    <header className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">Launch Campaign</h2>
                            {creditBalance !== null && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-bold text-primary">{creditBalance} Credits</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">Select channels and compose your message for immediate broadcast.</p>
                    </header>

                    {statusMessage && (
                        <div className={`p-4 rounded-lg border text-sm font-medium animate-in slide-in-from-top-2 ${statusMessage.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-destructive/5 border-destructive/20 text-destructive'
                            }`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="space-y-8">
                        {/* Channel Selection */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Channels</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleChannelToggle('sms')}
                                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${channels.includes('sms') ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30'
                                        }`}
                                >
                                    SMS
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChannelToggle('whatsapp')}
                                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${channels.includes('whatsapp') ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30'
                                        }`}
                                >
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recipients</label>
                            <textarea
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                placeholder="Numbers separated by commas (e.g. +256700000000, +256711111111)"
                                className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/40"
                                required
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Your message content..."
                                className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[160px] focus:outline-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/40"
                                required
                            />
                        </div>

                        {/* Media for WhatsApp */}
                        {channels.includes('whatsapp') && (
                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">WhatsApp Media</label>
                                <input
                                    type="file"
                                    onChange={handleMediaChange}
                                    accept="image/*,video/*"
                                    className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-foreground file:text-background hover:file:opacity-90 file:transition-opacity"
                                />
                                {mediaPreview && (
                                    <div className="mt-4 relative inline-block rounded-lg overflow-hidden border border-border">
                                        {mediaFile?.type.startsWith('video') ? (
                                            <video src={mediaPreview} className="h-32" controls />
                                        ) : (
                                            <img src={mediaPreview} alt="Preview" className="h-32 object-cover" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                            className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-xs hover:bg-background"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !userId}
                            className="w-full py-4 bg-foreground text-background font-bold rounded-lg hover:opacity-90 disabled:opacity-30 transition-all text-sm uppercase tracking-widest"
                        >
                            {isLoading ? 'Processing...' : 'Launch Campaign'}
                        </button>
                    </form>
                </div>

                {/* Side Preview */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="sticky top-8 w-full max-w-[320px] space-y-4">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">Live Preview</label>
                        <div className="border border-border rounded-[2.5rem] p-3 aspect-[9/18.5] bg-muted/10 relative overflow-hidden flex flex-col">
                            <div className="flex-1 bg-muted/20 rounded-[2rem] p-4 flex flex-col">
                                <div className="mt-auto max-w-[90%] bg-background p-3 rounded-2xl rounded-bl-none border border-border/50 text-xs shadow-sm animate-in slide-in-from-bottom-2 space-y-2">
                                    {channels.includes('whatsapp') && mediaPreview && (
                                        <div className="rounded-lg overflow-hidden border border-border/30 bg-muted/20">
                                            {mediaFile?.type.startsWith('video') ? (
                                                <video src={mediaPreview} className="w-full aspect-video object-cover" />
                                            ) : (
                                                <img src={mediaPreview} alt="Preview" className="w-full h-auto object-cover max-h-40" />
                                            )}
                                        </div>
                                    )}
                                    <div className="leading-relaxed whitespace-pre-wrap">
                                        {content || (channels.includes('whatsapp') ? "Enter WhatsApp content..." : "Enter SMS content...")}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground text-right mt-1">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ✓✓
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 h-10 bg-background rounded-full border border-border flex items-center px-4 text-[10px] text-muted-foreground justify-between shadow-inner">
                                {channels.includes('whatsapp') ? 'WhatsApp Message...' : 'SMS Message...'} <span>📎</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
