import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { usePageLevelControl } from '@/hooks/usePageLevelControl';

interface SliderFilterProps {
  /**
   * Label displayed above the slider
   */
  label: string;

  /**
   * Unique identifier for the filter
   */
  filterId: string;

  /**
   * Field name to filter on
   */
  field: string;

  /**
   * Minimum value of the range
   */
  min: number;

  /**
   * Maximum value of the range
   */
  max: number;

  /**
   * Initial minimum value (defaults to min)
   */
  initialMinValue?: number;

  /**
   * Initial maximum value (defaults to max)
   */
  initialMaxValue?: number;

  /**
   * Step size for slider increments
   */
  step?: number;

  /**
   * Callback when range changes
   */
  onChange: (filterId: string, range: { min: number; max: number }) => void;

  /**
   * Format function for displaying values
   */
  formatValue?: (value: number) => string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Show inputs for manual entry
   */
  showInputs?: boolean;

  /**
   * Whether to show the reset button
   */
  showReset?: boolean;

  /**
   * Custom className for styling
   */
  className?: string;

  /**
   * Debounce delay in ms for onChange callback
   */
  debounceMs?: number;

  /**
   * Optional unique ID for the control (for page-level filter tracking)
   */
  id?: string;
}

/**
 * SliderFilter - Dual-handle range slider for numeric filtering
 *
 * Features:
 * - Dual handles for min/max range selection
 * - Optional manual input fields
 * - Value formatting (currency, percentage, number)
 * - Debounced onChange for performance
 * - Reset to default values
 * - Accessible keyboard navigation
 * - Visual feedback for active ranges
 *
 * @example
 * ```tsx
 * <SliderFilter
 *   label="Cost Range"
 *   filterId="cost_filter"
 *   min={0}
 *   max={10000}
 *   step={100}
 *   formatValue={(v) => `$${v.toLocaleString()}`}
 *   onChange={(id, range) => console.log(`${id}: ${range.min} - ${range.max}`)}
 *   showInputs
 *   showReset
 * />
 * ```
 */
export const SliderFilter: React.FC<SliderFilterProps> = ({
  label,
  filterId,
  field,
  min,
  max,
  initialMinValue,
  initialMaxValue,
  step = 1,
  onChange,
  formatValue = (v) => v.toLocaleString(),
  description,
  showInputs = true,
  showReset = true,
  className = '',
  debounceMs = 300,
  id,
}) => {
  // Use page-level control hook for filter emission
  const { emitFilter } = usePageLevelControl(id || filterId || field);

  // State for current range values
  const [minValue, setMinValue] = useState(initialMinValue ?? min);
  const [maxValue, setMaxValue] = useState(initialMaxValue ?? max);

  // Refs for tracking slider interaction
  const minValueRef = useRef<HTMLInputElement>(null);
  const maxValueRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Calculate percentage for styling
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Debounced onChange callback
  const debouncedOnChange = useCallback(
    (newMin: number, newMax: number) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onChange(filterId, { min: newMin, max: newMax });

        // Emit page-level filter
        emitFilter({
          field,
          operator: 'between',
          values: [newMin.toString(), newMax.toString()],
        });
      }, debounceMs);
    },
    [filterId, onChange, debounceMs, field, emitFilter]
  );

  // Handle min value change
  const handleMinChange = (value: number) => {
    const newMinValue = Math.min(value, maxValue - step);
    setMinValue(newMinValue);
    debouncedOnChange(newMinValue, maxValue);
  };

  // Handle max value change
  const handleMaxChange = (value: number) => {
    const newMaxValue = Math.max(value, minValue + step);
    setMaxValue(newMaxValue);
    debouncedOnChange(minValue, newMaxValue);
  };

  // Handle manual input change
  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;

    if (type === 'min') {
      handleMinChange(Math.max(min, Math.min(numValue, max)));
    } else {
      handleMaxChange(Math.max(min, Math.min(numValue, max)));
    }
  };

  // Reset to initial values
  const handleReset = () => {
    const resetMin = initialMinValue ?? min;
    const resetMax = initialMaxValue ?? max;
    setMinValue(resetMin);
    setMaxValue(resetMax);
    onChange(filterId, { min: resetMin, max: resetMax });
  };

  // Update range highlight styling
  useEffect(() => {
    if (rangeRef.current) {
      const minPercent = getPercent(minValue);
      const maxPercent = getPercent(maxValue);

      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValue, maxValue, getPercent]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Calculate if reset is available
  const isResetAvailable =
    minValue !== (initialMinValue ?? min) ||
    maxValue !== (initialMaxValue ?? max);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {showReset && isResetAvailable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0"
              aria-label="Reset filter"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Value Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary">
            {formatValue(minValue)}
          </span>
          <span className="text-muted-foreground">to</span>
          <span className="font-medium text-primary">
            {formatValue(maxValue)}
          </span>
        </div>

        {/* Dual Range Slider */}
        <div className="relative pt-2 pb-6">
          {/* Track */}
          <div className="slider-track absolute w-full h-1.5 bg-secondary rounded-full">
            {/* Active range highlight */}
            <div
              ref={rangeRef}
              className="slider-range absolute h-full bg-primary rounded-full transition-all"
              role="presentation"
            />
          </div>

          {/* Min Handle */}
          <input
            ref={minValueRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={(e) => handleMinChange(parseFloat(e.target.value))}
            className="slider-thumb slider-thumb-min absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
            aria-label={`${label} minimum value`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={minValue}
            aria-valuetext={formatValue(minValue)}
          />

          {/* Max Handle */}
          <input
            ref={maxValueRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={(e) => handleMaxChange(parseFloat(e.target.value))}
            className="slider-thumb slider-thumb-max absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
            aria-label={`${label} maximum value`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={maxValue}
            aria-valuetext={formatValue(maxValue)}
          />

          {/* Min/Max Labels */}
          <div className="absolute w-full top-6 flex justify-between text-xs text-muted-foreground">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        </div>

        {/* Manual Input Fields */}
        {showInputs && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${filterId}-min-input`} className="text-xs">
                Min Value
              </Label>
              <Input
                id={`${filterId}-min-input`}
                type="number"
                min={min}
                max={max}
                step={step}
                value={minValue}
                onChange={(e) => handleInputChange('min', e.target.value)}
                className="h-8 text-sm"
                aria-label={`${label} minimum value input`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${filterId}-max-input`} className="text-xs">
                Max Value
              </Label>
              <Input
                id={`${filterId}-max-input`}
                type="number"
                min={min}
                max={max}
                step={step}
                value={maxValue}
                onChange={(e) => handleInputChange('max', e.target.value)}
                className="h-8 text-sm"
                aria-label={`${label} maximum value input`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Preset formatters for common use cases
 */
export const SliderFormatters = {
  /**
   * Format as currency (USD)
   */
  currency: (value: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  /**
   * Format as percentage
   */
  percentage: (value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Format as number with thousand separators
   */
  number: (value: number, decimals = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  /**
   * Format as compact notation (1K, 1M, etc.)
   */
  compact: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  },

  /**
   * Format as decimal with specific precision
   */
  decimal: (decimals: number) => (value: number): string => {
    return value.toFixed(decimals);
  },
};

export default SliderFilter;
