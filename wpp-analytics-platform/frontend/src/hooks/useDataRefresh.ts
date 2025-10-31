import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboardStore';

/**
 * Hook to auto-refresh data at midnight for dashboards using preset date filters
 * Makes dashboards "live" - data updates daily automatically
 *
 * This hook:
 * 1. Checks for active preset date filters (today, last7Days, etc.)
 * 2. At midnight (00:00), invalidates all React Query caches
 * 3. Causes all charts to refetch with updated date ranges
 *
 * Example: A dashboard with "Last 7 Days" filter will automatically
 * update at midnight to show the new rolling 7-day window.
 */
export const useDataRefresh = () => {
  const queryClient = useQueryClient();
  const paused = useDashboardStore((s) => s.pauseUpdates);

  useEffect(() => {
    // Check every minute for midnight
    const interval = setInterval(() => {
      if (paused) return; // Updates paused by user
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // At midnight (00:00)
      if (currentHour === 0 && currentMinute === 0) {
        console.log('[Auto-Refresh] Refreshing dashboard data at midnight');
        queryClient.invalidateQueries();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [queryClient, paused]);
};
