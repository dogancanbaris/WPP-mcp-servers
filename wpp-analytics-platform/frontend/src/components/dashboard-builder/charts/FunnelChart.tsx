'use client';

/**
 * Funnel Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows conversion stages using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports multi-page architecture with cascaded filters
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';

export interface FunnelChartProps extends Partial<ComponentConfig> {
  funnelAlign?: 'left' | 'center' | 'right';
  funnelSort?: 'ascending' | 'descending' | 'none';
  gap?: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  // Data props
  id: componentId,
  dataset_id,
  dimension = null,
  dimensions = [],
  metrics = [],
  dateRange,

  // Display props
  title = 'Funnel Chart',
  showTitle = true,
  titleFontFamily = 'roboto',
  titleFontSize = '16',
  titleFontWeight = '600',
  titleColor = '#111827',
  titleBackgroundColor = 'transparent',
  titleAlignment = 'left',

  // Background & Border
  backgroundColor = '#ffffff',
  showBorder = true,
  borderColor = '#e0e0e0',
  borderWidth = 1,
  borderRadius = 8,
  padding = 16,

  // Chart appearance
  showLegend = true,
  chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],

  // Funnel specific
  funnelAlign = 'center',
  funnelSort = 'descending',
  gap = 2,

  ...rest
}) => {
  const currentPageId = useCurrentPageId();

  // Ensure dimensions array includes dimension prop
  const effectiveDimensions = dimension ? [dimension, ...dimensions.filter(d => d !== dimension)] : dimensions;

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: { id: componentId, dataset_id, dimension, dimensions: effectiveDimensions, metrics, dateRange, ...rest },
    dateDimension: 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'funnelchart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: effectiveDimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!currentPageId && (!!dimension || effectiveDimensions.length > 0),
  });

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFontFamily,
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    backgroundColor: titleBackgroundColor,
    textAlign: titleAlignment as any,
    marginBottom: '12px'
  };

  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to ECharts funnel format with standardized names
  const funnelData = chartData.map((row: any, idx: number) => ({
    name: standardizeDimensionValue(row[dimension || ''], dimension || ''),
    value: Number(row[metrics[0]]),
    itemStyle: { color: chartColors[idx % chartColors.length] }
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: showLegend,
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: { color: '#666', fontSize: 11 }
    },
    series: [
      {
        type: 'funnel',
        left: showLegend ? '25%' : '10%',
        top: 40,
        bottom: 40,
        width: showLegend ? '60%' : '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: funnelSort,
        gap: gap,
        label: {
          show: true,
          position: 'inside',
          fontSize: 11,
          color: '#fff',
          formatter: '{b}: {c}'
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        data: funnelData
      }
    ]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
    </div>
  );
};
