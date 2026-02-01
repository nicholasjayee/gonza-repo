import { useCurrentUser } from './useCurrentUser';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useProfiles } from '@/components/contexts/ProfileContext';
import { logActivityAction } from '@/app/actions/activity-actions';

export type ActivityType = 'CREATE' | 'UPDATE' | 'DELETE';
export type ModuleType = 'SALES' | 'INVENTORY' | 'EXPENSES' | 'FINANCE' | 'CUSTOMERS' | 'TASKS';

export interface ActivityLogData {
  activityType: ActivityType;
  module: ModuleType;
  entityType: string;
  entityId?: string;
  entityName: string;
  description: string;
  metadata?: Record<string, unknown> | null;
}

export const useActivityLogger = () => {
  const { userId } = useCurrentUser();
  const { currentBusiness } = useBusiness();
  
  const profilesContext = useProfiles();
  const currentProfile = profilesContext?.currentProfile || null;

  const logActivity = async (data: ActivityLogData) => {
    if (!userId || !currentBusiness?.id) {
      console.warn('Cannot log activity: missing user or business context');
      return;
    }

    try {
      const result = await logActivityAction({
        activityType: data.activityType,
        module: data.module,
        entityType: data.entityType,
        entityId: data.entityId || undefined,
        entityName: data.entityName,
        description: data.description,
        metadata: data.metadata || undefined,
        profileId: currentProfile?.id || undefined,
        profileName: currentProfile?.profile_name || undefined
      });

      if (!result.success) {
        console.error('Error logging activity:', result.error);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};