'use client';

/**
 * Waterfall Chart - Dataset-Based (ECHARTS VERSION)
 *
 * Plug-and-play waterfall chart using ECharts rendering engine.
 * Shows cumulative effect of sequential positive/negative values.
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

export interface WaterfallChartProps extends Partial<ComponentConfig> {
  categoryField?: string;
  valueField?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimension,
    title = 'Waterfall Chart',
    showTitle = true,
    showLegend = true,
    categoryField = dimension,
    valueField = metrics[0],
    style,
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  const defaults = getChartDefaults('waterfall');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimension || undefined);
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
    componentId: componentId || 'waterfall',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    chartType: 'waterfall',
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

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to waterfall format (cumulative bars)
  const categories = currentData.map((row: any) => formatChartLabel(row[categoryField || '']));
  const values = currentData.map((row: any) => Number(row[valueField]) || 0);

  // Calculate cumulative positions for waterfall effect
  let cumulative = 0;
  const waterfallData = values.map((value, index) => {
    const start = cumulative;
    cumulative += value;
    return {
      value: Math.abs(value),
      start,
      isPositive: value >= 0
    };
  });

  // Helper data for transparent bars (to create waterfall effect)
  const helperData = waterfallData.map(d => d.start);
  const actualData = waterfallData.map(d => d.value);

  const option: EChartsOption = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const value = values[dataIndex];
        const total = waterfallData[dataIndex].start + value;
        return `${categories[dataIndex]}<br/>Change: ${value >= 0 ? '+' : ''}${value}<br/>Total: ${total}`;
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '80px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: '30px'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' as const } }
    },
    series: [
      {
        // Transparent helper bars to create waterfall effect
        name: 'Helper',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: 'transparent' },
        data: helperData
      },
      {
        // Actual visible bars
        name: formatChartLabel(valueField),
        type: 'bar',
        stack: 'total',
        data: actualData,
        itemStyle: {
          color: (params: any) => {
            return waterfallData[params.dataIndex].isPositive
              ? DASHBOARD_THEME.colors.wppGreen
              : DASHBOARD_THEME.colors.wppRed;
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => {
            const value = values[params.dataIndex];
            return value >= 0 ? `+${value}` : `${value}`;
          }
        }
      }
    ]
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
