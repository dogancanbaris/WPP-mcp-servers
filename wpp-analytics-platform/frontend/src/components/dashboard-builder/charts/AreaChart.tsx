'use client';

/**
 * Area Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Shows trends with filled areas using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Supports global filters via useGlobalFilters hook
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface AreaChartProps extends Partial<ComponentConfig> {
  smooth?: boolean;
  stacked?: boolean;
  fillOpacity?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  // Data props
  id: componentId,
  dataset_id,
  dimension = null,
  metrics = [],
  dateRange,

  // Display props
  title = 'Area Chart',
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

  // Area specific
  smooth = true,
  stacked = false,
  fillOpacity = 0.6,

  ...rest
}) => {
  const currentPageId = useCurrentPageId();

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
    componentId: componentId || 'areachart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : [],
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
        <RechartsAreaChart
          data={transformedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {metrics.map((metric, index) => (
              <linearGradient key={metric} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#666' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          {metrics.map((metric, index) => (
            <Area
              key={metric}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={metric}
              stroke={chartColors[index % chartColors.length]}
              fill={`url(#color${index})`}
              fillOpacity={fillOpacity}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
