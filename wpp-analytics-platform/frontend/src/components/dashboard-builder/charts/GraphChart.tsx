'use client';

/**
 * Graph Chart Component - Dataset-Based
 *
 * Network/relationship visualization showing nodes and edges.
 * Great for displaying connections, hierarchies, and network flows.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface GraphChartProps extends Partial<ComponentConfig> {
  /** Layout algorithm */
  layout?: 'force' | 'circular' | 'none';
  /** Node size metric */
  nodeSizeMetric?: string;
  /** Custom chart height */
  chartHeight?: string;
}

export const GraphChart: React.FC<GraphChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dimension = 'node',
    dateRange,
    filters = [],
    title = 'Network Graph',
    showTitle = true,
    showLegend = false,
    layout = 'force',
    nodeSizeMetric = 'value',
    chartHeight = '600px',
    style,
    ...rest
  } = props;

  // Subscribe to global filters
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const globalFilters = useFilterStore(state => state.activeFilters);

  const effectiveDateRange = globalDateRange || dateRange;
  const effectiveFilters = [...filters, ...globalFilters];

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['graph', dataset_id, dimension, metrics, effectiveDateRange, effectiveFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dimensions: dimension,
        metrics: metrics.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        ...(effectiveFilters.length > 0 && { filters: JSON.stringify(effectiveFilters) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && dimension !== undefined
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

  // Extract and transform data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[600px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform data to graph nodes and links
  // Assume data has columns: source, target, value
  const nodes = new Map();
  const links: any[] = [];

  chartData.forEach((row: any) => {
    const source = row.source || row[dimension];
    const target = row.target;
    const value = row[nodeSizeMetric] || row[metrics[0]] || 1;

    if (!nodes.has(source)) {
      nodes.set(source, {
        id: source,
        name: source,
        symbolSize: 20,
        value: 0
      });
    }

    if (target && !nodes.has(target)) {
      nodes.set(target, {
        id: target,
        name: target,
        symbolSize: 20,
        value: 0
      });
    }

    if (target) {
      links.push({
        source: source,
        target: target,
        value: value
      });
    }

    // Accumulate values for node sizes
    const nodeData = nodes.get(source);
    nodeData.value += value;
    nodeData.symbolSize = Math.sqrt(nodeData.value) * 2 + 10;
  });

  const nodeArray = Array.from(nodes.values());

  // ECharts option
  const option = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `<strong>${params.name}</strong><br/>Value: ${params.value.toLocaleString()}`;
        } else if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>Value: ${params.data.value.toLocaleString()}`;
        }
        return params.name;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      textStyle: { color: '#666', fontSize: 12 }
    },
    series: [
      {
        name: 'Network',
        type: 'graph',
        layout: layout,
        data: nodeArray,
        links: links,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          fontSize: 11,
          color: '#111827'
        },
        labelLayout: {
          hideOverlap: true
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 3
          }
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          opacity: 0.5
        },
        itemStyle: {
          color: DASHBOARD_THEME.colors.wppBlue,
          borderColor: '#fff',
          borderWidth: 2
        },
        force: layout === 'force' ? {
          repulsion: 100,
          edgeLength: [50, 200],
          gravity: 0.1
        } : undefined,
        circular: layout === 'circular' ? {
          rotateLabel: true
        } : undefined
      }
    ]
  };

  console.log('[GraphChart] Data loaded:', nodeArray.length, 'nodes,', links.length, 'links');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
