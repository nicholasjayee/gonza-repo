import { CreateSaleItemInput, DiscountType } from '../../../types';

export type SaleItem = CreateSaleItemInput & {
    id: string;
    showCostUI?: boolean;
    discountType: DiscountType;
};
