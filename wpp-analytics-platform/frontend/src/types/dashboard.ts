// Column width presets
export type ColumnWidth = '1/1' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';

// All component types available in the builder
export type ComponentType =
  // Content components
  | 'title'
  | 'date_filter'
  | 'text'
  // Chart components
  | 'scorecard'
  | 'time_series'
  | 'bar_chart'
  | 'pie_chart'
  | 'table'
  | 'line_chart'
  | 'area_chart'
  | 'scatter_chart'
  | 'heatmap'
  | 'funnel'
  | 'radar'
  | 'gauge'
  | 'treemap';

// Configuration for a single component (chart, filter, etc.)
export interface ComponentConfig {
  id: string;
  type: ComponentType;

  // Display properties
  title?: string;

  // Data configuration
  dataSource?: string;
  dimension?: string;
  metrics?: string[];
  breakdownDimension?: string;
  dateRange?: {
    start: string;
    end: string;
    granularity?: 'day' | 'week' | 'month';
  };

  // Style properties
  chartColors?: string[];
  backgroundColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
}

// Configuration for a column within a row
export interface ColumnConfig {
  id: string;
  width: ColumnWidth;
  component?: ComponentConfig;
}

// Configuration for a row (contains columns)
export interface RowConfig {
  id: string;
  columns: ColumnConfig[];
}

// Complete dashboard configuration
export interface DashboardConfig {
  id: string;
  title: string;
  rows: RowConfig[];
  createdAt: string;
  updatedAt: string;
  datasource?: string; // Default datasource for all components
}

// Column layout templates
export interface ColumnLayout {
  name: string;
  columns: ColumnWidth[];
  preview: string; // ASCII art preview
}

// State for the dashboard builder
export interface DashboardBuilderState {
  config: DashboardConfig;
  selectedComponentId?: string;
  history: DashboardConfig[];
  historyIndex: number;
  zoom: number;
  isDirty: boolean;
}

// Actions for modifying the dashboard
export type DashboardAction =
  | { type: 'ADD_ROW'; layout: ColumnWidth[] }
  | { type: 'REMOVE_ROW'; rowId: string }
  | { type: 'REORDER_ROWS'; oldIndex: number; newIndex: number }
  | { type: 'ADD_COMPONENT'; columnId: string; component: ComponentConfig }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'UPDATE_COMPONENT'; componentId: string; updates: Partial<ComponentConfig> }
  | { type: 'MOVE_COMPONENT'; componentId: string; targetColumnId: string }
  | { type: 'SELECT_COMPONENT'; componentId?: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_DASHBOARD'; config: DashboardConfig }
  | { type: 'SET_TITLE'; title: string };