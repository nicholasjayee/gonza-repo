
import { useQuery } from '@tanstack/react-query';
import { getInventoryStatsAction } from '@/app/inventory/stats/actions';

export interface GlobalInventoryStats {
    totalCostValue: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
}

export const useGlobalInventoryStats = (businessId: string | undefined) => {
    return useQuery<GlobalInventoryStats>({
        queryKey: ['inventory_global_stats', businessId],
        queryFn: async (): Promise<GlobalInventoryStats> => {
            if (!businessId) {
                return {
                    totalCostValue: 0,
                    totalStockValue: 0,
                    lowStockCount: 0,
                    outOfStockCount: 0
                };
            }

            const result = await getInventoryStatsAction(businessId);

            if (result.success && result.data) {
                return result.data as GlobalInventoryStats;
            }

            console.error('Error fetching global stats:', result.error);
            // Return defaults on error to prevent ui crash
            return {
                totalCostValue: 0,
                totalStockValue: 0,
                lowStockCount: 0,
                outOfStockCount: 0
            };
        },
        enabled: !!businessId,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // Keep cache for 5 mins
    });
};
