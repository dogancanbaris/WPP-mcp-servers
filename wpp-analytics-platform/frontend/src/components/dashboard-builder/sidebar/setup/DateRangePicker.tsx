import React, { useState } from 'react';
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRange {
  type: 'preset' | 'custom' | 'auto';
  preset?: string;
  startDate?: Date;
  endDate?: Date;
  compareEnabled?: boolean;
  compareTo?: 'previousPeriod' | 'previousYear';
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  hasPageDateControl?: boolean;
}

const DATE_PRESETS = [
  { value: 'auto', label: 'Auto (Follow Page)', conditional: true },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7Days', label: 'Last 7 days' },
  { value: 'last14Days', label: 'Last 14 days' },
  { value: 'last28Days', label: 'Last 28 days' },
  { value: 'last30Days', label: 'Last 30 days' },
  { value: 'last90Days', label: 'Last 90 days' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'lastWeek', label: 'Last week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'thisQuarter', label: 'This quarter' },
  { value: 'lastQuarter', label: 'Last quarter' },
  { value: 'thisYear', label: 'This year' },
  { value: 'lastYear', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
];

export function DateRangePicker({ value, onChange, hasPageDateControl = false }: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    if (preset === 'auto') {
      onChange({ type: 'auto' });
    } else if (preset === 'custom') {
      onChange({ type: 'custom', startDate: new Date(), endDate: new Date() });
    } else {
      onChange({ type: 'preset', preset });
    }
  };

  const handleDateSelect = (dates: { from?: Date; to?: Date }) => {
    if (dates.from && dates.to) {
      onChange({
        type: 'custom',
        startDate: dates.from,
        endDate: dates.to,
      });
      setIsCalendarOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (value.type === 'auto') {
      return hasPageDateControl
        ? 'Auto (Follow Page)'
        : 'Auto (Default: Last 30 days)';
    }
    if (value.type === 'preset' && value.preset) {
      const preset = DATE_PRESETS.find((p) => p.value === value.preset);
      return preset?.label || 'Select date range';
    }
    if (value.type === 'custom' && value.startDate && value.endDate) {
      // Validate dates before formatting - handle both Date objects and strings
      const startDate = value.startDate instanceof Date ? value.startDate : new Date(value.startDate);
      const endDate = value.endDate instanceof Date ? value.endDate : new Date(value.endDate);

      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Select date range';
      }

      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    return 'Select date range';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Date Range</label>

      <div className="flex gap-2">
        {/* Preset Selector */}
        <Select
          value={value.type === 'auto' ? 'auto' : value.type === 'preset' ? value.preset : 'custom'}
          onValueChange={handlePresetChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue>{getDisplayValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS
              .filter((preset) => !preset.conditional || hasPageDateControl)
              .map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Calendar Popover for Custom Range */}
        {value.type === 'custom' && (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: value.startDate,
                  to: value.endDate,
                }}
                onSelect={(range) =>
                  handleDateSelect({ from: range?.from, to: range?.to })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Auto Mode Helper Text */}
      {value.type === 'auto' && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            {hasPageDateControl
              ? '📅 This component will automatically sync with the page-level date control.'
              : '📅 No page date control found. Using default: Last 30 days. Add a date control to the page to enable auto-sync.'}
          </p>
        </div>
      )}

      {/* Comparison Toggle */}
      {value.type !== 'auto' && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="compare-date"
              className="rounded"
              checked={value.compareEnabled || false}
              onChange={(e) =>
                onChange({
                  ...value,
                  compareEnabled: e.target.checked,
                  compareTo: e.target.checked ? 'previousPeriod' : undefined,
                })
              }
            />
            <label htmlFor="compare-date" className="text-sm text-gray-700 cursor-pointer">
              Compare to previous period
            </label>
          </div>

          {value.compareEnabled && (
            <Select
              value={value.compareTo || 'previousPeriod'}
              onValueChange={(val: 'previousPeriod' | 'previousYear') =>
                onChange({ ...value, compareTo: val })
              }
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previousPeriod">Previous period</SelectItem>
                <SelectItem value="previousYear">Previous year</SelectItem>
              </SelectContent>
            </Select>
          )}

          {value.compareEnabled && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700">
                📊 Comparison data will show changes vs. the{' '}
                {value.compareTo === 'previousYear' ? 'same period last year' : 'previous period'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
