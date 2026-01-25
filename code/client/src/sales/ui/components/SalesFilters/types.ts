import { PaymentStatus, SaleSource } from '@/sales/types';

export interface SalesFiltersState {
    minPrice: number;
    maxPrice: number;
    startDate: string;
    endDate: string;
    paymentStatus: PaymentStatus | '';
    source: SaleSource | '';
    datePreset?: string;
}
