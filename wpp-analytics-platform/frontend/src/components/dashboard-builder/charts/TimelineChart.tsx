'use client';

/**
 * Timeline Chart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page support with cascaded filters
 *
 * Event-based visualization showing activities over time.
 * Great for project timelines, event sequences, and Gantt-style displays.
 */

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';

export interface TimelineChartProps extends Partial<ComponentConfig> {
  /** Event name dimension */
  eventDimension?: string;
  /** Start date dimension */
  startDateDimension?: string;
  /** End date dimension */
  endDateDimension?: string;
  /** Custom chart height */
  chartHeight?: string;
}

export const TimelineChart: React.FC<TimelineChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    title = 'Timeline Chart',
    showTitle = true,
    eventDimension = 'event',
    startDateDimension = 'start_date',
    endDateDimension = 'end_date',
    chartHeight = '400px',
    style,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimensions[0] || 'date',
  });

  // Combine event-specific dimensions
  const timelineDimensions = [eventDimension, startDateDimension, endDateDimension];

  // Use page-aware data fetching
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'timeline',
    datasetId: dataset_id || '',
    metrics,
    dimensions: timelineDimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && !!currentPageId,
  });

  // Styling from global theme
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
        <p className="text-sm text-muted-foreground">No timeline data available</p>
      </div>
    );
  }

  // Get unique events (Y-axis categories)
  const events = [...new Set(chartData.map((row: any) => row[eventDimension]))];

  // Transform to ECharts custom series format (Gantt-style bars)
  const seriesData = chartData.map((row: any, index: number) => {
    const eventName = row[eventDimension];
    const startDate = new Date(row[startDateDimension]).getTime();
    const endDate = new Date(row[endDateDimension]).getTime();
    const duration = endDate - startDate;
    const categoryIndex = events.indexOf(eventName);

    return {
      name: eventName,
      value: [categoryIndex, startDate, endDate, duration],
      itemStyle: {
        color: DASHBOARD_THEME.colors.wppBlue,
        borderRadius: 4
      }
    };
  });

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
        const [category, start, end, duration] = params.value;
        const startDate = new Date(start).toLocaleDateString();
        const endDate = new Date(end).toLocaleDateString();
        const days = Math.round(duration / (1000 * 60 * 60 * 24));
        return `<strong>${params.name}</strong><br/>Start: ${startDate}<br/>End: ${endDate}<br/>Duration: ${days} days`;
      }
    },
    grid: {
      left: '150px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: '60px',
      containLabel: false
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: events,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { show: false }
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;

          return {
            type: 'rect',
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height
            },
            style: api.style()
          };
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: seriesData
      }
    ]
  };

  console.log('[TimelineChart] Data loaded:', chartData.length, 'events');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
