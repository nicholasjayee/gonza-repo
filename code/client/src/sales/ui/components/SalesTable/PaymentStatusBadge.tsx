import React from 'react';

export function PaymentStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PAID: 'bg-emerald-500/10 text-emerald-600',
        UNPAID: 'bg-red-500/10 text-red-600',
        PARTIAL: 'bg-orange-500/10 text-orange-600',
        QUOTE: 'bg-blue-500/10 text-blue-600',
        INSTALLMENT: 'bg-purple-500/10 text-purple-600',
    };

    return (
        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}
