"use client";

import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears
} from 'date-fns';
import { cn } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';

/**
 * DateRangeFilter - Interactive calendar control for dashboard-wide date filtering
 *
 * Features:
 * - Quick date presets (Today, Last 7 days, This month, etc.)
 * - Custom range picker with dual-month calendar
 * - Comparison mode (compare to previous period)
 * - Global filter application via dashboard context
 * - Dataset time dimensions integration
 *
 * Usage:
 * ```tsx
 * <DateRangeFilter
 *   value={dateRange}
 *   onChange={setDateRange}
 *   onApply={(filter) => applyGlobalFilter(filter)}
 *   showComparison={true}
 * />
 * ```
 */

export interface DateRange {
  type: 'preset' | 'custom';
  preset?: DatePresetValue;
  startDate?: Date;
  endDate?: Date;
}

export interface DateRangeComparison {
  enabled: boolean;
  comparisonStartDate?: Date;
  comparisonEndDate?: Date;
}

export interface DateRangeFilterValue {
  range: DateRange;
  comparison: DateRangeComparison;
}

export interface DatasetTimeDimension {
  dimension: string;
  dateRange?: [string, string] | string;
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  onApply?: (timeDimension: DatasetTimeDimension) => void;
  showComparison?: boolean;
  dimension?: string; // Dataset dimension name (e.g., 'Orders.createdAt')
  granularity?: DatasetTimeDimension['granularity'];
  className?: string;
  disabled?: boolean;
}

type DatePresetValue =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last14days'
  | 'last28days'
  | 'last30days'
  | 'last90days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

interface DatePreset {
  value: DatePresetValue;
  label: string;
  icon?: React.ReactNode;
  getDateRange: () => { startDate: Date; endDate: Date };
  category: 'relative' | 'period' | 'custom';
}

const DATE_PRESETS: DatePreset[] = [
  {
    value: 'today',
    label: 'Today',
    icon: <Clock className="h-3 w-3" />,
    category: 'relative',
    getDateRange: () => ({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
    }),
  },
  {
    value: 'yesterday',
    label: 'Yesterday',
    category: 'relative',
    getDateRange: () => ({
      startDate: startOfDay(subDays(new Date(), 1)),
      endDate: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    value: 'last7days',
    label: 'Last 7 days',
    category: 'relative',
    getDateRange: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        startDate: startOfDay(subDays(yesterday, 6)),
        endDate: endOfDay(yesterday),
      };
    },
  },
  {
    value: 'last14days',
    label: 'Last 14 days',
    category: 'relative',
    getDateRange: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        startDate: startOfDay(subDays(yesterday, 13)),
        endDate: endOfDay(yesterday),
      };
    },
  },
  {
    value: 'last28days',
    label: 'Last 28 days',
    category: 'relative',
    getDateRange: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        startDate: startOfDay(subDays(yesterday, 27)),
        endDate: endOfDay(yesterday),
      };
    },
  },
  {
    value: 'last30days',
    label: 'Last 30 days',
    category: 'relative',
    getDateRange: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        startDate: startOfDay(subDays(yesterday, 29)),
        endDate: endOfDay(yesterday),
      };
    },
  },
  {
    value: 'last90days',
    label: 'Last 90 days',
    category: 'relative',
    getDateRange: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        startDate: startOfDay(subDays(yesterday, 89)),
        endDate: endOfDay(yesterday),
      };
    },
  },
  {
    value: 'thisWeek',
    label: 'This week',
    category: 'period',
    getDateRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    value: 'lastWeek',
    label: 'Last week',
    category: 'period',
    getDateRange: () => {
      const lastWeek = subDays(new Date(), 7);
      return {
        startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        endDate: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    },
  },
  {
    value: 'thisMonth',
    label: 'This month',
    category: 'period',
    getDateRange: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    }),
  },
  {
    value: 'lastMonth',
    label: 'Last month',
    category: 'period',
    getDateRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      };
    },
  },
  {
    value: 'thisQuarter',
    label: 'This quarter',
    category: 'period',
    getDateRange: () => ({
      startDate: startOfQuarter(new Date()),
      endDate: endOfQuarter(new Date()),
    }),
  },
  {
    value: 'lastQuarter',
    label: 'Last quarter',
    category: 'period',
    getDateRange: () => {
      const lastQuarter = subQuarters(new Date(), 1);
      return {
        startDate: startOfQuarter(lastQuarter),
        endDate: endOfQuarter(lastQuarter),
      };
    },
  },
  {
    value: 'thisYear',
    label: 'This year',
    category: 'period',
    getDateRange: () => ({
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
    }),
  },
  {
    value: 'lastYear',
    label: 'Last year',
    category: 'period',
    getDateRange: () => {
      const lastYear = subYears(new Date(), 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
      };
    },
  },
  {
    value: 'custom',
    label: 'Custom range',
    category: 'custom',
    getDateRange: () => ({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
    }),
  },
];

