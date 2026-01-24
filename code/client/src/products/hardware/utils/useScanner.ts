"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseScannerOptions {
    onScan: (barcode: string) => void;
    minChars?: number;
    timeout?: number;
    enabled?: boolean;
}

export function useScanner({ onScan, minChars = 2, timeout = 50, enabled = true }: UseScannerOptions) {
    const scanBuffer = useRef("");
    const lastKeyTime = useRef(Date.now());
    const scanTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Skip if focus is on a text input (unless it's the barcode field itself, but usually we want global)
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

        // We allow scanning globally, but some systems might want to ignore if in other fields.
        // For now, let's follow the existing logic which was global.

        const currentTime = Date.now();
        const diff = currentTime - lastKeyTime.current;

        // Clear buffer if pause is too long (> 100ms) - characteristic of manual typing
        if (diff > 100) {
            scanBuffer.current = "";
        }

        lastKeyTime.current = currentTime;

        if (scanTimeout.current) clearTimeout(scanTimeout.current);

        if (e.key === 'Enter') {
            if (scanBuffer.current.length >= minChars) {
                e.preventDefault();
                onScan(scanBuffer.current);
                scanBuffer.current = "";
            }
        } else if (e.key && e.key.length === 1) {
            scanBuffer.current += e.key;

            scanTimeout.current = setTimeout(() => {
                if (scanBuffer.current.length >= minChars) {
                    onScan(scanBuffer.current);
                    scanBuffer.current = "";
                }
            }, timeout);
        }
    }, [onScan, minChars, timeout, enabled]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', handleKeyDown, true);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            if (scanTimeout.current) clearTimeout(scanTimeout.current);
        };
    }, [handleKeyDown]);

    return {
        getBuffer: () => scanBuffer.current,
        clearBuffer: () => { scanBuffer.current = ""; }
    };
}
