'use client';

/**
 * Candlestick Chart Component - Dataset-Based
 *
 * Financial chart showing open, high, low, close (OHLC) data.
 * Commonly used for stock prices, trading volumes, and time-series financial data.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page support with cascaded filters (Global → Page → Component)
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';

export interface CandlestickChartProps extends Partial<ComponentConfig> {
  /** Metrics representing [open, high, low, close] */
  ohlcMetrics?: [string, string, string, string];
  /** Show volume data */
  showVolume?: boolean;
  /** Volume metric name */
  volumeMetric?: string;
  /** Custom chart height */
  chartHeight?: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    dimension = 'date',
    title = 'Candlestick Chart',
    showTitle = true,
    showLegend = true,
    ohlcMetrics = ['open', 'high', 'low', 'close'],
    showVolume = false,
    volumeMetric = 'volume',
    chartHeight = '500px',
    style,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  const allMetrics = showVolume
    ? [...ohlcMetrics, volumeMetric]
    : [...ohlcMetrics];

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimension,
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'candlestick',
    datasetId: dataset_id || '',
    metrics: allMetrics,
    dimensions: [dimension],
    filters: cascadedFilters,
    enabled: !!dataset_id && !!currentPageId,
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

  // Extract and transform data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to candlestick format: [open, close, low, high]
  const dates = chartData.map((row: any) => row[dimension]);
  const ohlcData = chartData.map((row: any) => [
    row[ohlcMetrics[0]], // open
    row[ohlcMetrics[3]], // close
    row[ohlcMetrics[2]], // low
    row[ohlcMetrics[1]]  // high
  ]);
  const volumeData = showVolume ? chartData.map((row: any) => row[volumeMetric]) : [];

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
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const date = params[0].axisValue;
        let tooltip = `<strong>${date}</strong><br/>`;

        params.forEach((param: any) => {
          if (param.seriesType === 'candlestick') {
            const [open, close, low, high] = param.data;
            tooltip += `Open: ${open}<br/>High: ${high}<br/>Low: ${low}<br/>Close: ${close}<br/>`;
          } else if (param.seriesType === 'bar') {
            tooltip += `Volume: ${param.value.toLocaleString()}<br/>`;
          }
        });

        return tooltip;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      textStyle: { color: '#666', fontSize: 12 }
    },
    grid: showVolume ? [
      {
        left: '60px',
        right: '30px',
        top: showTitle ? '60px' : '30px',
        height: '60%',
        containLabel: false
      },
      {
        left: '60px',
        right: '30px',
        top: '75%',
        height: '15%',
        containLabel: false
      }
    ] : {
      left: '60px',
      right: '30px',
      top: showTitle ? '60px' : '30px',
      bottom: showLegend ? '60px' : '30px',
      containLabel: false
    },
    xAxis: showVolume ? [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { show: false }
      },
      {
        type: 'category',
        data: dates,
        gridIndex: 1,
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', fontSize: 11 }
      }
    ] : {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    yAxis: showVolume ? [
      {
        scale: true,
        gridIndex: 0,
        splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', fontSize: 11 }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#666', fontSize: 11 }
      }
    ] : {
      scale: true,
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    series: [
      {
        name: 'OHLC',
        type: 'candlestick',
        data: ohlcData,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: DASHBOARD_THEME.colors.wppGreen,
          color0: DASHBOARD_THEME.colors.wppRed,
          borderColor: DASHBOARD_THEME.colors.wppGreen,
          borderColor0: DASHBOARD_THEME.colors.wppRed
        }
      },
      ...(showVolume ? [{
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData,
        itemStyle: {
          color: 'rgba(0, 0, 0, 0.2)'
        }
      }] : [])
    ]
  };

  console.log('[CandlestickChart] Data loaded:', chartData.length, 'periods');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
