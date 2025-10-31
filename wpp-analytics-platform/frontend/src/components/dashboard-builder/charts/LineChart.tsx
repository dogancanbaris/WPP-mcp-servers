'use client';

/**
 * Line Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows trends over time or continuous data using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports global filters via useGlobalFilters hook
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import {
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface LineChartProps extends Partial<ComponentConfig> {
  smooth?: boolean;
  showDots?: boolean;
  strokeWidth?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  // Data props
  id: componentId,
  dataset_id,
  dimension = null,
  metrics = [],
  dateRange,

  // Display props
  title = 'Line Chart',
  showTitle = true,
  titleFontFamily = 'roboto',
  titleFontSize = '16',
  titleFontWeight = '600',
  titleColor = '#111827',
  titleBackgroundColor = 'transparent',
  titleAlignment = 'left',

  // Background & Border
  backgroundColor = '#ffffff',
  showBorder = true,
  borderColor = '#e0e0e0',
  borderWidth = 1,
  borderRadius = 8,
  padding = 16,

  // Chart appearance
  showLegend = true,
  chartColors = ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de', '#3ba272'],

  // Line specific
  smooth = true,
  showDots = true,
  strokeWidth = 2,
  sortBy,
  sortDirection,
  limit,

  ...rest
}) => {
  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('line_chart');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimension || undefined);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: { id: componentId, dataset_id, dimension, metrics, dateRange, ...rest },
    dateDimension: dimension || 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'linechart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : [],
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    chartType: 'line_chart',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFontFamily,
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    backgroundColor: titleBackgroundColor,
    textAlign: titleAlignment as any,
    marginBottom: '12px'
  };

  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract comparison data
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];
  const hasComparison = comparisonData.length > 0;

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform data for Recharts - standardize dimension values
  const transformedData = currentData.map((row: any, index: number) => {
    const result: any = {
      name: dimension ? standardizeDimensionValue(row[dimension], dimension) : 'Value',
    };

    // Add current metrics
    metrics.forEach((metric) => {
      result[metric] = Number(row[metric]) || 0;
    });

    // Add comparison metrics if available
    if (hasComparison && comparisonData[index]) {
      metrics.forEach((metric) => {
        result[`${metric}_prev`] = Number(comparisonData[index][metric]) || 0;
      });
    }

    return result;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {formatChartLabel(entry.name)}: {formatMetricValue(entry.value, entry.name.toLowerCase(), [], 'gsc')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={transformedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#666' }}
            tickFormatter={(value) => formatChartLabel(value)}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(value) => formatChartLabel(value)} />}
          {/* Current period lines */}
          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={metric}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={strokeWidth}
              dot={showDots}
              activeDot={{ r: 6 }}
              name={formatChartLabel(metric)}
            />
          ))}

          {/* Comparison period lines (dashed) */}
          {hasComparison && metrics.map((metric, index) => (
            <Line
              key={`${metric}_prev`}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={`${metric}_prev`}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray="5 5"
              dot={false}
              name={`${formatChartLabel(metric)} (Previous)`}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
