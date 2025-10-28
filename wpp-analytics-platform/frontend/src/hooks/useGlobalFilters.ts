/**
 * useGlobalFilters Hook
 *
 * Custom hook for integrating global filters with dataset queries.
 * Automatically applies active filters to chart queries.
 */

import { useMemo } from 'react';
import { useFilterStore, GlobalFilter, DATE_RANGE_PRESETS } from '@/store/filterStore';

// Dataset query types
export interface DatasetFilter {
  member: string; // Changed from 'field' to 'member' to match actual usage
  operator: string;
  values: (string | number)[];
}

export interface Query {
  filters?: DatasetFilter[];
  [key: string]: any;
}

/**
 * Utility to get date range from filter with preset evaluation
 * Evaluates presets dynamically (today, last7Days, etc.)
 */
export const getDateRangeFromFilter = (filter: GlobalFilter & { type: 'dateRange' }): { startDate: string; endDate: string } => {
  // If filter has a preset and it's not 'custom', evaluate it dynamically
  if ((filter as any).preset && (filter as any).preset !== 'custom') {
    const preset = (filter as any).preset as keyof typeof DATE_RANGE_PRESETS;
    if (DATE_RANGE_PRESETS[preset]) {
      return DATE_RANGE_PRESETS[preset].getValue();
    }
  }

  // Otherwise use custom dates (new structure) or fallback to old startDate/endDate
  if ((filter as any).customStartDate && (filter as any).customEndDate) {
    return {
      startDate: (filter as any).customStartDate,
      endDate: (filter as any).customEndDate,
    };
  }

  // Fallback for old structure (backwards compatibility)
  return {
    startDate: (filter as any).startDate || '',
    endDate: (filter as any).endDate || '',
  };
};

interface UseGlobalFiltersOptions {
  /**
   * Override date dimension mapping
   * Maps 'date' to a specific dimension for this chart
   * @default 'date'
   */
  dateDimension?: string;

  /**
   * Disable global filters for this chart
   * @default false
   */
  disabled?: boolean;

  /**
   * Only apply specific filter types
   */
  includeTypes?: Array<'dateRange' | 'dimension' | 'measure'>;

  /**
   * Exclude specific filter types
   */
  excludeTypes?: Array<'dateRange' | 'dimension' | 'measure'>;

  /**
   * Custom filter transformation function
   */
  transformFilters?: (filters: DatasetFilter[]) => DatasetFilter[];
}

interface UseGlobalFiltersReturn {
  /**
   * Active filters in dataset format
   */
  filters: DatasetFilter[];

  /**
   * Raw global filters
   */
  globalFilters: GlobalFilter[];

  /**
   * Number of active filters
   */
  activeFilterCount: number;

  /**
   * Apply filters to a dataset query
   */
  applyToQuery: (query: Query) => Query;

  /**
   * Check if filters are applied
   */
  hasFilters: boolean;

  /**
   * Human-readable filter summary
   */
  filterSummary: string;
}

/**
 * Hook to get and apply global filters to dataset queries
 */
export const useGlobalFilters = (
  options: UseGlobalFiltersOptions = {}
): UseGlobalFiltersReturn => {
  const {
    dateDimension = 'date',
    disabled = false,
    includeTypes,
    excludeTypes,
    transformFilters,
  } = options;

  const { getActiveFilters, getFilterSummary } = useFilterStore();

  const globalFilters = useMemo(() => {
    if (disabled) return [];
    return getActiveFilters();
  }, [disabled, getActiveFilters]);

  const filters = useMemo(() => {
    if (disabled) return [];

    let activeFilters = globalFilters;

    if (includeTypes) {
      activeFilters = activeFilters.filter((f) => includeTypes.includes(f.type));
    }

    if (excludeTypes) {
      activeFilters = activeFilters.filter((f) => !excludeTypes.includes(f.type));
    }

    let datasetFilters: DatasetFilter[] = activeFilters.map((filter) => {
      if (filter.type === 'dateRange') {
        // ✅ EVALUATE PRESET DYNAMICALLY
        const { startDate, endDate } = getDateRangeFromFilter(filter);

        return {
          member: filter.dimension === 'date' ? dateDimension : filter.dimension,
          operator: 'inDateRange',
          values: [startDate, endDate],
        };
      } else if (filter.type === 'dimension') {
        return {
          member: filter.dimension,
          operator: filter.operator,
          values: filter.values,
        };
      } else if (filter.type === 'measure') {
        return {
          member: filter.measure,
          operator: filter.operator,
          values: [filter.value.toString()],
        };
      }
      return null as any;
    }).filter(Boolean);

    if (transformFilters) {
      datasetFilters = transformFilters(datasetFilters);
    }

    return datasetFilters;
  }, [
    disabled,
    globalFilters,
    includeTypes,
    excludeTypes,
    dateDimension,
    transformFilters,
  ]);

  const applyToQuery = useMemo(
    () => (query: Query): Query => {
      if (disabled || filters.length === 0) {
        return query;
      }

      // Merge with existing filters
      const existingFilters = query.filters || [];
      const mergedFilters = [...existingFilters, ...filters];

      return {
        ...query,
        filters: mergedFilters,
      };
    },
    [disabled, filters]
  );

  return {
    filters,
    globalFilters,
    activeFilterCount: globalFilters.length,
    applyToQuery,
    hasFilters: globalFilters.length > 0,
    filterSummary: getFilterSummary(),
  };
};

/**
 * Hook for date range filter only (most common use case)
 */
export const useDateRangeFilter = (dateDimension: string = 'date') => {
  return useGlobalFilters({
    dateDimension,
    includeTypes: ['dateRange'],
  });
};

/**
 * Hook for dimension filters only
 */
export const useDimensionFilters = () => {
  return useGlobalFilters({
    includeTypes: ['dimension'],
  });
};

/**
 * Hook for measure filters only
 */
export const useMeasureFilters = () => {
  return useGlobalFilters({
    includeTypes: ['measure'],
  });
};

/**
 * Get filter badge props for displaying filter count
 */
export const useFilterBadge = () => {
  const { getActiveFilters, getFilterSummary } = useFilterStore();

  return useMemo(() => {
    const activeFilters = getActiveFilters();
    return {
      count: activeFilters.length,
      summary: getFilterSummary(),
      hasFilters: activeFilters.length > 0,
    };
  }, [getActiveFilters, getFilterSummary]);
};

export default useGlobalFilters;
