"use client";

import { useState, useEffect } from 'react';

export interface CashAccount {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  locationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useCashAccounts = () => {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      
      // Mock data
      setAccounts([
        { id: '1', name: 'Cash Drawer', description: 'Main cash drawer', isDefault: true, locationId: 'loc1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Petty Cash', description: 'Office petty cash', isDefault: false, locationId: 'loc1', createdAt: new Date(), updatedAt: new Date() },
      ]);
    } catch (error) {
      console.error('Error loading cash accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return {
    accounts,
    isLoading,
    loadAccounts
  };
};
