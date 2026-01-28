import { useState, useEffect } from 'react';

export interface SalesCategory {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useSalesCategories = () => {
  const [categories, setCategories] = useState<SalesCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      
      // Mock data for now
      setCategories([
        { id: '1', name: 'Walk-in', isDefault: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Online', isDefault: false, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Referral', isDefault: false, createdAt: new Date(), updatedAt: new Date() },
      ]);
    } catch (error) {
      console.error('Error loading sales categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    loadCategories
  };
};
