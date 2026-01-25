"use client";

import React, { useState } from 'react';
import { BranchForm } from './BranchForm';
import { createBranchAction } from '../../api/controller';
import { useMessage } from '@/shared/ui/Message';
import { useRouter } from 'next/navigation';
import { Branch } from '../../types';

export function BranchSetupClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage, MessageComponent } = useMessage();
    const router = useRouter();

    const handleSetup = async (data: Omit<Branch, 'id' | 'adminId'>) => {
        setIsSubmitting(true);
        // Force the first branch to be MAIN
        const res = await createBranchAction({ ...data, type: 'MAIN' });
        if (res.success) {
            showMessage('success', 'Main Branch established! Welcome to Gonza.');
            // Small delay for the user to see the message
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } else {
            showMessage('error', res.error || 'Setup failed');
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {MessageComponent}
            <BranchForm
                onSubmit={handleSetup}
                isSubmitting={isSubmitting}
                initialData={{ type: 'MAIN', phone: '2080657652' }}
            />
        </>
    );
}
