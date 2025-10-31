'use client';

/**
 * Line Chart - Dataset-Based (ECHARTS VERSION)
 *
 * Plug-and-play line chart using ECharts rendering engine.
 * Perfect for trends over time or continuous data.
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import type { EChartsOption } from 'echarts';

export interface LineChartProps extends Partial<ComponentConfig> {
  smooth?: boolean;
  showDots?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const LineChart: React.FC<LineChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimension,
    title = 'Line Chart',
    showTitle = true,
    showLegend = true,
    chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
    smooth = true,
    showDots = false,
    style,
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('line_chart');
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
    componentId: componentId || 'linechart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    chartType: 'line_chart',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

  // Container styling
  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: style?.borderRadius || theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity,
    color: style?.textColor
  };

  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  // Transform to ECharts format
  const categories = currentData.map((row: any) => formatChartLabel(row[dimension || '']));

  // Build series for each metric
  const series = metrics.map((metric, index) => ({
    name: formatChartLabel(metric),
    type: 'line' as const,
    smooth,
    showSymbol: showDots,
    data: currentData.map((row: any) => Number(row[metric]) || 0),
    lineStyle: { width: 2 },
    itemStyle: { color: chartColors[index % chartColors.length] }
  }));

  // Add comparison series
  if (hasComparison) {
    metrics.forEach((metric, index) => {
      series.push({
        name: `${formatChartLabel(metric)} (Previous)`,
        type: 'line' as const,
        smooth,
        showSymbol: showDots,
        data: comparisonData.map((row: any) => Number(row[metric]) || 0),
        lineStyle: { width: 2, type: 'dashed' as const },
        itemStyle: { color: chartColors[index % chartColors.length], opacity: 0.7 }
      });
    });
  }

  // ECharts option - PLUG AND PLAY!
  const option: EChartsOption = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      data: series.map(s => s.name),
      formatter: (name: string) => formatChartLabel(name),
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: {
      left: '60px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: showLegend ? '60px' : '30px',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11, rotate: categories.length > 15 ? 45 : 0 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' as const } }
    },
    series: series
  };

  return (
    <div style={containerStyle}>
      <ReactECharts
        option={option}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};
