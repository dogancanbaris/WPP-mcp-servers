import { PageConfig } from './page-config';

// Column width options for responsive grid
export type ColumnWidth = '1/1' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';

// Absolute positioning for canvas mode
export interface AbsolutePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Canvas component with absolute positioning
export interface CanvasComponent extends AbsolutePosition {
  id: string;
  component: ComponentConfig;
  zIndex?: number; // Z-index for layering (higher = front)
}

// Component types available in the dashboard
export type ComponentType =
  // Basic charts
  | 'bar_chart'
  | 'horizontal_bar'
  | 'line_chart'
  | 'pie_chart'
  | 'donut_chart'
  | 'area_chart'
  | 'scatter_chart'
  | 'bubble_chart'
  | 'combo_chart'
  // Heatmaps
  | 'heatmap'
  | 'calendar_heatmap'
  // Advanced charts
  | 'radar'
  | 'polar_chart'
  | 'funnel'
  | 'sankey'
  | 'waterfall'
  | 'parallel'
  | 'parallel_coordinates'
  | 'boxplot'
  | 'bullet'
  | 'candlestick'
  | 'violin_plot'
  // Geographic
  | 'geomap'
  | 'choropleth'
  | 'geo_bubble'
  // Hierarchical
  | 'treemap'
  | 'sunburst'
  | 'tree'
  // Network
  | 'graph'
  | 'chord_diagram'
  // Stacked
  | 'stacked_bar'
  | 'stacked_column'
  | 'pictorial_bar'
  | 'theme_river'
  // Tables
  | 'table'
  | 'pivot_table'
  // KPIs
  | 'scorecard'
  | 'gauge'
  // Time-based
  | 'time_series'
  | 'timeline'
  | 'gantt'
  // Filters
  | 'date_range_filter'
  | 'date_picker'
  | 'date_range_picker'
  | 'checkbox_filter'
  | 'dimension_control'
  | 'slider_filter'
  | 'slider'
  | 'preset_filter'
  | 'data_source_control'
  | 'dropdown_filter'
  | 'dropdown'
  | 'advanced_filter'
  | 'button_control'
  | 'input_box_filter'
  | 'list_filter'
  | 'multi_select'
  | 'text_input'
  | 'number_input'
  | 'toggle'
  | 'radio_group'
  | 'checkbox_group'
  | 'search_box'
  // Layout components
  | 'title'
  | 'text'
  | 'text_block'
  | 'heading'
  | 'image'
  | 'video'
  | 'divider'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'iframe';

// Metric style configuration
export interface MetricStyleConfig {
  id: string;
  name: string;
  format: 'auto' | 'number' | 'percent' | 'currency' | 'duration';
  decimals: number;
  compact: boolean;
  alignment: 'left' | 'center' | 'right';
  textColor: string;
  fontWeight: string;
  showComparison: boolean;
  compareVs?: 'previous' | 'custom' | 'target';
  showBars: boolean;
  barColor?: string;
}

// Date range configuration
export interface DateRangeConfig {
  start: string;
  end: string;
}

// Filter configuration
export interface FilterConfig {
  id?: string; // Optional unique identifier for filter (used at runtime)
  field: string;
  operator: string;
  values: string[];
  enabled?: boolean; // Optional flag to enable/disable filter without removing it

  // Comparison support for date range filters
  comparisonEnabled?: boolean; // True if comparison mode is active
  comparisonValues?: string[]; // [comparisonStartDate, comparisonEndDate] for comparison period
  comparisonType?: 'previous_period' | 'previous_week' | 'previous_month' | 'previous_year' | 'custom'; // Type of comparison
}

// Table style configuration
export interface TableStyleConfig {
  layout?: 'auto' | 'fixed';
}

export interface TableHeaderStyleConfig {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
}

export interface TableBodyStyleConfig {
  evenRowColor?: string;
  oddRowColor?: string;
}

// Component configuration
export interface ComponentConfig {
  id: string;
  type: ComponentType;

  // Data props
  dataset_id?: string;
  datasource?: string;
  blendConfig?: BlendConfig;

