"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sale } from '@/types';

export const useSalesActions = () => {
  const router = useRouter();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isDeletingSale, setIsDeletingSale] = useState(false);

  const handleEditSale = useCallback((sale: Sale) => {
    { sessionStorage.setItem('navigation_state', JSON.stringify({ editSale: sale })); router.push('/new-sale'); };
  }, [router]);

  const handleViewReceipt = useCallback((sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptDialogOpen(true);
  }, []);

  const handleDeleteSale = useCallback((deleteSale: (id: string) => Promise<boolean>) => {
    return async (sale: Sale) => {
      setIsDeletingSale(true);
      try {
        await deleteSale(sale.id);
      } finally {
        setIsDeletingSale(false);
      }
    };
  }, []);

  const handleCloseReceiptDialog = useCallback((open: boolean) => {
    setIsReceiptDialogOpen(open);
    if (!open) setSelectedSale(null);
  }, []);

  return {
    selectedSale,
    isReceiptDialogOpen,
    isDeletingSale,
    handleEditSale,
    handleViewReceipt,
    handleDeleteSale,
    handleCloseReceiptDialog
  };
};