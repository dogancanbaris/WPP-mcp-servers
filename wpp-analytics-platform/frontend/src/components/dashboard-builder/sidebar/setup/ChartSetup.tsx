import React, { useEffect, useMemo, useState } from 'react';
import { ComponentConfig, BlendConfig } from '@/types/dashboard-builder';
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
  TextContentSetup,
  MediaSetupPanel,
  ShapeSetupPanel,
  ControlSetupPanel,
  NoSetupPanel,
} from '.';
import type { Field } from '@/lib/api/dashboards';
import { useDataSources } from '@/hooks/useDataSources';
import { getComponentBehavior } from '../component-behavior';
import BlendDataDialog from '@/components/dashboard-builder/dialogs/BlendDataDialog';

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

export const ChartSetup: React.FC<ChartSetupProps> = ({ config, onUpdate }) => {
  const behavior = getComponentBehavior(config.type);

  if (behavior.setupVariant === 'text') {
    return <TextContentSetup config={config} onUpdate={onUpdate} />;
  }

  if (behavior.setupVariant === 'media') {
    return <MediaSetupPanel config={config} onUpdate={onUpdate} />;
  }

  if (behavior.setupVariant === 'shape') {
    return <ShapeSetupPanel config={config} onUpdate={onUpdate} />;
  }

  if (behavior.setupVariant === 'control') {
    return <ControlSetupPanel />;
  }

  if (behavior.setupVariant === 'none') {
    return <NoSetupPanel />;
  }

  const { dataSources, loading: sourcesLoading, error } = useDataSources();
  const [availableFields, setAvailableFields] = useState<Field[]>([]);

  const chartType = config.type || 'table';
  const selectedSourceId = config.dataset_id || config.datasource || dataSources[0]?.id || '';
  const blendEnabled = !!(config.blendConfig && config.blendConfig.sources?.length && config.blendConfig.sources.length > 1);
  const selectedDimensions = ((config as unknown as Record<string, unknown>).dimensions as string[]) || [];
  const drillDownEnabled = ((config as unknown as Record<string, unknown>).drillDownEnabled as boolean) || false;
  const [isBlendDialogOpen, setBlendDialogOpen] = useState(false);

  const metrics: Metric[] = useMemo(() => {
    return (config.metrics || []).map((metricId) => {
      const field = availableFields.find((f) => f.id === metricId);
      return {
        id: metricId,
        name: field?.name || metricId,
        aggregation: 'sum',
        sortOrder: null,
        compareEnabled: false,
      };
    });
  }, [config.metrics, availableFields]);

  const filters: ChartFilter[] = useMemo(() => {
    return (config.filters || []).map((f, idx) => ({
      id: `filter-${idx}`,
      fieldId: f.field,
      fieldName: f.field,
      operator: f.operator,
      value: f.values.join(','),
    }));
  }, [config.filters]);

  const dateRange: DateRange = config.dateRange
    ? typeof config.dateRange === 'string'
      ? { type: 'preset', preset: normalizeDatePreset(config.dateRange) || 'last30Days' }
      : config.dateRange.start && config.dateRange.end
        ? {
            type: 'custom',
            startDate: new Date(config.dateRange.start),
            endDate: new Date(config.dateRange.end),
          }
        : { type: 'preset', preset: 'last30Days' }
    : { type: 'preset', preset: 'last30Days' };

  useEffect(() => {
    if (!dataSources || dataSources.length === 0) {
      setAvailableFields([]);
      return;
    }

    const source =
      (selectedSourceId && dataSources.find((s) => s.id === selectedSourceId)) || dataSources[0];
    setAvailableFields(source?.fields || []);

    if (!config.dataset_id && source) {
      onUpdate({
        dataset_id: source.id,
        datasource: source.table || source.name,
      });
    }
  }, [dataSources, selectedSourceId, config.dataset_id, onUpdate]);

  const handleChartTypeChange = (type: string) => {
    onUpdate({ type });
  };

  const handleDataSourceChange = (sourceId: string) => {
    const source = dataSources.find((ds) => ds.id === sourceId);
    onUpdate({
      dataset_id: sourceId,
      datasource: source?.table || source?.name || sourceId,
    });
  };

  const handleBlendToggle = (enabled: boolean) => {
    if (enabled) {
      setBlendDialogOpen(true);
    } else {
      onUpdate({ blendConfig: undefined });
    }
  };

  const handleBlendSave = (blendConfig: BlendConfig) => {
    const primarySource = blendConfig.sources.find((source) => source.id === blendConfig.primarySourceId);
    onUpdate({
      blendConfig,
      dataset_id: primarySource?.datasetId,
      datasource: 'Blended Source',
    });
  };

  const handleDimensionsChange = (dimensions: string[]) => {
    onUpdate({ dimensions });
  };

  const handleDrillDownToggle = (enabled: boolean) => {
    onUpdate({ drillDownEnabled: enabled });
  };

  const handleMetricsChange = (updatedMetrics: Metric[]) => {
    const metricIds = updatedMetrics.map((m) => m.id);
    onUpdate({ metrics: metricIds });
  };

  const handleFiltersChange = (updatedFilters: ChartFilter[]) => {
    const mapped = updatedFilters.map((f) => ({
      field: f.fieldId || f.fieldName,
      operator: f.operator,
      values: Array.isArray(f.value) ? (f.value as string[]) : [String(f.value)],
      enabled: true,
    }));
    onUpdate({ componentFilters: mapped as any });
  };

  const handleDateRangeChange = (range: DateRange) => {
    if (range.type === 'custom' && range.startDate && range.endDate) {
      onUpdate({
        dateRange: {
          start: range.startDate.toISOString().slice(0, 10),
          end: range.endDate.toISOString().slice(0, 10),
        } as any,
      });
    } else {
      onUpdate({ dateRange: undefined });
    }
  };

  if (sourcesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-sm text-gray-600">Loading data sources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dataSources || dataSources.length === 0) {
    return <NoSetupPanel message="No data sources available. Connect a BigQuery dataset to configure this chart." />;
  }

  return (
    <div className="space-y-6 pb-6">
      <ChartTypeSelector value={chartType} onChange={handleChartTypeChange} />

      <Separator />

      <DataSourceSelector
        dataSources={dataSources}
        selectedSourceId={selectedSourceId}
        onSourceChange={handleDataSourceChange}
        blendEnabled={blendEnabled}
        onBlendToggle={handleBlendToggle}
        isBlendActive={blendEnabled}
        blendSummary={blendEnabled ? `${config.blendConfig?.sources.length} sources` : undefined}
        onConfigureBlend={() => setBlendDialogOpen(true)}
      />

      <Separator />

      <DimensionSelector
        availableFields={availableFields}
        selectedDimensions={selectedDimensions}
        onDimensionsChange={handleDimensionsChange}
        drillDownEnabled={drillDownEnabled}
        onDrillDownToggle={handleDrillDownToggle}
      />

      <Separator />

      <MetricSelector
        availableFields={availableFields}
        metrics={metrics}
        onMetricsChange={handleMetricsChange}
      />

      <Separator />

      <FilterSection
        availableFields={availableFields}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <Separator />

      <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />

      <BlendDataDialog
        open={isBlendDialogOpen}
        onClose={() => setBlendDialogOpen(false)}
        dataSources={dataSources}
        value={config.blendConfig}
        onSave={handleBlendSave}
      />
    </div>
  );
};
