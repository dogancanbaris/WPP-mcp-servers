'use client';

/**
 * Tree Chart Component - Dataset-Based
 *
 * Hierarchical tree visualization for organizational structures and nested data.
 * Supports collapsible nodes and multiple layout orientations.
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

export interface TreeChartProps extends Partial<ComponentConfig> {
  /** Hierarchy dimensions (parent -> child) */
  hierarchyDimensions?: string[];
  /** Tree layout orientation */
  layout?: 'orthogonal' | 'radial';
  /** Tree orientation */
  orient?: 'LR' | 'RL' | 'TB' | 'BT';
  /** Custom chart height */
  chartHeight?: string;
}

export const TreeChart: React.FC<TreeChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    blendConfig,
    metrics = [],
    dimensions = [],
    dateRange,
    filters = [],
    title = 'Tree Chart',
    showTitle = true,
    hierarchyDimensions = [],
    layout = 'orthogonal',
    orient = 'LR',
    chartHeight = '600px',
    style,
    // Professional defaults (optional overrides)
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();
  const firstMetric = metrics[0];

  // Use hierarchyDimensions if provided, otherwise fall back to dimensions
  const effectiveDimensions = hierarchyDimensions.length > 0 ? hierarchyDimensions : dimensions;

  // Apply professional defaults
  const defaults = getChartDefaults('tree');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, effectiveDimensions[0] || 'name');
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
    componentId: componentId || 'tree',
    datasetId: dataset_id,
    blendConfig,
    metrics,
    dimensions: effectiveDimensions,
    filters: cascadedFilters,
    enabled: (Boolean(dataset_id) || Boolean(blendConfig)) && !!currentPageId && effectiveDimensions.length > 0,
    chartType: 'tree',
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

  // Build tree structure from flat data
  const buildTree = (data: any[], dimensions: string[], valueField?: string) => {
    const tree: any = { name: 'Root', children: [] };

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
            value: valueField ? (row[valueField] || 0) : 1
          };
          if (!currentLevel.children) currentLevel.children = [];
          currentLevel.children.push(child);
        } else if (valueField) {
          child.value = (child.value || 0) + (row[valueField] || 0);
        }

        currentLevel = child;
      });
    });

    return tree;
  };

  const treeData = buildTree(chartData, effectiveDimensions, firstMetric);

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
        let tooltip = `<strong>${params.name}</strong>`;
        if (params.value) {
          tooltip += `<br/>Value: ${params.value.toLocaleString()}`;
        }
        return tooltip;
      }
    },
    series: [
      {
        name: 'Tree',
        type: 'tree',
        data: [treeData],
        top: showTitle ? '15%' : '5%',
        left: '10%',
        bottom: '5%',
        right: '20%',
        symbolSize: 8,
        layout: layout,
        orient: orient,
        label: {
          position: orient === 'LR' || orient === 'RL' ? 'right' : 'bottom',
          verticalAlign: 'middle',
          align: orient === 'LR' ? 'left' : orient === 'RL' ? 'right' : 'center',
          fontSize: 11,
          color: '#111827'
        },
        leaves: {
          label: {
            position: orient === 'LR' || orient === 'RL' ? 'right' : 'bottom',
            verticalAlign: 'middle',
            align: orient === 'LR' ? 'left' : orient === 'RL' ? 'right' : 'center'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
        itemStyle: {
          color: DASHBOARD_THEME.colors.wppBlue,
          borderColor: '#fff',
          borderWidth: 2
        },
        lineStyle: {
          color: '#ccc',
          width: 1.5,
          curveness: 0.5
        }
      }
    ]
  };

  console.log('[TreeChart] Data loaded:', chartData.length, 'nodes');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
