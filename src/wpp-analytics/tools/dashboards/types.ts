/**
 * TypeScript Types and Interfaces for Dashboard Management
 *
 * Defines the data structures used across all dashboard tools.
 */

/**
 * Component types available in dashboard builder
 */
export type ComponentType =
  | 'title'
  | 'date_filter'
  | 'scorecard'
  | 'time_series'
  | 'bar_chart'
  | 'pie_chart'
  | 'table'
  | 'treemap'
  | 'sankey'
  | 'heatmap'
  | 'gauge'
  | 'area_chart'
  | 'scatter_chart'
  | 'funnel_chart'
  | 'radar_chart';

/**
 * Column width options (Bootstrap-style)
 */
export type ColumnWidth = '1/1' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';

/**
 * Component configuration
 */
export interface ComponentConfig {
  type: ComponentType;
  title?: string;
  dimension?: string;
  metrics?: string[];
  breakdownDimension?: string;
  filters?: Array<{
    field: string;
    operator: string;
    values: any[];
  }>;
  chartConfig?: {
    showLegend?: boolean;
    showDataLabels?: boolean;
    orientation?: 'vertical' | 'horizontal';
    colorScheme?: string;
  };
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
  columns: Omit<ColumnConfig, 'id'>[];
}

/**
 * Row configuration (with IDs assigned)
 */
export interface RowConfig {
  id: string;
  columns: ColumnConfig[];
}

/**
 * Dashboard layout
 */
export interface DashboardLayout {
  title: string;
  datasource: string;
  rows: RowConfig[];
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
