import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, TrendingUp, Search, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Data source types available in WPP Analytics Platform
 */
export type DataSourceType = 'gsc' | 'ads' | 'analytics' | 'bigquery';

/**
 * Data source configuration
 */
export interface DataSourceOption {
  id: string;
  name: string;
  type: DataSourceType;
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Props for DataSourceControl component
 */
export interface DataSourceControlProps {
  /**
   * Available data sources to choose from
   */
  sources: DataSourceOption[];

  /**
   * Currently selected data source ID
   */
  value: string;

  /**
   * Callback when data source changes
   */
  onChange: (sourceId: string) => void;

  /**
   * Optional label for the control
   * @default "Data Source"
   */
  label?: string;

  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean;

  /**
   * Size variant
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether the control is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Placeholder text when no source is selected
   * @default "Select data source"
   */
  placeholder?: string;
}

/**
 * Default icons for common data source types
 */
const defaultIcons: Record<DataSourceType, React.ReactNode> = {
  gsc: <Search className="h-4 w-4" />,
  ads: <TrendingUp className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  bigquery: <Database className="h-4 w-4" />,
};

/**
 * Color schemes for different data source types
 */
const typeColors: Record<DataSourceType, string> = {
  gsc: 'text-green-600',
  ads: 'text-blue-600',
  analytics: 'text-orange-600',
  bigquery: 'text-purple-600',
};

/**
 * DataSourceControl Component
 *
 * A dropdown control for switching between different data sources (GSC, Google Ads, Analytics)
 * in the WPP Analytics Platform. Provides a consistent interface for data source selection
 * across the dashboard builder.
 *
 * Features:
 * - Visual icons for each data source type
 * - Type-safe data source selection
 * - Responsive sizing options
 * - Optional descriptions for each source
 * - Customizable styling
 *
 * @example
 * ```tsx
 * const sources = [
 *   { id: 'gsc-main', name: 'Search Console', type: 'gsc', description: 'Organic search data' },
 *   { id: 'ads-campaign', name: 'Google Ads', type: 'ads', description: 'Paid campaign metrics' },
 *   { id: 'ga4-property', name: 'Analytics 4', type: 'analytics', description: 'User behavior data' }
 * ];
 *
 * <DataSourceControl
 *   sources={sources}
 *   value={selectedSource}
 *   onChange={setSelectedSource}
 * />
 * ```
 */
export const DataSourceControl: React.FC<DataSourceControlProps> = ({
  sources,
  value,
  onChange,
  label = 'Data Source',
  showLabel = true,
  size = 'default',
  className,
  disabled = false,
  placeholder = 'Select data source',
}) => {
  // Find the currently selected source
  const selectedSource = sources.find((s) => s.id === value);

  // Size-specific styles
  const sizeStyles = {
    sm: 'h-8 text-xs',
    default: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const iconSizeStyles = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
        </label>
      )}

      {/* Select Control */}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn('w-full', sizeStyles[size])}>
          <SelectValue placeholder={placeholder}>
            {selectedSource ? (
              <div className="flex items-center gap-2">
                {/* Icon */}
                <span className={cn(typeColors[selectedSource.type])}>
                  {selectedSource.icon || defaultIcons[selectedSource.type]}
                </span>

                {/* Name */}
                <span className="font-medium">{selectedSource.name}</span>

                {/* Type badge */}
                <span className="ml-auto text-xs text-gray-500 uppercase">
                  {selectedSource.type}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Database className={iconSizeStyles[size]} />
                <span>{placeholder}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {sources.map((source) => (
            <SelectItem
              key={source.id}
              value={source.id}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 py-1">
                {/* Icon */}
                <span className={cn(typeColors[source.type], 'flex-shrink-0')}>
                  {source.icon || defaultIcons[source.type]}
                </span>

                {/* Content */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-medium text-gray-900 truncate">
                    {source.name}
                  </span>
                  {source.description && (
                    <span className="text-xs text-gray-500 truncate">
                      {source.description}
                    </span>
                  )}
                </div>

                {/* Type badge */}
                <span className="text-xs text-gray-400 uppercase font-medium flex-shrink-0">
                  {source.type}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Helper text */}
      {selectedSource?.description && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedSource.description}
        </p>
      )}
    </div>
  );
};

/**
 * Pre-configured data sources for common WPP use cases
 */
export const commonDataSources: DataSourceOption[] = [
  {
    id: 'gsc-default',
    name: 'Google Search Console',
    type: 'gsc',
    description: 'Organic search performance, queries, and rankings',
  },
  {
    id: 'ads-default',
    name: 'Google Ads',
    type: 'ads',
    description: 'Paid search campaigns, keywords, and conversions',
  },
  {
    id: 'analytics-default',
    name: 'Google Analytics 4',
    type: 'analytics',
    description: 'User behavior, traffic sources, and engagement',
  },
  {
    id: 'bigquery-default',
    name: 'BigQuery',
    type: 'bigquery',
    description: 'Custom aggregated data warehouse queries',
  },
];

/**
 * Utility function to create data source options
 */
export const createDataSource = (
  id: string,
  name: string,
  type: DataSourceType,
  description?: string,
  icon?: React.ReactNode
): DataSourceOption => ({
  id,
  name,
  type,
  description,
  icon,
});

/**
 * Example Usage Component
 */
export const DataSourceControlExample: React.FC = () => {
  const [selectedSource, setSelectedSource] = React.useState('gsc-default');

  return (
    <div className="max-w-md p-6 space-y-6">
      <h3 className="text-lg font-semibold">Data Source Control Examples</h3>

      {/* Default size */}
      <DataSourceControl
        sources={commonDataSources}
        value={selectedSource}
        onChange={setSelectedSource}
        label="Choose Data Source"
      />

      {/* Small size */}
      <DataSourceControl
        sources={commonDataSources}
        value={selectedSource}
        onChange={setSelectedSource}
        label="Small Size"
        size="sm"
      />

      {/* Large size */}
      <DataSourceControl
        sources={commonDataSources}
        value={selectedSource}
        onChange={setSelectedSource}
        label="Large Size"
        size="lg"
      />

      {/* No label */}
      <DataSourceControl
        sources={commonDataSources}
        value={selectedSource}
        onChange={setSelectedSource}
        showLabel={false}
      />

      {/* Disabled state */}
      <DataSourceControl
        sources={commonDataSources}
        value={selectedSource}
        onChange={setSelectedSource}
        label="Disabled"
        disabled
      />

      {/* Selected value display */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <strong>Selected:</strong> {selectedSource}
      </div>
    </div>
  );
};
