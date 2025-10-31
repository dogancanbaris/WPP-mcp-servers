import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePageLevelControl } from '@/hooks/usePageLevelControl';

/**
 * Available dimension options for analytics
 */
export interface DimensionOption {
  value: string;
  label: string;
  description?: string;
  category?: 'time' | 'geography' | 'device' | 'traffic' | 'content' | 'custom';
}

/**
 * Common dimensions for Google Search Console, Google Analytics, and Google Ads
 */
export const COMMON_DIMENSIONS: DimensionOption[] = [
  // Time dimensions
  { value: 'date', label: 'Date', description: 'Daily breakdown', category: 'time' },
  { value: 'week', label: 'Week', description: 'Weekly aggregation', category: 'time' },
  { value: 'month', label: 'Month', description: 'Monthly aggregation', category: 'time' },
  { value: 'quarter', label: 'Quarter', description: 'Quarterly aggregation', category: 'time' },
  { value: 'year', label: 'Year', description: 'Yearly aggregation', category: 'time' },

  // Geography dimensions
  { value: 'country', label: 'Country', description: 'Country-level data', category: 'geography' },
  { value: 'region', label: 'Region', description: 'State/region-level data', category: 'geography' },
  { value: 'city', label: 'City', description: 'City-level data', category: 'geography' },

  // Device dimensions
  { value: 'device', label: 'Device', description: 'Device type (desktop, mobile, tablet)', category: 'device' },
  { value: 'deviceCategory', label: 'Device Category', description: 'Device categorization', category: 'device' },

  // Traffic dimensions (GSC)
  { value: 'query', label: 'Search Query', description: 'Search terms used', category: 'traffic' },
  { value: 'page', label: 'Page URL', description: 'Landing page URLs', category: 'traffic' },
  { value: 'searchAppearance', label: 'Search Appearance', description: 'How result appeared in search', category: 'traffic' },

  // Content dimensions (Analytics)
  { value: 'pagePath', label: 'Page Path', description: 'Website page paths', category: 'content' },
  { value: 'pageTitle', label: 'Page Title', description: 'Page title text', category: 'content' },
  { value: 'landingPage', label: 'Landing Page', description: 'Entry page for sessions', category: 'content' },

  // Traffic source dimensions (Analytics)
  { value: 'source', label: 'Traffic Source', description: 'Referral source', category: 'traffic' },
  { value: 'medium', label: 'Traffic Medium', description: 'Marketing medium', category: 'traffic' },
  { value: 'campaign', label: 'Campaign', description: 'Marketing campaign name', category: 'traffic' },
  { value: 'sourceMedium', label: 'Source / Medium', description: 'Combined source and medium', category: 'traffic' },

  // Google Ads dimensions
  { value: 'campaignName', label: 'Campaign Name', description: 'Google Ads campaign', category: 'traffic' },
  { value: 'adGroupName', label: 'Ad Group', description: 'Google Ads ad group', category: 'traffic' },
  { value: 'keyword', label: 'Keyword', description: 'Target keyword', category: 'traffic' },
  { value: 'adType', label: 'Ad Type', description: 'Type of advertisement', category: 'traffic' },
];

/**
 * Group dimensions by category for better UX
 */
export const DIMENSIONS_BY_CATEGORY = COMMON_DIMENSIONS.reduce((acc, dim) => {
  const category = dim.category || 'custom';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(dim);
  return acc;
}, {} as Record<string, DimensionOption[]>);

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<string, string> = {
  time: 'Time Dimensions',
  geography: 'Geography',
  device: 'Device & Platform',
  traffic: 'Traffic & Marketing',
  content: 'Content & Pages',
  custom: 'Custom Dimensions',
};

export interface DimensionControlProps {
  /**
   * Currently selected dimension value
   */
  value: string;

  /**
   * Callback when dimension changes
   */
  onChange: (dimension: string) => void;

  /**
   * Optional label for the control
   */
  label?: string;

  /**
   * Optional list of available dimensions (defaults to COMMON_DIMENSIONS)
   */
  availableDimensions?: DimensionOption[];

  /**
   * Whether to group dimensions by category
   */
  groupByCategory?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Show info tooltip
   */
  showInfo?: boolean;

