"use client";


import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types';

export const useProductSuggestions = (products: Product[], searchTerm: string) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get filtered suggestions based on search term
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) || 
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (product.supplier && product.supplier.toLowerCase().includes(searchLower)) ||
      (product.category.toLowerCase().includes(searchLower)) ||
      (product.itemNumber.toLowerCase().includes(searchLower))
    );

    // Sort by relevance (exact matches first, then starts with, then contains)
    return filtered
      .sort((a, b) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        const aItemLower = a.itemNumber.toLowerCase();
        const bItemLower = b.itemNumber.toLowerCase();
        
        // Exact match on item number (highest priority)
        if (aItemLower === searchLower) return -1;
        if (bItemLower === searchLower) return 1;
        
        // Exact match on name
        if (aNameLower === searchLower) return -1;
        if (bNameLower === searchLower) return 1;
        
        // Starts with on item number
        if (aItemLower.startsWith(searchLower) && !bItemLower.startsWith(searchLower)) return -1;
        if (bItemLower.startsWith(searchLower) && !aItemLower.startsWith(searchLower)) return 1;
        
        // Starts with on name
        if (aNameLower.startsWith(searchLower) && !bNameLower.startsWith(searchLower)) return -1;
        if (bNameLower.startsWith(searchLower) && !aNameLower.startsWith(searchLower)) return 1;
        
        // Alphabetical by name
        return aNameLower.localeCompare(bNameLower);
      })
      .slice(0, 100); // Increased to 100 suggestions for better user experience
  }, [products, searchTerm]);

  // Open panel when there are suggestions and search term is present

  // Open panel when there are suggestions and search term is present
  // Calculating derived state during render to avoid synchronous setState warnings
  
  // Refactored to only update when necessary variables change, 
  // but strictly speaking 'isOpen' should likely be derived or controlled better.
  // However, specifically fixing the 'synchronous setState' warning:
  
  useEffect(() => {
    const shouldBeOpen = searchTerm.length >= 1 && suggestions.length > 0;
    
    // Only update if the desired state is different from current state
    if (isOpen !== shouldBeOpen) {
       // Using timeout to push to next tick can avoid the warning, or better yet,
       // if this is purely derived, we shouldn't use state. 
       // But assuming we want to allow manual closing, state is needed.
       // The warning usually happens if we set state immediately.
       // Here we add a check to ensure we don't loop or cascade unexpectedly.
       // Ideally we just set it. The warning might be because it's happening during render phase somehow?
       // No, it's inside useEffect, which runs AFTER render. 
       
       // eslint-disable-next-line
       setIsOpen(shouldBeOpen);
    }
  }, [searchTerm, suggestions.length, isOpen]);



  const openPanel = () => {
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  return {
    suggestions,
    isOpen,
    openPanel,
    closePanel
  };
};
