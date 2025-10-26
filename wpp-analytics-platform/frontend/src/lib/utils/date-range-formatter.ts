/**
 * Utility functions for formatting date ranges for dataset queries
 */

/**
 * DateRange type matching the format from ChartSetup.tsx
 */
export interface DateRange {
  type: 'preset' | 'custom';
  preset?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

/**
 * Format a Date object or string to YYYY-MM-DD format for dataset queries
 */
function formatDateForDataset(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  // If it's already a string, check if it needs formatting
  if (typeof date === 'string') {
    // If it looks like ISO format, extract just the date part
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    // Otherwise assume it's already in correct format
    return date;
  }
  return date;
}

/**
 * Convert DateRange object to dataset format
 *
 * Handles both:
 * - Custom date ranges with startDate/endDate
 * - Preset date ranges like 'last30days'
 *
 * @param dateRange DateRange object from component props
 * @param fallback Fallback value if dateRange is invalid (default: 'last 30 days')
 * @returns Dataset-compatible date range format
 */
export function formatDateRangeForDataset(
  dateRange: DateRange | null | undefined,
  fallback: string | string[] = 'last 30 days'
): string | string[] {
  if (!dateRange) {
    return fallback;
  }

  // Handle custom date ranges
  if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
    return [
      formatDateForDataset(dateRange.startDate),
      formatDateForDataset(dateRange.endDate)
    ];
  }

  // Handle preset date ranges
  if (dateRange.type === 'preset' && dateRange.preset) {
    return dateRange.preset;
  }

  // Fallback if dateRange is malformed
  return fallback;
}

/**
 * Create a dataset filter for date range
 *
 * @param dateRange DateRange object
 * @param memberName The dataset field name (e.g., 'date')
 * @returns Dataset filter object or null if no valid date range
 */
export function createDateRangeFilter(
  dateRange: DateRange | null | undefined,
  memberName: string
): { member: string; operator: string; values: string[] } | null {
  if (!dateRange) {
    return null;
  }

  // Handle custom date ranges
  if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
    return {
      member: memberName,
      operator: 'inDateRange',
      values: [
        formatDateForDataset(dateRange.startDate),
        formatDateForDataset(dateRange.endDate)
      ]
    };
  }

  // Handle preset date ranges
  if (dateRange.type === 'preset' && dateRange.preset) {
    return {
      member: memberName,
      operator: 'inDateRange',
      values: [dateRange.preset]
    };
  }

  return null;
}
