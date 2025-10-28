'use client';

/**
 * Parallel Coordinates Chart - Dataset-Based
 *
 * Multi-dimensional visualization showing relationships across multiple variables.
 * Ideal for comparing patterns and filtering across dimensions.
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

export interface ParallelChartProps extends Partial<ComponentConfig> {
  /** Dimensions to display as parallel axes */
  parallelDimensions?: string[];
  /** Custom chart height */
  chartHeight?: string;
}

export const ParallelChart: React.FC<ParallelChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dateRange,
    filters = [],
    title = 'Parallel Coordinates',
    showTitle = true,
    parallelDimensions,
    chartHeight = '500px',
    style,
    ...rest
  } = props;

  // Subscribe to global filters
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const globalFilters = useFilterStore(state => state.activeFilters);

  const effectiveDateRange = globalDateRange || dateRange;
  const effectiveFilters = [...filters, ...globalFilters];

  // Use parallelDimensions or fall back to metrics
  const dimensions = parallelDimensions || metrics;

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['parallel', dataset_id, dimensions, effectiveDateRange, effectiveFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        metrics: dimensions.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        ...(effectiveFilters.length > 0 && { filters: JSON.stringify(effectiveFilters) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && dimensions.length > 0
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

  // Extract and transform data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[500px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Build parallel axes schema
  const parallelAxis = dimensions.map((dim, index) => {
    const values = chartData.map((row: any) => row[dim]).filter((v: any) => typeof v === 'number');
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      dim: index,
      name: dim.charAt(0).toUpperCase() + dim.slice(1),
      min: min,
      max: max
    };
  });

  // Transform data to parallel format
  const seriesData = chartData.map((row: any) =>
    dimensions.map(dim => row[dim])
  );

  // ECharts option
  const option = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        let tooltip = '<strong>Data Point</strong><br/>';
        dimensions.forEach((dim, index) => {
          tooltip += `${dim}: ${params.value[index]}<br/>`;
        });
        return tooltip;
      }
    },
    parallelAxis: parallelAxis,
    parallel: {
      left: '80px',
      right: '80px',
      top: showTitle ? '80px' : '50px',
      bottom: '50px',
      parallelAxisDefault: {
        type: 'value',
        nameLocation: 'end',
        nameGap: 20,
        nameTextStyle: {
          color: '#666',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#666',
          fontSize: 11
        }
      }
    },
    series: [
      {
        name: 'Parallel',
        type: 'parallel',
        lineStyle: {
          width: 2,
          opacity: 0.5,
          color: DASHBOARD_THEME.colors.wppBlue
        },
        emphasis: {
          lineStyle: {
            width: 3,
            opacity: 0.8,
            color: DASHBOARD_THEME.colors.wppGreen
          }
        },
        data: seriesData
      }
    ]
  };

  console.log('[ParallelChart] Data loaded:', chartData.length, 'series across', dimensions.length, 'dimensions');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
