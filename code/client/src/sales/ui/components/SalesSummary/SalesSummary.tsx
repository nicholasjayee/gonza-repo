import React from 'react';
import { Sale } from '@/sales/types';
import { SalesSummaryClient } from './SalesSummaryClient';

interface SalesSummaryProps {
    sales: Sale[];
}

export const SalesSummary: React.FC<SalesSummaryProps> = ({ sales }) => {
    return <SalesSummaryClient sales={sales} />;
};
