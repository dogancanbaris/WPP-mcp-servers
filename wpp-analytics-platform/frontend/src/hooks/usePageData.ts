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
  fillGaps?: boolean;
  chartType?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export function usePageData(options: UsePageDataOptions) {
  const { pageId, componentId, datasetId, metrics, dimensions, filters, enabled = true, fillGaps, chartType, sortBy, sortDirection, limit } = options;
  const currentPageId = useCurrentPageId();

  // Only fetch if this page is currently active
  const isPageActive = pageId === currentPageId;

  return useQuery({
    queryKey: ['page-component-data', pageId, componentId, datasetId, JSON.stringify(metrics), JSON.stringify(dimensions), JSON.stringify(filters), fillGaps ? 'fillGaps' : 'noFill', chartType, sortBy, sortDirection, limit],
    queryFn: async () => {
      const enabledNow = enabled && isPageActive;
      if (!enabledNow) {
        console.log('[usePageData] Skipping fetch (disabled or inactive page):', { pageId, currentPageId, componentId, datasetId, enabled, isPageActive });
      }
      const params = new URLSearchParams({
        metrics: metrics.join(','),
        ...(dimensions && { dimensions: dimensions.join(',') }),
        ...(filters && { filters: JSON.stringify(filters) }),
        ...(fillGaps ? { fillGaps: 'true' } : {}),
        ...(chartType && { chartType }),
        ...(sortBy && { sortBy }),
        ...(sortDirection && { sortDirection }),
        ...(limit !== undefined && { limit: limit.toString() }),
      });

      const url = `/api/datasets/${datasetId}/query?${params}`;
      console.log('[usePageData] Fetching:', { url, componentId, pageId, metrics, dimensions, filtersCount: filters?.length || 0, fillGaps, chartType, sortBy, sortDirection, limit });
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        console.error('[usePageData] Fetch failed:', { status: response.status, statusText: response.statusText, body: text });
        throw new Error('Failed to fetch data');
      }
      const json = await response.json();
      const shape = Array.isArray(json?.data) ? 'array' : (json?.data ? Object.keys(json.data) : 'none');
      console.log('[usePageData] Response:', { success: json?.success, rowCount: json?.rowCount, shape });
      return json;
    },
    enabled: enabled && isPageActive, // Only fetch if page is active
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces deprecated cacheTime)
  });
}
