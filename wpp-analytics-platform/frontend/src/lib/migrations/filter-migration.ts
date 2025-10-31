/**
 * Filter Migration Utility
 *
 * Provides backwards compatibility for old dashboards that stored
 * static date ranges. Migrates them to the new preset-based system.
 *
 * Use this when loading dashboards created before the preset system was implemented.
 */

// Type definitions for old filter format
export interface DateRangeFilter {
  type: 'dateRange';
  field?: string;
  preset?: string;
  startDate?: string;
  endDate?: string;
  customStartDate?: string;
  customEndDate?: string;
  [key: string]: any;
}

// Date range preset definitions
const DATE_RANGE_PRESETS = {
  today: {
    label: 'Today',
    getValue: () => {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      };
    },
  },
  yesterday: {
    label: 'Yesterday',
    getValue: () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
      };
    },
  },
  last7Days: {
    label: 'Last 7 Days',
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return {
        startDate: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      };
    },
  },
  last30Days: {
    label: 'Last 30 Days',
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return {
        startDate: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      };
    },
  },
  last90Days: {
    label: 'Last 90 Days',
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return {
        startDate: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      };
    },
  },
  thisMonth: {
    label: 'This Month',
    getValue: () => {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
    },
  },
  lastMonth: {
    label: 'Last Month',
    getValue: () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return {
        startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59),
      };
    },
  },
  custom: {
    label: 'Custom',
    getValue: () => ({ startDate: new Date(), endDate: new Date() }),
  },
};

/**
 * Migrate old static date filter to new preset-based filter
 *
 * Old format: { startDate: '2024-01-01', endDate: '2024-01-31' }
 * New format: { preset: 'last30Days' } OR { customStartDate: '...', customEndDate: '...' }
 */
export const migrateOldDateFilter = (
  oldFilter: DateRangeFilter
): DateRangeFilter => {
  // If already has preset field, it's already migrated
  if ((oldFilter as any).preset !== undefined) {
    return oldFilter;
  }

  // Try to detect if the date range matches a preset
  const startDate = (oldFilter as any).startDate;
  const endDate = (oldFilter as any).endDate;

  if (!startDate || !endDate) {
    return oldFilter; // Invalid filter, return as-is
  }

  // Check each preset to see if it matches
  for (const [presetKey, presetValue] of Object.entries(DATE_RANGE_PRESETS)) {
    if (presetKey === 'custom') continue;

    const { startDate: presetStart, endDate: presetEnd } = presetValue.getValue();

    // If the dates match a preset (within 1 day tolerance for edge cases)
    const startDiff = Math.abs(
      new Date(startDate).getTime() - new Date(presetStart).getTime()
    );
    const endDiff = Math.abs(
      new Date(endDate).getTime() - new Date(presetEnd).getTime()
    );

    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (startDiff <= ONE_DAY && endDiff <= ONE_DAY) {
      // Matches a preset! Migrate to preset-based filter
      return {
        ...oldFilter,
        preset: presetKey as keyof typeof DATE_RANGE_PRESETS,
        // Remove old fields
        startDate: undefined as any,
        endDate: undefined as any,
      };
    }
  }

  // Doesn't match any preset, treat as custom
  return {
    ...oldFilter,
    preset: 'custom',
    customStartDate: startDate,
    customEndDate: endDate,
    // Remove old fields
    startDate: undefined as any,
    endDate: undefined as any,
  };
};

/**
 * Migrate all filters in a dashboard config
 */
export const migrateDashboardFilters = (filters: DateRangeFilter[]): DateRangeFilter[] => {
  return filters.map(migrateOldDateFilter);
};

/**
 * Check if a dashboard needs migration
 */
export const needsFilterMigration = (filters: DateRangeFilter[]): boolean => {
  return filters.some(
    (f) =>
      f.type === 'dateRange' &&
      (f as any).preset === undefined &&
      ((f as any).startDate || (f as any).endDate)
  );
};
