import React from 'react';
import { cookies } from 'next/headers';
import { getTemplatesAction } from '@/messaging/api/controller';
import { getCashAccountsAction } from '@/finance/api/controller';
import { SaleFormClient } from './saleform/SaleFormClient';
import { Sale } from '../../types';
import { MessageTemplate } from '@/messaging/types';
import { CashAccount } from '@/finance/types';

interface SaleFormProps {
    initialData?: Partial<Sale>;
}

export async function SaleForm({ initialData }: SaleFormProps) {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get('userData')?.value;
    let userId: string | null = null;
    let templates: MessageTemplate[] = [];
    let cashAccounts: CashAccount[] = [];

    if (userDataStr) {
        try {
            const decodedData = decodeURIComponent(userDataStr);
            const user = JSON.parse(decodedData);
            userId = user.id;

            const templatesRes = await getTemplatesAction(user.id);
            if (templatesRes.success) {
                templates = (templatesRes.data as MessageTemplate[]) || [];
            }
        } catch (error) {
            console.error('Error parsing userData cookie:', error);
        }
    }

    const cashAccountsRes = await getCashAccountsAction();
    if (cashAccountsRes.success) {
        cashAccounts = (cashAccountsRes.data as CashAccount[]) || [];
    }

    return (
        <SaleFormClient
            initialData={initialData}
            templates={templates}
            cashAccounts={cashAccounts}
            userId={userId}
        />
    );
}
