'use client';

/**
 * Bar Chart - Dataset-Based (ECHARTS VERSION)
 *
 * Plug-and-play bar chart using ECharts rendering engine.
 * Supports both vertical and horizontal orientations.
 *
 * NEW ARCHITECTURE:
 * - Pure ECharts (no Recharts)
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page support with cascaded filters
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel, truncateAxisLabel } from '@/lib/utils/label-formatter';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import type { EChartsOption } from 'echarts';

export interface BarChartProps extends Partial<ComponentConfig> {
  orientation?: 'vertical' | 'horizontal';
  barWidth?: string | number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const BarChart: React.FC<BarChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimension,
    title = 'Bar Chart',
    showTitle = true,
    showLegend = true,
    chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
    orientation = 'vertical',
    barWidth = '60%',
    style,
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('bar_chart');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimension || undefined);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  // Use cascaded filters
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  // Fetch data
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'barchart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    chartType: 'bar_chart',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

  // Container styling - responsive to column width
  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: style?.borderRadius || theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity,
    color: style?.textColor,
    minHeight: '400px',  // Minimum height for charts
    height: '100%',      // Fill container
    display: 'flex',
    flexDirection: 'column'
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract data
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];
  const hasComparison = comparisonData.length > 0;

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to ECharts format with capitalized labels
  const categories = currentData.map((row: any) => formatChartLabel(row[dimension || '']));

  // Build series data for each metric
  const series = metrics.map((metric, index) => ({
    name: formatChartLabel(metric),
    type: 'bar' as const,
    data: currentData.map((row: any) => Number(row[metric]) || 0),
    itemStyle: {
      color: chartColors[index % chartColors.length]
    }
  }));

  // Add comparison series if available
  if (hasComparison) {
    metrics.forEach((metric, index) => {
      series.push({
        name: `${formatChartLabel(metric)} (Previous)`,
        type: 'bar' as const,
        data: comparisonData.map((row: any) => Number(row[metric]) || 0),
        itemStyle: {
          color: chartColors[index % chartColors.length],
          opacity: 0.4
        }
      });
    });
  }

  // Build ECharts option - PLUG AND PLAY!
  const option: EChartsOption = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      data: series.map(s => s.name),
      formatter: (name: string) => formatChartLabel(name),
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: {
      left: orientation === 'horizontal' ? '200px' : '80px',  // More space for Y-axis labels
      right: '40px',
      top: showTitle ? '80px' : '40px',
      bottom: showLegend ? '140px' : '120px',  // Even more space for rotated X-axis labels
      containLabel: false  // Let labels extend outside grid
    },
    // VERTICAL bars: categories on X, values on Y
    // HORIZONTAL bars: values on X, categories on Y
    xAxis: orientation === 'vertical' ? {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        rotate: 45,
        interval: 'auto',  // Auto-space labels to prevent overlap
        margin: 15,  // Space between labels and axis
        formatter: (value: string) => truncateAxisLabel(value, 18)  // Truncate long labels
      }
    } : {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' as const } }
    },
    yAxis: orientation === 'vertical' ? {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' as const } }
    } : {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        interval: 'auto',  // Auto-space labels
        margin: 10,  // Space between labels and bars
        formatter: (value: string) => truncateAxisLabel(value, 35)  // Truncate long URLs
      }
    },
    series: series
  };

  return (
    <div style={containerStyle}>
      <ReactECharts
        option={option}
        style={{ flex: 1, width: '100%' }}  // Flex to fill container
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};
