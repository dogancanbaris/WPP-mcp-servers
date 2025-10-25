/**
 * Global Filter Store
 *
 * Zustand store for managing dashboard-wide filters that apply to all charts.
 * Supports multiple filter types: date range, dimension filters, and metric filters.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Filter Types
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'inDateRange'
  | 'beforeDate'
  | 'afterDate'
  | 'inList'
  | 'notInList';

export interface DateRangeFilter {
  id: string;
  type: 'dateRange';
  label: string;
  dimension: string; // e.g., 'GoogleAds.date', 'SearchConsole.date'
  startDate: string; // ISO 8601 format
  endDate: string;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  enabled: boolean;
  scope?: 'all-pages' | 'current-page'; // Filter scope
}

export interface DimensionFilter {
  id: string;
  type: 'dimension';
  label: string;
  dimension: string; // e.g., 'GoogleAds.campaignName'
  operator: FilterOperator;
  values: string[];
  enabled: boolean;
  scope?: 'all-pages' | 'current-page'; // Filter scope
}

export interface MeasureFilter {
  id: string;
  type: 'measure';
  label: string;
  measure: string; // e.g., 'GoogleAds.cost'
  operator: FilterOperator;
  value: number;
  enabled: boolean;
  scope?: 'all-pages' | 'current-page'; // Filter scope
}

export type GlobalFilter = DateRangeFilter | DimensionFilter | MeasureFilter;

// Preset date ranges
export const DATE_RANGE_PRESETS = {
  today: {
    label: 'Today',
    getValue: () => ({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }),
  },
  yesterday: {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];
      return { startDate: date, endDate: date };
    },
  },
  last7Days: {
    label: 'Last 7 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  last30Days: {
    label: 'Last 30 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  last90Days: {
    label: 'Last 90 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  thisMonth: {
    label: 'This Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
    },
  },
  lastMonth: {
    label: 'Last Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  thisYear: {
    label: 'This Year',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
    },
  },
  lastYear: {
    label: 'Last Year',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  custom: {
    label: 'Custom Range',
    getValue: () => ({
      startDate: '',
      endDate: '',
    }),
  },
};

interface FilterState {
  // State
  filters: GlobalFilter[];
  activePreset: string | null;
  isFilterBarVisible: boolean;
  filterScope: 'all-pages' | 'current-page';

  // Actions
  addFilter: (filter: GlobalFilter) => void;
  updateFilter: (id: string, updates: Partial<GlobalFilter>) => void;
  removeFilter: (id: string) => void;
  toggleFilter: (id: string) => void;
  clearAllFilters: () => void;

  // Date range specific
  setDateRangePreset: (preset: keyof typeof DATE_RANGE_PRESETS) => void;
  setCustomDateRange: (startDate: string, endDate: string) => void;

  // Dimension filter helpers
  addDimensionFilter: (dimension: string, operator: FilterOperator, values: string[], label?: string) => void;

  // Measure filter helpers
  addMeasureFilter: (measure: string, operator: FilterOperator, value: number, label?: string) => void;

  // Scope management
  setFilterScope: (scope: 'all-pages' | 'current-page') => void;

  // UI Actions
  toggleFilterBar: () => void;
  setFilterBarVisible: (visible: boolean) => void;

  // Query generation
  getActiveFilters: () => GlobalFilter[];
  getCubeJSFilters: () => any[];
  getFilterSummary: () => string;

  // Simple active date range (for dashboard-wide filtering)
  activeDateRange: [string, string] | null;
  setActiveDateRange: (range: [string, string] | null) => void;
}

export const useFilterStore = create<FilterState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        filters: [],
        activePreset: 'last30Days',
        isFilterBarVisible: false,
        filterScope: 'all-pages',
        activeDateRange: null, // Simple active date range for dashboard-wide filtering

        // Add a new filter
        addFilter: (filter) =>
          set((state) => ({
            filters: [...state.filters, { ...filter, scope: filter.scope || state.filterScope } as GlobalFilter],
          }), false, 'addFilter'),

        // Update an existing filter
        updateFilter: (id, updates) =>
          set((state) => ({
            filters: state.filters.map((f) =>
              f.id === id ? { ...f, ...updates } : f
            ),
          }), false, 'updateFilter'),

        // Remove a filter
        removeFilter: (id) =>
          set((state) => ({
            filters: state.filters.filter((f) => f.id !== id),
          }), false, 'removeFilter'),

        // Toggle filter enabled/disabled
        toggleFilter: (id) =>
          set((state) => ({
            filters: state.filters.map((f) =>
              f.id === id ? { ...f, enabled: !f.enabled } : f
            ),
          }), false, 'toggleFilter'),

        // Clear all filters
        clearAllFilters: () =>
          set({ filters: [], activePreset: null }, false, 'clearAllFilters'),

        // Set date range from preset
        setDateRangePreset: (preset) => {
          const presetData = DATE_RANGE_PRESETS[preset];
          const { startDate, endDate } = presetData.getValue();

          set((state) => {
            // Remove existing date range filters
            const filtersWithoutDateRange = state.filters.filter(
              (f) => f.type !== 'dateRange'
            );

            // Add new date range filter if not custom (custom requires manual input)
            if (preset !== 'custom' && startDate && endDate) {
              const dateFilter: DateRangeFilter = {
                id: `dateRange-${Date.now()}`,
                type: 'dateRange',
                label: presetData.label,
                dimension: 'date', // Generic, will be mapped per chart
                startDate,
                endDate,
                granularity: 'day',
                enabled: true,
              };
              return {
                filters: [...filtersWithoutDateRange, dateFilter],
                activePreset: preset,
              };
            }

            return {
              filters: filtersWithoutDateRange,
              activePreset: preset,
            };
          }, false, 'setDateRangePreset');
        },

        // Set custom date range
        setCustomDateRange: (startDate, endDate) => {
          set((state) => {
            const filtersWithoutDateRange = state.filters.filter(
              (f) => f.type !== 'dateRange'
            );

            const dateFilter: DateRangeFilter = {
              id: `dateRange-${Date.now()}`,
              type: 'dateRange',
              label: `${startDate} to ${endDate}`,
              dimension: 'date',
              startDate,
              endDate,
              granularity: 'day',
              enabled: true,
            };

            return {
              filters: [...filtersWithoutDateRange, dateFilter],
              activePreset: 'custom',
            };
          }, false, 'setCustomDateRange');
        },

        // Add dimension filter helper
        addDimensionFilter: (dimension, operator, values, label) => {
          const filter: DimensionFilter = {
            id: `dimension-${Date.now()}`,
            type: 'dimension',
            label: label || `${dimension} ${operator} ${values.join(', ')}`,
            dimension,
            operator,
            values,
            enabled: true,
          };
          get().addFilter(filter);
        },

        // Add measure filter helper
        addMeasureFilter: (measure, operator, value, label) => {
          const filter: MeasureFilter = {
            id: `measure-${Date.now()}`,
            type: 'measure',
            label: label || `${measure} ${operator} ${value}`,
            measure,
            operator,
            value,
            enabled: true,
          };
          get().addFilter(filter);
        },

        // Set filter scope
        setFilterScope: (scope) =>
          set({ filterScope: scope }, false, 'setFilterScope'),

        // Toggle filter bar visibility
        toggleFilterBar: () =>
          set((state) => ({
            isFilterBarVisible: !state.isFilterBarVisible,
          }), false, 'toggleFilterBar'),

        setFilterBarVisible: (visible) =>
          set({ isFilterBarVisible: visible }, false, 'setFilterBarVisible'),

        // Simple active date range setter (for dashboard-wide filtering)
        setActiveDateRange: (range) =>
          set({ activeDateRange: range }, false, 'setActiveDateRange'),

        // Get only active (enabled) filters
        getActiveFilters: () => {
          return get().filters.filter((f) => f.enabled);
        },

        // Convert filters to Cube.js format
        getCubeJSFilters: () => {
          const activeFilters = get().getActiveFilters();

          return activeFilters.map((filter) => {
            if (filter.type === 'dateRange') {
              return {
                member: filter.dimension,
                operator: 'inDateRange',
                values: [filter.startDate, filter.endDate],
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
            return null;
          }).filter(Boolean);
        },

        // Get human-readable filter summary
        getFilterSummary: () => {
          const activeFilters = get().getActiveFilters();

          if (activeFilters.length === 0) {
            return 'No filters applied';
          }

          if (activeFilters.length === 1) {
            return activeFilters[0].label;
          }

          return `${activeFilters.length} filters active`;
        },
      }),
      {
        name: 'wpp-filter-storage',
        partialize: (state) => ({
          filters: state.filters,
          activePreset: state.activePreset,
          isFilterBarVisible: state.isFilterBarVisible,
          filterScope: state.filterScope,
        }),
      }
    )
  )
);

// Utility functions

/**
 * Generate a filter ID
 */
