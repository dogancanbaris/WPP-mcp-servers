'use client';

/**
 * Scorecard Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Simple fetch pattern, dataset API
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { fetchChartData } from '@/lib/data/fetchChartData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';

export interface ScorecardProps extends Partial<ComponentConfig> {}

export const Scorecard: React.FC<ScorecardProps> = (props) => {
  const {
    // Component identity
    id: componentId,

    // Data props
    dataset_id,
    blendConfig,
    metrics = [],
    dateRange,

    // Display props
    title = 'KPI Scorecard',
    showTitle = true,
    titleFontFamily = 'roboto',
    titleFontSize = '14',
    titleFontWeight = '500',
    titleColor = '#666666',
    titleBackgroundColor = 'transparent',
    titleAlignment = 'left',

    // Background & Border
    backgroundColor = '#ffffff',
    showBorder = true,
    borderColor = '#e0e0e0',
    borderWidth = 1,
    borderRadius = 8,
    padding = 20,

    // Chart appearance
    chartColors = ['#5470c6'],
  } = props;
  const firstMetric = metrics[0];
  const currentPageId = useCurrentPageId();

  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props as ComponentConfig,
    dateDimension: 'date',
  });

  // Fetch from dataset API (with caching)
  const blendKey = blendConfig ? JSON.stringify(blendConfig) : 'no-blend';

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'scorecard-final',
      componentId || 'scorecard',
      dataset_id || 'blend-only',
      metrics,
      dateRange,
      cascadedFilters,
      blendKey,
    ],
    queryFn: async () => {
      return fetchChartData({
        datasetId: dataset_id || undefined,
        blendConfig,
        metrics,
        filters: cascadedFilters,
        dateRange: dateRange
          ? { start: (dateRange as any).start, end: (dateRange as any).end }
          : undefined,
        chartType: 'scorecard',
      });
    },
    enabled: (Boolean(dataset_id) || Boolean(blendConfig)) && metrics.length > 0 && !!currentPageId,
  });

  // Styling
  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    minHeight: '150px',
    boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFontFamily,
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    backgroundColor: titleBackgroundColor,
    textAlign: titleAlignment as any,
    marginBottom: '8px'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: chartColors[0],
    lineHeight: '1.2'
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract value
  const value = data?.data?.[0]?.[firstMetric] || 0;

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <div style={valueStyle}>{formatMetricValue(value, firstMetric, [])}</div>
      {data?.cached && (
        <p className="text-xs text-muted-foreground mt-2">
          Cached {new Date(data.cachedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
