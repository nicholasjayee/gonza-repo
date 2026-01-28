"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sale } from '@/dashboard/types';
import SalesForm from '@/sales/ui/components/SalesForm';
import ReceiptDialog from '@/sales/ui/components/ReceiptDialog';
import NewCustomerDialog from '@/customers/ui/components/NewCustomerDialog';
import { useCustomerCategories } from '@/shared/hooks/useCustomerCategories';

const NewSalePage = () => {
  const searchParams = useSearchParams();
  const editSaleId = searchParams.get('edit');
  
  // Mock edit sale data loading if needed
  const editSale: Sale | undefined = undefined; 

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  
  const handleSaleSuccess = () => {
    // Show receipt or redirect
    console.log('Sale completed successfully');
    // For now, just show a success message or clear form
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{editSale ? 'Edit Sale' : 'New Sale'}</h1>
      
      <SalesForm 
        initialData={editSale}
        onSuccess={handleSaleSuccess}
        onCancel={handleCancel}
      />

      <ReceiptDialog 
        isOpen={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        sale={completedSale}
        currency="UGX"
      />

      <NewCustomerDialog
        open={newCustomerDialogOpen}
        onClose={() => setNewCustomerDialogOpen(false)}
        onAddCustomer={(data) => console.log('Add customer', data)}
      />
    </div>
  );
};

export default NewSalePage;
