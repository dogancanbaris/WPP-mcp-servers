'use client';

/**
 * SankeyChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - ECharts-based Sankey diagram for flow visualization
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface SankeyChartProps extends Partial<ComponentConfig> {
  sourceField?: string;
  targetField?: string;
  valueField?: string;
}

export const SankeyChart: React.FC<SankeyChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dimensions = [],
    dateRange,
    filters = [],
    title = 'Sankey Diagram',
    showTitle = true,
    sourceField = dimensions[0],
    targetField = dimensions[1],
    valueField = metrics[0],
    ...rest
  } = props;

  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['sankey', dataset_id, metrics, dimensions, filters, effectiveDateRange],
    queryFn: async () => {
      const payload = {
        metrics,
        dimensions,
        filters,
        ...(effectiveDateRange && { dateRange: effectiveDateRange })
      };

      const response = await fetch(`/api/datasets/${dataset_id}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[SankeyChart] Data loaded:', result?.data?.length || 0, 'rows');
      return result;
    },
    enabled: !!dataset_id && metrics.length > 0 && dimensions.length >= 2
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

  // No data state
  if (!data?.data || data.data.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform data for Sankey diagram
  const nodes: Set<string> = new Set();
  const links: Array<{ source: string; target: string; value: number }> = [];

  data.data.forEach((row: any) => {
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
