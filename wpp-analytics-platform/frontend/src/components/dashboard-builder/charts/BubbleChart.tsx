'use client';

/**
 * BubbleChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Recharts-based bubble chart for 3D data visualization
 * - Multi-page architecture with cascaded filters
 */

import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
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

export interface BubbleChartProps extends Partial<ComponentConfig> {
  xAxisField?: string;
  yAxisField?: string;
  sizeField?: string;
  categoryField?: string;
}

export const BubbleChart: React.FC<BubbleChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    dateRange,
    title = 'Bubble Chart',
    showTitle = true,
    xAxisField = metrics[0],
    yAxisField = metrics[1],
    sizeField = metrics[2],
    categoryField = dimensions[0],
    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('bubble_chart');
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
    componentId: componentId || 'bubble-chart',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length >= 2 && !!currentPageId,
    chartType: 'bubble_chart',
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

  // Transform data for bubble chart
  const bubbleData = currentData.map((row: any, index: number) => ({
    x: parseFloat(row[xAxisField]) || 0,
    y: parseFloat(row[yAxisField]) || 0,
    z: sizeField ? parseFloat(row[sizeField]) || 100 : 100,
    name: categoryField ? row[categoryField] : `Bubble ${index + 1}`
  }));

  // Transform comparison data if available
  const comparisonBubbleData = hasComparison
    ? comparisonData.map((row: any, index: number) => ({
        x: parseFloat(row[xAxisField]) || 0,
        y: parseFloat(row[yAxisField]) || 0,
        z: sizeField ? parseFloat(row[sizeField]) || 100 : 100,
        name: categoryField ? row[categoryField] : `Bubble ${index + 1}`
      }))
    : [];

  // Calculate size range for Z-axis
  const allBubbles = [...bubbleData, ...comparisonBubbleData];
  const zValues = allBubbles.map(d => d.z);
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  const zRange = [minZ || 100, maxZ || 1000];

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
        <ScatterChart>
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
          <ZAxis
            type="number"
            dataKey="z"
            range={zRange}
            name={formatChartLabel(sizeField || 'Size')}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: theme.tooltipBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '4px'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'x') return [value, formatChartLabel(xAxisField)];
              if (name === 'y') return [value, formatChartLabel(yAxisField)];
              if (name === 'z') return [value, formatChartLabel(sizeField || 'Size')];
              return [value, formatChartLabel(name)];
            }}
          />
          <Legend formatter={(value) => formatChartLabel(value)} />
          {/* Current period bubbles */}
          <Scatter name="Current" data={bubbleData} fill={DASHBOARD_THEME.colors.wppBlue}>
            {bubbleData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>

          {/* Comparison period bubbles (semi-transparent) */}
          {hasComparison && (
            <Scatter name="Previous" data={comparisonBubbleData} fill={DASHBOARD_THEME.colors.wppGreen}>
              {comparisonBubbleData.map((entry: any, index: number) => (
                <Cell
                  key={`comp-cell-${index}`}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.4}
                />
              ))}
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
