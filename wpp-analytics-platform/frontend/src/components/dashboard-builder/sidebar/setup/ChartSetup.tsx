import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ComponentConfig, BlendConfig, FilterConfig, DateRangeConfig } from '@/types/dashboard-builder';
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
import { getBlendSummary, getPrimaryBlendDatasetInfo } from '@/lib/data/blend-utils';
import { toast } from '@/lib/toast';

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

  const { dataSources, loading: sourcesLoading, error } = useDataSources();
  const [availableFields, setAvailableFields] = useState<Field[]>([]);

  const chartType = config.type || 'table';
  const dataSourceByLegacyName = useMemo(() => {
    if (!config.datasource) return undefined;
    return dataSources.find(
      (source) => source.table === config.datasource || source.name === config.datasource
    );
  }, [config.datasource, dataSources]);

  const selectedSourceId = useMemo(() => {
    if (config.dataset_id) return config.dataset_id;
    if (dataSourceByLegacyName) return dataSourceByLegacyName.id;
    return dataSources[0]?.id || '';
  }, [config.dataset_id, dataSourceByLegacyName, dataSources]);

  const supportsBlending = behavior.supportsBlending;
  const blendEnabled =
    supportsBlending &&
    !!(config.blendConfig && config.blendConfig.sources?.length && config.blendConfig.sources.length > 1);
  const selectedDimensions = ((config as unknown as Record<string, unknown>).dimensions as string[]) || [];
  const drillDownEnabled = ((config as unknown as Record<string, unknown>).drillDownEnabled as boolean) || false;
  const [isBlendDialogOpen, setBlendDialogOpen] = useState(false);
  const blendSummary = useMemo(
    () => getBlendSummary(config.blendConfig, dataSources),
    [config.blendConfig, dataSources]
  );
  const lastBaseDatasetRef = useRef<string | undefined>(config.dataset_id);

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

  useEffect(() => {
    if (!blendEnabled && config.dataset_id) {
      lastBaseDatasetRef.current = config.dataset_id;
    }
  }, [blendEnabled, config.dataset_id]);

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

  const handleChartTypeChange = (type: string) => {
    onUpdate({ type });
  };

  const handleDataSourceChange = (sourceId: string) => {
    const source = dataSources.find((ds) => ds.id === sourceId);
    lastBaseDatasetRef.current = sourceId;
    onUpdate({
      dataset_id: sourceId,
      datasource: source?.table || source?.name || sourceId,
    });
  };

  const handleBlendToggle = (enabled: boolean) => {
    if (!supportsBlending) return;
    if (enabled) {
      if (dataSources.length < 2) {
        toast.error('Connect at least two data sources before blending');
        return;
      }
      setBlendDialogOpen(true);
    } else {
      handleBlendClear();
    }
  };

  const handleBlendClear = () => {
    const fallbackSourceId =
      lastBaseDatasetRef.current || selectedSourceId || dataSources[0]?.id;
    const fallbackSource = dataSources.find((ds) => ds.id === fallbackSourceId);
    onUpdate({
      blendConfig: undefined,
      dataset_id: fallbackSourceId,
      datasource: fallbackSource ? fallbackSource.table || fallbackSource.name : undefined,
    });
  };

  const handleBlendSave = (blendConfig: BlendConfig) => {
    const primaryInfo = getPrimaryBlendDatasetInfo(blendConfig, dataSources);
    onUpdate({
      blendConfig,
      dataset_id: primaryInfo?.datasetId,
      datasource: primaryInfo?.label || 'Blended Source',
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
    const mapped: FilterConfig[] = updatedFilters.map((f) => ({
      field: f.fieldId || f.fieldName,
      operator: f.operator,
      values: Array.isArray(f.value) ? (f.value as string[]) : [String(f.value)],
      enabled: true,
    }));
    onUpdate({ componentFilters: mapped });
  };

  const handleDateRangeChange = (range: DateRange) => {
    if (range.type === 'custom' && range.startDate && range.endDate) {
      const nextRange: DateRangeConfig = {
        start: range.startDate.toISOString().slice(0, 10),
        end: range.endDate.toISOString().slice(0, 10),
      };
      onUpdate({
        dateRange: nextRange,
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
        blendSummary={blendEnabled ? blendSummary.summaryLabel : undefined}
        blendDetails={blendEnabled ? blendSummary.details : undefined}
        supportsBlending={supportsBlending}
        onConfigureBlend={() => setBlendDialogOpen(true)}
        onClearBlend={blendEnabled ? handleBlendClear : undefined}
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

      {supportsBlending && (
        <BlendDataDialog
          open={isBlendDialogOpen}
          onClose={() => setBlendDialogOpen(false)}
          dataSources={dataSources}
          value={config.blendConfig}
          onSave={handleBlendSave}
        />
      )}
    </div>
  );
};
