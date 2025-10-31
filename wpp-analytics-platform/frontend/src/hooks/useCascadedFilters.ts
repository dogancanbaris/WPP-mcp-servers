/**
 * useCascadedFilters Hook
 *
 * Implements a 2-level filter cascade: Page → Component
 * Merges filters from page and component levels and provides them to chart components.
 *
 * Filter Priority: Component > Page
 */

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { getMergedFilters, getFilterSource } from '@/lib/utils/filter-cascade';
import type { ComponentConfig } from '@/types/dashboard-builder';

export type DatasetFilter = {
  member: string;
  operator: string;
  values: any[];
  // Preserve comparison metadata for API to build comparison period
  comparisonEnabled?: boolean;
  comparisonValues?: any[];
  comparisonType?: string;
};

// Re-export FilterConfig from dashboard-builder for convenience
export type { FilterConfig } from '@/types/dashboard-builder';

// Static empty array to prevent reference instability in selectors
// Used as fallback when config.pages is undefined to avoid infinite re-renders
const EMPTY_PAGES_ARRAY: any[] = [];

export interface UseCascadedFiltersOptions {
  /**
   * Page ID to retrieve page-level filters
   * If not provided, uses currentPageId from dashboard store
   */
  pageId?: string;

  /**
   * Component ID (for debugging/logging purposes)
   */
  componentId?: string;

  /**
   * Component configuration with filter overrides
   * Contains useGlobalFilters, usePageFilters, and componentFilters
   */
  componentConfig?: ComponentConfig;

  /**
   * Override date dimension mapping
   * Maps 'date' filter to a specific dimension for this chart
   * @default 'date'
   */
  dateDimension?: string;
}

export interface UseCascadedFiltersResult {
  /**
   * Merged filters from 2 levels (ready to use in queries)
   * These are in DatasetFilter format (member, operator, values)
   */
  filters: DatasetFilter[];

  /**
   * Indicates which level is providing the active filters
   * Useful for UI badges and debugging
   */
  source: 'page' | 'component' | 'none';

  /**
   * Raw page filters (before merging)
   */
  pageFilters: DatasetFilter[] | undefined;

  /**
   * Raw component filters (before merging)
   */
  componentFilters: DatasetFilter[] | undefined;

  /**
   * Number of active filters after cascade merge
   */
  activeFilterCount: number;

  /**
   * Whether any filters are active
   */
  hasFilters: boolean;

  /**
   * Human-readable filter summary
   */
  filterSummary: string;
}

/**
 * Hook to get cascaded filters from 2 levels (Page → Component)
 *
 * @example
 * // Basic usage in a chart component
 * const { filters } = useCascadedFilters({
 *   pageId: currentPageId,
 *   componentId: component.id,
 *   componentConfig: component,
 *   dateDimension: 'date',
 * });
 *
 * @example
 * // Component with custom filters (overrides page filters)
 * const { filters, source } = useCascadedFilters({
 *   componentConfig: {
 *     id: 'scorecard-1',
 *     type: 'scorecard',
 *     componentFilters: [
 *       { field: 'country', operator: 'equals', values: ['US'] }
 *     ]
 *   }
 * });
 * // source === 'component'
 *
 * @example
 * // Component that opts out of all filters
 * const { filters, source } = useCascadedFilters({
 *   componentConfig: {
 *     id: 'scorecard-2',
 *     type: 'scorecard',
 *     usePageFilters: false
 *   }
 * });
 * // filters === []
 * // source === 'none'
 */
