"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseScannerOptions {
    onScan: (barcode: string) => void;
    minChars?: number;
    timeout?: number;
    enabled?: boolean;
}

export function useScanner({ onScan, minChars = 2, timeout = 250, enabled = true }: UseScannerOptions) {
    const scanBuffer = useRef("");
    const lastKeyTime = useRef(Date.now());
    const scanTimeout = useRef<NodeJS.Timeout | null>(null);
    const isFastScan = useRef(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        const currentTime = Date.now();
        const diff = currentTime - lastKeyTime.current;
        lastKeyTime.current = currentTime;

        // Detect if this is a scanner action (fast key arrival)
        // Most scanners send keys every 5-30ms.
        const isCurrentlyFast = diff < 50;
        if (isCurrentlyFast) {
            isFastScan.current = true;
        }

        // Reset if it's the start of a new potential scan
        if (scanBuffer.current === "") {
            // Note: the first char will always have a large diff, so isFastScan starts false
            isFastScan.current = false;
        }

        const target = e.target as HTMLElement;
        const isInInputField = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        if (e.key === 'Enter') {
            if (scanBuffer.current.length >= minChars) {
                // If in an input, only trigger if we detected scanner-like speed
                if (!isInInputField || isFastScan.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    onScan(scanBuffer.current);
                }
                scanBuffer.current = "";
                isFastScan.current = false;
                if (scanTimeout.current) clearTimeout(scanTimeout.current);
            }
            return;
        }

        if (e.key && e.key.length === 1) {
            // Always buffer characters
            scanBuffer.current += e.key;

            // If we've detected it's a scanner, prevent it from typing into the focused input
            // Scanners are fast, so usually isFastScan becomes true on the second char.
            if (isInInputField && isFastScan.current) {
                e.preventDefault();
            }

            if (scanTimeout.current) clearTimeout(scanTimeout.current);
            scanTimeout.current = setTimeout(() => {
                if (scanBuffer.current.length >= minChars) {
                    // Only trigger if it was a fast scan OR not in an input field
                    if (!isInInputField || isFastScan.current) {
                        onScan(scanBuffer.current);
                    }
                }
                scanBuffer.current = "";
                isFastScan.current = false;
            }, timeout);
        } else if (diff > 200) {
            // Clear buffer if pause is too long (manual navigation or non-printable keys)
            scanBuffer.current = "";
            isFastScan.current = false;
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
        clearBuffer: () => { scanBuffer.current = ""; isFastScan.current = false; }
    };
}
