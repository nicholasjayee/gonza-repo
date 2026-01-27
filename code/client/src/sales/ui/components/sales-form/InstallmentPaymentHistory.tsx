import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { formatNumber } from '@/shared/utils/format';
import { InstallmentPayment } from '@/sales/hooks/useInstallmentPayments';
import { PaymentChange } from '@/sales/hooks/useLocalPaymentChanges';
import { format } from 'date-fns';
import { CashAccount } from '@/sales/hooks/useCashAccounts';

interface InstallmentPaymentHistoryProps {
  payments: InstallmentPayment[];
  currency: string;
  isLoading?: boolean;
  pendingChanges?: PaymentChange[];
  isLocalMode?: boolean;
  onStageChange?: (change: PaymentChange) => void;
  cashAccounts?: CashAccount[];
  onLinkToCash?: (paymentId: string, accountId: string) => Promise<void>;
  onUpdatePayment?: (paymentId: string, updates: { amount?: number; notes?: string; paymentDate?: Date }) => Promise<void>;
}

const InstallmentPaymentHistory: React.FC<InstallmentPaymentHistoryProps> = ({
  payments,
  currency,
  isLoading,
}) => {
  // Simplified implementation for now, focusing on display
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (payments.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No payments recorded yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{format(payment.paymentDate, 'MMM dd, yyyy')}</TableCell>
                <TableCell>{currency} {formatNumber(payment.amount)}</TableCell>
                <TableCell>{payment.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InstallmentPaymentHistory;
