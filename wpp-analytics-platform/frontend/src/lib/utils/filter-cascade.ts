/**
 * Filter Cascade Utilities
 *
 * Implements a 3-level filter hierarchy: Global Filters → Page Filters → Component Filters
 * Each level can override the parent level with proper priority logic.
 *
 * Priority Order: Component > Page > Global
 *
 * @module filter-cascade
 */

import type { FilterConfig, ComponentConfig } from '@/types/dashboard-builder';

/**
 * Extended component config interface for filter cascade support
 * This extends ComponentConfig with filter-specific properties
 */
export interface ComponentConfigWithFilters extends ComponentConfig {
  /**
   * Whether this component should use global filters
   * Default: true (inherits global filters)
   */
  useGlobalFilters?: boolean;

  /**
   * Whether this component should use page-level filters
   * Default: true (inherits page filters)
   */
  usePageFilters?: boolean;

  /**
   * Component-specific filters that override all parent filters
   * When set, these REPLACE all global and page filters
   */
  componentFilters?: FilterConfig[];
}

/**
 * Merges filters from 3 levels (global → page → component) with proper override logic
 *
 * Strategy: REPLACE, not MERGE
 * - If page has filters, they REPLACE global filters
 * - If component has filters, they REPLACE all parent filters
 * - Components can opt out of filters entirely
 *
 * Priority: Component > Page > Global
 *
 * @param globalFilters - Dashboard-level filters (apply to all components by default)
 * @param pageFilters - Page-level filters (override global for this page)
 * @param componentConfig - Component configuration with opt-out flags
 * @returns Merged filter array for this specific component
 *
 * @example
 * // Scenario 1: Global filters only
 * const filters = getMergedFilters(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   undefined,
 *   undefined
 * );
 * // Result: [{ field: 'date', operator: 'last_n_days', values: ['30'] }]
 *
 * @example
 * // Scenario 2: Page overrides global
 * const filters = getMergedFilters(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   [{ field: 'date', operator: 'last_n_days', values: ['7'] }],
 *   undefined
 * );
 * // Result: [{ field: 'date', operator: 'last_n_days', values: ['7'] }]
 *
 * @example
 * // Scenario 3: Component overrides all
 * const filters = getMergedFilters(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   [{ field: 'date', operator: 'last_n_days', values: ['7'] }],
 *   {
 *     id: 'comp1',
 *     type: 'scorecard',
 *     componentFilters: [{ field: 'date', operator: 'all_time', values: [] }]
 *   }
 * );
 * // Result: [{ field: 'date', operator: 'all_time', values: [] }]
 *
 * @example
 * // Scenario 4: Component opts out of all filters
 * const filters = getMergedFilters(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   [{ field: 'date', operator: 'last_n_days', values: ['7'] }],
 *   {
 *     id: 'comp1',
 *     type: 'scorecard',
 *     useGlobalFilters: false,
 *     usePageFilters: false
 *   }
 * );
 * // Result: []
 */
export function getMergedFilters(
  globalFilters: FilterConfig[],
  pageFilters: FilterConfig[] | undefined,
  componentConfig?: ComponentConfigWithFilters
): FilterConfig[] {
  const useGlobal = componentConfig?.useGlobalFilters !== false; // default true
  const usePage = componentConfig?.usePageFilters !== false; // default true

  let filters: FilterConfig[] = [];

  // Apply page vs global with REPLACE strategy, honoring toggles
  if (usePage && pageFilters && pageFilters.length > 0) {
    filters = pageFilters;
  } else if (useGlobal) {
    filters = globalFilters;
  } else {
    filters = [];
  }

  // Component-level overrides
  if (componentConfig) {
    // If both toggles are off and no component filters, result is empty
    if (!useGlobal && !usePage && (!componentConfig.componentFilters || componentConfig.componentFilters.length === 0)) {
      return [];
    }

    // Component filters replace all
    if (componentConfig.componentFilters && componentConfig.componentFilters.length > 0) {
      return componentConfig.componentFilters;
    }
  }

  return filters;
}

/**
 * Determines where the active filters are originating from
 * Useful for UI indicators to show users which level is controlling filters
 *
 * @param globalFilters - Dashboard-level filters
 * @param pageFilters - Page-level filters
 * @param componentConfig - Component configuration
 * @returns Filter source identifier for UI display
 *
 * @example
 * // Component has its own filters
 * getFilterSource(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   undefined,
 *   { id: 'c1', type: 'scorecard', componentFilters: [{ field: 'country', operator: 'equals', values: ['US'] }] }
 * );
 * // Returns: 'component'
 *
 * @example
 * // Page filters active
 * getFilterSource(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   [{ field: 'date', operator: 'last_n_days', values: ['7'] }],
 *   { id: 'c1', type: 'scorecard' }
 * );
 * // Returns: 'page'
 *
 * @example
 * // Global filters active
 * getFilterSource(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   undefined,
 *   { id: 'c1', type: 'scorecard' }
 * );
 * // Returns: 'global'
 *
 * @example
 * // Component opted out
 * getFilterSource(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   undefined,
 *   { id: 'c1', type: 'scorecard', useGlobalFilters: false, usePageFilters: false }
 * );
 * // Returns: 'none'
 */
