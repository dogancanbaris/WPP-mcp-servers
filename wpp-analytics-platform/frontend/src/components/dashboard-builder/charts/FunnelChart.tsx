'use client';

/**
 * Funnel Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows conversion stages using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports global filters via useGlobalFilters hook
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useFilterStore } from '@/store/filterStore';

export interface FunnelChartProps extends Partial<ComponentConfig> {
  funnelAlign?: 'left' | 'center' | 'right';
  funnelSort?: 'ascending' | 'descending' | 'none';
  gap?: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  // Data props
  dataset_id,
  dimension = null,
  metrics = [],
  dateRange,

  // Display props
  title = 'Funnel Chart',
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

  // Funnel specific
  funnelAlign = 'center',
  funnelSort = 'descending',
  gap = 2,

  ...rest
}) => {
  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['funnelchart', dataset_id, dimension, metrics, effectiveDateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(dimension && { dimensions: dimension }),
        metrics: metrics.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        limit: '10' // Top 10 for funnel
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

  // Transform to ECharts funnel format with standardized names
  const funnelData = chartData.map((row: any, idx: number) => ({
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
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: { color: '#666', fontSize: 11 }
    },
    series: [
      {
        type: 'funnel',
        left: showLegend ? '25%' : '10%',
        top: 40,
        bottom: 40,
        width: showLegend ? '60%' : '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: funnelSort,
        gap: gap,
        label: {
          show: true,
          position: 'inside',
          fontSize: 11,
          color: '#fff',
          formatter: '{b}: {c}'
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        data: funnelData
      }
    ]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
    </div>
  );
};