export function DateRangeFilter({
  value,
  onChange,
  onApply,
  showComparison = false,
  dimension = 'createdAt',
  granularity = 'day',
  className,
  disabled = false,
}: DateRangeFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);

  // Calculate actual dates for preset values
  const actualDateRange = useMemo(() => {
    if (value.range.type === 'preset' && value.range.preset && value.range.preset !== 'custom') {
      const preset = DATE_PRESETS.find(p => p.value === value.range.preset);
      return preset ? preset.getDateRange() : null;
    }
    if (value.range.type === 'custom' && value.range.startDate && value.range.endDate) {
      return {
        startDate: value.range.startDate,
        endDate: value.range.endDate,
      };
    }
    return null;
  }, [value.range]);

  // Calculate comparison period
  const comparisonDateRange = useMemo(() => {
    if (!value.comparison.enabled || !actualDateRange) return null;

    const duration = actualDateRange.endDate.getTime() - actualDateRange.startDate.getTime();
    const comparisonEndDate = new Date(actualDateRange.startDate.getTime() - 1);
    const comparisonStartDate = new Date(comparisonEndDate.getTime() - duration);

    return {
      comparisonStartDate,
      comparisonEndDate,
    };
  }, [value.comparison.enabled, actualDateRange]);

  // Handle preset selection
  const handlePresetChange = (presetValue: string) => {
    const preset = DATE_PRESETS.find(p => p.value === presetValue);
    if (!preset) return;

    if (preset.value === 'custom') {
      onChange({
        ...value,
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: new Date(),
          endDate: new Date()
        },
      });
      setIsPresetMenuOpen(false);
      setIsCalendarOpen(true);
    } else {
      const { startDate, endDate } = preset.getDateRange();
      onChange({
        ...value,
        range: {
          type: 'preset',
          preset: preset.value,
          startDate,
          endDate
        },
      });
      setIsPresetMenuOpen(false);
    }
  };

  // Handle custom date selection
  const handleDateSelect = (dates: { from?: Date; to?: Date } | undefined) => {
    if (dates?.from && dates?.to) {
      onChange({
        ...value,
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: startOfDay(dates.from),
          endDate: endOfDay(dates.to),
        },
      });
      setIsCalendarOpen(false);
    } else if (dates?.from) {
      onChange({
        ...value,
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: startOfDay(dates.from),
          endDate: value.range.endDate,
        },
      });
    }
  };

  // Handle comparison toggle
  const handleComparisonToggle = (enabled: boolean) => {
    onChange({
      ...value,
      comparison: {
        enabled,
        ...(enabled && comparisonDateRange ? comparisonDateRange : {}),
      },
    });
  };

  // Clear filter
  const handleClear = () => {
    const defaultRange: DateRangeFilterValue = {
      range: {
        type: 'preset',
        preset: 'last30days',
        ...DATE_PRESETS.find(p => p.value === 'last30days')!.getDateRange(),
      },
      comparison: { enabled: false },
    };
    onChange(defaultRange);
  };

  // Get filter store for global date range
  const filterStore = useFilterStore();

  // Apply filter to dashboard
  const handleApply = () => {
    if (!actualDateRange) return;

    const dateRange: [string, string] = [
      format(actualDateRange.startDate, 'yyyy-MM-dd'),
      format(actualDateRange.endDate, 'yyyy-MM-dd'),
    ];

    // Update global filter store (all charts will react)
    filterStore.setActiveDateRange(dateRange);

    // Also call onApply if provided (for backward compatibility)
    if (onApply) {
      const timeDimension: DatasetTimeDimension = {
        dimension,
        dateRange,
        granularity,
      };
      onApply(timeDimension);
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (!actualDateRange) return 'Select date range';

    const formatStr = 'MMM d, yyyy';
    return `${format(actualDateRange.startDate, formatStr)} - ${format(actualDateRange.endDate, formatStr)}`;
  };

  const selectedPresetLabel = useMemo(() => {
    if (value.range.type === 'preset' && value.range.preset && value.range.preset !== 'custom') {
      return DATE_PRESETS.find(p => p.value === value.range.preset)?.label;
    }
    return 'Custom range';
  }, [value.range]);

  // Group presets by category
  const groupedPresets = useMemo(() => {
    return {
      relative: DATE_PRESETS.filter(p => p.category === 'relative'),
      period: DATE_PRESETS.filter(p => p.category === 'period'),
      custom: DATE_PRESETS.filter(p => p.category === 'custom'),
    };
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Date Range
        </label>
        {actualDateRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
            disabled={disabled}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* Preset Selector */}
        <Popover open={isPresetMenuOpen} onOpenChange={setIsPresetMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between text-left font-normal",
                !actualDateRange && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <span className="truncate">{selectedPresetLabel}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <div className="p-2">
              <div className="mb-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                  Relative dates
                </div>
                <div className="space-y-1">
                  {groupedPresets.relative.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors",
                        value.range.preset === preset.value && "bg-accent font-medium"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {preset.icon}
                        <span>{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-2 pt-2 border-t">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                  Periods
                </div>
                <div className="space-y-1">
                  {groupedPresets.period.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors",
                        value.range.preset === preset.value && "bg-accent font-medium"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                {groupedPresets.custom.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetChange(preset.value)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors",
                      value.range.preset === preset.value && "bg-accent font-medium"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Display & Calendar Button */}
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted/50">
            {getDisplayValue()}
          </div>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: actualDateRange?.startDate,
                  to: actualDateRange?.endDate,
                }}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Comparison Toggle */}
        {showComparison && (
          <div className="flex items-start gap-2 pt-2 border-t">
            <input
              type="checkbox"
              id="compare-date"
              checked={value.comparison.enabled}
              onChange={(e) => handleComparisonToggle(e.target.checked)}
              className="mt-0.5 rounded"
              disabled={disabled}
            />
            <div className="flex-1">
              <label
                htmlFor="compare-date"
                className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                Compare to previous period
              </label>
              {value.comparison.enabled && comparisonDateRange && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(comparisonDateRange.comparisonStartDate, 'MMM d')} - {format(comparisonDateRange.comparisonEndDate, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Badges - Removed days badge for cleaner UI */}
        {actualDateRange && value.comparison.enabled && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              Comparison enabled
            </Badge>
          </div>
        )}

        {/* Apply Button */}
        {onApply && (
          <Button
            onClick={handleApply}
            className="w-full"
            disabled={disabled || !actualDateRange}
          >
            Apply to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to convert DateRangeFilterValue to Dataset query format
 */
export function toDatasetTimeDimension(
  value: DateRangeFilterValue,
  dimension: string,
  granularity: DatasetTimeDimension['granularity'] = 'day'
): DatasetTimeDimension | null {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (value.range.type === 'preset' && value.range.preset && value.range.preset !== 'custom') {
    const preset = DATE_PRESETS.find(p => p.value === value.range.preset);
    if (preset) {
      const range = preset.getDateRange();
      startDate = range.startDate;
      endDate = range.endDate;
    }
  } else if (value.range.type === 'custom') {
    startDate = value.range.startDate;
    endDate = value.range.endDate;
  }

  if (!startDate || !endDate) return null;

  return {
    dimension,
    dateRange: [
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
    ],
    granularity,
  };
}

/**
 * Helper function to get Dataset query with comparison
 */
export function toDatasetTimeDimensionWithComparison(
  value: DateRangeFilterValue,
  dimension: string,
  granularity: DatasetTimeDimension['granularity'] = 'day'
): { primary: DatasetTimeDimension; comparison?: DatasetTimeDimension } | null {
  const primary = toDatasetTimeDimension(value, dimension, granularity);
  if (!primary) return null;

  if (!value.comparison.enabled) {
    return { primary };
  }

  const actualDateRange = value.range.startDate && value.range.endDate
    ? { startDate: value.range.startDate, endDate: value.range.endDate }
    : null;

  if (!actualDateRange) return { primary };

  const duration = actualDateRange.endDate.getTime() - actualDateRange.startDate.getTime();
  const comparisonEndDate = new Date(actualDateRange.startDate.getTime() - 1);
  const comparisonStartDate = new Date(comparisonEndDate.getTime() - duration);

  return {
    primary,
    comparison: {
      dimension,
      dateRange: [
        format(comparisonStartDate, 'yyyy-MM-dd'),
        format(comparisonEndDate, 'yyyy-MM-dd'),
      ],
      granularity,
    },
  };
}
