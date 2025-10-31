/**
 * TypeScript Types and Interfaces for Dashboard Management
 *
 * Defines the data structures used across all dashboard tools.
 * Supports multi-page dashboards with 3-level filter and style cascades:
 * - Global → Page → Component
 */

/**
 * Component types available in dashboard builder
 * REFINED 20-CHART LIBRARY + Filter Controls + Layout Components
 */
export type ComponentType =
  // Basic Charts (4)
  | 'pie_chart'
  | 'donut_chart'
  | 'bar_chart'
  | 'horizontal_bar'
  // Stacked Charts (2)
  | 'stacked_bar'
  | 'stacked_column'
  // Time-Series Charts (3)
  | 'line_chart'
  | 'area_chart'
  | 'time_series'
  // Advanced Charts (4)
  | 'scatter_chart'
  | 'bubble_chart'
  | 'heatmap'
  | 'waterfall'
  // Hierarchical Charts (3)
  | 'treemap'
  | 'sunburst'
  | 'tree'
  // Specialized Charts (4)
  | 'sankey'
  | 'funnel'
  | 'geomap'
  | 'word_cloud'
  // Data Display (2)
  | 'table'
  | 'scorecard'
  // Filters - Page and component level
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

/**
 * Column width options (Bootstrap-style)
 */
export type ColumnWidth = '1/1' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';

/**
 * Date range configuration
 */
export interface DateRangeConfig {
  start: string;
  end: string;
}

/**
 * Filter configuration
 * Supports field-level filtering with operator-based logic
 * Can be used at global, page, or component level
 */
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

/**
 * Page-level style overrides
 * These styles apply to all components within a page unless overridden at component level
 */
export interface PageStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
}

/**
 * Component configuration
 */
export interface ComponentConfig {
  id: string;
  type: ComponentType;

  // Data props
  datasource?: string;
  dimension?: string | null;
  breakdownDimension?: string | null;
  metrics?: string[];
  filters?: FilterConfig[];
  dateRange?: DateRangeConfig;

  // Filter cascade overrides (for multi-page dashboards)
  /**
   * Whether to inherit global dashboard filters
   * @default true - Component will use global filters
   * If false, component ignores global filters (but may still use page filters)
   */
  useGlobalFilters?: boolean;

  /**
   * Whether to inherit page-level filters
   * @default true - Component will use page filters
   * If false, component ignores page filters (but may still use global filters)
   */
  usePageFilters?: boolean;

  /**
   * Component-specific filter overrides
   * These filters apply in addition to or instead of global/page filters
   * depending on useGlobalFilters and usePageFilters settings
   */
  componentFilters?: FilterConfig[];

  // Style cascade overrides (for multi-page dashboards)
  /**
   * Whether to inherit page-level styles
   * @default true - Component will use page styles as base
   * If false, component uses only global theme + its own component-level styles
   */
  usePageStyles?: boolean;

  // Title props
  title?: string;
  showTitle?: boolean;
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleBackgroundColor?: string;
  titleAlignment?: 'left' | 'center' | 'right';

  // Background & Border props
  backgroundColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  showShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  padding?: number;

  // Chart appearance
  showLegend?: boolean;
  chartConfig?: {
    showLegend?: boolean;
    showDataLabels?: boolean;
    orientation?: 'vertical' | 'horizontal';
    colorScheme?: string;
  };
}

/**
 * Component configuration (input - without IDs)
 */
export type ComponentConfigInput = Omit<ComponentConfig, 'id'>;

/**
 * Column configuration (input - without IDs)
 */
export interface ColumnConfigInput {
  width: ColumnWidth;
  component?: ComponentConfigInput;
}

/**
 * Column configuration
 */
export interface ColumnConfig {
  id: string;
  width: ColumnWidth;
  component?: ComponentConfig;
}

/**
 * Row configuration (input - without IDs)
 */
export interface RowConfigInput {
  columns: ColumnConfigInput[];
  height?: string; // Optional row height (e.g., '300px', 'auto')
}

/**
 * Row configuration (with IDs assigned)
 */
export interface RowConfig {
  id: string;
  columns: ColumnConfig[];
  height?: string; // Optional row height (e.g., '300px', 'auto')
}

/**
 * Page configuration for multi-page dashboards
 * Represents a single page within a multi-page dashboard with its own
 * filters, styles, and layout
 */
export interface PageConfig {
  id: string;
  name: string;
  order: number;

  /**
   * Page-level filter overrides (optional)
   * If not set, inherits from global dashboard filters
   * If set, these filters apply to all components on this page unless component overrides
   */
  filters?: FilterConfig[];

  /**
   * Page-level date range override (optional)
   * If not set, inherits from global dashboard date range
   * If set, this date range applies to all components on this page unless component overrides
   */
  dateRange?: DateRangeConfig;

  /**
   * Page-level style overrides (optional)
   * If not set, inherits from global theme
   * If set, these styles apply to all components on this page unless component overrides
   */
  pageStyles?: PageStyles;

  /**
   * Layout for this specific page
   * Standard row-based layout (rows → columns → components)
   */
  rows: RowConfig[];

  /** Timestamp when page was created */
  createdAt?: string;

  /** Timestamp when page was last updated */
  updatedAt?: string;
}

/**
 * Dashboard layout - supports both legacy flat rows and new multi-page structure
 */
export interface DashboardLayout {
  id?: string;
  title: string;
  description?: string;
  datasource: string;
  dataset_id?: string;

  /**
   * Global theme settings
   */
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
   * - 3-level filter cascade: Global → Page → Component
   * - 3-level style cascade: Global Theme → Page Styles → Component Styles
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

/**
 * Dashboard template
 */
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  datasource: string;
  rows: RowConfig[];
  preview?: string;
}
