import type { BlendConfig } from '@/types/dashboard-builder';

export interface DatasetFilterInput {
  member: string;
  operator: string;
  values: any[];
  comparisonEnabled?: boolean;
  comparisonValues?: any[];
  comparisonType?: string;
}

interface DateRange {
  start: string;
  end: string;
}

export interface DatasetQueryParams {
  datasetId?: string;
  blendConfig?: BlendConfig;
  dimensions?: string[];
  metrics: string[];
  filters?: DatasetFilterInput[];
  dateRange?: DateRange;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  chartType?: string;
  fillGaps?: boolean;
  debugNoCache?: boolean;
}

export async function fetchChartData(params: DatasetQueryParams) {
  const {
    datasetId,
    blendConfig,
    dimensions = [],
    metrics,
    filters,
    dateRange,
    limit,
    offset,
    sortBy,
    sortDirection,
    chartType,
    fillGaps,
    debugNoCache,
  } = params;

  const isBlend = !!(blendConfig && blendConfig.sources && blendConfig.sources.length > 1);

  if (isBlend) {
    const response = await fetch('/api/datasets/blend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blendConfig,
        dimensions,
        metrics,
        filters,
        dateRange,
        limit,
        sortBy,
        sortDirection,
        chartType,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Blend query failed: ${response.statusText}. ${error}`);
    }

    return response.json();
  }

  if (!datasetId) {
    throw new Error('datasetId is required when blendConfig is not provided');
  }

  const searchParams = new URLSearchParams();
  if (dimensions.length > 0) searchParams.set('dimensions', dimensions.join(','));
  if (metrics.length > 0) searchParams.set('metrics', metrics.join(','));
  if (filters && filters.length > 0) searchParams.set('filters', JSON.stringify(filters));
  if (dateRange) searchParams.set('dateRange', JSON.stringify(dateRange));
  if (typeof limit === 'number') searchParams.set('limit', String(limit));
  if (typeof offset === 'number') searchParams.set('offset', String(offset));
  if (sortBy) searchParams.set('sortBy', sortBy);
  if (sortDirection) searchParams.set('sortDirection', sortDirection);
  if (chartType) searchParams.set('chartType', chartType);
  if (fillGaps) searchParams.set('fillGaps', 'true');
  if (debugNoCache) searchParams.set('debugNoCache', 'true');

  const response = await fetch(`/api/datasets/${datasetId}/query?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dataset query failed: ${response.statusText}. ${error}`);
  }

  return response.json();
}
