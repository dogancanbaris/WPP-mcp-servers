/**
 * useCascadedFilters Hook
 *
 * Implements a 3-level filter cascade: Global → Page → Component
 * Merges filters from all levels and provides them to chart components.
 *
 * This hook replaces the legacy useGlobalFilters hook for multi-page dashboards,
 * enabling page-level and component-level filter overrides.
 *
 * Filter Priority: Component > Page > Global
 */

import { useMemo } from 'react';
import { useFilterStore, getDateRangeFromFilter } from '@/store/filterStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { getMergedFilters, getFilterSource } from '@/lib/utils/filter-cascade';
import type { ComponentConfig } from '@/types/dashboard-builder';
import type { DatasetFilter } from '@/hooks/useGlobalFilters';

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
   * Merged filters from all 3 levels (ready to use in queries)
   * These are in DatasetFilter format (member, operator, values)
   */
  filters: DatasetFilter[];

  /**
   * Indicates which level is providing the active filters
   * Useful for UI badges and debugging
   */
  source: 'global' | 'page' | 'component' | 'none' | 'mixed';

  /**
   * Raw global filters (before merging)
   */
  globalFilters: DatasetFilter[];

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
 * Hook to get cascaded filters from all 3 levels (Global → Page → Component)
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
 * // Component with custom filters (overrides all parent filters)
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
 *     useGlobalFilters: false,
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

  // Get global filters from filter store
  // Select filters directly and memoize the enabled filter to prevent infinite loop
  const allFilters = useFilterStore((state) => state.filters);
  const globalFiltersRaw = useMemo(() =>
    allFilters.filter(f => f.enabled),
    [allFilters]
  );

  // Get current page ID from dashboard store if not provided
  const currentPageId = useDashboardStore((state) => state.currentPageId);
  const effectivePageId = pageId || currentPageId;

  // Get page filters from dashboard store
  // IMPORTANT: Use EMPTY_PAGES_ARRAY constant for fallback to prevent infinite re-renders
  const pages = useDashboardStore((state) => state.config?.pages || EMPTY_PAGES_ARRAY);
  const currentPage = effectivePageId ? pages.find(p => p.id === effectivePageId) : null;
  const pageFiltersRaw = currentPage?.filters;

  // Convert global filters to FilterConfig format for cascade merge
  // Note: FilterConfig from dashboard-builder has a different shape than GlobalFilter
  // We need to convert GlobalFilter → FilterConfig for cascade utilities
  const globalFiltersConfig = useMemo(() => {
    return globalFiltersRaw.map(filter => {
      if (filter.type === 'dateRange') {
        // Convert date range filter
        const { startDate, endDate } = getDateRangeFromFilter(filter);

        return {
          id: filter.id,
          field: filter.dimension === 'date' ? dateDimension : filter.dimension,
          operator: 'inDateRange',
          values: [startDate, endDate],
          enabled: filter.enabled,
        };
      } else if (filter.type === 'dimension') {
        return {
          id: filter.id,
          field: filter.dimension,
          operator: filter.operator,
          values: filter.values,
          enabled: filter.enabled,
        };
      } else if (filter.type === 'measure') {
        return {
          id: filter.id,
          field: filter.measure,
          operator: filter.operator,
          values: [filter.value.toString()],
          enabled: filter.enabled,
        };
      }
      return null;
    }).filter(Boolean) as any[];
  }, [globalFiltersRaw, dateDimension]);

  // Merge filters using cascade utility
  const mergedFiltersConfig = useMemo(
    () => getMergedFilters(globalFiltersConfig, pageFiltersRaw, componentConfig),
    [globalFiltersConfig, pageFiltersRaw, componentConfig]
  );

  // Convert merged FilterConfig to DatasetFilter format (for dataset queries)
  const mergedFiltersDataset = useMemo(() => {
    return mergedFiltersConfig.map(filter => ({
      member: filter.field,
      operator: filter.operator,
      values: filter.values,
    }));
  }, [mergedFiltersConfig]);

  // Determine filter source
  const source = useMemo(
    () => getFilterSource(globalFiltersConfig, pageFiltersRaw, componentConfig),
    [globalFiltersConfig, pageFiltersRaw, componentConfig]
  );

  // Convert global filters to DatasetFilter format
  const globalFiltersDataset = useMemo(() => {
    return globalFiltersConfig.map(f => ({
      member: f.field,
      operator: f.operator,
      values: f.values,
    }));
  }, [globalFiltersConfig]);

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
    globalFilters: globalFiltersDataset,
    pageFilters: pageFiltersDataset,
    componentFilters: componentFiltersDataset,
    activeFilterCount: mergedFiltersDataset.length,
    hasFilters: mergedFiltersDataset.length > 0,
    filterSummary,
  };
}

/**
 * Hook for date range filter only (most common use case)
 * Cascades through global → page → component levels
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
