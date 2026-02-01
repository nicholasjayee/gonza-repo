"use client";

import { useState } from 'react';
import { InstallmentPayment } from './useInstallmentPayments';

export interface PaymentChange {
  id: string;
  type: 'update' | 'delete' | 'create';
  originalPayment?: InstallmentPayment;
  updatedData?: Partial<InstallmentPayment>;
  newData?: Partial<InstallmentPayment>;
}

export const useLocalPaymentChanges = () => {
  const [pendingChanges, setPendingChanges] = useState<PaymentChange[]>([]);

  const addPaymentChange = (change: PaymentChange) => {
    setPendingChanges(prev => {
      // Check if there's already a change for this payment
      const existingIndex = prev.findIndex(c => c.id === change.id);
      
      if (existingIndex >= 0) {
        // Update existing change
        const newChanges = [...prev];
        newChanges[existingIndex] = change;
        return newChanges;
      }
      
      // Add new change
      return [...prev, change];
    });
  };

  const clearChanges = () => {
    setPendingChanges([]);
  };

  const getModifiedPayments = (payments: InstallmentPayment[]) => {
    return payments
      .filter(payment => {
        // Filter out deleted payments
        const deleteChange = pendingChanges.find(c => c.id === payment.id && c.type === 'delete');
        return !deleteChange;
      })
      .map(payment => {
        // Apply updates to payments
        const updateChange = pendingChanges.find(c => c.id === payment.id && c.type === 'update');
        if (updateChange && updateChange.updatedData) {
          return {
            ...payment,
            ...updateChange.updatedData,
          };
        }
        return payment;
      });
  };

  return {
    pendingChanges,
    addPaymentChange,
    clearChanges,
    getModifiedPayments
  };
};
