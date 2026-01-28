import { useState, useCallback } from 'react';
import { Sale } from '@/sales/types';

export function useSalesActions() {
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

    const handleViewReceipt = useCallback((sale: Sale) => {
        setSelectedSale(sale);
        setIsReceiptDialogOpen(true);
    }, []);

    const handleEditSale = useCallback((sale: Sale) => {
        // Navigate to edit page or open edit dialog
        console.log('Edit sale:', sale.id);
        // TODO: Implement navigation to edit page
    }, []);

    const handleDeleteSale = useCallback((sale: Sale) => {
        // This will be handled by the parent component
        console.log('Delete sale:', sale.id);
    }, []);

    const handleCloseReceiptDialog = useCallback(() => {
        setIsReceiptDialogOpen(false);
        setSelectedSale(null);
    }, []);

    return {
        selectedSale,
        isReceiptDialogOpen,
        handleViewReceipt,
        handleEditSale,
        handleDeleteSale,
        handleCloseReceiptDialog
    };
}
