'use client';

/**
 * TreemapChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - ECharts-based treemap for hierarchical data visualization
 * - Multi-page support with cascaded filters
 */

import { Loader2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';

export interface TreemapChartProps extends Partial<ComponentConfig> {
  labelField?: string;
  valueField?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const TreemapChart: React.FC<TreemapChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    title = 'Treemap',
    showTitle = true,
    labelField = dimensions[0],
    valueField = metrics[0],
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('treemap');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimensions[0] || undefined);
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
    componentId: componentId || 'treemap',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && dimensions.length > 0 && !!currentPageId,
    chartType: 'treemap',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

  // Container styling
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius,
    padding: theme.padding,
    display: 'flex',
    flexDirection: 'column'
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract comparison data
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];
  const hasComparison = comparisonData.length > 0;

  // No data state
  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform data for treemap - show % change if comparison available
  const treemapData = currentData.map((row: any, index: number) => {
    const currentValue = parseFloat(row[valueField]) || 0;
    const compValue = hasComparison ? parseFloat(comparisonData[index]?.[valueField]) || 0 : 0;
    const percentChange = hasComparison && compValue > 0
      ? ((currentValue - compValue) / compValue * 100).toFixed(1)
      : null;

    return {
      name: formatChartLabel(row[labelField] || 'Unknown'),
      value: currentValue,
      percentChange
    };
  });

  const option = {
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: {
        color: theme.textColor,
        fontSize: 16,
        fontWeight: 'bold'
      }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>Value: ${params.value}`;
      }
    },
    series: [
      {
        type: 'treemap',
        data: treemapData,
        label: {
          show: true,
          formatter: (params: any) => {
            const item = params.data;
            if (item.percentChange !== null) {
              const sign = parseFloat(item.percentChange) > 0 ? '+' : '';
              return `${item.name}\n${item.value}\n(${sign}${item.percentChange}%)`;
            }
            return `${item.name}\n${item.value}`;
          },
          color: '#fff',
          fontSize: 12
        },
        upperLabel: {
          show: true,
          height: 30,
          color: theme.textColor
        },
        itemStyle: {
          borderColor: theme.borderColor,
          borderWidth: 2,
          gapWidth: 2
        },
        levels: [
          {
            itemStyle: {
              borderColor: theme.borderColor,
              borderWidth: 3,
              gapWidth: 3
            }
          },
          {
            colorSaturation: [0.35, 0.5],
            itemStyle: {
              gapWidth: 1,
              borderColorSaturation: 0.6
            }
          }
        ]
      }
    ]
  };

  return (
    <div style={containerStyle}>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};
