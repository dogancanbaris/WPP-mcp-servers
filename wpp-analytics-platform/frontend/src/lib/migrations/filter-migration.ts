/**
 * Filter Migration Utility
 *
 * Provides backwards compatibility for old dashboards that stored
 * static date ranges. Migrates them to the new preset-based system.
 *
 * Use this when loading dashboards created before the preset system was implemented.
 */

import { DateRangeFilter, DATE_RANGE_PRESETS } from '@/store/filterStore';

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