export const generateFilterId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get operator label
 */
export const getOperatorLabel = (operator: FilterOperator): string => {
  const labels: Record<FilterOperator, string> = {
    equals: 'equals',
    notEquals: 'does not equal',
    contains: 'contains',
    notContains: 'does not contain',
    startsWith: 'starts with',
    endsWith: 'ends with',
    gt: '>',
    gte: '≥',
    lt: '<',
    lte: '≤',
    inDateRange: 'in range',
    beforeDate: 'before',
    afterDate: 'after',
    inList: 'in',
    notInList: 'not in',
  };
  return labels[operator] || operator;
};

/**
 * Validate filter
 */
export const validateFilter = (filter: GlobalFilter): { valid: boolean; error?: string } => {
  if (filter.type === 'dateRange') {
    if (!filter.startDate || !filter.endDate) {
      return { valid: false, error: 'Start and end dates are required' };
    }
    if (new Date(filter.startDate) > new Date(filter.endDate)) {
      return { valid: false, error: 'Start date must be before end date' };
    }
  } else if (filter.type === 'dimension') {
    if (!filter.dimension) {
      return { valid: false, error: 'Dimension is required' };
    }
    if (!filter.values || filter.values.length === 0) {
      return { valid: false, error: 'At least one value is required' };
    }
  } else if (filter.type === 'measure') {
    if (!filter.measure) {
      return { valid: false, error: 'Measure is required' };
    }
    if (filter.value === undefined || filter.value === null) {
      return { valid: false, error: 'Value is required' };
    }
  }

  return { valid: true };
};
