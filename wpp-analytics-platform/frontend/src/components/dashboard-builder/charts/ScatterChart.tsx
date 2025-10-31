'use client';

/**
 * Scatter Chart - Dataset-Based (ECHARTS VERSION)
 *
 * Plug-and-play scatter plot using ECharts rendering engine.
 * Perfect for correlation analysis between two metrics.
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

export interface ScatterChartProps extends Partial<ComponentConfig> {
  xAxisField?: string;
  yAxisField?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const ScatterChart: React.FC<ScatterChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    title = 'Scatter Plot',
    showTitle = true,
    showLegend = true,
    chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
    xAxisField = metrics[0],
    yAxisField = metrics[1],
    style,
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  const defaults = getChartDefaults('scatter_chart');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimensions[0]);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'scatter',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length >= 2 && !!currentPageId,
    chartType: 'scatter_chart',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

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

  // Transform to ECharts scatter format: [[x, y], [x, y], ...]
  const scatterData = currentData.map((row: any) => [
    Number(row[xAxisField]) || 0,
    Number(row[yAxisField]) || 0
  ]);

  const comparisonScatterData = hasComparison
    ? comparisonData.map((row: any) => [
        Number(row[xAxisField]) || 0,
        Number(row[yAxisField]) || 0
      ])
    : [];

  const series: any[] = [{
    name: formatChartLabel(xAxisField + ' vs ' + yAxisField),
    type: 'scatter',
    data: scatterData,
    itemStyle: { color: chartColors[0] },
    symbolSize: 8
  }];

  if (hasComparison) {
    series.push({
      name: `${formatChartLabel(xAxisField + ' vs ' + yAxisField)} (Previous)`,
      type: 'scatter',
      data: comparisonScatterData,
      itemStyle: { color: chartColors[0], opacity: 0.4 },
      symbolSize: 8
    });
  }

  const option: EChartsOption = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params.data;
        return `${formatChartLabel(xAxisField)}: ${data[0]}<br/>${formatChartLabel(yAxisField)}: ${data[1]}`;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      data: series.map(s => s.name),
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: {
      left: '80px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: showLegend ? '60px' : '30px'
    },
    xAxis: {
      type: 'value',
      name: formatChartLabel(xAxisField),
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' as const } }
    },
    yAxis: {
      type: 'value',
      name: formatChartLabel(yAxisField),
      nameLocation: 'middle',
      nameGap: 50,
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
