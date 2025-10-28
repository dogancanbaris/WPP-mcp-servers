'use client';

/**
 * ComboChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Recharts-based combo chart (bar + line)
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface ComboChartProps extends Partial<ComponentConfig> {
  categoryField?: string;
  barMetrics?: string[];
  lineMetrics?: string[];
}

export const ComboChart: React.FC<ComboChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dimensions = [],
    dateRange,
    filters = [],
    title = 'Combo Chart',
    showTitle = true,
    categoryField = dimensions[0],
    barMetrics = [metrics[0]],
    lineMetrics = [metrics[1]],
    ...rest
  } = props;

  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['combo', dataset_id, metrics, dimensions, filters, effectiveDateRange],
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
      console.log('[ComboChart] Data loaded:', result?.data?.length || 0, 'rows');
      return result;
    },
    enabled: !!dataset_id && metrics.length >= 2 && dimensions.length > 0
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

  // Data is already in correct format from API
  const chartData = data.data;

  const barColors = [
    DASHBOARD_THEME.colors.wppBlue,
    DASHBOARD_THEME.colors.wppGreen,
    DASHBOARD_THEME.colors.wppYellow
  ];

  const lineColors = [
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
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis dataKey={categoryField} stroke={theme.axisColor} />
          <YAxis stroke={theme.axisColor} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.tooltipBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '4px'
            }}
          />
          <Legend />

          {/* Bar series */}
          {barMetrics.filter(Boolean).map((metric, index) => (
            <Bar
              key={`bar-${metric}`}
              dataKey={metric}
              fill={barColors[index % barColors.length]}
              name={metric}
            />
          ))}

          {/* Line series */}
          {lineMetrics.filter(Boolean).map((metric, index) => (
            <Line
              key={`line-${metric}`}
              type="monotone"
              dataKey={metric}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
              name={metric}
              dot={{ r: 4 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
