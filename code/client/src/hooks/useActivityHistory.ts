"use client";

import { useState, useCallback } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { ActivityFilters, ActivityHistoryItem } from '@/types/activity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActivityHistoryAction } from '@/app/actions/activity-actions';

const ITEMS_PER_PAGE = 20;

export const useActivityHistory = (locationId?: string, filters?: ActivityFilters) => {
  const { userId } = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const fetchActivities = useCallback(async (): Promise<{ activities: ActivityHistoryItem[], count: number }> => {
    if (!userId || !locationId) {
      return { activities: [], count: 0 };
    }

    try {
      const response = await getActivityHistoryAction(locationId, currentPage, ITEMS_PER_PAGE, filters);
      
      if (!response.success || !response.data) {
        console.error('Error fetching activity history:', response.error);
        return { activities: [], count: 0 };
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching activity history:', error);
      return { activities: [], count: 0 };
    }
  }, [userId, locationId, currentPage, filters]);

  // React Query caching
  const queryKey = ['activity_history', userId, locationId, currentPage, filters];
  const { data: queriedData, isLoading: isQueryLoading } = useQuery({
    queryKey,
    queryFn: fetchActivities,
    enabled: !!userId && !!locationId,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Derived state directly from query data to avoid useEffect sync state updates
  const activities = queriedData?.activities || [];
  const totalCount = queriedData?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Derived loading state
  const isLoading = isQueryLoading && !queriedData;

  const refetchActivities = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    activities,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch: refetchActivities
  };
};