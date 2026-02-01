import React from 'react';
import { Card, CardContent } from '@/inventory/components/ui/card';
import SaleItems from './SaleItems';
import TaxRateInput from './TaxRateInput';
import SaleTotals from './SaleTotals';
import { SaleItem, FormErrors } from '@/types';

interface SaleItemsManagerProps {
  items: SaleItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, updatedItem: SaleItem) => void;
  onRemoveItem: (index: number) => void;
  taxRateInput: string;
  onTaxRateChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: FormErrors;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  taxRate: number;
  currency: string;
  saleDate?: string;
}

const SaleItemsManager: React.FC<SaleItemsManagerProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  taxRateInput,
  onTaxRateChange,
  errors,
  totalAmount,
  taxAmount,
  grandTotal,
  taxRate,
  currency,
  saleDate,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 space-y-6">
        <SaleItems
          items={items}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
          saleDate={saleDate}
        />
        
        <TaxRateInput
          taxRateInput={taxRateInput}
          onTaxRateChange={onTaxRateChange}
          errors={errors}
        />
        
        <SaleTotals
          totalAmount={totalAmount}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          taxRate={taxRate}
          currency={currency}
        />
      </CardContent>
    </Card>
  );
};

export default SaleItemsManager;