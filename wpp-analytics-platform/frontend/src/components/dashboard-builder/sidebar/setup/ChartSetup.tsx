import React, { useState, useEffect } from 'react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  ChartTypeSelector,
  DataSourceSelector,
  DimensionSelector,
  MetricSelector,
  FilterSection,
  DateRangePicker,
} from '.';
import { getAvailableFields, Field, DataSource, FieldsResponse } from '@/lib/api/dashboards';

interface ChartSetupProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

interface Metric {
  id: string;
  name: string;
  aggregation: string;
  sortOrder?: 'asc' | 'desc' | null;
  compareEnabled?: boolean;
}

interface ChartFilter {
  id: string;
  fieldId: string;
  fieldName: string;
  operator: string;
  value: string;
}

interface DateRange {
  type: 'preset' | 'custom';
  preset?: string;
  startDate?: Date;
  endDate?: Date;
}

const DATE_PRESET_ALIASES: Record<string, string> = {
  last7days: 'last7Days',
  last14days: 'last14Days',
  last28days: 'last28Days',
  last30days: 'last30Days',
  last90days: 'last90Days',
  thisweek: 'thisWeek',
  lastweek: 'lastWeek',
  thismonth: 'thisMonth',
  lastmonth: 'lastMonth',
  thisquarter: 'thisQuarter',
  lastquarter: 'lastQuarter',
  all_time: 'allTime',
};

const normalizeDatePreset = (preset?: string): string | undefined => {
  if (!preset) return undefined;
  const lower = preset.toLowerCase();
  if (lower === 'custom') return 'custom';
  return DATE_PRESET_ALIASES[lower] ?? preset;
};

/**
 * ChartSetup Component - Enhanced Looker Studio Style
 *
 * Complete rebuild with all Looker Studio sections:
 * - Chart Type Selector (with icons)
 * - Data Source Selector (with blend toggle)
 * - Dimension Selector (primary + additional + drill down)
 * - Metric Selector (drag-to-reorder, aggregation, sort, compare)
 * - Filter Section (advanced filter builder)
 * - Date Range Picker (presets + custom calendar)
 *
 * Fetches available fields from /api/dashboards/fields on mount.
 *
 * @param config - Current component configuration
 * @param onUpdate - Callback to update component properties
 */
