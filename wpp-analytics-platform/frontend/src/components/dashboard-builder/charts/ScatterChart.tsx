'use client';

/**
 * ScatterChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Recharts-based scatter plot for correlation analysis
 * - Multi-page support with cascaded filters
 */

import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart as RechartsScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';

export interface ScatterChartProps extends Partial<ComponentConfig> {
  xAxisField?: string;
  yAxisField?: string;
  sizeField?: string;
}

export const ScatterChart: React.FC<ScatterChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    dateRange,
    filters = [],
    title = 'Scatter Plot',
    showTitle = true,
    xAxisField = metrics[0],
    yAxisField = metrics[1],
    sizeField = metrics[2],
    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('scatter_chart');
  const finalSortBy = props.sortBy || resolveSortField(defaults.sortBy, metrics, dimensions[0]);
  const finalSortDirection = props.sortDirection || defaults.sortDirection;
  const finalLimit = props.limit !== undefined ? props.limit : defaults.limit;

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
    componentId: componentId || 'scatter',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length >= 2 && !!currentPageId,
    chartType: 'scatter_chart',
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

  // Transform data for scatter chart
  const scatterData = currentData.map((row: any, index: number) => ({
    x: parseFloat(row[xAxisField]) || 0,
    y: parseFloat(row[yAxisField]) || 0,
    z: sizeField ? parseFloat(row[sizeField]) || 1 : 1,
    name: dimensions[0] ? row[dimensions[0]] : `Point ${index + 1}`
  }));

  // Transform comparison data if available
  const comparisonScatterData = hasComparison
    ? comparisonData.map((row: any, index: number) => ({
        x: parseFloat(row[xAxisField]) || 0,
        y: parseFloat(row[yAxisField]) || 0,
        z: sizeField ? parseFloat(row[sizeField]) || 1 : 1,
        name: dimensions[0] ? row[dimensions[0]] : `Point ${index + 1}`
      }))
    : [];

  const colors = [
    DASHBOARD_THEME.colors.wppBlue,
    DASHBOARD_THEME.colors.wppGreen,
    DASHBOARD_THEME.colors.wppYellow,
    DASHBOARD_THEME.colors.wppRed,
    DASHBOARD_THEME.colors.purple,
    DASHBOARD_THEME.colors.orange
  ];

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
        <RechartsScatter>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            type="number"
            dataKey="x"
            name={formatChartLabel(xAxisField)}
            stroke={theme.axisColor}
            label={{ value: formatChartLabel(xAxisField), position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={formatChartLabel(yAxisField)}
            stroke={theme.axisColor}
            label={{ value: formatChartLabel(yAxisField), angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: theme.tooltipBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '4px'
            }}
            formatter={(value, name) => [value, formatChartLabel(name as string)]}
          />
          <Legend formatter={(value) => formatChartLabel(value)} />
          {/* Current period scatter */}
          <Scatter name="Current" data={scatterData} fill={DASHBOARD_THEME.colors.wppBlue}>
            {scatterData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>

          {/* Comparison period scatter (semi-transparent) */}
          {hasComparison && (
            <Scatter name="Previous" data={comparisonScatterData} fill={DASHBOARD_THEME.colors.wppGreen}>
              {comparisonScatterData.map((entry: any, index: number) => (
                <Cell
                  key={`comp-cell-${index}`}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.4}
                />
              ))}
            </Scatter>
          )}
        </RechartsScatter>
      </ResponsiveContainer>
    </div>
  );
};
