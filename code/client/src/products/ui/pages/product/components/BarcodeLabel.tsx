"use client";

import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { Printer } from "lucide-react";

interface BarcodeLabelProps {
    value: string;
    name?: string;
    price?: number;
    currency?: string;
}

import { printBarcode } from '@/products/hardware/utils/print';

export function BarcodeLabel({ value, name, price, currency = "UGX" }: BarcodeLabelProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        printBarcode({ name: name || "Product", barcode: value, price: price || 0, currency });
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border border-border rounded-xl bg-card shadow-sm">
            <div ref={printRef} className="bg-white p-2 rounded shadow-inner">
                <Barcode
                    value={value}
                    width={1.5}
                    height={60}
                    fontSize={12}
                    margin={10}
                />
            </div>
            <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition-all transition-colors"
            >
                <Printer className="h-4 w-4" />
                Print Label
            </button>
        </div>
    );
}
