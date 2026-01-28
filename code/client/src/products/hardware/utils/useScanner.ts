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

        const currentTime = Date.now();
        const diff = currentTime - lastKeyTime.current;
        lastKeyTime.current = currentTime;

        // Characters arriving very fast (< 30ms) are almost certainly from a scanner
        const isScannerAction = diff < 30;

        if (e.key === 'Enter') {
            if (scanBuffer.current.length >= minChars) {
                e.preventDefault();
                e.stopPropagation();
                onScan(scanBuffer.current);
                scanBuffer.current = "";
                if (scanTimeout.current) clearTimeout(scanTimeout.current);
            }
            return;
        }

        if (e.key && e.key.length === 1) {
            // Buffer characters
            scanBuffer.current += e.key;

            // If it's fast, prevent it from typing into the focused input
            if (isScannerAction || scanBuffer.current.length > 1) {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    e.preventDefault();
                }
            }

            if (scanTimeout.current) clearTimeout(scanTimeout.current);
            scanTimeout.current = setTimeout(() => {
                if (scanBuffer.current.length >= minChars) {
                    onScan(scanBuffer.current);
                    scanBuffer.current = "";
                } else {
                    scanBuffer.current = "";
                }
            }, timeout);
        } else if (diff > 100) {
            // Clear buffer if pause is too long - manual typing or other keys
            scanBuffer.current = "";
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
