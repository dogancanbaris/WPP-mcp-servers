/**
 * Professional Chart Defaults Configuration
 *
 * Defines intelligent defaults for all chart types following BI industry best practices.
 * Charts work professionally out-of-the-box while remaining fully customizable.
 */

export interface ChartDefaults {
  sortBy: 'metric' | 'dimension' | 'date' | null;
  sortDirection: 'ASC' | 'DESC';
  limit: number | null;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  legendScroll?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

/**
 * Master Configuration: Defaults for all chart types
 *
 * Design Philosophy:
 * - Rankings (pie, bar): Top N by metric value
 * - Time-series (line, area): Chronological order
 * - Tables: Sortable with pagination
 * - Sequential (funnel, waterfall): Preserve order
 * - Categorical (heatmap, radar): Alphabetical
 */
export const CHART_DEFAULTS: Record<string, ChartDefaults> = {
  // ========================================
  // RANKING CHARTS (Top Performers)
  // ========================================

  pie_chart: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 10,  // Top 10 items (too many slices unreadable)
    legendPosition: 'bottom',
    legendScroll: true
  },

  donut_chart: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 10,  // Top 10 items
    legendPosition: 'bottom',
    legendScroll: true
  },

  bar_chart: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 20,  // Top 20 performers
    legendPosition: 'top-right'
  },

  horizontal_bar: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 25,  // More vertical space available
    legendPosition: 'top-right'
  },

  stacked_bar: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 15,  // Stacked = less space per bar
    legendPosition: 'top-right'
  },

  stacked_column: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 15,  // Stacked columns
    legendPosition: 'top'
  },

  treemap: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 20  // Hierarchical layout can handle 20
  },

  sunburst: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 100,  // Radial hierarchy
    legendPosition: 'right'
  },

  tree: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 100,  // Tree structure
    legendPosition: 'top'
  },

  // ========================================
  // TIME-SERIES CHARTS (Chronological)
  // ========================================

  line_chart: {
    sortBy: 'date',
    sortDirection: 'ASC',
    limit: null,  // No limit - show all data points
    legendPosition: 'top-right'
  },

  area_chart: {
    sortBy: 'date',
    sortDirection: 'ASC',
    limit: null,  // No limit
    legendPosition: 'top-right'
  },

  time_series: {
    sortBy: 'date',
    sortDirection: 'ASC',
    limit: null,  // No limit
    legendPosition: 'top-right'
  },

  // ========================================
  // TABULAR (Sortable & Paginated)
  // ========================================

  table: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 100,
    showPagination: true,
    pageSize: 10  // Default 10 rows per page
  },

  // ========================================
  // SEQUENTIAL CHARTS (Preserve Order)
  // ========================================

  funnel_chart: {
    sortBy: 'dimension',
    sortDirection: 'ASC',
    limit: null  // Show all steps in sequence
  },

  waterfall: {
    sortBy: 'dimension',
    sortDirection: 'ASC',
    limit: null  // Sequential calculation
  },

  // ========================================
  // CATEGORICAL CHARTS (Alphabetical)
  // ========================================

  heatmap: {
    sortBy: 'dimension',
    sortDirection: 'ASC',
    limit: null,  // Grid layout
    legendPosition: 'right'
  },

  // ========================================
  // CORRELATION CHARTS (Continuous Axes)
  // ========================================

  scatter: {
    sortBy: null,  // X/Y axes are continuous
    sortDirection: 'ASC',
    limit: 200
  },

  bubble: {
    sortBy: null,  // Continuous axes
    sortDirection: 'ASC',
    limit: 100
  },

  // ========================================
  // FLOW CHARTS (Relationship-based)
  // ========================================

  sankey: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 30  // Top 30 links
  },

  // ========================================
  // CORRELATION/SCATTER CHARTS (Continuous Axes)
  // ========================================

  scatter_chart: {
    sortBy: null,  // X/Y axes are continuous
    sortDirection: 'ASC',
    limit: 200,  // Sample for performance
    legendPosition: 'top-right'
  },

  bubble_chart: {
    sortBy: null,  // Continuous axes + size dimension
    sortDirection: 'ASC',
    limit: 150,  // Larger bubbles need space
    legendPosition: 'top-right'
  },

  // ========================================
  // FLOW/NETWORK CHARTS (Relationship-based)
  // ========================================

  sankey: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 50,  // Top 50 flows
    legendPosition: 'bottom'
  },

  // ========================================
  // FLOW/NETWORK CHARTS
  // ========================================

  sankey: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 50,  // Top 50 flows
    legendPosition: 'bottom'
  },

  // ========================================
  // SEQUENTIAL/WATERFALL CHARTS
  // ========================================

  waterfall: {
    sortBy: 'dimension',  // Sequential calculation
    sortDirection: 'ASC',
    limit: null,  // Show all steps
    legendPosition: 'top-right'
  },

  funnel_chart: {
    sortBy: 'dimension',
    sortDirection: 'ASC',
    limit: null  // Show all steps in sequence
  },

  // ========================================
  // WORD CLOUD CHARTS
  // ========================================

  word_cloud: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 100,  // Top 100 words
    legendPosition: 'top'
  },

  // ========================================
  // GEOGRAPHIC CHARTS
  // ========================================

  geomap: {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: null,  // Show all geographic data
    legendPosition: 'bottom-right'
  },

  // ========================================
  // DATA DISPLAY CHARTS
  // ========================================

  scorecard: {
    sortBy: null,
    sortDirection: 'DESC',
    limit: 1  // Single aggregated value
  },
};

