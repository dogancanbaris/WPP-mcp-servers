'use client';

/**
 * Gauge Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows single metric progress/percentage using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports multi-page architecture with cascaded filters
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';

export interface GaugeChartProps extends Partial<ComponentConfig> {
  min?: number;
  max?: number;
  gaugeColor?: string[];
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  // Data props
  id: componentId,
  dataset_id,
  metrics = [],
  dimensions = [],
  dateRange,

  // Display props
  title = 'Gauge Chart',
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

  // Gauge specific
  min = 0,
  max = 100,
  gaugeColor = [
    [0.2, '#91cc75'],
    [0.8, '#fac858'],
    [1, '#ee6666']
  ],

  ...rest
}) => {
  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: { id: componentId, dataset_id, metrics, dimensions, dateRange, ...rest },
    dateDimension: 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'gaugechart',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!currentPageId,
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

  // Extract single metric value
  const value = Number(chartData[0]?.[metrics[0]]) || 0;

  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '70%'],
        radius: '90%',
        min: min,
        max: max,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: gaugeColor
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 11,
          distance: -60,
          rotate: 'tangential',
          formatter: function (value: number) {
            if (value === min || value === max) {
              return value.toString();
            }
            return '';
          }
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 14,
          color: '#666'
        },
        detail: {
          fontSize: 24,
          offsetCenter: [0, '-35%'],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value) + '';
          },
          color: 'auto'
        },
        data: [
          {
            value: value,
            name: metrics[0].charAt(0).toUpperCase() + metrics[0].slice(1)
          }
        ]
      }
    ]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />
    </div>
  );
};
