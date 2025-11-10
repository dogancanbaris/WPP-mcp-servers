/**
 * usePrefetchPages Hook - Intelligent Page Prefetching
 *
 * Prefetches adjacent pages on hover to improve perceived performance.
 * Implements smart prefetching strategy for multi-page dashboards.
 */

import { useQueryClient } from '@tanstack/react-query';
import { usePages } from '@/store/dashboardStore';
import { useCallback } from 'react';
import { fetchChartData, DatasetFilterInput } from '@/lib/data/fetchChartData';
import type { ComponentConfig } from '@/types/dashboard-builder';
import type { PageConfig } from '@/types/page-config';

export function usePrefetchPages() {
  const queryClient = useQueryClient();
  const pages = usePages();

  const gatherComponents = useCallback((page: PageConfig) => {
    const layoutComponents =
      page.rows?.flatMap((row) =>
        row.columns
          .map((column) => column.component)
          .filter((component): component is ComponentConfig => Boolean(component))
      ) || [];

    const canvasComponents =
      page.components
        ?.map((canvas) => canvas.component)
        .filter((component): component is ComponentConfig => Boolean(component)) || [];

    return [...layoutComponents, ...canvasComponents];
  }, []);

  const getDimensions = (component: ComponentConfig) => {
    const inlineDims: string[] = [];
    if (component.dimension) inlineDims.push(component.dimension);
    if (component.breakdownDimension) inlineDims.push(component.breakdownDimension);

    const multiDims = Array.isArray((component as { dimensions?: string[] }).dimensions)
      ? ((component as { dimensions?: string[] }).dimensions || [])
      : [];

    return Array.from(new Set([...inlineDims, ...multiDims].filter(Boolean)));
  };

  const prefetchPage = useCallback(
    (pageId: string) => {
      const page = pages?.find(p => p.id === pageId);
      if (!page) return;

      const components = gatherComponents(page);

      components.forEach((component) => {
        const metrics = component.metrics || [];
        const hasBlend = Boolean(component.blendConfig && component.blendConfig.sources?.length);
        const hasDataset = Boolean(component.dataset_id);

        if (metrics.length === 0 || (!hasDataset && !hasBlend)) {
          return;
        }

        const dimensions = getDimensions(component);
        const filters: DatasetFilterInput[] | undefined = component.filters?.map((filter) => ({
          member: filter.field,
          operator: filter.operator,
          values: filter.values,
          comparisonEnabled: filter.comparisonEnabled,
          comparisonValues: filter.comparisonValues,
          comparisonType: filter.comparisonType,
        }));

        const blendKey = component.blendConfig ? JSON.stringify(component.blendConfig) : 'no-blend';

        queryClient.prefetchQuery({
          queryKey: [
            'page-component-data',
            pageId,
            component.id,
            component.dataset_id || 'blend-only',
            JSON.stringify(metrics),
            JSON.stringify(dimensions),
            filters ? JSON.stringify(filters) : 'no-filters',
            blendKey,
          ],
          queryFn: async () => {
            return fetchChartData({
              datasetId: component.dataset_id,
              blendConfig: component.blendConfig,
              dimensions,
              metrics,
              filters,
              chartType: component.type,
              sortBy: component.sortBy,
              sortDirection: component.sortDirection,
              limit: component.limit,
            });
          },
          staleTime: 5 * 60 * 1000,
        });
      });
    },
    [gatherComponents, pages, queryClient]
  );

  const prefetchAdjacentPages = useCallback(
    (currentPageId: string) => {
      if (!pages || pages.length === 0) return;

      const currentIndex = pages.findIndex(p => p.id === currentPageId);
      if (currentIndex === -1) return;

      // Prefetch next page
      if (currentIndex < pages.length - 1) {
        const nextPage = pages[currentIndex + 1];
        prefetchPage(nextPage.id);
      }

      // Prefetch previous page
      if (currentIndex > 0) {
        const prevPage = pages[currentIndex - 1];
        prefetchPage(prevPage.id);
      }
    },
    [pages, prefetchPage]
  );

  return {
    prefetchPage,
    prefetchAdjacentPages,
  };
}
