"use client";

import React from 'react';
import { Printer } from 'lucide-react';
import { printSaleReceipt } from '@/products/hardware/utils/print';
import { Sale } from '@/sales/types';

interface PrintReceiptButtonProps {
    sale: Sale;
}

export const PrintReceiptButton: React.FC<PrintReceiptButtonProps> = ({ sale }) => {
    return (
        <button
            onClick={() => printSaleReceipt(sale)}
            className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2"
        >
            <Printer className="h-4 w-4" />
            Print Receipt
        </button>
    );
};
