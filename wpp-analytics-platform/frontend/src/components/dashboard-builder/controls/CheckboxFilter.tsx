import React, { useState, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePageLevelControl } from '@/hooks/usePageLevelControl';

/**
 * CheckboxFilter Component
 *
 * Boolean toggle filter for Dataset dimensions with true/false/all states.
 * Designed for WPP Analytics Platform dashboard controls.
 *
 * @example
 * ```tsx
 * <CheckboxFilter
 *   label="Active Campaigns"
 *   dimension="GoogleAds.isActive"
 *   value={true}
 *   onChange={(value) => setFilter(value)}
 *   description="Filter by active/inactive campaigns"
 * />
 * ```
 */

export interface CheckboxFilterProps {
  /** Display label for the filter */
  label: string;

  /** Dataset dimension to filter (e.g., "GoogleAds.isActive") */
  dimension: string;

  /** Current filter value: true, false, or null (all) */
  value: boolean | null;

  /** Callback when filter value changes */
  onChange: (value: boolean | null) => void;

  /** Optional description text */
  description?: string;

  /** Custom labels for true/false states */
  trueLabel?: string;
  falseLabel?: string;

  /** Show "All" option as third state */
  showAllOption?: boolean;

  /** Disable the filter */
  disabled?: boolean;

  /** Show info tooltip */
  tooltipContent?: string;

  /** Show count badges (requires data) */
  counts?: {
    true: number;
    false: number;
    all: number;
  };

  /** Compact mode (smaller spacing) */
  compact?: boolean;

  /** Custom CSS class */
  className?: string;

  /** Optional unique ID for the control (for page-level filter tracking) */
  id?: string;
}

