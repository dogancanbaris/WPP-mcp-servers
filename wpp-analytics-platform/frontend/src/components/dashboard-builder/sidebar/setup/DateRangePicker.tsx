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
  type: 'preset' | 'custom';
  preset?: string;
  startDate?: Date;
  endDate?: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last14days', label: 'Last 14 days' },
  { value: 'last28days', label: 'Last 28 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'last90days', label: 'Last 90 days' },
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

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
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
          value={value.type === 'preset' ? value.preset : 'custom'}
          onValueChange={handlePresetChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue>{getDisplayValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((preset) => (
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

      {/* Comparison Toggle (Future Enhancement) */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <input
          type="checkbox"
          id="compare-date"
          className="rounded"
          disabled
        />
        <label
          htmlFor="compare-date"
          className="text-sm text-gray-400 cursor-not-allowed"
        >
          Compare to previous period (coming soon)
        </label>
      </div>
    </div>
  );
}