  // Dimensions (supports multiple for charts like tables, heatmaps)
  dimensions?: string[];
  // Legacy properties (deprecated, kept for backwards compatibility)
  dimension?: string | null;
  breakdownDimension?: string | null;

  // Drill-down capability
  drillDownEnabled?: boolean;

  metrics?: string[];
  filters?: FilterConfig[];  // Page-level filters
  dateRange?: DateRangeConfig;

  // Filter cascade overrides (for multi-page dashboards)
  /**
   * Whether to inherit page-level filters
   * @default true - Component will use page filters
   * If false, component ignores page filters
   */
  usePageFilters?: boolean;

  /**
   * Component-specific filter overrides
   * These filters apply in addition to or instead of page filters
   * depending on usePageFilters setting
   */
  componentFilters?: FilterConfig[];

  // Style cascade overrides (for multi-page dashboards)
  /**
   * Whether to inherit page-level styles
   * @default true - Component will use page styles as base
   * If false, component uses only global theme + its own component-level styles
   */
  usePageStyles?: boolean;

  // Title props (from TitleStyleAccordion)
  title?: string;
  showTitle?: boolean;
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleBackgroundColor?: string;
  titleAlignment?: 'left' | 'center' | 'right';

  // Background & Border props (from BackgroundBorderAccordion)
  backgroundColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  showShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  padding?: number;

  // Metric formatting (from MetricStyleAccordion)
  metricsConfig?: MetricStyleConfig[];

  // Table-specific styles
  tableStyle?: TableStyleConfig;
  tableHeaderStyle?: TableHeaderStyleConfig;
  tableBodyStyle?: TableBodyStyleConfig;

  // Chart appearance
  showLegend?: boolean;
  chartColors?: string[];

  // NEW: Professional defaults - sorting and pagination
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;

  // NEW: Legend configuration
  legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  legendScroll?: boolean;

  // NEW: Table-specific pagination
  showPagination?: boolean;
  pageSize?: number;

  // Title component specific props
  text?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';

  // Interaction & layout controls
  /** If true, component can't be moved or removed via the canvas */
  locked?: boolean;
}

// Column configuration
export interface ColumnConfig {
  id: string;
  width: ColumnWidth;
  component?: ComponentConfig;
}

// Row configuration
export interface RowConfig {
  id: string;
  columns: ColumnConfig[];
  height?: string; // Optional row height (e.g., '300px', 'auto')
}

// Dashboard layout configuration
export interface DashboardLayout {
  id: string;
  name: string;
  title?: string; // Display title for the dashboard
  description?: string; // Dashboard description
  dataset_id?: string; // Primary dataset UUID (links to datasets table)
  datasource?: string; // Legacy: BigQuery table name (for backward compatibility)
  theme?: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };

  /**
   * Multi-page dashboard structure (new approach)
   * Dashboard → Pages → Rows → Columns → Components
   *
   * Migration path:
   * - New dashboards: Use `pages` array
   * - Legacy dashboards: Continue using `rows` array (backward compatible)
   * - During migration: System checks `pages` first, falls back to `rows` if empty
   *
   * Benefits of pages:
   * - Organize complex dashboards (10+ components) into logical sections
   * - 2-level filter cascade: Page → Component
   * - 2-level style cascade: Page Styles → Component Styles
   */
  pages?: PageConfig[];

  /**
   * Legacy flat row structure (backward compatible)
   * @deprecated Use `pages` array for new dashboards
   * This field is maintained for backward compatibility with existing dashboards
   */
  rows?: RowConfig[];

  globalStyles?: {
    backgroundColor?: string;
    padding?: number;
    gap?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Alias for backward compatibility
export type DashboardConfig = DashboardLayout;
export interface BlendSourceConfig {
  id: string;
  datasetId: string;
  alias: string;
  joinKeys: string[];
  joinType: 'left' | 'inner';
  metrics: string[];
}

export interface BlendConfig {
  id: string;
  primarySourceId: string;
  sources: BlendSourceConfig[];
}