export const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  label,
  dimension,
  value,
  onChange,
  description,
  trueLabel = 'Yes',
  falseLabel = 'No',
  showAllOption = true,
  disabled = false,
  tooltipContent,
  counts,
  compact = false,
  className = '',
  id,
}) => {
  const [localValue, setLocalValue] = useState<boolean | null>(value);

  // Use page-level control hook for filter emission
  const { emitFilter, clearFilter } = usePageLevelControl(id || dimension);

  const handleChange = useCallback((newValue: boolean | null) => {
    setLocalValue(newValue);
    onChange(newValue);

    // Emit page-level filter
    if (newValue !== null) {
      emitFilter({
        field: dimension,
        operator: 'equals',
        values: [newValue.toString()],
      });
    } else {
      clearFilter();
    }
  }, [onChange, dimension, emitFilter, clearFilter]);

  const getFilterMode = (): 'all' | 'true' | 'false' => {
    if (localValue === null) return 'all';
    return localValue ? 'true' : 'false';
  };

  const mode = getFilterMode();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className={compact ? 'text-sm' : 'text-base'}>
              {label}
            </CardTitle>
            {tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltipContent}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {counts && (
            <Badge variant="secondary" className="text-xs">
              {mode === 'all' && counts.all}
              {mode === 'true' && counts.true}
              {mode === 'false' && counts.false}
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className={compact ? 'text-xs' : ''}>
            {description}
          </CardDescription>
        )}
        <div className="text-xs text-muted-foreground font-mono">
          {dimension}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : ''}>
        <div className="space-y-3">
          {/* All Option */}
          {showAllOption && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${dimension}-all`}
                  checked={mode === 'all'}
                  onCheckedChange={() => handleChange(null)}
                  disabled={disabled}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor={`${dimension}-all`}
                  className={`flex-1 cursor-pointer select-none ${
                    disabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">All</span>
                    {counts && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {counts.all.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </Label>
              </div>
              <Separator />
            </>
          )}

          {/* True Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${dimension}-true`}
              checked={mode === 'true'}
              onCheckedChange={() => handleChange(true)}
              disabled={disabled}
              className="data-[state=checked]:bg-green-600"
            />
            <Label
              htmlFor={`${dimension}-true`}
              className={`flex-1 cursor-pointer select-none ${
                disabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{trueLabel}</span>
                {counts && (
                  <Badge variant="outline" className="text-xs ml-2 border-green-200 bg-green-50">
                    {counts.true.toLocaleString()}
                  </Badge>
                )}
              </div>
            </Label>
          </div>

          {/* False Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${dimension}-false`}
              checked={mode === 'false'}
              onCheckedChange={() => handleChange(false)}
              disabled={disabled}
              className="data-[state=checked]:bg-red-600"
            />
            <Label
              htmlFor={`${dimension}-false`}
              className={`flex-1 cursor-pointer select-none ${
                disabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{falseLabel}</span>
                {counts && (
                  <Badge variant="outline" className="text-xs ml-2 border-red-200 bg-red-50">
                    {counts.false.toLocaleString()}
                  </Badge>
                )}
              </div>
            </Label>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {mode !== 'all' && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active filter:</span>
              <Badge variant={mode === 'true' ? 'default' : 'destructive'}>
                {dimension} = {mode}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * CheckboxFilterGroup Component
 *
 * Group multiple checkbox filters with shared styling.
 * Useful for related boolean dimensions.
 *
 * @example
 * ```tsx
 * <CheckboxFilterGroup title="Campaign Status">
 *   <CheckboxFilter label="Active" dimension="GoogleAds.isActive" ... />
 *   <CheckboxFilter label="Paused" dimension="GoogleAds.isPaused" ... />
 *   <CheckboxFilter label="Deleted" dimension="GoogleAds.isDeleted" ... />
 * </CheckboxFilterGroup>
 * ```
 */

export interface CheckboxFilterGroupProps {
  /** Group title */
  title: string;

  /** Optional description */
  description?: string;

  /** Child CheckboxFilter components */
  children: React.ReactNode;

  /** Horizontal layout (default: vertical) */
  horizontal?: boolean;

  /** Custom CSS class */
  className?: string;
}

export const CheckboxFilterGroup: React.FC<CheckboxFilterGroupProps> = ({
  title,
  description,
  children,
  horizontal = false,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div
        className={
          horizontal
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Utility function to convert CheckboxFilter value to Dataset filter
 *
 * @example
 * ```tsx
 * const datasetFilter = checkboxToDatasetFilter(
 *   'GoogleAds.isActive',
 *   true
 * );
 * // Returns: { member: 'GoogleAds.isActive', operator: 'equals', values: ['true'] }
 * ```
 */
export const checkboxToDatasetFilter = (
  dimension: string,
  value: boolean | null
): object | null => {
  if (value === null) {
    return null; // No filter for "All"
  }

  return {
    member: dimension,
    operator: 'equals',
    values: [value.toString()],
  };
};

/**
 * Hook for managing multiple checkbox filters
 *
 * @example
 * ```tsx
 * const { filters, setFilter, getDatasetFilters, reset } = useCheckboxFilters({
 *   'GoogleAds.isActive': true,
 *   'GoogleAds.isPaused': null,
 * });
 *
 * const datasetQuery = {
 *   measures: ['GoogleAds.clicks'],
 *   filters: getDatasetFilters(),
 * };
 * ```
 */
export const useCheckboxFilters = (
  initialFilters: Record<string, boolean | null> = {}
) => {
  const [filters, setFilters] = useState<Record<string, boolean | null>>(
    initialFilters
  );

  const setFilter = useCallback((dimension: string, value: boolean | null) => {
    setFilters((prev) => ({
      ...prev,
      [dimension]: value,
    }));
  }, []);

  const getDatasetFilters = useCallback(() => {
    return Object.entries(filters)
      .map(([dimension, value]) => checkboxToDatasetFilter(dimension, value))
      .filter((filter): filter is object => filter !== null);
  }, [filters]);

  const reset = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some((value) => value !== null);
  }, [filters]);

  return {
    filters,
    setFilter,
    getDatasetFilters,
    reset,
    hasActiveFilters,
  };
};

export default CheckboxFilter;
