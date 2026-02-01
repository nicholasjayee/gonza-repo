export interface ActivityFilters {
    activityType: 'ALL' | 'CREATE' | 'UPDATE' | 'DELETE';
    module: 'ALL' | 'SALES' | 'INVENTORY' | 'EXPENSES' | 'FINANCE' | 'CUSTOMERS' | 'TASKS';
    search: string;
    dateRange: {
        from: Date | undefined;
        to: Date | undefined;
    };
}

export interface ActivityHistoryItem {
  id: string;
  user_id: string;
  location_id: string;
  activity_type: 'CREATE' | 'UPDATE' | 'DELETE';
  module: 'SALES' | 'INVENTORY' | 'EXPENSES' | 'FINANCE' | 'CUSTOMERS' | 'TASKS';
  entity_type: string;
  entity_id: string | null;
  entity_name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  created_at: string;
  profile_id: string | null;
  profile_name: string | null;
}
