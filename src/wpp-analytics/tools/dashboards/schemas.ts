/**
 * Zod Validation Schemas for Dashboard Management
 *
 * Provides runtime validation for all dashboard-related inputs.
 * Supports multi-page dashboards with 3-level filter and style cascades.
 */

import { z } from 'zod';

/**
 * Filter configuration validation
 * Supports field-level filtering with operator-based logic
 * Can be used at global, page, or component level
 */
export const FilterConfigSchema = z.object({
  id: z.string().optional(),
  field: z.string().min(1, 'Field name is required'),
  operator: z.string().min(1, 'Operator is required'),
  values: z.array(z.string()).min(1, 'At least one value is required'),
  enabled: z.boolean().optional().default(true),
  // Comparison support for date range filters
  comparisonEnabled: z.boolean().optional(),
  comparisonValues: z.array(z.string()).optional(),
  comparisonType: z.enum([
    'previous_period',
    'previous_week',
    'previous_month',
    'previous_year',
    'custom',
  ]).optional(),
});

/**
 * Date range configuration validation
 */
export const DateRangeConfigSchema = z.object({
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
});

/**
 * Page-level styles validation
 */
export const PageStylesSchema = z.object({
  backgroundColor: z.string().optional(),
  padding: z.number().optional(),
  gap: z.number().optional(),
});

/**
 * Component configuration validation
 * Updated to include all available chart types and filter controls
 */
