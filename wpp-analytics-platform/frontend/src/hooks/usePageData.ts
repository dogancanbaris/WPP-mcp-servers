/**
 * usePageData Hook - Lazy Loading for Page Components
 *
 * Only fetches data when the page is currently active.
 * Provides efficient data loading across multi-page dashboards.
 */

import { useQuery } from '@tanstack/react-query';
import { useDashboardStore, useCurrentPageId } from '@/store/dashboardStore';

interface UsePageDataOptions {
  pageId: string;
  componentId: string;
  datasetId: string;
  metrics: string[];
  dimensions?: string[];
  filters?: any[];
  enabled?: boolean;
}

export function usePageData(options: UsePageDataOptions) {
  const { pageId, componentId, datasetId, metrics, dimensions, filters, enabled = true } = options;
  const currentPageId = useCurrentPageId();

  // Only fetch if this page is currently active
  const isPageActive = pageId === currentPageId;

  return useQuery({
    queryKey: ['page-component-data', pageId, componentId, datasetId, metrics, dimensions, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        metrics: metrics.join(','),
        ...(dimensions && { dimensions: dimensions.join(',') }),
        ...(filters && { filters: JSON.stringify(filters) }),
      });

      const response = await fetch(`/api/datasets/${datasetId}/query?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
    enabled: enabled && isPageActive, // Only fetch if page is active
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces deprecated cacheTime)
  });
}
