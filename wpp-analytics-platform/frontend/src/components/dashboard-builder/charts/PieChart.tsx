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
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults } from '@/lib/defaults/chart-defaults';

export interface PieChartProps extends Partial<ComponentConfig> {
  pieRadius?: string | [string, string];
  pieCenter?: [string, string];
  showLabel?: boolean;
  labelPosition?: 'outside' | 'inside' | 'center';
}

export const PieChart: React.FC<PieChartProps> = (props) => {
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

    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('pie_chart');
  const finalLimit = props.limit !== undefined ? props.limit : defaults.limit;

  const currentPageId = useCurrentPageId();

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
      bottom: 0,
      formatter: (name: string) => formatChartLabel(name),
      textStyle: {
        color: '#374151',  // Darker for better readability
        fontSize: 12       // Larger for professional appearance
      },
      pageIconSize: 12,
      pageTextStyle: {
        fontSize: 12
      }
    },
    grid: {
      bottom: '25%',  // More space for legend
      top: '10%',
      containLabel: true
    },
    series: hasComparison ? [
      // Current period pie (left)
      {
        type: 'pie',
        radius: typeof pieRadius === 'string' ? pieRadius : pieRadius[1],
        center: ['30%', '50%'],
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
        center: ['70%', '50%'],
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
