import type { ComponentType } from '@/types/dashboard-builder';

export type SetupVariant = 'data' | 'text' | 'media' | 'shape' | 'control' | 'none';
export type StyleVariant = 'chart' | 'table' | 'scorecard' | 'text' | 'media' | 'shape' | 'control' | 'none';

export interface ComponentBehavior {
  category: 'chart' | 'table' | 'scorecard' | 'kpi' | 'control' | 'text' | 'media' | 'shape' | 'other';
  setupVariant: SetupVariant;
  styleVariant: StyleVariant;
  supportsDataSource: boolean;
  supportsComponentFilters: boolean;
  supportsPageFilters: boolean;
  supportsBlending: boolean;
}

const DATA_CHART_TYPES: ComponentType[] = [
  'bar_chart',
  'horizontal_bar',
  'line_chart',
  'pie_chart',
  'donut_chart',
  'area_chart',
  'scatter_chart',
  'bubble_chart',
  'combo_chart',
  'heatmap',
  'calendar_heatmap',
  'radar',
  'polar_chart',
  'funnel',
  'sankey',
  'waterfall',
  'parallel',
  'parallel_coordinates',
  'boxplot',
  'bullet',
  'candlestick',
  'violin_plot',
  'geomap',
  'choropleth',
  'geo_bubble',
  'treemap',
  'sunburst',
  'tree',
  'graph',
  'chord_diagram',
  'stacked_bar',
  'stacked_column',
  'pictorial_bar',
  'theme_river',
  'time_series',
  'timeline',
  'gantt',
];

const TABLE_TYPES: ComponentType[] = ['table', 'pivot_table'];
const KPI_TYPES: ComponentType[] = ['scorecard', 'gauge'];
const CONTROL_TYPES: ComponentType[] = [
  'date_range_filter',
  'date_picker',
  'date_range_picker',
  'checkbox_filter',
  'dimension_control',
  'slider_filter',
  'slider',
  'preset_filter',
  'data_source_control',
  'dropdown_filter',
  'dropdown',
  'advanced_filter',
  'button_control',
  'input_box_filter',
  'list_filter',
  'multi_select',
  'text_input',
  'number_input',
  'toggle',
  'radio_group',
  'checkbox_group',
  'search_box',
];
const TEXT_TYPES: ComponentType[] = ['title', 'text', 'text_block', 'heading'];
const MEDIA_TYPES: ComponentType[] = ['image', 'video', 'iframe'];
const SHAPE_TYPES: ComponentType[] = ['line', 'circle', 'rectangle', 'divider'];

const DEFAULT_BEHAVIOR: ComponentBehavior = {
  category: 'other',
  setupVariant: 'data',
  styleVariant: 'chart',
  supportsDataSource: true,
  supportsComponentFilters: true,
  supportsPageFilters: true,
  supportsBlending: true,
};

const BEHAVIOR_MAP: Partial<Record<ComponentType, ComponentBehavior>> = {};

DATA_CHART_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'chart',
    setupVariant: 'data',
    styleVariant: 'chart',
    supportsDataSource: true,
    supportsComponentFilters: true,
    supportsPageFilters: true,
    supportsBlending: true,
  };
});

TABLE_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'table',
    setupVariant: 'data',
    styleVariant: 'table',
    supportsDataSource: true,
    supportsComponentFilters: true,
    supportsPageFilters: true,
    supportsBlending: true,
  };
});

KPI_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'scorecard',
    setupVariant: 'data',
    styleVariant: 'scorecard',
    supportsDataSource: true,
    supportsComponentFilters: true,
    supportsPageFilters: true,
    supportsBlending: true,
  };
});

CONTROL_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'control',
    setupVariant: 'control',
    styleVariant: 'control',
    supportsDataSource: true,
    supportsComponentFilters: false,
    supportsPageFilters: true,
    supportsBlending: false,
  };
});

TEXT_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'text',
    setupVariant: 'text',
    styleVariant: 'text',
    supportsDataSource: false,
    supportsComponentFilters: false,
    supportsPageFilters: false,
    supportsBlending: false,
  };
});

MEDIA_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'media',
    setupVariant: 'media',
    styleVariant: 'media',
    supportsDataSource: false,
    supportsComponentFilters: false,
    supportsPageFilters: false,
    supportsBlending: false,
  };
});

SHAPE_TYPES.forEach((type) => {
  BEHAVIOR_MAP[type] = {
    category: 'shape',
    setupVariant: 'shape',
    styleVariant: 'shape',
    supportsDataSource: false,
    supportsComponentFilters: false,
    supportsPageFilters: false,
    supportsBlending: false,
  };
});

export function getComponentBehavior(type?: ComponentType | string): ComponentBehavior {
  if (!type) {
    return DEFAULT_BEHAVIOR;
  }
  return BEHAVIOR_MAP[type as ComponentType] ?? DEFAULT_BEHAVIOR;
}
