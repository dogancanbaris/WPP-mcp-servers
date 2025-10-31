'use client';

/**
 * SankeyChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - ECharts-based Sankey diagram for flow visualization
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
import { formatChartLabel } from '@/lib/utils/label-formatter';

export interface SankeyChartProps extends Partial<ComponentConfig> {
  sourceField?: string;
  targetField?: string;
  valueField?: string;
}

export const SankeyChart: React.FC<SankeyChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    title = 'Sankey Diagram',
    showTitle = true,
    sourceField = dimensions[0],
    targetField = dimensions[1],
    valueField = metrics[0],
    // Professional defaults (optional overrides)
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('sankey');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimensions?.[0]);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

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
    componentId: componentId || 'sankey',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && dimensions.length >= 2 && !!currentPageId,
    chartType: 'sankey',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit,
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

  // Transform data for Sankey diagram
  const nodes: Set<string> = new Set();
  const links: Array<{ source: string; target: string; value: number }> = [];

  currentData.forEach((row: any) => {
    const source = row[sourceField];
    const target = row[targetField];
    const value = parseFloat(row[valueField]) || 0;

    if (source && target && value > 0) {
      nodes.add(source);
      nodes.add(target);
      links.push({ source, target, value });
    }
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
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>Value: ${params.data.value}`;
        }
        return `${params.name}<br/>Total: ${params.value}`;
      }
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency'
        },
        data: Array.from(nodes).map(name => ({ name })),
        links: links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
        label: {
          color: theme.textColor,
          fontSize: 12
        }
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
