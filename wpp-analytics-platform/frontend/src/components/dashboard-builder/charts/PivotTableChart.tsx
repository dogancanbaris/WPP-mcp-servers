'use client';

/**
 * Pivot Table Chart Component - Dataset-Based
 *
 * Interactive pivot table for multi-dimensional data analysis.
 * Supports row/column grouping, aggregations, and drill-down.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface PivotTableChartProps extends Partial<ComponentConfig> {
  /** Row dimensions */
  rowDimensions?: string[];
  /** Column dimensions */
  columnDimensions?: string[];
  /** Aggregation function */
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export const PivotTableChart: React.FC<PivotTableChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dateRange,
    filters = [],
    title = 'Pivot Table',
    showTitle = true,
    rowDimensions = [],
    columnDimensions = [],
    aggregation = 'sum',
    style,
    ...rest
  } = props;

  // Subscribe to global filters
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const globalFilters = useFilterStore(state => state.activeFilters);

  const effectiveDateRange = globalDateRange || dateRange;
  const effectiveFilters = [...filters, ...globalFilters];

  const firstMetric = metrics[0];
  const allDimensions = [...rowDimensions, ...columnDimensions];

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['pivot-table', dataset_id, firstMetric, allDimensions, effectiveDateRange, effectiveFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dimensions: allDimensions.join(','),
        metrics: firstMetric,
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        ...(effectiveFilters.length > 0 && { filters: JSON.stringify(effectiveFilters) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0 && allDimensions.length > 0
  });

  // Styling
  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: style?.borderRadius || theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity,
    color: style?.textColor,
    overflowX: 'auto'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: style?.fontSize || '16px',
    fontWeight: '600',
    color: style?.textColor || '#111827',
    marginBottom: '16px'
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

  // Extract data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Build pivot structure
  const rowKeys = new Set<string>();
  const colKeys = new Set<string>();
  const pivotData = new Map<string, Map<string, number>>();

  chartData.forEach((row: any) => {
    const rowKey = rowDimensions.map(dim => row[dim]).join(' | ');
    const colKey = columnDimensions.length > 0
      ? columnDimensions.map(dim => row[dim]).join(' | ')
      : firstMetric;
    const value = row[firstMetric] || 0;

    rowKeys.add(rowKey);
    colKeys.add(colKey);

    if (!pivotData.has(rowKey)) {
      pivotData.set(rowKey, new Map());
    }

    const rowData = pivotData.get(rowKey)!;
    const currentValue = rowData.get(colKey) || 0;

    // Apply aggregation
    switch (aggregation) {
      case 'sum':
        rowData.set(colKey, currentValue + value);
        break;
      case 'avg':
        rowData.set(colKey, (currentValue + value) / 2);
        break;
      case 'count':
        rowData.set(colKey, (rowData.get(colKey) || 0) + 1);
        break;
      case 'min':
        rowData.set(colKey, Math.min(currentValue || Infinity, value));
        break;
      case 'max':
        rowData.set(colKey, Math.max(currentValue, value));
        break;
    }
  });

  const rowKeysArray = Array.from(rowKeys);
  const colKeysArray = Array.from(colKeys);

  console.log('[PivotTableChart] Data loaded:', rowKeysArray.length, 'rows x', colKeysArray.length, 'columns');

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left text-sm font-semibold">
              {rowDimensions.join(' / ')}
            </th>
            {colKeysArray.map((colKey) => (
              <th
                key={colKey}
                className="border border-gray-300 bg-gray-100 px-4 py-2 text-right text-sm font-semibold"
              >
                {colKey}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowKeysArray.map((rowKey) => {
            const rowData = pivotData.get(rowKey)!;
            return (
              <tr key={rowKey} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                  {rowKey}
                </td>
                {colKeysArray.map((colKey) => {
                  const value = rowData.get(colKey) || 0;
                  return (
                    <td
                      key={colKey}
                      className="border border-gray-300 px-4 py-2 text-right text-sm"
                    >
                      {value.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
