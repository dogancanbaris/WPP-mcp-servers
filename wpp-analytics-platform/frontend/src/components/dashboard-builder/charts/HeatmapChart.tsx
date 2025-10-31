'use client';

/**
 * Heatmap Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows data density/intensity in a matrix using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports cascaded filters (Global → Page → Component)
 */

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import { formatChartLabel } from '@/lib/utils/label-formatter';

export interface HeatmapChartProps extends Partial<ComponentConfig> {
  xAxisDimension?: string;
  yAxisDimension?: string;
  colorRange?: string[];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = (props) => {
  const {
    id: componentId,
    dataset_id,
    dimension,
    metrics = [],
    dateRange,

    // Display props
    title = 'Heatmap Chart',
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

    // Heatmap specific (use secondaryDimension from props)
    secondaryDimension,
    xAxisDimension = dimension,
    yAxisDimension = secondaryDimension,
    colorRange = ['#50a3ba', '#eac736', '#d94e5d'],
    sortBy,
    sortDirection,
    limit,

    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('heatmap');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, xAxisDimension || undefined);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

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
    componentId: componentId || 'heatmapchart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: [xAxisDimension, yAxisDimension].filter(Boolean),
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!xAxisDimension && !!yAxisDimension && !!currentPageId,
    chartType: 'heatmap',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
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
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[400px] gap-2">
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
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Extract unique x and y axis values
  const xAxisDataRaw = Array.from(new Set(currentData.map((row: any) => row[xAxisDimension])));
  const yAxisDataRaw = Array.from(new Set(currentData.map((row: any) => row[yAxisDimension])));

  // Capitalized versions for display
  const xAxisData = xAxisDataRaw.map(v => formatChartLabel(String(v)));
  const yAxisData = yAxisDataRaw.map(v => formatChartLabel(String(v)));

  // Transform to heatmap format: [xIndex, yIndex, value]
  const heatmapData = currentData.map((row: any) => [
    xAxisDataRaw.indexOf(row[xAxisDimension]),
    yAxisDataRaw.indexOf(row[yAxisDimension]),
    Number(row[metrics[0]]) || 0
  ]);

  // Calculate delta heatmap if comparison data available
  const deltaHeatmapData = hasComparison
    ? currentData.map((row: any, index: number) => {
        const currentValue = Number(row[metrics[0]]) || 0;
        const compValue = Number(comparisonData[index]?.[metrics[0]]) || 0;
        const delta = currentValue - compValue;
        return [
          xAxisDataRaw.indexOf(row[xAxisDimension]),
          yAxisDataRaw.indexOf(row[yAxisDimension]),
          delta
        ];
      })
    : [];

  // Find min/max for visual scale
  const values = hasComparison
    ? deltaHeatmapData.map((item: any) => item[2])
    : heatmapData.map((item: any) => item[2]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: function (params: any) {
        return `${xAxisData[params.value[0]]}, ${yAxisData[params.value[1]]}: ${params.value[2]}`;
      }
    },
    grid: {
      left: 100,
      right: 50,
      top: 30,
      bottom: 80,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        fontSize: 10,
        color: '#666',
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        fontSize: 10,
        color: '#666'
      }
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: colorRange
      },
      textStyle: {
        color: '#666',
        fontSize: 10
      }
    },
    series: [
      {
        type: 'heatmap',
        data: hasComparison ? deltaHeatmapData : heatmapData,
        label: {
          show: true,
          fontSize: 10,
          color: '#000',
          formatter: hasComparison
            ? (params: any) => (params.value[2] > 0 ? '+' : '') + params.value[2].toFixed(0)
            : undefined
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
    </div>
  );
};
