'use client';

/**
 * Bullet Chart Component - Dataset-Based
 *
 * Progress visualization showing actual value vs target, with performance ranges.
 * Compact alternative to gauge charts for KPI tracking.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page support with page-aware data fetching
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';

export interface BulletChartProps extends Partial<ComponentConfig> {
  /** Target value to compare against */
  targetValue?: number;
  /** Performance ranges (poor, satisfactory, good) */
  ranges?: [number, number, number];
  /** Chart orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Custom chart height */
  chartHeight?: string;
}

export const BulletChart: React.FC<BulletChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    title = 'Bullet Chart',
    showTitle = true,
    targetValue = 100,
    ranges = [60, 80, 100],
    orientation = 'horizontal',
    chartHeight = '200px',
    style,
    ...rest
  } = props;

  const firstMetric = metrics[0];
  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'bullet-chart',
    datasetId: dataset_id || '',
    metrics,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!currentPageId,
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
      <div style={containerStyle} className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <p className="text-sm text-red-600">Failed to load chart data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract value
  const chartData = data?.data || [];
  const actualValue = chartData[0]?.[firstMetric] || 0;

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // ECharts option (using bar chart to simulate bullet chart)
  const option = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: orientation === 'horizontal' ? '100px' : '30px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: orientation === 'vertical' ? '100px' : '30px',
      containLabel: true
    },
    xAxis: orientation === 'horizontal' ? {
      type: 'value',
      max: ranges[2],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { show: false }
    } : {
      type: 'category',
      data: [firstMetric.charAt(0).toUpperCase() + firstMetric.slice(1)],
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    yAxis: orientation === 'horizontal' ? {
      type: 'category',
      data: [firstMetric.charAt(0).toUpperCase() + firstMetric.slice(1)],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 12, fontWeight: 500 }
    } : {
      type: 'value',
      max: ranges[2],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { show: false }
    },
    series: [
      // Range 1 (Poor)
      {
        name: 'Poor',
        type: 'bar',
        stack: 'range',
        barWidth: '40%',
        data: [ranges[0]],
        itemStyle: { color: '#fee2e2' },
        label: { show: false }
      },
      // Range 2 (Satisfactory)
      {
        name: 'Satisfactory',
        type: 'bar',
        stack: 'range',
        data: [ranges[1] - ranges[0]],
        itemStyle: { color: '#fef3c7' },
        label: { show: false }
      },
      // Range 3 (Good)
      {
        name: 'Good',
        type: 'bar',
        stack: 'range',
        data: [ranges[2] - ranges[1]],
        itemStyle: { color: '#d1fae5' },
        label: { show: false }
      },
      // Actual value
      {
        name: 'Actual',
        type: 'bar',
        barGap: '-100%',
        barWidth: '20%',
        data: [actualValue],
        itemStyle: {
          color: actualValue >= targetValue ? DASHBOARD_THEME.colors.wppGreen : DASHBOARD_THEME.colors.wppRed
        },
        label: {
          show: true,
          position: 'right',
          formatter: `{c}`,
          color: '#111827',
          fontWeight: 600
        },
        z: 10
      },
      // Target marker
      {
        name: 'Target',
        type: 'scatter',
        data: [[targetValue, 0]],
        symbolSize: 20,
        symbol: 'diamond',
        itemStyle: {
          color: '#1f2937',
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'top',
          formatter: `Target: ${targetValue}`,
          color: '#1f2937',
          fontSize: 11
        },
        z: 20
      }
    ]
  };

  console.log('[BulletChart] Data loaded:', actualValue, 'vs target:', targetValue);

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
