'use client';

/**
 * Pie Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows part-to-whole relationships using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getEChartsTheme } from '@/lib/themes/echarts-theme';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useFilterStore } from '@/store/filterStore';

export interface PieChartProps extends Partial<ComponentConfig> {
  pieRadius?: string | [string, string];
  pieCenter?: [string, string];
  showLabel?: boolean;
  labelPosition?: 'outside' | 'inside' | 'center';
}

export const PieChart: React.FC<PieChartProps> = ({
  // Data props
  dataset_id,
  dimension = null,
  metrics = [],
  dateRange,

  // Display props
  title = 'Pie Chart',
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

  // Chart appearance
  showLegend = true,
  chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],

  // Pie specific
  pieRadius = '60%',
  pieCenter = ['50%', '50%'],
  showLabel = true,
  labelPosition = 'outside',

  ...rest
}) => {
  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['piechart', dataset_id, dimension, metrics, effectiveDateRange], // Global date in key
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(dimension && { dimensions: dimension }),
        metrics: metrics.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        limit: '10' // Top 10 for pie charts
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0 && !!dimension
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
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to ECharts format with standardized names
  const pieData = chartData.map((row: any, idx: number) => ({
    name: standardizeDimensionValue(row[dimension || ''], dimension || ''),
    value: Number(row[metrics[0]]),
    itemStyle: { color: chartColors[idx % chartColors.length] }
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: showLegend,
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#666', fontSize: 11 }
    },
    series: [{
      type: 'pie',
      radius: pieRadius,
      center: pieCenter,
      data: pieData,
      label: {
        show: showLabel,
        position: labelPosition,
        fontSize: 11,
        color: '#666'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />
    </div>
  );
};
