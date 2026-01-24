
"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

interface MessageProps {
    type: MessageType;
    message: string;
    onClose?: () => void;
    duration?: number;
}

export function Message({ type, message, onClose, duration = 5000 }: MessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: {
            bg: 'bg-emerald-50/80',
            border: 'border-emerald-200/50',
            text: 'text-emerald-800',
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            ring: 'focus:ring-emerald-500/20'
        },
        error: {
            bg: 'bg-rose-50/80',
            border: 'border-rose-200/50',
            text: 'text-rose-800',
            icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
            ring: 'focus:ring-rose-500/20'
        },
        warning: {
            bg: 'bg-amber-50/80',
            border: 'border-amber-200/50',
            text: 'text-amber-800',
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
            ring: 'focus:ring-amber-500/20'
        },
        info: {
            bg: 'bg-sky-50/80',
            border: 'border-sky-200/50',
            text: 'text-sky-800',
            icon: <Info className="h-5 w-5 text-sky-500" />,
            ring: 'focus:ring-sky-500/20'
        }
    };

    const currentStyle = styles[type];

    return (
        <div className={`
            flex items-center gap-4 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300
            ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}
        `}>
            {currentStyle.icon}
            <span className="text-sm font-medium flex-1">{message}</span>
            {onClose && (
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onClose();
                    }}
                    className={`p-1 hover:bg-black/5 rounded-lg transition-colors outline-none focus:ring-4 ${currentStyle.ring}`}
                >
                    <X className="h-4 w-4 opacity-50 hover:opacity-100" />
                </button>
            )}
        </div>
    );
}

// Utility hook to manage single message state
export function useMessage() {
    const [message, setMessage] = useState<{ type: MessageType, text: string } | null>(null);

    const showMessage = React.useCallback((type: MessageType, text: string) => {
        setMessage({ type, text });
    }, []);

    const hideMessage = React.useCallback(() => setMessage(null), []);

    const MessageComponent = React.useMemo(() => message ? (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-md">
            <Message
                type={message.type}
                message={message.text}
                onClose={hideMessage}
            />
        </div>
    ) : null, [message, hideMessage]);

    return { showMessage, MessageComponent };
}
