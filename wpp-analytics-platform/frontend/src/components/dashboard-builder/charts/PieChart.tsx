'use client';

/**
 * Pie Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows part-to-whole relationships using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';
import { getEChartsTheme } from '@/lib/themes/echarts-theme';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults } from '@/lib/defaults/chart-defaults';
import { useChartResize } from '@/hooks/useChartResize';

export interface PieChartProps extends Partial<ComponentConfig> {
  pieRadius?: string | [string, string];
  pieCenter?: [string, string];
  showLabel?: boolean;
  labelPosition?: 'outside' | 'inside' | 'center';
  containerSize?: { width: number; height: number };
}

/**
 * Calculate dynamic grid padding based on container size
 * Ensures all chart elements (labels, legend, axes) remain visible
 */
function calculateDynamicGrid(
  containerSize: { width: number; height: number } | undefined,
  showLegend: boolean,
  useDualAxis: boolean
) {
  const width = containerSize?.width || 600;
  const height = containerSize?.height || 400;

  // Calculate responsive padding (minimum pixels, maximum percentage)
  const leftPx = Math.min(Math.max(40, width * 0.08), width * 0.15);
  const rightPx = useDualAxis
    ? Math.min(Math.max(50, width * 0.08), width * 0.15)
    : Math.min(Math.max(30, width * 0.05), width * 0.10);
  const topPx = Math.min(Math.max(30, height * 0.08), height * 0.12);
  // FIX: Increase bottom padding for legends (more space for scrollable legend)
  const bottomPx = showLegend
    ? Math.min(Math.max(80, height * 0.20), height * 0.30) // Increased from 60/0.15
    : Math.min(Math.max(30, height * 0.08), height * 0.12);

  return {
    left: leftPx,
    right: rightPx,
    top: topPx,
    bottom: bottomPx,
    containLabel: true, // CRITICAL - keeps all labels visible
  };
}

export const PieChart: React.FC<PieChartProps> = (props) => {
  // Chart ref for ResizeObserver
  const chartRef = useRef<ReactECharts>(null);

  const {
    // Component ID
    id: componentId,

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
    containerSize,

    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('pie_chart');
  const finalLimit = props.limit !== undefined ? props.limit : defaults.limit;

  const currentPageId = useCurrentPageId();

  // Enable auto-resize when container changes
  useChartResize(chartRef, containerSize);

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimension || 'date',
  });

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['piechart', dataset_id, dimension, metrics, cascadedFilters, finalLimit],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(dimension && { dimensions: dimension }),
        metrics: metrics.join(','),
        ...(cascadedFilters.length > 0 && { filters: JSON.stringify(cascadedFilters) }),
        limit: finalLimit?.toString() || '10', // Use defaults or fallback to 10
        chartType: 'pie_chart' // Tell backend to sort by metric DESC
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

  // Extract comparison data
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];
  const hasComparison = comparisonData.length > 0;

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to ECharts format with capitalized names
  const pieData = currentData.map((row: any, idx: number) => ({
    name: formatChartLabel(standardizeDimensionValue(row[dimension || ''], dimension || '')),
    value: Number(row[metrics[0]]),
    itemStyle: { color: chartColors[idx % chartColors.length] }
  }));

  // Transform comparison data if available
  const comparisonPieData = hasComparison
    ? comparisonData.map((row: any, idx: number) => ({
        name: formatChartLabel(standardizeDimensionValue(row[dimension || ''], dimension || '')),
        value: Number(row[metrics[0]]),
        itemStyle: { color: chartColors[idx % chartColors.length], opacity: 0.5 }
      }))
    : [];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const name = formatChartLabel(params.name);
        return `${name}: ${params.value} (${params.percent}%)`;
      }
    },
    legend: {
      show: showLegend,
      type: 'scroll',  // Enable scrolling for many items
      orient: 'horizontal',
      bottom: 10, // FIX: Space from bottom edge (was 0)
      height: 60, // FIX: Explicit height for scroll area
      formatter: (name: string) => formatChartLabel(name),
      textStyle: {
        color: '#374151',  // Darker for better readability
        fontSize: Math.max(10, Math.min(12, (containerSize?.width || 600) / 60))
      },
      pageIconSize: 12,
      pageTextStyle: {
        fontSize: Math.max(10, Math.min(12, (containerSize?.width || 600) / 60))
      }
    },
    grid: calculateDynamicGrid(containerSize, showLegend, false),
    series: hasComparison ? [
      // Current period pie (left)
      {
        type: 'pie',
        radius: typeof pieRadius === 'string' ? pieRadius : pieRadius[1],
        center: ['30%', showLegend ? '42%' : '50%'], // FIX: Move up when legend at bottom
        data: pieData,
        label: {
          show: showLabel,
          position: labelPosition,
          fontSize: 10,
          color: '#666',
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      },
      // Comparison period pie (right, semi-transparent)
      {
        type: 'pie',
        radius: typeof pieRadius === 'string' ? pieRadius : pieRadius[1],
        center: ['70%', showLegend ? '42%' : '50%'], // FIX: Move up when legend at bottom
        data: comparisonPieData,
        label: {
          show: showLabel,
          position: labelPosition,
          fontSize: 10,
          color: '#999',
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ] : [
      // Single pie (no comparison)
      {
        type: 'pie',
        radius: pieRadius,
        center: showLegend ? ['50%', '42%'] : pieCenter, // FIX: Move pie up when legend at bottom
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
      }
    ]
  };

  // Use container size for responsive height, or default
  const chartHeight = containerSize?.height
    ? `${containerSize.height - (showTitle ? 40 : 0)}px`
    : '300px';

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: chartHeight, width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
};
