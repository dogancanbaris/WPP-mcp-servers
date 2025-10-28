'use client';

/**
 * Boxplot Chart Component - Dataset-Based
 *
 * Shows distribution statistics (min, Q1, median, Q3, max) using box-and-whisker visualization.
 * Useful for analyzing data spread and outliers.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page architecture with cascaded filters
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';

export interface BoxplotChartProps extends Partial<ComponentConfig> {
  /** Dimension to group data by (e.g., 'category', 'region') */
  groupDimension?: string;
  /** Whether to show outliers */
  showOutliers?: boolean;
  /** Custom chart height */
  chartHeight?: string;
}

export const BoxplotChart: React.FC<BoxplotChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimension = 'category',
    dimensions = [dimension],
    groupDimension = dimension,
    dateRange,
    title = 'Box Plot Chart',
    showTitle = true,
    showLegend = true,
    showOutliers = true,
    chartHeight = '400px',
    style,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();
  const firstMetric = metrics[0];

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
    componentId: componentId || 'boxplot-chart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: [groupDimension],
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

  const titleStyle: React.CSSProperties = {
    fontSize: style?.fontSize || '16px',
    fontWeight: '600',
    color: style?.textColor || '#111827',
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

  // Extract and process data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Calculate box plot statistics for each category
  const calculateBoxPlotData = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);

    return {
      min: sorted[0],
      q1: sorted[q1Index],
      median: sorted[q2Index],
      q3: sorted[q3Index],
      max: sorted[sorted.length - 1]
    };
  };

  // Group data by dimension
  const groupedData = chartData.reduce((acc: any, row: any) => {
    const category = row[groupDimension];
    if (!acc[category]) acc[category] = [];
    acc[category].push(row[firstMetric]);
    return acc;
  }, {});

  const categories = Object.keys(groupedData);
  const boxplotData = categories.map(cat => {
    const stats = calculateBoxPlotData(groupedData[cat]);
    return [stats.min, stats.q1, stats.median, stats.q3, stats.max];
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
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (params.componentSubType === 'boxplot') {
          const [min, q1, median, q3, max] = params.value;
          return `
            <strong>${params.name}</strong><br/>
            Max: ${max.toFixed(2)}<br/>
            Q3: ${q3.toFixed(2)}<br/>
            Median: ${median.toFixed(2)}<br/>
            Q1: ${q1.toFixed(2)}<br/>
            Min: ${min.toFixed(2)}
          `;
        }
        return params.name;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: {
      left: '80px',
      right: '30px',
      bottom: showLegend ? '60px' : '30px',
      top: showTitle ? '60px' : '30px',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11, rotate: categories.length > 5 ? 45 : 0 }
    },
    yAxis: {
      type: 'value',
      name: firstMetric.charAt(0).toUpperCase() + firstMetric.slice(1),
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        data: boxplotData,
        itemStyle: {
          color: DASHBOARD_THEME.colors.wppBlue,
          borderColor: '#333'
        },
        emphasis: {
          itemStyle: {
            color: DASHBOARD_THEME.colors.wppCyan,
            borderColor: '#000',
            borderWidth: 2
          }
        }
      }
    ]
  };

  console.log('[BoxplotChart] Data loaded:', chartData.length, 'rows');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