export const ComponentConfigSchema = z.object({
  id: z.string().min(1, 'Component ID is required'),
  type: z.enum([
    // REFINED 20-CHART LIBRARY
    // Basic Charts (4)
    'pie_chart',
    'donut_chart',
    'bar_chart',
    'horizontal_bar',
    // Stacked Charts (2)
    'stacked_bar',
    'stacked_column',
    // Time-Series Charts (3)
    'line_chart',
    'area_chart',
    'time_series',
    // Advanced Charts (4)
    'scatter_chart',
    'bubble_chart',
    'heatmap',
    'waterfall',
    // Hierarchical Charts (3)
    'treemap',
    'sunburst',
    'tree',
    // Specialized Charts (4)
    'sankey',
    'funnel',
    'geomap',
    'word_cloud',
    // Data Display (2)
    'table',
    'scorecard',
    // Filter Controls
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
    // Layout components
    'title',
    'text',
    'text_block',
    'heading',
    'image',
    'video',
    'divider',
    'line',
    'circle',
    'rectangle',
    'iframe',
  ]),
  // Data props
  datasource: z.string().optional(),
  dimension: z.string().nullable().optional(),
  breakdownDimension: z.string().nullable().optional(),
  metrics: z.array(z.string()).optional(),
  filters: z.array(FilterConfigSchema).optional(),
  dateRange: DateRangeConfigSchema.optional(),
  // Filter cascade overrides
  useGlobalFilters: z.boolean().optional().default(true),
  usePageFilters: z.boolean().optional().default(true),
  componentFilters: z.array(FilterConfigSchema).optional(),
  // Style cascade overrides
  usePageStyles: z.boolean().optional().default(true),
  // Title props
  title: z.string().optional(),
  showTitle: z.boolean().optional(),
  titleFontFamily: z.string().optional(),
  titleFontSize: z.string().optional(),
  titleFontWeight: z.string().optional(),
  titleColor: z.string().optional(),
  titleBackgroundColor: z.string().optional(),
  titleAlignment: z.enum(['left', 'center', 'right']).optional(),
  // Background & Border props
  backgroundColor: z.string().optional(),
  showBorder: z.boolean().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
  borderRadius: z.number().optional(),
  showShadow: z.boolean().optional(),
  shadowColor: z.string().optional(),
  shadowBlur: z.number().optional(),
  padding: z.number().optional(),
  // Chart appearance
  showLegend: z.boolean().optional(),
  chartConfig: z.object({
    showLegend: z.boolean().optional(),
    showDataLabels: z.boolean().optional(),
    orientation: z.enum(['vertical', 'horizontal']).optional(),
    colorScheme: z.string().optional(),
  }).optional(),
  // NEW: Professional defaults - sorting and pagination
  sortBy: z.string().optional(),
  sortDirection: z.enum(['ASC', 'DESC']).optional(),
  limit: z.number().int().min(1).max(10000).optional(),
  offset: z.number().int().min(0).optional(),
  // NEW: Legend configuration
  legendPosition: z.enum(['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  legendScroll: z.boolean().optional(),
  // NEW: Table-specific pagination
  showPagination: z.boolean().optional(),
  pageSize: z.number().int().min(10).max(1000).optional(),
});

/**
 * Column configuration validation
 */
export const ColumnConfigSchema = z.object({
  id: z.string().min(1, 'Column ID is required'),
  width: z.enum(['1/1', '1/2', '1/3', '2/3', '1/4', '3/4']),
  component: ComponentConfigSchema.optional(),
});

/**
 * Row configuration validation
 */
export const RowConfigSchema = z.object({
  id: z.string().min(1, 'Row ID is required'),
  columns: z.array(ColumnConfigSchema).min(1, 'Each row must have at least one column'),
  height: z.string().optional(),
});

/**
 * Column configuration input validation (without IDs - for input)
 */
export const ColumnConfigInputSchema = z.object({
  width: z.enum(['1/1', '1/2', '1/3', '2/3', '1/4', '3/4']),
  component: ComponentConfigSchema.omit({ id: true }).optional(),
});

/**
 * Row configuration input validation (without IDs)
 */
export const RowConfigInputSchema = z.object({
  columns: z.array(ColumnConfigInputSchema).min(1, 'Each row must have at least one column'),
  height: z.string().optional(),
});

/**
 * Page configuration input validation (without IDs - for input)
 */
export const PageConfigInputSchema = z.object({
  name: z.string().min(1, 'Page name is required').max(100, 'Page name too long'),
  order: z.number().int().min(0, 'Page order must be non-negative').optional(),
  filters: z.array(FilterConfigSchema).optional(),
  dateRange: DateRangeConfigSchema.optional(),
  pageStyles: PageStylesSchema.optional(),
  rows: z.array(RowConfigInputSchema).min(1, 'Page must have at least one row'),
});

/**
 * Page configuration validation
 * Represents a single page within a multi-page dashboard
 */
export const PageConfigSchema = z.object({
  id: z.string().min(1, 'Page ID is required'),
  name: z.string().min(1, 'Page name is required').max(100, 'Page name too long'),
  order: z.number().int().min(0, 'Page order must be non-negative'),
  filters: z.array(FilterConfigSchema).optional(),
  dateRange: DateRangeConfigSchema.optional(),
  pageStyles: PageStylesSchema.optional(),
  rows: z.array(RowConfigSchema).min(1, 'Page must have at least one row'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Create dashboard input validation
 * Supports both legacy flat rows and new multi-page structure
 */
export const CreateDashboardSchema = z.object({
  title: z.string().min(1, 'Dashboard title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  datasource: z.string()
    .regex(
      /^[a-z0-9-]+\.[a-z0-9_]+\.[a-z0-9_]+$/,
      'datasource must be full BigQuery reference in format: project.dataset.table (e.g., mcp-servers-475317.wpp_marketing.gsc_performance_shared)'
    ),
  dataset_id: z.string().uuid('dataset_id must be valid UUID').optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    borderColor: z.string().optional(),
  }).optional(),
  // Support both legacy rows and new pages structure
  pages: z.array(PageConfigInputSchema).optional(),
  rows: z.array(RowConfigInputSchema).optional(),
  globalStyles: z.object({
    backgroundColor: z.string().optional(),
    padding: z.number().optional(),
    gap: z.number().optional(),
  }).optional(),
  workspaceId: z.string().uuid('workspaceId must be valid UUID and is required for multi-tenant isolation'),
  supabaseUrl: z.string().url('Invalid Supabase URL').optional(),
  supabaseKey: z.string().min(1, 'Supabase API key required').optional(),
}).refine(
  (data) => data.pages || data.rows,
  {
    message: 'Dashboard must have either pages or rows',
    path: ['pages'],
  }
).refine(
  (data) => {
    // Count components across all pages or rows
    let componentCount = 0;

    if (data.pages) {
      componentCount = data.pages.reduce((sum, page) =>
        sum + (page.rows?.reduce((rSum, row) =>
          rSum + (row.columns?.filter(col => col.component).length || 0), 0) || 0), 0);
    } else if (data.rows) {
      componentCount = data.rows.reduce((sum, row) =>
        sum + (row.columns?.filter(col => col.component).length || 0), 0);
    }

    return componentCount > 0;
  },
  {
    message: 'Dashboard must have at least one component (chart, table, or scorecard)',
    path: ['pages'],
  }
);

/**
 * Update dashboard layout input validation
 * Supports multi-page architecture with page, row, component, and filter operations
 */
export const UpdateDashboardLayoutSchema = z.object({
  dashboard_id: z.string().uuid('dashboard_id must be valid UUID'),
  workspaceId: z.string().uuid('workspaceId must be valid UUID and is required for access control'),
  operation: z.enum([
    // Page management operations
    'add_page',
    'remove_page',
    'update_page',
    'reorder_pages',
    // Row operations (within specific page)
    'add_row_to_page',
    'remove_row_from_page',
    // Component operations (within specific page)
    'update_component_in_page',
    // Filter operations
    'set_page_filters',
    'set_component_filters',
  ]),
  data: z.any(),
  supabaseUrl: z.string().url('Invalid Supabase URL').optional(),
  supabaseKey: z.string().min(1, 'Supabase API key required').optional(),
});

/**
 * Get dashboard input validation
 */
export const GetDashboardSchema = z.object({
  dashboard_id: z.string().uuid('Invalid dashboard ID'),
  supabaseUrl: z.string().url('Invalid Supabase URL').optional(),
  supabaseKey: z.string().min(1, 'Supabase API key required').optional(),
  includeMetadata: z.boolean().optional().default(true),
});

/**
 * List dashboards input validation
 */
export const ListDashboardsSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID').optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  supabaseUrl: z.string().url('Invalid Supabase URL').optional(),
  supabaseKey: z.string().min(1, 'Supabase API key required').optional(),
});

/**
 * Delete dashboard input validation
 */
export const DeleteDashboardSchema = z.object({
  dashboard_id: z.string().uuid('dashboard_id must be valid UUID'),
  workspaceId: z.string().uuid('workspaceId must be valid UUID and is required for safety'),
  confirm: z.boolean().optional().default(false),
  supabaseUrl: z.string().url('Invalid Supabase URL').optional(),
  supabaseKey: z.string().min(1, 'Supabase API key required').optional(),
}).refine(
  (data) => data.confirm === true,
  {
    message: 'Deletion requires explicit confirmation. Set confirm: true to proceed.',
    path: ['confirm'],
  }
);
