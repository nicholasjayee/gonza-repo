import { QueryClient } from '@tanstack/react-query';

export const clearInventoryCaches = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['stockHistory'] });
  queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
  queryClient.invalidateQueries({ queryKey: ['inventorySales'] });
  queryClient.invalidateQueries({ queryKey: ['stockSummary'] });
};
