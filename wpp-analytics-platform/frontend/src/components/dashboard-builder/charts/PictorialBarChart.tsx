'use client';

/**
 * Pictorial Bar Chart Component - Dataset-Based
 *
 * Bar chart using custom symbols/images for visual impact.
 * Great for infographics and storytelling with data.
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

export interface PictorialBarChartProps extends Partial<ComponentConfig> {
  /** Symbol type for bars */
  symbolType?: 'rect' | 'circle' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none';
  /** Symbol size */
  symbolSize?: number | string;
  /** Chart orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Custom chart height */
  chartHeight?: string;
}

export const PictorialBarChart: React.FC<PictorialBarChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dimension = 'category',
    dateRange,
    filters = [],
    title = 'Pictorial Bar Chart',
    showTitle = true,
    showLegend = false,
    symbolType = 'roundRect',
    symbolSize = '100%',
    orientation = 'vertical',
    chartHeight = '400px',
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
    queryKey: ['pictorial-bar', dataset_id, firstMetric, dimension, effectiveDateRange, effectiveFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dimensions: dimension,
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

  const categories = chartData.map((row: any) => row[dimension]);
  const values = chartData.map((row: any) => row[firstMetric]);
  const maxValue = Math.max(...values);

  // Color palette
  const colors = [
    DASHBOARD_THEME.colors.wppBlue,
    DASHBOARD_THEME.colors.wppGreen,
    DASHBOARD_THEME.colors.wppYellow,
    DASHBOARD_THEME.colors.wppRed,
    DASHBOARD_THEME.colors.wppCyan
  ];

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
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const param = params[0];
        return `<strong>${param.name}</strong><br/>${firstMetric}: ${param.value.toLocaleString()}`;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: {
      left: orientation === 'horizontal' ? '100px' : '60px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: orientation === 'vertical' ? '80px' : '60px',
      containLabel: false
    },
    xAxis: orientation === 'vertical' ? {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: {
        color: '#666',
        fontSize: 11,
        rotate: categories.length > 5 ? 45 : 0
      }
    } : {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    },
    yAxis: orientation === 'vertical' ? {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    } : {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    series: [
      {
        name: firstMetric.charAt(0).toUpperCase() + firstMetric.slice(1),
        type: 'pictorialBar',
        symbol: symbolType,
        symbolSize: symbolSize,
        symbolRepeat: true,
        symbolMargin: '5%',
        data: values.map((value, index) => ({
          value: value,
          itemStyle: {
            color: colors[index % colors.length]
          }
        })),
        label: {
          show: true,
          position: orientation === 'vertical' ? 'top' : 'right',
          formatter: '{c}',
          color: '#111827',
          fontSize: 11
        },
        emphasis: {
          itemStyle: {
            opacity: 0.8
          }
        }
      }
    ]
  };

  console.log('[PictorialBarChart] Data loaded:', chartData.length, 'categories');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
