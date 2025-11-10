'use client';

/**
 * Sunburst Chart Component - Dataset-Based
 *
 * Hierarchical visualization showing proportions in a radial layout.
 * Great for displaying nested categorical data and part-to-whole relationships.
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
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';

export interface SunburstChartProps extends Partial<ComponentConfig> {
  /** Hierarchy levels (dimensions) */
  hierarchyDimensions?: string[];
  /** Custom chart height */
  chartHeight?: string;
}

export const SunburstChart: React.FC<SunburstChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    blendConfig,
    metrics = [],
    dimensions = [],
    title = 'Sunburst Chart',
    showTitle = true,
    hierarchyDimensions = dimensions,
    chartHeight = '600px',
    style,
    // Professional defaults (optional overrides)
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('sunburst');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimensions?.[0]);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

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
    componentId: componentId || 'sunburst',
    datasetId: dataset_id,
    blendConfig: props.blendConfig,
    metrics,
    dimensions: hierarchyDimensions,
    filters: cascadedFilters,
    enabled: (Boolean(dataset_id) || Boolean(props.blendConfig)) && metrics.length > 0 && hierarchyDimensions.length > 0 && !!currentPageId,
    chartType: 'sunburst',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit,
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
      <div style={containerStyle} className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[600px] gap-2">
        <p className="text-sm text-red-600">Failed to load chart data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[600px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Build hierarchical tree structure
  const buildTree = (data: any[], dimensions: string[], valueField: string) => {
    const tree: any = { name: 'root', children: [] };

    data.forEach((row: any) => {
      let currentLevel = tree;

      dimensions.forEach((dim, index) => {
        const dimValueRaw = row[dim];
        const dimValue = formatChartLabel(dimValueRaw); // Capitalize for consistent storage
        let child = currentLevel.children?.find((c: any) => c.name === dimValue);

        if (!child) {
          child = {
            name: dimValue,
            children: index < dimensions.length - 1 ? [] : undefined,
            value: 0
          };
          if (!currentLevel.children) currentLevel.children = [];
          currentLevel.children.push(child);
        }

        child.value = (child.value || 0) + (row[valueField] || 0);
        currentLevel = child;
      });
    });

    return tree.children;
  };

  const treeData = buildTree(chartData, hierarchyDimensions, firstMetric);

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
        return `<strong>${params.name}</strong><br/>Value: ${params.value?.toLocaleString() || 0}<br/>Percentage: ${params.percent?.toFixed(2)}%`;
      }
    },
    series: [
      {
        name: 'Sunburst',
        type: 'sunburst',
        data: treeData,
        radius: [0, '90%'],
        label: {
          show: true,
          formatter: (params: any) => {
            const depth = params.treePathInfo?.length || 0;
            return depth > 1 ? params.name : '';
          },
          color: '#fff',
          fontSize: 11
        },
        itemStyle: {
          borderRadius: 4,
          borderWidth: 2,
          borderColor: '#fff'
        },
        emphasis: {
          focus: 'ancestor',
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        levels: [
          {},
          {
            r0: '0%',
            r: '35%',
            label: { rotate: 'tangential', fontSize: 12 },
            itemStyle: { color: DASHBOARD_THEME.colors.wppBlue }
          },
          {
            r0: '35%',
            r: '65%',
            label: { rotate: 'tangential', fontSize: 11 },
            itemStyle: { color: DASHBOARD_THEME.colors.wppGreen }
          },
          {
            r0: '65%',
            r: '90%',
            label: { rotate: 'tangential', fontSize: 10 },
            itemStyle: { color: DASHBOARD_THEME.colors.wppYellow }
          }
        ]
      }
    ]
  };

  console.log('[SunburstChart] Data loaded:', chartData.length, 'rows');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
