'use client';

/**
 * Bar Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows categorical data with horizontal or vertical bars using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports global filters via useGlobalFilters hook
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useFilterStore } from '@/store/filterStore';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BarChartProps extends Partial<ComponentConfig> {
  orientation?: 'vertical' | 'horizontal';
  barSize?: number;
  stacked?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  // Component ID
  id: componentId,

  // Data props
  dataset_id,
  dimension = null,
  metrics = [],
  dateRange,

  // Display props
  title = 'Bar Chart',
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

  // Bar specific
  orientation = 'vertical',
  barSize = 20,
  stacked = false,

  ...rest
}) => {
  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: { id: componentId, dimension, metrics, dateRange, ...rest },
    dateDimension: 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'barchart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
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

  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform data for Recharts - standardize dimension values
  const transformedData = chartData.map((row: any) => ({
    name: dimension ? standardizeDimensionValue(row[dimension], dimension) : 'Value',
    ...metrics.reduce((acc, metric) => {
      acc[metric] = Number(row[metric]) || 0;
      return acc;
    }, {} as Record<string, number>)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatMetricValue(entry.value, entry.name.toLowerCase(), [], 'gsc')}
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
        <RechartsBarChart
          data={transformedData}
          layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          {orientation === 'vertical' ? (
            <>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} />
            </>
          ) : (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#666' }} width={100} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          {metrics.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={chartColors[index % chartColors.length]}
              stackId={stacked ? 'stack' : undefined}
              maxBarSize={barSize}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
