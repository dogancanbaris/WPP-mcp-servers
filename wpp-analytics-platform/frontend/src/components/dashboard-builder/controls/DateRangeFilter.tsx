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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  Clock,
  TrendingUp,
  ArrowRight
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
import { useDashboardStore } from '@/store/dashboardStore';
import { useQueryClient } from '@tanstack/react-query';
import type { FilterConfig } from '@/types/dashboard-builder';

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

export type ComparisonType = 'previous_period' | 'previous_week' | 'previous_month' | 'previous_year';

export interface DateRangeComparison {
  enabled: boolean;
  comparisonStartDate?: Date;
  comparisonEndDate?: Date;
  type?: ComparisonType;
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
  config?: { id?: string }; // Component config for unique filter ID
}

type DatePresetValue =
  | 'today'
  | 'yesterday'
  | 'last7Days'
  | 'last14Days'
  | 'last28Days'
  | 'last30Days'
  | 'last90Days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'allTime'
  | 'custom';

interface DatePreset {
  value: DatePresetValue;
  label: string;
  icon?: React.ReactNode;
  getDateRange: () => { startDate: Date; endDate: Date };
  category: 'relative' | 'period' | 'custom';
}

// Curated preset list: Only essential presets for analytics
const DATE_PRESETS: DatePreset[] = [
  // Quick Select (4 presets)
  {
    value: 'last7Days',
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
    value: 'last14Days',
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
    value: 'last30Days',
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
    value: 'last90Days',
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
  // Periods (3 presets)
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
  // Custom
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

export function computeComparisonRange(
  range: { startDate: Date; endDate: Date },
  type: ComparisonType = 'previous_period'
): { comparisonStartDate: Date; comparisonEndDate: Date } {
  const start = range.startDate;
  const end = range.endDate;
  const duration = end.getTime() - start.getTime();

  switch (type) {
    case 'previous_week': {
      const comparisonStartDate = new Date(start.getTime() - 7 * 86400000);
      const comparisonEndDate = new Date(end.getTime() - 7 * 86400000);
      return { comparisonStartDate, comparisonEndDate };
    }
    case 'previous_month': {
      const comparisonStartDate = new Date(start);
      comparisonStartDate.setMonth(comparisonStartDate.getMonth() - 1);
      const comparisonEndDate = new Date(end);
      comparisonEndDate.setMonth(comparisonEndDate.getMonth() - 1);
      return { comparisonStartDate, comparisonEndDate };
    }
    case 'previous_year': {
      const comparisonStartDate = new Date(start);
      comparisonStartDate.setFullYear(comparisonStartDate.getFullYear() - 1);
      const comparisonEndDate = new Date(end);
      comparisonEndDate.setFullYear(comparisonEndDate.getFullYear() - 1);
      return { comparisonStartDate, comparisonEndDate };
    }
    case 'previous_period':
    default: {
      const comparisonEndDate = new Date(start.getTime() - 86400000);
      const comparisonStartDate = new Date(comparisonEndDate.getTime() - duration);
      return { comparisonStartDate, comparisonEndDate };
    }
  }
}

export function DateRangeFilter({
  value,
  onChange,
  onApply,
  showComparison = false,
  dimension = 'date',
  granularity = 'day',
  className,
  disabled = false,
  config,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    if (!value.comparison.enabled) return null;

    if (value.comparison.comparisonStartDate && value.comparison.comparisonEndDate) {
      return {
        comparisonStartDate: value.comparison.comparisonStartDate,
        comparisonEndDate: value.comparison.comparisonEndDate,
      };
    }

    if (!actualDateRange) return null;

    return computeComparisonRange(actualDateRange, value.comparison.type || 'previous_period');
  }, [value.comparison, actualDateRange]);

  const buildComparisonState = (
    enabled: boolean,
    type: ComparisonType | undefined,
    rangeOverride?: { startDate: Date; endDate: Date }
  ): DateRangeComparison => {
    if (!enabled) {
      return {
        enabled: false,
        type,
      };
    }

    const effectiveRange = rangeOverride || actualDateRange;
    if (!effectiveRange) {
      return {
        enabled: true,
        type: type || 'previous_period',
      };
    }

    const comparisonRange = computeComparisonRange(effectiveRange, type || 'previous_period');
    return {
      enabled: true,
      type: type || 'previous_period',
      ...comparisonRange,
    };
  };

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
        comparison: buildComparisonState(
          value.comparison.enabled,
          value.comparison.type,
          {
            startDate: new Date(),
            endDate: new Date(),
          }
        ),
      });
      // Stay open for custom selection
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
        comparison: buildComparisonState(
          value.comparison.enabled,
          value.comparison.type,
          {
            startDate,
            endDate,
          }
        ),
      });
      // Do NOT auto-apply; wait for explicit Apply
    }
  };

  // Handle custom date selection
  const handleDateSelect = (dates: { from?: Date; to?: Date } | undefined) => {
    if (dates?.from && dates?.to) {
      const start = startOfDay(dates.from);
      const end = endOfDay(dates.to);
      onChange({
        ...value,
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: start,
          endDate: end,
        },
        comparison: buildComparisonState(
          value.comparison.enabled,
          value.comparison.type,
          {
            startDate: start,
            endDate: end,
          }
        ),
      });
      // Don't auto-close, let user apply changes
    } else if (dates?.from) {
      const start = startOfDay(dates.from);
      const end = value.range.endDate ?? endOfDay(dates.from);
      onChange({
        ...value,
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: start,
          endDate: end,
        },
        comparison: buildComparisonState(
          value.comparison.enabled,
          value.comparison.type,
          {
            startDate: start,
            endDate: end,
          }
        ),
      });
    }
  };

  // Handle comparison toggle
  const handleComparisonToggle = (enabled: boolean) => {
    console.log('[DateRangeFilter] Comparison toggle clicked:', { enabled, currentValue: value.comparison.enabled });
    const newValue = {
      ...value,
      comparison: buildComparisonState(
        enabled,
        value.comparison.type || 'previous_period'
      ),
    };
    console.log('[DateRangeFilter] New value:', newValue);
    onChange(newValue);
  };

  // Clear filter
  const handleClear = () => {
    const defaultRange: DateRangeFilterValue = {
      range: {
        type: 'preset',
        preset: 'last30Days',
        ...DATE_PRESETS.find(p => p.value === 'last30Days')!.getDateRange(),
      },
      comparison: { enabled: false },
    };
    onChange(defaultRange);
  };

  // Get dashboard store for page-level filters
  const currentPageId = useDashboardStore((state) => state.currentPageId);
  const updatePageFilter = useDashboardStore((state) => state.updatePageFilter);
  const setPageFilters = useDashboardStore((state) => state.setPageFilters);
  const queryClient = useQueryClient();

  // Apply filter to dashboard
  const handleApply = () => {
    if (!actualDateRange) return;

    const startDate = format(actualDateRange.startDate, 'yyyy-MM-dd');
    const endDate = format(actualDateRange.endDate, 'yyyy-MM-dd');

    // Build filter config
    const filterConfig: FilterConfig = {
      id: `date-control-${config?.id || 'default'}`,
      field: dimension || 'date',
      operator: 'inDateRange',
      values: [startDate, endDate],
      enabled: true,
    };

    // Add comparison data if enabled
    if (value.comparison.enabled && comparisonDateRange) {
      const compStartDate = format(comparisonDateRange.comparisonStartDate, 'yyyy-MM-dd');
      const compEndDate = format(comparisonDateRange.comparisonEndDate, 'yyyy-MM-dd');

      filterConfig.comparisonEnabled = true;
      filterConfig.comparisonValues = [compStartDate, compEndDate];
      filterConfig.comparisonType = value.comparison.type || 'previous_period';
    }

    // Save to page filters (not global) with de-duplication by field/operator
    if (currentPageId) {
      const state = useDashboardStore.getState();
      const page = state.config.pages?.find(p => p.id === currentPageId);
      const existing = page?.filters || [];
      const cleaned = existing.filter(f => !(f.field === (dimension || 'date') && f.operator === 'inDateRange'));
      setPageFilters(currentPageId, [...cleaned, filterConfig]);

      // Invalidate all chart queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['page-component-data'] });
    }

    // Call onApply if provided (optional callback)
    if (onApply) {
      const dateRange: [string, string] = [startDate, endDate];
      const timeDimension: DatasetTimeDimension = {
        dimension,
        dateRange,
        granularity,
      };
      onApply(timeDimension);
    }

    // Close popover after applying
    setIsOpen(false);
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
        <Label className="text-sm font-medium text-foreground">
          Date Range
        </Label>
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

      {/* Main Date Range Trigger */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !actualDateRange && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {actualDateRange ? (
              <>
                <span className="font-medium">{format(actualDateRange.startDate, 'MMM d, yyyy')}</span>
                <ArrowRight className="mx-2 h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{format(actualDateRange.endDate, 'MMM d, yyyy')}</span>
              </>
            ) : (
              "Select date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[700px]" align="start" side="bottom">
          <div className="flex">
            {/* Left: Calendar */}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{
                  from: actualDateRange?.startDate,
                  to: actualDateRange?.endDate,
                }}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                disabled={disabled}
              />
            </div>

            {/* Right: Presets & Options */}
            <div className="border-l flex flex-col" style={{ width: '200px' }}>
              {/* Presets Section */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    QUICK SELECT
                  </div>
                  {groupedPresets.relative.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePresetChange(preset.value)}
                      className={cn(
                        "w-full justify-start h-8 text-sm font-normal",
                        value.range.preset === preset.value && "bg-accent font-medium"
                      )}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    PERIODS
                  </div>
                  {groupedPresets.period.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePresetChange(preset.value)}
                      className={cn(
                        "w-full justify-start h-8 text-sm font-normal",
                        value.range.preset === preset.value && "bg-accent font-medium"
                      )}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Comparison Section */}
              {showComparison && (
                <>
                  <Separator />
                  <div className="p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="compare-toggle"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Compare
                      </Label>
                      <Switch
                        id="compare-toggle"
                        checked={value.comparison.enabled}
                        onCheckedChange={handleComparisonToggle}
                        disabled={disabled}
                        className="scale-90"
                      />
                    </div>

                    {value.comparison.enabled && (
                      <div className="space-y-2 animate-in fade-in-50 duration-200">
                        <Select
                          value={value.comparison.type || 'previous_period'}
                          onValueChange={(type) => {
                            const nextType = type as ComparisonType;
                            onChange({
                              ...value,
                              comparison: buildComparisonState(
                                value.comparison.enabled,
                                nextType
                              ),
                            });
                          }}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="previous_period">Previous Period</SelectItem>
                            <SelectItem value="previous_week">Week over Week</SelectItem>
                            <SelectItem value="previous_month">Month over Month</SelectItem>
                            <SelectItem value="previous_year">Year over Year</SelectItem>
                          </SelectContent>
                        </Select>

                        {comparisonDateRange && (
                          <div className="text-xs text-muted-foreground p-2 bg-background rounded border">
                            <div className="font-medium text-foreground">vs</div>
                            <div>
                              {format(comparisonDateRange.comparisonStartDate, 'MMM d')} - {format(comparisonDateRange.comparisonEndDate, 'MMM d, yyyy')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Apply Button - Always visible for custom date selection */}
              <>
                <Separator />
                <div className="p-3">
                  <Button
                    onClick={handleApply}
                    className="w-full h-9"
                    disabled={disabled || !actualDateRange}
                  >
                    Apply
                  </Button>
                </div>
              </>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Summary Badge */}
      {actualDateRange && value.comparison.enabled && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs font-normal">
            <TrendingUp className="h-3 w-3 mr-1" />
            Comparison active
          </Badge>
        </div>
      )}
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
