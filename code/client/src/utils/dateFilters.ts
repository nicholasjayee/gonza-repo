import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns';

export const dateFilters = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Last Week', value: 'last-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
  { label: 'All Time', value: 'all' },
];

export const getDateRange = (filter: string) => {
  const now = new Date();
  switch (filter) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case 'this-week':
      return { from: startOfWeek(now), to: endOfWeek(now) };
    case 'last-week':
      const lastWeek = subWeeks(now, 1);
      return { from: startOfWeek(lastWeek), to: endOfWeek(lastWeek) };
    case 'this-month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last-month':
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    case 'this-year':
      return { from: startOfYear(now), to: endOfYear(now) };
    case 'last-year':
      const lastYear = subYears(now, 1);
      return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    default:
      return { from: undefined, to: undefined };
  }
};

export const getDateRangeFromFilter = (filter: string) => {
    return getDateRange(filter);
};
