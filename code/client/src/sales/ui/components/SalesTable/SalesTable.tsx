import React from 'react';
import { Sale } from '@/sales/types';
import { SalesTableClient } from './SalesTableClient';

interface SalesTableProps {
    sales: Sale[];
}

export const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
    return <SalesTableClient sales={sales} />;
};