export function useCascadedFilters(
  options: UseCascadedFiltersOptions = {}
): UseCascadedFiltersResult {
  const {
    pageId,
    componentId,
    componentConfig: componentConfigProp,
    dateDimension = 'date'
  } = options;

  // Memoize componentConfig to prevent infinite re-renders from reference changes
  const componentConfig = useMemo(() => componentConfigProp, [
    componentConfigProp?.id,
    componentConfigProp?.type,
    componentConfigProp?.useGlobalFilters,
    componentConfigProp?.usePageFilters,
    componentConfigProp?.componentFilters ? JSON.stringify(componentConfigProp.componentFilters) : undefined,
  ]);

  // Get current page ID from dashboard store if not provided
  const currentPageId = useDashboardStore((state) => state.currentPageId);
  const effectivePageId = pageId || currentPageId;

  // Get page filters from dashboard store
  // IMPORTANT: Use EMPTY_PAGES_ARRAY constant for fallback to prevent infinite re-renders
  const pages = useDashboardStore((state) => state.config?.pages || EMPTY_PAGES_ARRAY);
  const currentPage = effectivePageId ? pages.find(p => p.id === effectivePageId) : null;
  const pageFiltersRaw = currentPage?.filters;

  // Merge filters using cascade utility (Page → Component)
  const mergedFiltersConfig = useMemo(
    () => getMergedFilters(pageFiltersRaw, componentConfig),
    [pageFiltersRaw, componentConfig]
  );

  // Convert merged FilterConfig to DatasetFilter format (for dataset queries)
  const mergedFiltersDataset = useMemo(() => {
    const ds = mergedFiltersConfig.map(filter => ({
      member: filter.field,
      operator: filter.operator,
      values: filter.values,
      ...(filter.comparisonEnabled !== undefined ? { comparisonEnabled: filter.comparisonEnabled } : {}),
      ...(filter.comparisonValues !== undefined ? { comparisonValues: filter.comparisonValues } : {}),
      ...(filter.comparisonType !== undefined ? { comparisonType: filter.comparisonType } : {}),
    }));
    try {
      const summary = ds.map(f => `${f.member}:${f.operator}${f.comparisonEnabled ? '(cmp)' : ''}`).join(', ');
      console.log('[useCascadedFilters]', { componentId, pageId: effectivePageId, count: ds.length, summary });
    } catch {}
    return ds;
  }, [mergedFiltersConfig]);

  // Determine filter source
  const source = useMemo(
    () => getFilterSource(pageFiltersRaw, componentConfig),
    [pageFiltersRaw, componentConfig]
  );

  // Convert page filters to DatasetFilter format
  const pageFiltersDataset = useMemo(() => {
    if (!pageFiltersRaw || pageFiltersRaw.length === 0) return undefined;
    return pageFiltersRaw.map(f => ({
      member: f.field,
      operator: f.operator,
      values: f.values,
    }));
  }, [pageFiltersRaw]);

  // Convert component filters to DatasetFilter format
  const componentFiltersDataset = useMemo(() => {
    if (!componentConfig?.componentFilters || componentConfig.componentFilters.length === 0) {
      return undefined;
    }
    return componentConfig.componentFilters.map(f => ({
      member: f.field,
      operator: f.operator,
      values: f.values,
    }));
  }, [componentConfig?.componentFilters]);

  // Generate filter summary
  const filterSummary = useMemo(() => {
    if (mergedFiltersDataset.length === 0) return 'No filters applied';
    if (mergedFiltersDataset.length === 1) {
      const filter = mergedFiltersDataset[0];
      return `${filter.member} ${filter.operator}`;
    }
    return `${mergedFiltersDataset.length} filters active`;
  }, [mergedFiltersDataset]);

  return {
    filters: mergedFiltersDataset,
    source,
    pageFilters: pageFiltersDataset,
    componentFilters: componentFiltersDataset,
    activeFilterCount: mergedFiltersDataset.length,
    hasFilters: mergedFiltersDataset.length > 0,
    filterSummary,
  };
}

/**
 * Hook for date range filter only (most common use case)
 * Cascades through page → component levels
 */
export const useCascadedDateRangeFilter = (
  dateDimension: string = 'date',
  options: Omit<UseCascadedFiltersOptions, 'dateDimension'> = {}
) => {
  const result = useCascadedFilters({
    ...options,
    dateDimension,
  });

  // Filter to only date range filters
  const dateRangeFilters = result.filters.filter(f =>
    f.operator === 'inDateRange' ||
    f.operator === 'beforeDate' ||
    f.operator === 'afterDate'
  );

  return {
    ...result,
    filters: dateRangeFilters,
  };
};

export default useCascadedFilters;
