'use client';

/**
 * ThemeRiver Chart Component - Dataset-Based
 *
 * Flowing visualization showing change over time across categories.
 * Ideal for displaying temporal trends and category distributions.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface ThemeRiverChartProps extends Partial<ComponentConfig> {
  /** Category dimension */
  categoryDimension?: string;
  /** Custom chart height */
  chartHeight?: string;
}

export const ThemeRiverChart: React.FC<ThemeRiverChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dimension = 'date',
    categoryDimension = 'category',
    dateRange,
    filters = [],
    title = 'Theme River Chart',
    showTitle = true,
    showLegend = true,
    chartHeight = '500px',
    style,
    ...rest
  } = props;

  // Subscribe to global filters
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const globalFilters = useFilterStore(state => state.activeFilters);

  const effectiveDateRange = globalDateRange || dateRange;
  const effectiveFilters = [...filters, ...globalFilters];

  const firstMetric = metrics[0];

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['theme-river', dataset_id, firstMetric, dimension, categoryDimension, effectiveDateRange, effectiveFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dimensions: `${dimension},${categoryDimension}`,
        metrics: firstMetric,
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        ...(effectiveFilters.length > 0 && { filters: JSON.stringify(effectiveFilters) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0
  });

  // Styling
  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: style?.borderRadius || theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity,
    color: style?.textColor
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[500px] gap-2">
        <p className="text-sm text-red-600">Failed to load chart data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[500px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to themeRiver format: [date, value, category]
  const themeRiverData = chartData.map((row: any) => [
    row[dimension],
    row[firstMetric],
    row[categoryDimension]
  ]);

  // Get unique categories for legend
  const categories = [...new Set(chartData.map((row: any) => row[categoryDimension]))];

  // ECharts option
  const option = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0,0,0,0.2)', width: 1, type: 'solid' } },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const date = params[0].axisValue;
        let tooltip = `<strong>${date}</strong><br/>`;
        params.forEach((param: any) => {
          tooltip += `${param.marker} ${param.seriesName}: ${param.value[1].toLocaleString()}<br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      data: categories,
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
      type: 'time',
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    },
    series: [
      {
        name: 'ThemeRiver',
        type: 'themeRiver',
        data: themeRiverData,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  };

  console.log('[ThemeRiverChart] Data loaded:', chartData.length, 'points across', categories.length, 'categories');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
