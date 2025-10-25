/**
 * Hook for handling dashboard data refresh events
 *
 * Usage in chart components:
 * ```tsx
 * const refreshKey = useRefreshData();
 *
 * const { resultSet, isLoading, error } = useCubeQuery(queryConfig, {
 *   skip: !shouldQuery,
 *   cubeApi,
 *   resetResultSetOnChange: true
 * });
 *
 * // Or use refreshKey as dependency:
 * useEffect(() => {
 *   // Refetch data when refreshKey changes
 * }, [refreshKey]);
 * ```
 */

import { useEffect, useState } from 'react';

export const useRefreshData = (): number => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[useRefreshData] Refresh event received', customEvent.detail);

      // Increment refresh key to trigger re-renders in components
      setRefreshKey(prev => prev + 1);
    };

    // Listen for refresh events
    window.addEventListener('refresh-dashboard-data', handleRefresh);

    return () => {
      window.removeEventListener('refresh-dashboard-data', handleRefresh);
    };
  }, []);

  return refreshKey;
};
