'use client';

/**
 * Calendar Heatmap Component - Dataset-Based
 *
 * Displays time-series data in a calendar format with color-coded cells.
 * Great for visualizing patterns over days, weeks, and months.
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Global filter support via filterStore
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface CalendarHeatmapProps extends Partial<ComponentConfig> {
  /** Year to display */
  year?: number;
  /** Color scheme for heatmap */
  colorScheme?: string[];
  /** Custom chart height */
  chartHeight?: string;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    dataset_id,
    metrics = [],
    dimension = 'date',
    dateRange,
    filters = [],
    title = 'Calendar Heatmap',
    showTitle = true,
    year = new Date().getFullYear(),
    colorScheme = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    chartHeight = '180px',
    style,
    ...rest
  } = props;

  // Subscribe to global filters
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const globalFilters = useFilterStore(state => state.activeFilters);

  const effectiveDateRange = globalDateRange || dateRange || {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
  const effectiveFilters = [...filters, ...globalFilters];

  const firstMetric = metrics[0];

  // Fetch from dataset API
  const { data, isLoading, error } = useQuery({
    queryKey: ['calendar-heatmap', dataset_id, firstMetric, dimension, effectiveDateRange, effectiveFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dimensions: dimension,
        metrics: firstMetric,
        dateRange: JSON.stringify(effectiveDateRange),
        ...(effectiveFilters.length > 0 && { filters: JSON.stringify(effectiveFilters) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0
  });

  // Styling
  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: style?.borderRadius || theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity,
    color: style?.textColor
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <p className="text-sm text-red-600">Failed to load chart data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract and transform data
  const chartData = data?.data || [];

  if (chartData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to ECharts calendar format
  const calendarData = chartData.map((row: any) => [row[dimension], row[firstMetric]]);

  // Calculate min/max for color scale
  const values = chartData.map((row: any) => row[firstMetric]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // ECharts option
  const option = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const [date, value] = params.data;
        return `<strong>${date}</strong><br/>${firstMetric}: ${value.toLocaleString()}`;
      }
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: showTitle ? 45 : 10,
      inRange: {
        color: colorScheme
      },
      show: true,
      textStyle: {
        color: '#666',
        fontSize: 11
      }
    },
    calendar: {
      top: showTitle ? 100 : 80,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: year.toString(),
      itemStyle: {
        borderWidth: 0.5,
        borderColor: '#fff'
      },
      yearLabel: { show: false },
      dayLabel: {
        nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        textStyle: {
          color: '#666',
          fontSize: 11
        }
      },
      monthLabel: {
        textStyle: {
          color: '#666',
          fontSize: 11
        }
      }
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: calendarData
      }
    ]
  };

  console.log('[CalendarHeatmap] Data loaded:', chartData.length, 'days');

  return (
    <div style={containerStyle}>
      <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
    </div>
  );
};

// Export functionality: Phase 4.4 (MCP-59)
