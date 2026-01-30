"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

import { getBranchesAction } from "@/branches/api/controller";
import { Branch } from "@/branches/types";

// Removed BusinessLocation interface as we use Branch from types

interface BusinessContextType {
  currentBusiness: Branch | null;
  businessLocations: Branch[];
  switchBusiness: (
    businessId: string,
    onPasswordPrompt?: (
      businessId: string,
      businessName: string,
      onVerified: () => void,
    ) => void,
  ) => void;
  loadBusinessLocations: () => Promise<void>;
  createBusiness: (name: string) => Promise<Branch | null>;
  updateBusiness: (id: string, name: string) => Promise<boolean>;
  deleteBusiness: (id: string) => Promise<boolean>;
  resetBusiness: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined,
);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [currentBusiness, setCurrentBusiness] =
    useState<Branch | null>(null);
  const [businessLocations, setBusinessLocations] = useState<
    Branch[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusinessLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getBranchesAction();

      if (res.success && res.data) {
        setBusinessLocations(res.data);
        const activeBranch = res.data.find((b) => b.id === res.activeId);
        setCurrentBusiness(activeBranch || res.data[0] || null);
      } else {
        // If error is unauthorized, we just don't set business. 
        // Or we could redirect? For now, just handle gracefully.
        console.warn("Failed to load branches:", res.error);
        setError(res.error || "Failed to load branches");
        setCurrentBusiness(null);
        setBusinessLocations([]);
      }
    } catch (error) {
      console.error("Error loading business locations:", error);
      setError("Failed to load business data");
      setCurrentBusiness(null);
      setBusinessLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const switchBusiness = (
    businessId: string,
    onPasswordPrompt?: (
      businessId: string,
      businessName: string,
      onVerified: () => void,
    ) => void,
  ) => {
    const business = businessLocations.find((b) => b.id === businessId);
    if (!business) {
      console.error("Business not found:", businessId);
      return;
    }
    // Logic for password removed
    setCurrentBusiness(business);
    localStorage.setItem("currentBusinessId", business.id);
  };

  const createBusiness = async (
    name: string,
  ): Promise<Branch | null> => {
    // Implement using createBranchAction if needed
    return null;
  };

  const updateBusiness = async (id: string, name: string): Promise<boolean> => {
    setBusinessLocations((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name } : b)),
    );
    if (currentBusiness?.id === id) {
      setCurrentBusiness((prev) => (prev ? { ...prev, name } : null));
    }
    return true;
  };

  const deleteBusiness = async (id: string): Promise<boolean> => {
    setBusinessLocations((prev) => prev.filter((b) => b.id !== id));
    if (currentBusiness?.id === id) {
      const remaining = businessLocations.filter((b) => b.id !== id);
      const next = remaining[0] || null;
      setCurrentBusiness(next);
      if (next) localStorage.setItem("currentBusinessId", next.id);
      else localStorage.removeItem("currentBusinessId");
    }
    return true;
  };

  const resetBusiness = async (id: string): Promise<boolean> => {
    return true; // Mock success
  };

  useEffect(() => {
    loadBusinessLocations();
  }, []);

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        businessLocations,
        switchBusiness,
        loadBusinessLocations,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        resetBusiness,
        isLoading,
        error,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};
