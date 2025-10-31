'use client';

/**
 * WaterfallChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Recharts-based waterfall chart for incremental analysis
 * - Multi-page support with cascaded filters (Global → Page → Component)
 */

import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import { formatChartLabel } from '@/lib/utils/label-formatter';

export interface WaterfallChartProps extends Partial<ComponentConfig> {
  categoryField?: string;
  valueField?: string;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    title = 'Waterfall Chart',
    showTitle = true,
    categoryField = dimensions[0],
    valueField = metrics[0],
    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('waterfall');
  const finalSortBy = props.sortBy || resolveSortField(defaults.sortBy, metrics, dimensions[0]);
  const finalSortDirection = props.sortDirection || defaults.sortDirection;
  const finalLimit = props.limit !== undefined ? props.limit : defaults.limit;

  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimensions[0] || 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'waterfall',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && dimensions.length > 0 && !!currentPageId,
    chartType: 'waterfall',
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

  // Transform data for waterfall chart (cumulative calculation)
  let cumulative = 0;
  const waterfallData = currentData.map((row: any, index: number) => {
    const value = parseFloat(row[valueField]) || 0;
    const start = cumulative;
    cumulative += value;

    return {
      name: row[categoryField] || `Category ${index + 1}`,
      value: Math.abs(value),
      start: start,
      end: cumulative,
      fill: value >= 0 ? DASHBOARD_THEME.colors.wppGreen : DASHBOARD_THEME.colors.wppRed,
      isPositive: value >= 0
    };
  });

  return (
    <div style={containerStyle}>
      {showTitle && (
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: theme.textColor,
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={waterfallData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis dataKey="name" stroke={theme.axisColor} />
          <YAxis stroke={theme.axisColor} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.tooltipBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '4px'
            }}
            formatter={(value: any, name: string, props: any) => {
              const item = props.payload;
              return [`${item.isPositive ? '+' : '-'}${value}`, `Change (Total: ${item.end})`];
            }}
          />
            <Legend formatter={(value) => formatChartLabel(value)} />
          <Bar dataKey="value" stackId="a">
            {waterfallData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
