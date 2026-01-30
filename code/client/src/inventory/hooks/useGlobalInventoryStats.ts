import { useQuery } from "@tanstack/react-query";
import { getInventoryStatsAction } from "@/app/inventory/actions";

export interface GlobalInventoryStats {
  totalCostValue: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export const useGlobalInventoryStats = (businessId: string | undefined) => {
  return useQuery<GlobalInventoryStats>({
    queryKey: ["inventory_global_stats", businessId],
    queryFn: async (): Promise<GlobalInventoryStats> => {
      if (!businessId) {
        return {
          totalCostValue: 0,
          totalStockValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        };
      }

      const res = await getInventoryStatsAction();
      if (res.success && res.data) {
        return res.data;
      }
      return {
          totalCostValue: 0,
          totalStockValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
      };
    },
    enabled: !!businessId,
  });
};
