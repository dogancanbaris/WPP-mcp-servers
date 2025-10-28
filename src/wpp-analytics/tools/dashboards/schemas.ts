/**
 * Zod Validation Schemas for Dashboard Management
 *
 * Provides runtime validation for all dashboard-related inputs.
 */

import { z } from 'zod';

/**
 * Component configuration validation
 */
export const ComponentConfigSchema = z.object({
  type: z.enum([
    'title',
    'date_filter',
    'scorecard',
    'time_series',
    'bar_chart',
    'pie_chart',
    'table',
    'treemap',
    'sankey',
    'heatmap',
    'gauge',
    'area_chart',
    'scatter_chart',
    'funnel_chart',
    'radar_chart',
  ]),
  title: z.string().optional(),
  dimension: z.string().optional(),
  metrics: z.array(z.string()).optional(),
  breakdownDimension: z.string().optional(),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    values: z.array(z.any()),
  })).optional(),
  chartConfig: z.object({
    showLegend: z.boolean().optional(),
    showDataLabels: z.boolean().optional(),
    orientation: z.enum(['vertical', 'horizontal']).optional(),
    colorScheme: z.string().optional(),
  }).optional(),
});

/**
 * Column configuration validation
 */
export const ColumnConfigSchema = z.object({
  width: z.enum(['1/1', '1/2', '1/3', '2/3', '1/4', '3/4']),
  component: ComponentConfigSchema.optional(),
});

/**
 * Row configuration input validation
 */
export const RowConfigInputSchema = z.object({
  columns: z.array(ColumnConfigSchema).min(1, 'Each row must have at least one column'),
});

/**
 * Create dashboard input validation
 */
export const CreateDashboardSchema = z.object({
  title: z.string().min(1, 'Dashboard title is required').max(100, 'Title too long'),
  datasource: z.string().default('gsc_performance_7days'),
  rows: z.array(RowConfigInputSchema).min(1, 'Dashboard must have at least one row'),
  workspaceId: z.string().optional(),
  supabaseUrl: z.string().url('Invalid Supabase URL').optional(),
  supabaseKey: z.string().min(1, 'Supabase API key required').optional(),
});

/**
 * Update dashboard layout input validation
 */
export const UpdateDashboardLayoutSchema = z.object({
  dashboard_id: z.string().uuid('Invalid dashboard ID'),
  operation: z.enum(['add_row', 'remove_row', 'update_component']),
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
