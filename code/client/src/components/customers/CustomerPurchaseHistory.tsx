"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSalesData } from '@/hooks/useSalesData';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Sale } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import ReceiptDialog from '@/components/sales/ReceiptDialog';

interface CustomerPurchaseHistoryProps {
  customerId: string;
  customerName?: string;
}

const CustomerPurchaseHistory: React.FC<CustomerPurchaseHistoryProps> = ({ customerId, customerName }) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const { sales, isLoading } = useSalesData(user?.id, 'desc');


  const customerSales = React.useMemo(() => {
    if (!sales || sales.length === 0) return [];
    
    return sales.filter((sale) => {
       if (sale.customerId) {
         return sale.customerId === customerId;
       }
       if (customerName) {
         const matchesCustomer = sale.customerName?.toLowerCase().trim() === customerName.toLowerCase().trim();
         // Filter out manual statement entries (Adjustments and Manual Payments)
         const isManualEntry = sale.receiptNumber?.startsWith('ADJ-') || sale.receiptNumber?.startsWith('PAY-');
         return matchesCustomer && !isManualEntry;
       }
       return false;
    });
  }, [sales, customerId, customerName]);

  // Handle local state or simple pass through (if we need to fetch customer name, it should be passed in ideally)
  // For now we assume customerName is passed from parent (CustomerDetail likely has it)


  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${formatNumber(value)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "NOT PAID":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
      case "QUOTE":
        return <Badge className="bg-blue-100 text-blue-800">Quote</Badge>;
      case "INSTALLMENT SALE":
        return <Badge className="bg-purple-100 text-purple-800">Installment</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getItemsDisplay = (sale: Sale) => {
    if (!sale.items || sale.items.length === 0) {
      return "No items";
    }

    const first = sale.items[0];
    return sale.items.length === 1
      ? `${first.description} (${first.quantity})`
      : `${first.description} (+${sale.items.length - 1} more)`;
  };

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (customerSales.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <h3 className="text-lg font-medium text-gray-900">No purchase history found</h3>
        <p className="mt-1 text-sm text-gray-500">
          This customer hasn&apos;t made any purchases yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Receipt #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customerSales.map((sale) => (
              <TableRow
                key={sale.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(sale)}
              >
                <TableCell>{format(sale.date, 'MMM d, yyyy')}</TableCell>

                <TableCell>
                  <Link
                    href={`/sales?receipt=${sale.receiptNumber}`}
                    className="text-blue-600 hover:underline"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    {sale.receiptNumber}
                  </Link>
                </TableCell>

                <TableCell>
                  {formatCurrency(
                    sale.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                  )}
                </TableCell>

                <TableCell>
                  <span className="text-sm">{getItemsDisplay(sale)}</span>
                </TableCell>

                <TableCell>{getStatusBadge(sale.paymentStatus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedSale && (
        <ReceiptDialog
          isOpen={isReceiptDialogOpen}
          sale={selectedSale}
          currency={settings.currency}
          onOpenChange={() => {
            setIsReceiptDialogOpen(false);
            setSelectedSale(null);
          }}
        />
      )}
    </>
  );
};

export default CustomerPurchaseHistory;
