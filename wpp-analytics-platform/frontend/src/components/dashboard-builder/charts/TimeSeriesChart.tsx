'use client';

/**
 * Time Series Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Line chart showing metrics over time using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';

export interface TimeSeriesChartProps extends Partial<ComponentConfig> {}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = (props) => {
  // Apply global theme
  const theme = DASHBOARD_THEME.charts;
  const tsTheme = theme.timeSeries;

  const {
    id: componentId,
    dataset_id,
    dimension = 'date',
    metrics = [],
    dateRange,
    title = 'Time Series Chart',
    showTitle = true,
    showLegend = true,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimension || 'date',
  });

  // Chart colors from global theme
  const chartColors = [
    DASHBOARD_THEME.colors.wppBlue,
    DASHBOARD_THEME.colors.wppGreen,
    DASHBOARD_THEME.colors.wppYellow,
    DASHBOARD_THEME.colors.wppRed,
    DASHBOARD_THEME.colors.wppCyan
  ];

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'timeseries',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
  });

  // Styling from global theme
  const containerStyle: React.CSSProperties = {
    backgroundColor: tsTheme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px'
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
        <p className="text-sm text-red-600">Failed to load chart data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Build ECharts series
  const series = metrics.map((metric, index) => ({
    name: metric.charAt(0).toUpperCase() + metric.slice(1),
    type: 'line',
    smooth: true,
    data: chartData.map((row: any) => row[metric]),
    itemStyle: { color: chartColors[index % chartColors.length] },
    lineStyle: { width: 2 }
  }));

  // Determine if we need dual Y-axis (when metrics have vastly different scales)
  const useDualAxis = metrics.length === 2 &&
    (metrics.includes('clicks') && metrics.includes('impressions')); // Clicks vs Impressions need dual axis

  // ECharts option
  const option = {
    backgroundColor: '#ffffff', // Force white background, override any theme
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const date = params[0].axisValue;
        let tooltip = `<strong>${date}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.value;
          const formatted = formatMetricValue(value, param.seriesName.toLowerCase(), [], 'gsc');
          tooltip += `${param.marker} ${param.seriesName}: ${formatted}<br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: {
      left: '60px',
      right: useDualAxis ? '60px' : '30px',
      bottom: showLegend ? '60px' : '30px',
      top: '30px',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: chartData.map((row: any) => row[dimension]),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0', width: 1 } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    yAxis: useDualAxis ? [
      {
        type: 'value',
        name: 'Clicks',
        position: 'left',
        axisLine: { show: true, lineStyle: { color: chartColors[0] } },
        axisLabel: { color: '#666', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Impressions',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: chartColors[1] } },
        axisLabel: { color: '#666', fontSize: 11 },
        splitLine: { show: false }
      }
    ] : {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    },
    series: useDualAxis ? series.map((s, idx) => ({
      ...s,
      yAxisIndex: idx // First metric on left axis, second on right axis
    })) : series
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
    </div>
  );
};
