"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export const BackButton: React.FC = () => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/sales')}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
        >
            <ArrowLeft className="h-5 w-5" />
        </button>
    );
};
