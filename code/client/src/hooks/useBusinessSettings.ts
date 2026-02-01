"use client";


import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { getBranchSettingsAction, updateBranchSettingsAction } from '@/app/settings/actions';

export interface BusinessSettings {
  id?: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLogo?: string;
  currency: string;
  signature?: string;
  paymentInfo?: string;
  defaultPrintFormat?: 'standard' | 'thermal';
}

// Utility function to parse payment info text into structured format
export const parsePaymentInfo = (paymentInfo: string): { method: string, accountNumber: string, accountName: string }[] => {
  if (!paymentInfo || paymentInfo.trim() === '') {
    return [];
  }

  const lines = paymentInfo.split('\n').filter(line => line.trim() !== '');
  const methods: { method: string, accountNumber: string, accountName: string }[] = [];

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      methods.push({
        method: lines[i].trim(),
        accountNumber: lines[i + 1].trim(),
        accountName: lines[i + 2].trim()
      });
    }
  }

  return methods;
};

// Utility function to convert payment methods array back to string format
export const convertPaymentMethodsToString = (paymentMethods: { method: string, accountNumber: string, accountName: string }[]): string => {
  return paymentMethods
    .filter(pm => pm.method.trim() !== '' || pm.accountNumber.trim() !== '' || pm.accountName.trim() !== '')
    .map(pm => `${pm.method}\n${pm.accountNumber}\n${pm.accountName}`)
    .join('\n');
};

// Default settings for new businesses
const getDefaultSettings = (): BusinessSettings => ({
  businessName: 'Your Business Name',
  businessAddress: 'Your Business Address',
  businessPhone: '(123) 456-7890',
  businessEmail: 'support@yourbusiness.com',
  currency: 'UGX',
  paymentInfo: '',
  defaultPrintFormat: 'standard'
});

export const useBusinessSettings = () => {
  const [settings, setSettings] = useState<BusinessSettings>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();

  const loadSettings = async (): Promise<BusinessSettings> => {
    if (!currentBusiness) {
      return getDefaultSettings();
    }

    try {
      const result = await getBranchSettingsAction(currentBusiness.id);
      
      if (!result.success || result.error) {
        console.error('Error loading business settings:', result.error);
        throw new Error(result.error || 'Failed to load settings');
      }

      if (result.data) {
        // Map from Prisma schema fields to hook interface
        return {
          id: result.data.id,
          businessName: result.data.businessName || 'Your Business Name',
          businessAddress: result.data.address || 'Your Business Address',
          businessPhone: result.data.phone || '(123) 456-7890',
          businessEmail: result.data.email || 'support@yourbusiness.com',
          businessLogo: result.data.logo || undefined,
          currency: result.data.currency || 'UGX',
          signature: result.data.signatureImage || undefined,
          paymentInfo: '',
          defaultPrintFormat: 'standard'
        };
      } else {
        return getDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
      toast({
        title: "Error",
        description: "Failed to load business settings. Please try again.",
        variant: "destructive"
      });
      return getDefaultSettings();
    }
  };

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    if (!currentBusiness) {
      console.error('No business selected for updating settings');
      toast({
        title: "Error",
        description: "No business selected",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Map from hook interface to Prisma schema fields
      const updateData: {
        businessName?: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        logo?: string;
        signatureImage?: string;
        enableSignature?: boolean;
        currency?: string;
      } = {};

      if (newSettings.hasOwnProperty('businessName')) updateData.businessName = newSettings.businessName;
      if (newSettings.hasOwnProperty('businessAddress')) updateData.address = newSettings.businessAddress;
      if (newSettings.hasOwnProperty('businessPhone')) updateData.phone = newSettings.businessPhone;
      if (newSettings.hasOwnProperty('businessEmail')) updateData.email = newSettings.businessEmail;
      if (newSettings.hasOwnProperty('businessLogo')) updateData.logo = newSettings.businessLogo;
      if (newSettings.hasOwnProperty('currency')) updateData.currency = newSettings.currency;
      if (newSettings.hasOwnProperty('signature')) {
        updateData.signatureImage = newSettings.signature;
        updateData.enableSignature = !!newSettings.signature;
      }

      const result = await updateBranchSettingsAction(currentBusiness.id, updateData);

      if (!result.success) {
        console.error('Error updating business settings:', result.error);
        throw new Error(result.error || 'Failed to update settings');
      }

      toast({
        title: "Success",
        description: "Business settings updated successfully"
      });

      // Refetch settings after update
      refetch();

      return true;
    } catch (error) {
      console.error('Error updating business settings:', error);
      toast({
        title: "Error",
        description: "Failed to update business settings. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // React Query for settings loading with proper caching
  const { data: queriedData, isLoading: isQueryLoading, isFetching, refetch } = useQuery({
    queryKey: ['businessSettings', currentBusiness?.id],
    queryFn: loadSettings,
    enabled: !!currentBusiness?.id,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Sync React Query data with local state
  useEffect(() => {
    if (queriedData) {
      setSettings(queriedData);
    } else if (!currentBusiness) {
      setSettings(getDefaultSettings());
    }
  }, [queriedData, currentBusiness]);

  // Sync loading state from React Query
  useEffect(() => {
    setIsLoading(isQueryLoading || isFetching);
  }, [isQueryLoading, isFetching]);

  return {
    settings,
    isLoading,
    updateSettings,
    loadSettings
  };
};
