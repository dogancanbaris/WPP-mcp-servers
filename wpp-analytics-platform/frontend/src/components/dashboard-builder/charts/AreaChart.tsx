'use client';

/**
 * Area Chart - Dataset-Based (ECHARTS VERSION)
 *
 * Plug-and-play area chart using ECharts rendering engine.
 * Shows trends with filled areas for visual emphasis.
 */

import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import { useChartResize } from '@/hooks/useChartResize';
import type { EChartsOption } from 'echarts';

export interface AreaChartProps extends Partial<ComponentConfig> {
  smooth?: boolean;
  stacked?: boolean;
  fillOpacity?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
  containerSize?: { width: number; height: number };
}

function calculateDynamicGrid(
  containerSize: { width: number; height: number } | undefined,
  showLegend: boolean,
  useDualAxis: boolean
) {
  const width = containerSize?.width || 600;
  const height = containerSize?.height || 400;

  const leftPx = Math.min(Math.max(40, width * 0.08), width * 0.15);
  const rightPx = useDualAxis
    ? Math.min(Math.max(50, width * 0.08), width * 0.15)
    : Math.min(Math.max(30, width * 0.05), width * 0.10);
  const topPx = Math.min(Math.max(30, height * 0.08), height * 0.12);
  const bottomPx = showLegend
    ? Math.min(Math.max(60, height * 0.15), height * 0.25)
    : Math.min(Math.max(30, height * 0.08), height * 0.12);

  return {
    left: leftPx,
    right: rightPx,
    top: topPx,
    bottom: bottomPx,
    containLabel: true,
  };
}

export const AreaChart: React.FC<AreaChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;
  const chartRef = useRef<ReactECharts>(null);

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimension,
    title = 'Area Chart',
    showTitle = true,
    showLegend = true,
    chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
    smooth = true,
    stacked = false,
    fillOpacity = 0.6,
    style,
    sortBy,
    sortDirection,
    limit,
    containerSize,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  useChartResize(chartRef, containerSize);

  const defaults = getChartDefaults('area_chart');
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
    componentId: componentId || 'areachart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    chartType: 'area_chart',
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

  // Transform to ECharts format
  const categories = currentData.map((row: any) => formatChartLabel(row[dimension || '']));

  // Build series (line with areaStyle)
  const series = metrics.map((metric, index) => ({
    name: formatChartLabel(metric),
    type: 'line' as const,
    smooth,
    areaStyle: { opacity: fillOpacity },
    data: currentData.map((row: any) => Number(row[metric]) || 0),
    lineStyle: { width: 2 },
    itemStyle: { color: chartColors[index % chartColors.length] }
  }));

  if (hasComparison) {
    metrics.forEach((metric, index) => {
      series.push({
        name: `${formatChartLabel(metric)} (Previous)`,
        type: 'line' as const,
        smooth,
        areaStyle: { opacity: fillOpacity * 0.5 },
        data: comparisonData.map((row: any) => Number(row[metric]) || 0),
        lineStyle: { width: 2, type: 'dashed' as const },
        itemStyle: { color: chartColors[index % chartColors.length], opacity: 0.7 }
      });
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
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      data: series.map(s => s.name),
      formatter: (name: string) => formatChartLabel(name),
      textStyle: {
        color: '#666',
        fontSize: Math.max(10, Math.min(12, (containerSize?.width || 600) / 60))
      }
    },
    grid: calculateDynamicGrid(containerSize, showLegend, false),
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: {
        color: '#666',
        fontSize: Math.max(9, Math.min(11, (containerSize?.width || 600) / 70)),
        rotate: containerSize && containerSize.width < 300 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: {
        color: '#666',
        fontSize: Math.max(9, Math.min(11, (containerSize?.width || 600) / 70))
      },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' as const } }
    },
    series: series
  };

  const chartHeight = containerSize?.height
    ? `${containerSize.height - (showTitle ? 40 : 0)}px`
    : '400px';

  return (
    <div style={containerStyle}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: chartHeight, width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
};
