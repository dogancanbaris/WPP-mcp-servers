'use client';

/**
 * Time Series Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Line chart showing metrics over time using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 */

import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { addDays, format as formatDate, parseISO } from 'date-fns';
import { useChartResize } from '@/hooks/useChartResize';

export interface TimeSeriesChartProps extends Partial<ComponentConfig> {
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
  containerSize?: { width: number; height: number };
}

/**
 * Calculate dynamic grid padding based on container size
 * Ensures all chart elements (labels, legend, axes) remain visible
 */
function calculateDynamicGrid(
  containerSize: { width: number; height: number } | undefined,
  showLegend: boolean,
  useDualAxis: boolean
) {
  const width = containerSize?.width || 600;
  const height = containerSize?.height || 400;

  // Calculate responsive padding (minimum pixels, maximum percentage)
  const leftPx = Math.min(Math.max(40, width * 0.08), width * 0.15);
  const rightPx = useDualAxis
    ? Math.min(Math.max(50, width * 0.08), width * 0.15)
    : Math.min(Math.max(30, width * 0.05), width * 0.10);
  const topPx = Math.min(Math.max(30, height * 0.08), height * 0.12);
  const bottomPx = showLegend
    ? Math.min(Math.max(60, height * 0.15), height * 0.25)
    : Math.min(Math.max(30, height * 0.08), height * 0.12);

  return {
    left: leftPx,
    right: rightPx,
    top: topPx,
    bottom: bottomPx,
    containLabel: true, // CRITICAL - keeps all labels visible
  };
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = (props) => {
  // Apply global theme
  const theme = DASHBOARD_THEME.charts;
  const tsTheme = theme.timeSeries;

  // Chart ref for ResizeObserver
  const chartRef = useRef<ReactECharts>(null);

  const {
    id: componentId,
    dataset_id,
    dimension,
    metrics = [],
    dateRange,
    title = 'Time Series Chart',
    showTitle = true,
    showLegend = true,
    sortBy,
    sortDirection,
    limit,
    containerSize,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Enable auto-resize when container changes
  useChartResize(chartRef, containerSize);

  // Apply professional defaults
  const defaults = getChartDefaults('time_series');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimension || undefined);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimension || 'date',
  });

  // Chart colors from global theme
  const chartColors = [
    DASHBOARD_THEME.colors.wppBlue,
    DASHBOARD_THEME.colors.wppGreen,
    DASHBOARD_THEME.colors.wppYellow,
    DASHBOARD_THEME.colors.wppRed,
    DASHBOARD_THEME.colors.wppCyan
  ];

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'timeseries',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    fillGaps: true,
    chartType: 'time_series',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

  // Debug: inputs and fetch enablement
  try {
    console.log('[TimeSeriesChart:init]', {
      componentId,
      dataset_id,
      metrics,
      dimension,
      currentPageId,
      filtersCount: cascadedFilters.length,
      enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId
    });
  } catch {}

  // Styling from global theme
  const containerStyle: React.CSSProperties = {
    backgroundColor: tsTheme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
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

  // Extract data with comparison support
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];

  // Debug: response shape
  try {
    const shape = Array.isArray(data?.data) ? 'array' : (data?.data ? Object.keys(data?.data) : 'none');
    console.log('[TimeSeriesChart:data]', {
      shape,
      rowCount: Array.isArray(currentData) ? currentData.length : 0,
      cmpCount: Array.isArray(comparisonData) ? comparisonData.length : 0,
      firstRow: currentData?.[0],
    });
  } catch {}

  // Helper: build continuous date array from filters (if present)
  const findDateFilter = () => {
    // cascadedFilters come as { member, operator, values }
    return cascadedFilters.find((f: any) => f.member === (dimension || 'date') && f.operator === 'inDateRange');
  };

  const buildDateArray = (startStr: string, endStr: string) => {
    const out: string[] = [];
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    for (let d = start; d <= end; d = addDays(d, 1)) {
      out.push(formatDate(d, 'yyyy-MM-dd'));
    }
    return out;
  };

  // Build aligned X axis based on selected date range (guarantees 1→end coverage)
  let xAxisDates: string[] | null = null;
  const dateFilter = findDateFilter();
  if (dateFilter && dateFilter.values?.length >= 2) {
    xAxisDates = buildDateArray(dateFilter.values[0], dateFilter.values[1]);
  }

  // Index data by date for alignment and zero-fill
  const normalizeDateKey = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') {
      // Try to detect ISO date or yyyy-MM-dd; fallback to Date parsing
      const parsed = parseISO(val);
      if (!isNaN(parsed.getTime())) return formatDate(parsed, 'yyyy-MM-dd');
      const asDate = new Date(val);
      if (!isNaN(asDate.getTime())) return formatDate(asDate, 'yyyy-MM-dd');
      return val; // as-is
    }
    if (val instanceof Date) {
      if (!isNaN(val.getTime())) return formatDate(val, 'yyyy-MM-dd');
      return null;
    }
    if (typeof val === 'object') {
      // Common BigQuery / connector shapes
      if (val && typeof (val as any).value === 'string') {
        const parsed = parseISO((val as any).value);
        if (!isNaN(parsed.getTime())) return formatDate(parsed, 'yyyy-MM-dd');
      }
      if (
        (val as any).year !== undefined &&
        (val as any).month !== undefined &&
        (val as any).day !== undefined
      ) {
        const y = Number((val as any).year);
        const m = Number((val as any).month);
        const d = Number((val as any).day);
        const dt = new Date(y, (m || 1) - 1, d || 1);
        if (!isNaN(dt.getTime())) return formatDate(dt, 'yyyy-MM-dd');
      }
      // Last resort: try Date constructor on a numeric epoch
      if (typeof (val as any).seconds === 'number') {
        const dt = new Date((val as any).seconds * 1000);
        if (!isNaN(dt.getTime())) return formatDate(dt, 'yyyy-MM-dd');
      }
    }
    const asDate = new Date(val);
    if (!isNaN(asDate.getTime())) return formatDate(asDate, 'yyyy-MM-dd');
    return null;
  };

  const indexByDate = (rows: any[]) => {
    const map = new Map<string, any>();
    rows.forEach((row) => {
      const keyRaw = row[dimension || 'date'];
      const key = normalizeDateKey(keyRaw);
      if (key) {
        map.set(key, row);
      }
    });
    return map;
  };

  // Robust metric getter: handle case differences and nested { value }
  const getMetricValue = (row: any, metric: string): number => {
    if (!row) return 0;
    const candidates = [
      row[metric],
      row?.[metric?.toLowerCase?.()] ,
      row?.[metric?.toUpperCase?.()],
      row?.[metric]?.value,
    ];
    for (const c of candidates) {
      const n = Number(c);
      if (!Number.isNaN(n) && c !== undefined && c !== null) return n;
    }
    return 0;
  };

  let alignedCurrent: any[] = currentData;
  let alignedComparison: any[] = comparisonData;

  if (xAxisDates) {
    const curMap = indexByDate(currentData);
    const cmpMap = indexByDate(comparisonData);
    try { console.log('[TimeSeriesChart:alignment]', { xAxisDates: xAxisDates.length, curKeys: curMap.size, cmpKeys: cmpMap.size }); } catch {}
    alignedCurrent = xAxisDates.map((d) => {
      const row = curMap.get(d);
      if (row) return row;
      const blank: any = { [dimension || 'date']: d };
      metrics.forEach((m) => (blank[m] = 0));
      return blank;
    });
    // If comparison present and comparison dates derivable from filter.comparisonValues, align similarly
    if (dateFilter?.comparisonEnabled && dateFilter?.comparisonValues?.length >= 2) {
      const cmpDates = buildDateArray(dateFilter.comparisonValues[0], dateFilter.comparisonValues[1]);
      // Align previous period by index against current xAxisDates (overlay lines match positions)
      alignedComparison = xAxisDates.map((_, idx) => {
        const d = cmpDates[idx];
        const row = d ? cmpMap.get(d) : undefined;
        if (row) return row;
        const blank: any = { [dimension || 'date']: d || '' };
        metrics.forEach((m) => (blank[m] = 0));
        return blank;
      });
    } else if (comparisonData.length > 0) {
      // Fallback: use raw comparison data when filter metadata is unavailable but data exists
      alignedComparison = comparisonData;
    } else {
      alignedComparison = [];
    }
  }

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Build ECharts series with comparison
  const series: any[] = [];

  // Determine if we need dual Y-axis (when metrics have vastly different scales)
  const useDualAxis = metrics.length === 2 &&
    (metrics.includes('clicks') && metrics.includes('impressions'));

  // Helper to assign axis index per metric for both current and comparison series
  const getAxisIndex = (metric: string) => {
    if (!useDualAxis) return undefined;
    const idx = metrics.indexOf(metric);
    if (idx < 0) return 0;
    return idx > 0 ? 1 : 0; // clamp to 0 or 1
  };

  // Current period series
  metrics.forEach((metric, index) => {
    const s: any = {
      name: formatChartLabel(metric),
      type: 'line',
      smooth: true,
      data: (xAxisDates ? alignedCurrent : currentData).map((row: any) => getMetricValue(row, metric)),
      lineStyle: { width: 2 },
      itemStyle: { color: chartColors[index % chartColors.length] },
    };
    const axisIdx = getAxisIndex(metric);
    if (axisIdx !== undefined) s.yAxisIndex = axisIdx;
    series.push(s);
  });

  // Comparison period series (dashed lines)
  if ((xAxisDates ? alignedComparison : comparisonData).length > 0) {
    metrics.forEach((metric, index) => {
      const s: any = {
        name: `${formatChartLabel(metric)} (Previous)`,
        type: 'line',
        smooth: true,
        data: (xAxisDates ? alignedComparison : comparisonData).map((row: any) => getMetricValue(row, metric)),
        lineStyle: {
          width: 2,
          type: 'dashed',
        },
        itemStyle: {
          color: chartColors[index % chartColors.length],
          opacity: 0.7,
        },
      };
      const axisIdx = getAxisIndex(metric);
      if (axisIdx !== undefined) s.yAxisIndex = axisIdx;
      series.push(s);
    });
  }

  // ECharts option
  const option = {
    backgroundColor: '#ffffff', // Force white background, override any theme
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const date = params[0].axisValue;
        let tooltip = `<strong>${date}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.value;
          const formatted = formatMetricValue(value, param.seriesName.toLowerCase(), [], 'gsc');
          tooltip += `${param.marker} ${param.seriesName}: ${formatted}<br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      show: showLegend,
      bottom: 0,
      type: 'scroll', // Scroll if too many items
      textStyle: { color: '#666', fontSize: Math.max(10, Math.min(12, (containerSize?.width || 600) / 60)) }
    },
    grid: calculateDynamicGrid(containerSize, showLegend, useDualAxis),
    xAxis: {
      type: 'category',
      data: (xAxisDates ? xAxisDates : currentData.map((row: any) => row[dimension])),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0', width: 1 } },
      axisLabel: {
        color: '#666',
        fontSize: Math.max(9, Math.min(11, (containerSize?.width || 600) / 70)),
        rotate: containerSize && containerSize.width < 300 ? 45 : 0 // Rotate labels if narrow
      }
    },
    yAxis: useDualAxis ? [
      {
        type: 'value',
        name: 'Clicks',
        position: 'left',
        axisLine: { show: true, lineStyle: { color: chartColors[0] } },
        axisLabel: {
          color: '#666',
          fontSize: Math.max(9, Math.min(11, (containerSize?.width || 600) / 70))
        },
        splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Impressions',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: chartColors[1] } },
        axisLabel: {
          color: '#666',
          fontSize: Math.max(9, Math.min(11, (containerSize?.width || 600) / 70))
        },
        splitLine: { show: false }
      }
    ] : {
      type: 'value',
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: {
        color: '#666',
        fontSize: Math.max(9, Math.min(11, (containerSize?.width || 600) / 70))
      },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }
    },
    series
  };

  try {
    const sample = series.map((s) => ({ name: s.name, data: s.data?.slice?.(0, 10) }));
    console.log('[TimeSeriesChart:series]', { seriesCount: series.length, names: series.map(s => s.name), sample });
  } catch {}

  // Use container size for responsive height, or default
  const chartHeight = containerSize?.height
    ? `${containerSize.height - (showTitle ? 40 : 0)}px` // Subtract title height if shown
    : '400px';

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: chartHeight, width: '100%' }}
        opts={{ renderer: 'svg' }} // SVG for better scaling
        notMerge={false} // Better performance - merge with previous option
        lazyUpdate={true} // Lazy update for better performance
      />
    </div>
  );
};
