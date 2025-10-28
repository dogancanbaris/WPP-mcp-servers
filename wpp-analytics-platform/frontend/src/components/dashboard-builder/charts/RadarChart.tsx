'use client';

/**
 * Radar Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows multivariate data on a radial axis using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports cascaded filters (Global → Page → Component)
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';

export interface RadarChartProps extends Partial<ComponentConfig> {
  shape?: 'polygon' | 'circle';
}

export const RadarChart: React.FC<RadarChartProps> = (props) => {
  const {
    id: componentId,
    dataset_id,
    dimension = null,
    metrics = [],
    dateRange,

    // Display props
    title = 'Radar Chart',
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

    // Radar specific
    shape = 'polygon',

    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'radarchart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : [],
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!currentPageId,
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
      <div style={containerStyle} className="flex items-center justify-center min-h-[350px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[350px] gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[350px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // If dimension provided, use it as series, metrics as indicators
  // Otherwise, use metrics as indicators with single series
  let indicator: any[] = [];
  let series: any[] = [];

  if (dimension) {
    // Dimension as series, metrics as indicators
    indicator = metrics.map(metric => ({
      name: metric.charAt(0).toUpperCase() + metric.slice(1),
      max: Math.max(...chartData.map((row: any) => Number(row[metric]) || 0)) * 1.2
    }));

    series = chartData.map((row: any, idx: number) => ({
      name: standardizeDimensionValue(row[dimension], dimension),
      value: metrics.map(metric => Number(row[metric]) || 0),
      itemStyle: { color: chartColors[idx % chartColors.length] }
    }));
  } else {
    // Single data point, metrics as indicators
    indicator = metrics.map(metric => ({
      name: metric.charAt(0).toUpperCase() + metric.slice(1),
      max: Number(chartData[0]?.[metric]) * 1.5 || 100
    }));

    series = [{
      name: 'Metrics',
      value: metrics.map(metric => Number(chartData[0]?.[metric]) || 0),
      itemStyle: { color: chartColors[0] }
    }];
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item'
    },
    legend: showLegend ? {
      bottom: 0,
      textStyle: { color: '#666', fontSize: 11 }
    } : undefined,
    radar: {
      indicator: indicator,
      shape: shape,
      splitNumber: 4,
      radius: '60%',
      axisName: {
        color: '#666',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: ['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#ccc']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0.02)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: series,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          opacity: 0.3
        }
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
