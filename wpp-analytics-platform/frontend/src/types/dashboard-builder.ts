// Column width options for responsive grid
export type ColumnWidth = '1/1' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';

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
  field: string;
  operator: string;
  values: string[];
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
  datasource?: string;
  dimension?: string | null;
  breakdownDimension?: string | null;
  metrics?: string[];
  filters?: FilterConfig[];
  dateRange?: DateRangeConfig;

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

  // Title component specific props
  text?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
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
  theme?: 'light' | 'dark' | 'auto'; // Theme preference
  rows: RowConfig[];
  globalStyles?: {
    backgroundColor?: string;
    padding?: number;
    gap?: number;
  };
}

// Alias for backward compatibility
export type DashboardConfig = DashboardLayout;