  /**
   * Custom info text
   */
  infoText?: string;

  /**
   * Optional unique ID for the control (for page-level filter tracking)
   */
  id?: string;
}

/**
 * DimensionControl Component
 *
 * A dropdown control for dynamically switching dimensions across all charts in a dashboard.
 * Supports categorized dimensions, tooltips, and customizable dimension lists.
 *
 * @example
 * ```tsx
 * <DimensionControl
 *   value={currentDimension}
 *   onChange={(dim) => updateAllCharts(dim)}
 *   groupByCategory={true}
 * />
 * ```
 */
export function DimensionControl({
  value,
  onChange,
  label = 'Dimension',
  availableDimensions = COMMON_DIMENSIONS,
  groupByCategory = true,
  disabled = false,
  className = '',
  showInfo = true,
  infoText = 'Change the dimension to view data broken down by different attributes',
  id,
}: DimensionControlProps) {
  // Use page-level control hook for filter emission
  const { emitFilter } = usePageLevelControl(id || 'dimension-control');

  // Find current dimension details
  const currentDimension = availableDimensions.find(d => d.value === value);

  // Group dimensions if needed
  const groupedDimensions = React.useMemo(() => {
    if (!groupByCategory) return null;

    return availableDimensions.reduce((acc, dim) => {
      const category = dim.category || 'custom';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dim);
      return acc;
    }, {} as Record<string, DimensionOption[]>);
  }, [availableDimensions, groupByCategory]);

  // Handle dimension change with page-level filter emission
  const handleDimensionChange = (newDimension: string) => {
    onChange(newDimension);

    // Emit dimension change as page-level filter
    emitFilter({
      field: 'selected_dimension',
      operator: 'equals',
      values: [newDimension],
    });
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor="dimension-control" className="text-sm font-medium">
          {label}
        </Label>
        {showInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{infoText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Select
        value={value}
        onValueChange={handleDimensionChange}
        disabled={disabled}
      >
        <SelectTrigger id="dimension-control" className="w-full">
          <SelectValue>
            {currentDimension ? (
              <div className="flex items-center justify-between w-full">
                <span>{currentDimension.label}</span>
                {currentDimension.description && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {currentDimension.description}
                  </span>
                )}
              </div>
            ) : (
              'Select dimension...'
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {groupByCategory && groupedDimensions ? (
            // Render grouped dimensions
            Object.entries(groupedDimensions).map(([category, dimensions]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {CATEGORY_LABELS[category] || category}
                </div>
                {dimensions.map((dimension) => (
                  <SelectItem
                    key={dimension.value}
                    value={dimension.value}
                    className="pl-6"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{dimension.label}</span>
                      {dimension.description && (
                        <span className="text-xs text-muted-foreground">
                          {dimension.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))
          ) : (
            // Render flat list
            availableDimensions.map((dimension) => (
              <SelectItem key={dimension.value} value={dimension.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{dimension.label}</span>
                  {dimension.description && (
                    <span className="text-xs text-muted-foreground">
                      {dimension.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Current dimension description as helper text */}
      {currentDimension?.description && (
        <p className="text-xs text-muted-foreground">
          {currentDimension.description}
        </p>
      )}
    </div>
  );
}

/**
 * Hook for managing dimension state with persistence
 */
export function useDimensionControl(
  defaultDimension: string = 'date',
  storageKey: string = 'dashboard-dimension'
) {
  const [dimension, setDimension] = React.useState<string>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored || defaultDimension;
    }
    return defaultDimension;
  });

  // Persist to localStorage when dimension changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, dimension);
    }
  }, [dimension, storageKey]);

  return [dimension, setDimension] as const;
}

/**
 * Utility function to get dimension label from value
 */
export function getDimensionLabel(dimensionValue: string): string {
  const dimension = COMMON_DIMENSIONS.find(d => d.value === dimensionValue);
  return dimension?.label || dimensionValue;
}

/**
 * Utility function to validate dimension value
 */
export function isValidDimension(
  dimensionValue: string,
  availableDimensions: DimensionOption[] = COMMON_DIMENSIONS
): boolean {
  return availableDimensions.some(d => d.value === dimensionValue);
}

export default DimensionControl;
