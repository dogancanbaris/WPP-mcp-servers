'use client';

/**
 * Heatmap Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows data density/intensity in a matrix using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports global filters via useGlobalFilters hook
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { useFilterStore } from '@/store/filterStore';

export interface HeatmapChartProps extends Partial<ComponentConfig> {
  xAxisDimension?: string;
  yAxisDimension?: string;
  colorRange?: string[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  // Data props
  dataset_id,
  dimension = null,
  metrics = [],
  dateRange,

  // Display props
  title = 'Heatmap Chart',
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

  // Heatmap specific
  xAxisDimension = 'date',
  yAxisDimension = 'category',
  colorRange = ['#50a3ba', '#eac736', '#d94e5d'],

  ...rest
}) => {
  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['heatmapchart', dataset_id, xAxisDimension, yAxisDimension, metrics, effectiveDateRange],
    queryFn: async () => {
      const dimensions = [xAxisDimension, yAxisDimension].filter(Boolean).join(',');
      const params = new URLSearchParams({
        dimensions,
        metrics: metrics.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0 && !!xAxisDimension && !!yAxisDimension
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

  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Extract unique x and y axis values
  const xAxisData = Array.from(new Set(chartData.map((row: any) => row[xAxisDimension])));
  const yAxisData = Array.from(new Set(chartData.map((row: any) => row[yAxisDimension])));

  // Transform to heatmap format: [xIndex, yIndex, value]
  const heatmapData = chartData.map((row: any) => [
    xAxisData.indexOf(row[xAxisDimension]),
    yAxisData.indexOf(row[yAxisDimension]),
    Number(row[metrics[0]]) || 0
  ]);

  // Find min/max for visual scale
  const values = heatmapData.map((item: any) => item[2]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: function (params: any) {
        return `${xAxisData[params.value[0]]}, ${yAxisData[params.value[1]]}: ${params.value[2]}`;
      }
    },
    grid: {
      left: 100,
      right: 50,
      top: 30,
      bottom: 80,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        fontSize: 10,
        color: '#666',
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        fontSize: 10,
        color: '#666'
      }
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: colorRange
      },
      textStyle: {
        color: '#666',
        fontSize: 10
      }
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          fontSize: 10,
          color: '#000'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
    </div>
  );
};
