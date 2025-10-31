'use client';

/**
 * Stacked Column Chart Component - Dataset-Based
 *
 * Vertical stacked bar chart showing categorical comparison over time.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page support with cascaded filters
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import type { EChartsOption } from 'echarts';

export interface StackedColumnChartProps extends Partial<ComponentConfig> {
  /** Series configuration (if not using dataset metrics) */
  seriesConfig?: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  showValues?: boolean;
  valueFormat?: 'number' | 'currency' | 'percent' | 'decimal';
  isPercentStacked?: boolean;
  barWidth?: number | string;
  chartHeight?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const StackedColumnChart: React.FC<StackedColumnChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    dimension,
    dateRange,
    filters = [],
    title = 'Stacked Column Chart',
    showTitle = true,
    showLegend = true,
    seriesConfig,
    showValues = false,
    valueFormat = 'number',
    isPercentStacked = false,
    barWidth = '60%',
    chartHeight = '400px',
    style,
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('stacked_column');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimension || undefined);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  // Extract actual dimension for API
  const actualDimension = dimension || dimensions?.[0];

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'stacked-column',
    datasetId: dataset_id || '',
    metrics,
    dimensions: actualDimension ? [actualDimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!actualDimension && !!currentPageId,
    chartType: 'stacked_column',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
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

  // Extract comparison data
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];
  const hasComparison = comparisonData.length > 0;

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Use actualDimension defined above (line 86)
  const categories = currentData.map((row: any) => formatChartLabel(row[actualDimension]));
  const series = seriesConfig || metrics.map(m => ({ key: m, name: formatChartLabel(m) }));

  const colors = [
    DASHBOARD_THEME.colors.wppBlue,
    DASHBOARD_THEME.colors.wppGreen,
    DASHBOARD_THEME.colors.wppYellow,
    DASHBOARD_THEME.colors.wppRed,
    DASHBOARD_THEME.colors.wppCyan
  ];

  // Build option
  const option: EChartsOption = (() => {
    // Calculate totals for percentage mode
    const totals = isPercentStacked
      ? currentData.map(item => {
          return series.reduce((sum, s) => {
            const value = Number(item[s.key]) || 0;
            return sum + value;
          }, 0);
        })
      : [];

    // Transform data for ECharts series (current period)
    const chartSeries = series.map((s, index) => {
      const seriesData = currentData.map((item, dataIndex) => {
        const value = Number(item[s.key]) || 0;
        if (isPercentStacked && totals[dataIndex] > 0) {
          return (value / totals[dataIndex]) * 100;
        }
        return value;
      });

      return {
        name: s.name,
        type: 'bar',
        stack: 'total',
        barWidth,
        data: seriesData,
        itemStyle: {
          color: s.color || colors[index % colors.length],
        },
        emphasis: {
          focus: 'series',
        },
        label: showValues
          ? {
              show: true,
              position: 'inside',
              formatter: (params: any) => {
                const value = params.value;
                if (isPercentStacked) {
                  return value > 5 ? `${value.toFixed(1)}%` : '';
                }
                return value > 0 ? value.toLocaleString() : '';
              },
            }
          : undefined,
      };
    });

    // Add comparison series if available (lower opacity)
    if (hasComparison) {
      series.forEach((s, index) => {
        const compSeriesData = comparisonData.map((item, dataIndex) => {
          const value = Number(item[s.key]) || 0;
          if (isPercentStacked && totals[dataIndex] > 0) {
            return (value / totals[dataIndex]) * 100;
          }
          return value;
        });

        chartSeries.push({
          name: `${s.name} (Previous)`,
          type: 'bar',
          stack: 'comparison',
          barWidth,
          data: compSeriesData,
          itemStyle: {
            color: s.color || colors[index % colors.length],
            opacity: 0.4,
          },
          emphasis: {
            focus: 'series',
          },
        });
      });
    }

    return {
      backgroundColor: '#ffffff',
      title: showTitle ? {
        text: title,
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
      } : undefined,
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        show: showLegend,
        bottom: 0,
        data: series.map(s => s.name),
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
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: {
          color: '#666',
          fontSize: 11,
          rotate: categories.length > 5 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        max: isPercentStacked ? 100 : undefined,
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', fontSize: 11, formatter: isPercentStacked ? '{value}%' : '{value}' },
        splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
      },
      series: chartSeries
    };
  })();

  console.log('[StackedColumnChart] Data loaded:', currentData.length, 'categories');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
