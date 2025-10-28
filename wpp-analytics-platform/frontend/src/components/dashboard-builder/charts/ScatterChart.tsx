'use client';

/**
 * ScatterChart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Recharts-based scatter plot for correlation analysis
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
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
import { useFilterStore } from '@/store/filterStore';

export interface ScatterChartProps extends Partial<ComponentConfig> {
  xAxisField?: string;
  yAxisField?: string;
  sizeField?: string;
}

export const ScatterChart: React.FC<ScatterChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
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

  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['scatter', dataset_id, metrics, dimensions, filters, effectiveDateRange],
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
      console.log('[ScatterChart] Data loaded:', result?.data?.length || 0, 'rows');
      return result;
    },
    enabled: !!dataset_id && metrics.length >= 2
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

  // Transform data for scatter chart
  const scatterData = data.data.map((row: any, index: number) => ({
    x: parseFloat(row[xAxisField]) || 0,
    y: parseFloat(row[yAxisField]) || 0,
    z: sizeField ? parseFloat(row[sizeField]) || 1 : 1,
    name: dimensions[0] ? row[dimensions[0]] : `Point ${index + 1}`
  }));

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
        <RechartsScatter data={scatterData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisField}
            stroke={theme.axisColor}
            label={{ value: xAxisField, position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisField}
            stroke={theme.axisColor}
            label={{ value: yAxisField, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: theme.tooltipBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Scatter name={title} fill={DASHBOARD_THEME.colors.wppBlue}>
            {scatterData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
        </RechartsScatter>
      </ResponsiveContainer>
    </div>
  );
};
