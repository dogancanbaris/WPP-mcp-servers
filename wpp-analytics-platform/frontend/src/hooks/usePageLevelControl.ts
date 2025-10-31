/**
 * usePageLevelControl Hook
 *
 * Custom hook for control components to emit page-level filters.
 * Provides a standardized interface for all control types (DateRange, Checkbox,
 * Dimension, Slider, List, Input) to communicate filter changes to the page.
 *
 * Usage:
 * ```tsx
 * function MyControl() {
 *   const { emitFilter, clearFilter, isOnPage, pageId } = usePageLevelControl('my-control-id');
 *
 *   const handleChange = (value: string) => {
 *     emitFilter({
 *       field: 'department',
 *       operator: 'equals',
 *       values: [value],
 *     });
 *   };
 *
 *   return <input onChange={(e) => handleChange(e.target.value)} />;
 * }
 * ```
 */

import { useDashboardStore } from '@/store/dashboardStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { FilterConfig } from '@/types/dashboard-builder';

export interface UsePageLevelControlReturn {
  /**
   * Emit a filter that will be applied to all components on the current page
   */
  emitFilter: (filter: Omit<FilterConfig, 'id' | 'enabled'>) => void;

  /**
   * Clear the filter emitted by this control
   */
  clearFilter: () => void;

  /**
   * Update an existing filter (partial update)
   */
  updateFilter: (updates: Partial<Omit<FilterConfig, 'id'>>) => void;

  /**
   * True if control is on an active page
   */
  isOnPage: boolean;

  /**
   * Current page ID (null if not on a page)
   */
  pageId: string | null;
}

/**
 * Hook for control components to emit page-level filters
 *
 * @param controlId - Unique ID for this control instance
 * @returns Methods to emit, clear, and update page-level filters
 */
export function usePageLevelControl(controlId: string): UsePageLevelControlReturn {
  const currentPageId = useDashboardStore((state) => state.currentPageId);
  const updatePageFilter = useDashboardStore((state) => state.updatePageFilter);
  const removePageFilter = useDashboardStore((state) => state.removePageFilter);
  const queryClient = useQueryClient();

  /**
   * Emit a filter that will be applied to all components on the current page
   */
  const emitFilter = useCallback(
    (filter: Omit<FilterConfig, 'id' | 'enabled'>) => {
      if (!currentPageId) {
        console.warn('[usePageLevelControl] No active page - cannot emit filter');
        return;
      }

      const fullFilter: FilterConfig = {
        id: `control-${controlId}`,
        ...filter,
        enabled: true,
      };

      updatePageFilter(currentPageId, fullFilter);

      // Invalidate all chart queries to trigger data refresh
      queryClient.invalidateQueries({
        queryKey: ['page-component-data', currentPageId],
      });
    },
    [currentPageId, controlId, updatePageFilter, queryClient]
  );

  /**
   * Clear the filter emitted by this control
   */
  const clearFilter = useCallback(() => {
    if (!currentPageId) return;

    removePageFilter(currentPageId, `control-${controlId}`);
    queryClient.invalidateQueries({
      queryKey: ['page-component-data', currentPageId],
    });
  }, [currentPageId, controlId, removePageFilter, queryClient]);

  /**
   * Update an existing filter (partial update)
   */
  const updateFilter = useCallback(
    (updates: Partial<Omit<FilterConfig, 'id'>>) => {
      if (!currentPageId) return;

      // Get current page filters
      const state = useDashboardStore.getState();
      const config = state.config;
      const page = config?.pages?.find((p) => p.id === currentPageId);
      const existingFilter = page?.filters?.find((f) => f.id === `control-${controlId}`);

      if (existingFilter) {
        const updatedFilter: FilterConfig = {
          ...existingFilter,
          ...updates,
        };
        updatePageFilter(currentPageId, updatedFilter);
        queryClient.invalidateQueries({
          queryKey: ['page-component-data', currentPageId],
        });
      }
    },
    [currentPageId, controlId, updatePageFilter, queryClient]
  );

  return {
    emitFilter,
    clearFilter,
    updateFilter,
    isOnPage: !!currentPageId,
    pageId: currentPageId,
  };
}

export default usePageLevelControl;
