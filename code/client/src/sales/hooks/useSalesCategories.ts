"use client";

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

  const createCategory = async (name: string) => {
    // Mock implementation
    const newCategory: SalesCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, name: string) => {
    // Mock implementation
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = async (id: string) => {
      // Mock implementation
      setCategories(categories.filter(c => c.id !== id));
  };

  return {
    categories,
    isLoading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
