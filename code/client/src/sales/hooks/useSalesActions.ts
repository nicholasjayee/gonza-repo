"use client";

import { useState } from 'react';
import { Sale } from './useSalesData';

export const useSalesActions = () => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const handleEditSale = (sale: Sale) => {
    // Logic for editing sale.
    // Legacy might navigate or open modal.
    console.log("Edit sale:", sale);
    // TODO: Implement navigation or dialog for edit
  };

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptDialogOpen(true);
  };

  const handleDeleteSale = (deleteFn: (id: string) => Promise<boolean>) => async (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale? Stock will be restored.')) {
        await deleteFn(saleId);
    }
  };

  const handleCloseReceiptDialog = () => {
    setIsReceiptDialogOpen(false);
    setSelectedSale(null);
  };

  return {
    selectedSale,
    isReceiptDialogOpen,
    handleEditSale,
    handleViewReceipt,
    handleDeleteSale,
    handleCloseReceiptDialog
  };
};