/**
 * Get defaults for a specific chart type
 * Returns sensible fallback if chart type not found
 */
export function getChartDefaults(chartType: string): ChartDefaults {
  return CHART_DEFAULTS[chartType] || {
    sortBy: 'metric',
    sortDirection: 'DESC',
    limit: 100,
    legendPosition: 'top-right'
  };
}

/**
 * Apply defaults to component configuration
 * Merges user-provided config with intelligent defaults
 */
export function applyChartDefaults(
  chartType: string,
  userConfig: Partial<ChartDefaults>
): ChartDefaults {
  const defaults = getChartDefaults(chartType);

  return {
    sortBy: userConfig.sortBy !== undefined ? userConfig.sortBy : defaults.sortBy,
    sortDirection: userConfig.sortDirection || defaults.sortDirection,
    limit: userConfig.limit !== undefined ? userConfig.limit : defaults.limit,
    legendPosition: userConfig.legendPosition || defaults.legendPosition,
    legendScroll: userConfig.legendScroll !== undefined ? userConfig.legendScroll : defaults.legendScroll,
    showPagination: userConfig.showPagination !== undefined ? userConfig.showPagination : defaults.showPagination,
    pageSize: userConfig.pageSize || defaults.pageSize
  };
}

/**
 * Resolve sortBy to actual field name
 * Converts 'metric' → metrics[0], 'dimension' → dimension name, 'date' → 'date'
 */
export function resolveSortField(
  sortBy: 'metric' | 'dimension' | 'date' | string | null,
  metrics: string[],
  dimension?: string
): string | undefined {
  if (!sortBy) return undefined;

  if (sortBy === 'metric') {
    return metrics[0];  // First metric
  } else if (sortBy === 'dimension') {
    return dimension;  // Dimension name
  } else if (sortBy === 'date') {
    return 'date';
  } else {
    return sortBy;  // Explicit field name
  }
}

/**
 * Chart type categorization for smart behavior (19 charts)
 */
export const CHART_CATEGORIES = {
  ranking: ['pie_chart', 'donut_chart', 'bar_chart', 'horizontal_bar', 'stacked_bar', 'stacked_column', 'treemap'],
  timeSeries: ['line_chart', 'area_chart', 'time_series'],
  sequential: ['funnel_chart', 'waterfall'],
  categorical: ['heatmap'],
  correlation: ['scatter_chart', 'bubble_chart'],
  flow: ['sankey'],
  hierarchical: ['sunburst', 'tree'],
  geographic: ['geomap'],
    text: ['word_cloud'],
  dataDisplay: ['table'],
  singleValue: ['scorecard']
};

/**
 * Get chart category
 */
export function getChartCategory(chartType: string): string {
  for (const [category, types] of Object.entries(CHART_CATEGORIES)) {
    if (types.includes(chartType)) {
      return category;
    }
  }
  return 'other';
}
