/**
 * usePrefetchPages Hook - Intelligent Page Prefetching
 *
 * Prefetches adjacent pages on hover to improve perceived performance.
 * Implements smart prefetching strategy for multi-page dashboards.
 */

import { useQueryClient } from '@tanstack/react-query';
import { usePages } from '@/store/dashboardStore';
import { useCallback } from 'react';

export function usePrefetchPages() {
  const queryClient = useQueryClient();
  const pages = usePages();

  const prefetchPage = useCallback(
    (pageId: string) => {
      const page = pages?.find(p => p.id === pageId);
      if (!page) return;

      // Prefetch all components on this page
      page.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.component && column.component.dataset_id) {
            const { dataset_id, metrics, dimension } = column.component;

            // Only prefetch if component has required data configuration
            if (!dataset_id || !metrics || metrics.length === 0) return;

            queryClient.prefetchQuery({
              queryKey: ['page-component-data', pageId, column.component.id, dataset_id, metrics, dimension],
              queryFn: async () => {
                const params = new URLSearchParams({
                  metrics: (metrics || []).join(','),
                  ...(dimension && { dimensions: dimension }),
                });

                const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);
                return response.json();
              },
              staleTime: 5 * 60 * 1000,
            });
          }
        });
      });
    },
    [pages, queryClient]
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
