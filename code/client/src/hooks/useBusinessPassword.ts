"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  setBranchPasswordAction, 
  verifyBranchPasswordAction, 
  removeBranchPasswordAction 
} from '@/branches/actions';

export const useBusinessPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Session storage key for verified businesses
  const VERIFIED_BUSINESSES_KEY = 'verified_businesses';

  const getVerifiedBusinesses = (): Set<string> => {
    try {
      const stored = sessionStorage.getItem(VERIFIED_BUSINESSES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const setBusinessVerified = (businessId: string) => {
    try {
      const verified = getVerifiedBusinesses();
      verified.add(businessId);
      sessionStorage.setItem(VERIFIED_BUSINESSES_KEY, JSON.stringify(Array.from(verified)));
    } catch (error) {
      console.error('Error storing verified business:', error);
    }
  };

  const isBusinessVerified = (businessId: string): boolean => {
    return getVerifiedBusinesses().has(businessId);
  };

  const clearVerifiedBusinesses = () => {
    try {
      sessionStorage.removeItem(VERIFIED_BUSINESSES_KEY);
    } catch (error) {
      console.error('Error clearing verified businesses:', error);
    }
  };

  const setBusinessPassword = async (businessId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Setting password for business:', businessId);
      
      const result = await setBranchPasswordAction(businessId, password);

      console.log('Server action response:', result);

      if (!result.success) {
        console.error('Error setting business password:', result.error);
        toast({
          title: "Failed to Set Password",
          description: result.error || "Please try again later.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Password Set Successfully",
        description: "Your business is now password protected.",
      });
      return true;
    } catch (error) {
      console.error('Error setting business password:', error);
      toast({
        title: "Failed to Set Password",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBusinessPassword = async (businessId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Verifying password for business:', businessId);
      
      const result = await verifyBranchPasswordAction(businessId, password);

      console.log('Verification response:', result);

      if (!result.success) {
        console.error('Error verifying business password:', result.error);
        toast({
          title: "Verification Failed",
          description: "Could not verify password. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      const isVerified = result.verified === true;
      
      if (isVerified) {
        setBusinessVerified(businessId);
        console.log('Password verified successfully for business:', businessId);
      } else {
        console.log('Password verification failed for business:', businessId);
        toast({
          title: "Incorrect Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
      }

      return isVerified;
    } catch (error) {
      console.error('Error verifying business password:', error);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeBusinessPassword = async (businessId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await removeBranchPasswordAction(businessId);

      if (!result.success) {
        console.error('Error removing business password:', result.error);
        toast({
          title: "Failed to Remove Password",
          description: result.error || "Please try again later.",
          variant: "destructive",
        });
        return false;
      }

      // Remove from verified list since password is removed
      const verified = getVerifiedBusinesses();
      verified.delete(businessId);
      sessionStorage.setItem(VERIFIED_BUSINESSES_KEY, JSON.stringify(Array.from(verified)));

      return true;
    } catch (error) {
      console.error('Error removing business password:', error);
      toast({
        title: "Failed to Remove Password",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setBusinessPassword,
    verifyBusinessPassword,
    removeBusinessPassword,
    isBusinessVerified,
    setBusinessVerified,
    clearVerifiedBusinesses,
  };
};