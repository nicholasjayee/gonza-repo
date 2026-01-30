import { useState, useCallback, useEffect } from "react";
import { useToast } from "./use-toast";
import {
  getCarriageInwardsAction,
  createCarriageInwardAction,
  updateCarriageInwardAction,
  deleteCarriageInwardAction,
  CarriageInwardFormData,
} from "@/app/inventory/carriage-inwards/actions";

export type { CarriageInwardFormData };

export interface CarriageInward {
  id: string;
  userId: string;
  locationId: string;
  supplierName: string;
  details: string;
  amount: number;
  date: Date;
  cashAccountId?: string;
  cashTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useCarriageInwards = () => {
  const [carriageInwards, setCarriageInwards] = useState<CarriageInward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadCarriageInwards = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCarriageInwardsAction();
      if (result.success && result.data) {
        // Deserialize dates if necessary (though serialize utility usually keeps them as strings/ISO)
        const rawData = result.data as Record<string, unknown>[];
        const formattedData: CarriageInward[] = rawData.map((item) => ({
          ...item,
          id: item.id as string,
          userId: item.userId as string,
          locationId: item.locationId as string,
          supplierName: item.supplierName as string,
          details: item.details as string,
          amount: Number(item.amount),
          date: new Date(item.date as string | Date),
          cashAccountId: item.cashAccountId as string | undefined,
          cashTransactionId: item.cashTransactionId as string | undefined,
          createdAt: new Date(item.createdAt as string | Date),
          updatedAt: new Date(item.updatedAt as string | Date),
        }));
        setCarriageInwards(formattedData);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error loading carriage inwards:", error);
      toast({
        title: "Error",
        description: "Failed to load carriage inwards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createCarriageInward = async (data: CarriageInwardFormData) => {
    try {
      const result = await createCarriageInwardAction(data);
      if (result.success) {
        await loadCarriageInwards();
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating carriage inwards:", error);
      throw error;
    }
  };

  const updateCarriageInward = async (
    id: string,
    updates: Partial<CarriageInwardFormData>
  ) => {
    try {
      const result = await updateCarriageInwardAction(id, updates);
      if (result.success) {
        await loadCarriageInwards();
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating carriage inwards:", error);
      return false;
    }
  };

  const deleteCarriageInward = async (id: string) => {
    try {
      const result = await deleteCarriageInwardAction(id);
      if (result.success) {
        await loadCarriageInwards();
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting carriage inwards:", error);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    loadCarriageInwards();
  }, [loadCarriageInwards]);

  return {
    carriageInwards,
    isLoading,
    createCarriageInward,
    updateCarriageInward,
    deleteCarriageInward,
    refreshCarriageInwards: loadCarriageInwards,
  };
};
