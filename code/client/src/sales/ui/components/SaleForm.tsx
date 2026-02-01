/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { cookies } from 'next/headers';
import { getTemplatesAction } from '@/messaging/api/controller';
import { getCashAccountsAction } from '@/finance/api/controller';
import { SaleFormClient } from './saleform/SaleFormClient';
import { Sale } from '../../types';
import { MessageTemplate } from '@/messaging/types';
import { CashAccount } from '@/finance/types';


import { getSaleAction } from '@/sales/api/controller';
import { mapDbSaleToSale } from '@/types';

interface SaleFormProps {
    initialData?: Partial<Sale>;
    saleId?: string;
}

export async function SaleForm({ initialData: propInitialData, saleId }: SaleFormProps) {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get('userData')?.value;
    let userId: string | null = null;
    let templates: MessageTemplate[] = [];
    let cashAccounts: CashAccount[] = [];

    // Fetch sale data if ID is provided
    let fetchedInitialData: Partial<Sale> | undefined = undefined;
    if (saleId) {
        const saleRes = await getSaleAction(saleId);
        if (saleRes.success && saleRes.data) {
            // mapDbSaleToSale expects DbSale, but getSaleAction returns serialized DbSale. 
            // We need to ensure types match or cast. 
            // The controller returns { success: true, data: serialize(data) } where data is from SaleService.getById
            // SaleService.getById likely returns a DbSale.
            // Let's assume the data structure matches DbSale.
            fetchedInitialData = mapDbSaleToSale(saleRes.data as any);
        }
    }

    const initialData = propInitialData || fetchedInitialData;

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