export const ChartSetup: React.FC<ChartSetupProps> = ({ config, onUpdate }) => {
  // State for available fields from API
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [availableFields, setAvailableFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current selections from config
  const chartType = config.type || 'table';
  const selectedSourceId = config.datasource || '';
  const blendEnabled = ((config as unknown as Record<string, unknown>).blendEnabled as boolean) || false;
  const selectedDimensions = ((config as unknown as Record<string, unknown>).dimensions as string[]) || [];
  const drillDownEnabled = ((config as unknown as Record<string, unknown>).drillDownEnabled as boolean) || false;

  // Convert simple metrics array to enhanced Metric objects
  const metrics: Metric[] = (config.metrics || []).map((metricId) => {
    const field = availableFields.find((f) => f.id === metricId);
    return {
      id: metricId,
      name: field?.name || metricId,
      aggregation: 'sum',
      sortOrder: null,
      compareEnabled: false,
    };
  });

  const filters: ChartFilter[] = (config.filters || []).map((f, idx) => ({
    id: `filter-${idx}`,
    fieldId: f.field,
    fieldName: f.field,
    operator: f.operator,
    value: f.values.join(',')
  }));

  const dateRange: DateRange = config.dateRange
    ? typeof config.dateRange === 'string'
      ? { type: 'preset', preset: normalizeDatePreset(config.dateRange) || 'last30Days' }
      : config.dateRange.start && config.dateRange.end
        ? {
            type: 'custom',
            startDate: new Date(config.dateRange.start),
            endDate: new Date(config.dateRange.end)
          }
        : { type: 'preset', preset: 'last30Days' }
    : { type: 'preset', preset: 'last30Days' };

  /**
   * Fetch available fields from API on mount
   * Uses the API client created by frontend-developer agent
   */
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use typed API client instead of raw fetch
        const data: FieldsResponse = await getAvailableFields();

        setDataSources(data.sources);

        // If a data source is selected, use its fields
        if (selectedSourceId) {
          const selectedSource = data.sources.find((s) => s.id === selectedSourceId);
          if (selectedSource) {
            setAvailableFields(selectedSource.fields);
          }
        } else if (data.sources.length > 0) {
          // Default to first data source
          setAvailableFields(data.sources[0].fields);
          onUpdate({ datasource: data.sources[0].id });
        }
      } catch (err) {
        console.error('Error fetching fields:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fields');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  /**
   * Update available fields when data source changes
   */
  useEffect(() => {
    if (selectedSourceId && dataSources.length > 0) {
      const selectedSource = dataSources.find((s) => s.id === selectedSourceId);
      if (selectedSource) {
        setAvailableFields(selectedSource.fields);
      }
    }
  }, [selectedSourceId, dataSources]);

  /**
   * Handle chart type change
   */
  const handleChartTypeChange = (type: string) => {
    // Write to ComponentConfig.type
    onUpdate({ type });
  };

  /**
   * Handle data source change
   */
  const handleDataSourceChange = (sourceId: string) => {
    onUpdate({ datasource: sourceId });
  };

  /**
   * Handle blend toggle
   */
  const handleBlendToggle = (enabled: boolean) => {
    onUpdate({ blendEnabled: enabled });
  };

  /**
   * Handle dimension changes
   */
  const handleDimensionsChange = (dimensions: string[]) => {
    onUpdate({ dimensions });
  };

  /**
   * Handle drill down toggle
   */
  const handleDrillDownToggle = (enabled: boolean) => {
    onUpdate({ drillDownEnabled: enabled });
  };

  /**
   * Handle metrics change
   */
  const handleMetricsChange = (updatedMetrics: Metric[]) => {
    // Convert back to simple array of IDs for config
    const metricIds = updatedMetrics.map((m) => m.id);
    onUpdate({ metrics: metricIds });
  };

  /**
   * Handle filters change
   */
  const handleFiltersChange = (updatedFilters: ChartFilter[]) => {
    // Map to FilterConfig[] and store as componentFilters (align with cascade)
    const mapped = updatedFilters.map((f) => ({
      field: f.fieldId || f.fieldName,
      operator: f.operator,
      values: Array.isArray(f.value) ? (f.value as string[]) : [String(f.value)],
      enabled: true,
    }));
    onUpdate({ componentFilters: mapped as any });
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (range: DateRange) => {
    // Only persist custom ranges; presets should inherit from cascade/global
    if (range.type === 'custom' && range.startDate && range.endDate) {
      onUpdate({ dateRange: { start: range.startDate.toISOString().slice(0,10), end: range.endDate.toISOString().slice(0,10) } as any });
    } else {
      onUpdate({ dateRange: undefined });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-sm text-gray-600">Loading fields...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Chart Type */}
      <ChartTypeSelector value={chartType} onChange={handleChartTypeChange} />

      <Separator />

      {/* Data Source */}
      <DataSourceSelector
        dataSources={dataSources}
        selectedSourceId={selectedSourceId}
        onSourceChange={handleDataSourceChange}
        blendEnabled={blendEnabled}
        onBlendToggle={handleBlendToggle}
      />

      <Separator />

      {/* Dimension */}
      <DimensionSelector
        availableFields={availableFields}
        selectedDimensions={selectedDimensions}
        onDimensionsChange={handleDimensionsChange}
        drillDownEnabled={drillDownEnabled}
        onDrillDownToggle={handleDrillDownToggle}
      />

      <Separator />

      {/* Metrics */}
      <MetricSelector
        availableFields={availableFields}
        metrics={metrics}
        onMetricsChange={handleMetricsChange}
      />

      <Separator />

      {/* Filters */}
      <FilterSection
        availableFields={availableFields}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <Separator />

      {/* Date Range */}
      <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />

      {/* Info Message */}
      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-md">
        <p className="font-medium mb-1">Auto-save enabled</p>
        <p>
          All changes are applied automatically. Chart preview will update in real-time
          as you configure settings.
        </p>
      </div>
    </div>
  );
};
