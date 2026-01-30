/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { getStockSummaryReportAction } from "@/app/inventory/actions";
import { toast } from "sonner";

export const useStockSummaryData = (dateRange: {
  from: Date | undefined;
  to: Date | undefined;
}) => {
  const [stockSummaryData, setStockSummaryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStockSummaryData = useCallback(async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
        const res = await getStockSummaryReportAction(dateRange.from, dateRange.to);
        if (res.success && res.data) {
            setStockSummaryData(res.data);
        } else {
             toast.error(res.error || "Failed to load summary");
        }
    } catch (e) {
        console.error(e);
        toast.error("Error loading summary");
    } finally {
        setIsLoading(false);
    }
  }, [dateRange]);

  const clearCache = useCallback(() => {
    // Dummy clear cache
    console.log("Cache cleared");
  }, []);

  const clearAllLocationCaches = useCallback(() => {
    // Dummy clear all caches
    console.log("All location caches cleared");
  }, []);

  // Load data initially (simulated)
  // useEffect(() => {
  //   loadStockSummaryData();
  // }, [loadStockSummaryData]);
  // Commented out to avoid "setState in useEffect" issues if not handled carefully,
  // but usually we want this. The components seem to call loadStockSummaryData manually or in their own useEffect.

  return {
    stockSummaryData,
    isLoading,
    loadStockSummaryData,
    clearCache,
    clearAllLocationCaches,
  };
};