export function getFilterSource(
  globalFilters: FilterConfig[],
  pageFilters: FilterConfig[] | undefined,
  componentConfig?: ComponentConfigWithFilters
): 'global' | 'page' | 'component' | 'none' | 'mixed' {
  const useGlobal = componentConfig?.useGlobalFilters !== false; // default true
  const usePage = componentConfig?.usePageFilters !== false; // default true

  // Component overrides
  if (componentConfig?.componentFilters && componentConfig.componentFilters.length > 0) {
    return 'component';
  }

  if (!useGlobal && !usePage) {
    return 'none';
  }

  if (usePage && pageFilters && pageFilters.length > 0) {
    return 'page';
  }

  if (useGlobal && globalFilters.length > 0) {
    return 'global';
  }

  return 'none';
}

/**
 * Merges two filter arrays by field name (for additive merging if needed)
 *
 * Currently we use REPLACE strategy in getMergedFilters(), but this utility
 * enables MERGE strategy if requirements change in the future.
 *
 * When merging, later filters override earlier filters for the same field.
 * This allows fine-grained control: keep most parent filters but override specific ones.
 *
 * @param base - Base filter array (lower priority)
 * @param override - Override filter array (higher priority)
 * @returns Combined filter array with overrides applied
 *
 * @example
 * // Merge filters while overriding specific fields
 * const merged = mergeFilterArrays(
 *   [
 *     { field: 'date', operator: 'last_n_days', values: ['30'] },
 *     { field: 'country', operator: 'equals', values: ['US'] }
 *   ],
 *   [
 *     { field: 'date', operator: 'last_n_days', values: ['7'] }
 *   ]
 * );
 * // Result: [
 * //   { field: 'country', operator: 'equals', values: ['US'] },
 * //   { field: 'date', operator: 'last_n_days', values: ['7'] }
 * // ]
 *
 * @example
 * // Add new filter without overriding
 * const merged = mergeFilterArrays(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   [{ field: 'country', operator: 'equals', values: ['US'] }]
 * );
 * // Result: [
 * //   { field: 'date', operator: 'last_n_days', values: ['30'] },
 * //   { field: 'country', operator: 'equals', values: ['US'] }
 * // ]
 */
export function mergeFilterArrays(
  base: FilterConfig[],
  override: FilterConfig[]
): FilterConfig[] {
  // Create map of base filters by field name for O(1) lookup
  const filterMap = new Map(base.map(f => [f.field, f]));

  // Override or add filters from the override array
  // This ensures later filters replace earlier ones for the same field
  override.forEach(f => filterMap.set(f.field, f));

  // Convert map back to array (maintains insertion order)
  return Array.from(filterMap.values());
}

/**
 * Checks if a component is using any filters at all
 * Useful for conditional rendering of filter indicators
 *
 * @param globalFilters - Dashboard-level filters
 * @param pageFilters - Page-level filters
 * @param componentConfig - Component configuration
 * @returns true if component has active filters, false otherwise
 *
 * @example
 * hasActiveFilters(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   undefined,
 *   undefined
 * );
 * // Returns: true
 *
 * @example
 * hasActiveFilters(
 *   [{ field: 'date', operator: 'last_n_days', values: ['30'] }],
 *   undefined,
 *   { id: 'c1', type: 'scorecard', useGlobalFilters: false, usePageFilters: false }
 * );
 * // Returns: false
 */
export function hasActiveFilters(
  globalFilters: FilterConfig[],
  pageFilters: FilterConfig[] | undefined,
  componentConfig?: ComponentConfigWithFilters
): boolean {
  const mergedFilters = getMergedFilters(globalFilters, pageFilters, componentConfig);
  return mergedFilters.length > 0;
}

/**
 * Gets a human-readable description of the filter source
 * Useful for tooltips and accessibility labels
 *
 * @param source - Filter source from getFilterSource()
 * @returns Human-readable description
 *
 * @example
 * getFilterSourceDescription('global');
 * // Returns: 'Using dashboard-wide filters'
 *
 * @example
 * getFilterSourceDescription('component');
 * // Returns: 'Using component-specific filters'
 */
export function getFilterSourceDescription(
  source: 'global' | 'page' | 'component' | 'none' | 'mixed'
): string {
  const descriptions: Record<typeof source, string> = {
    global: 'Using dashboard-wide filters',
    page: 'Using page-level filters',
    component: 'Using component-specific filters',
    none: 'No filters applied',
    mixed: 'Using mixed filter sources'
  };

  return descriptions[source];
}
