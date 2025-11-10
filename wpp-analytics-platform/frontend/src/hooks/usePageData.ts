/**
 * usePageData Hook - Lazy Loading for Page Components
 *
 * Only fetches data when the page is currently active.
 * Provides efficient data loading across multi-page dashboards.
 */

import { useQuery } from '@tanstack/react-query';
import { useDashboardStore, useCurrentPageId } from '@/store/dashboardStore';
import { fetchChartData } from '@/lib/data/fetchChartData';
import type { BlendConfig } from '@/types/dashboard-builder';

interface UsePageDataOptions {
  pageId: string;
  componentId: string;
  datasetId?: string;
  metrics: string[];
  dimensions?: string[];
  filters?: any[];
  enabled?: boolean;
  fillGaps?: boolean;
  chartType?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
  blendConfig?: BlendConfig;
}

export function usePageData(options: UsePageDataOptions) {
  const { pageId, componentId, datasetId, metrics, dimensions, filters, enabled = true, fillGaps, chartType, sortBy, sortDirection, limit, blendConfig } = options;
  const currentPageId = useCurrentPageId();

  // Only fetch if this page is currently active
  const isPageActive = pageId === currentPageId;
  const normalizedDatasetId = datasetId || undefined;

  const derivedBlendConfig = useDashboardStore((state) => {
    if (!componentId) return undefined;
    const pages = state.config.pages || [];
    const targetPage =
      pages.find((p) => p.id === pageId) ||
      pages.find((p) => p.id === state.currentPageId) ||
      pages[0];
    if (!targetPage) return undefined;
    const canvasComponent = targetPage.components?.find((comp) => comp.component.id === componentId);
    if (canvasComponent) {
      return canvasComponent.component.blendConfig;
    }
    for (const row of targetPage.rows) {
      for (const col of row.columns) {
        if (col.component?.id === componentId) {
          return col.component.blendConfig;
        }
      }
    }
    return undefined;
  });

  const effectiveBlendConfig = blendConfig ?? derivedBlendConfig;
  const blendKey = effectiveBlendConfig ? JSON.stringify(effectiveBlendConfig) : 'no-blend';
  const hasDataset = Boolean(normalizedDatasetId) || Boolean(effectiveBlendConfig);

  return useQuery({
    queryKey: ['page-component-data', pageId, componentId, normalizedDatasetId || 'blend-only', JSON.stringify(metrics), JSON.stringify(dimensions), JSON.stringify(filters), fillGaps ? 'fillGaps' : 'noFill', chartType, sortBy, sortDirection, limit, blendKey],
    queryFn: async () => {
      const enabledNow = enabled && isPageActive;
      if (!enabledNow) {
        console.log('[usePageData] Skipping fetch (disabled or inactive page):', { pageId, currentPageId, componentId, datasetId, enabled, isPageActive });
      }
      const json = await fetchChartData({
        datasetId: normalizedDatasetId,
        blendConfig: effectiveBlendConfig,
        metrics,
        dimensions: dimensions || [],
        filters,
        fillGaps,
        chartType,
        sortBy,
        sortDirection,
        limit,
      });
      const shape = Array.isArray(json?.data) ? 'array' : (json?.data ? Object.keys(json.data) : 'none');
      console.log('[usePageData] Response:', { success: json?.success, rowCount: json?.rowCount, shape });
      return json;
    },
    enabled: enabled && isPageActive && hasDataset, // Only fetch if page is active
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces deprecated cacheTime)
  });
}
