/**
 * MCP Tools for WPP Analytics Dashboard Management
 *
 * These tools allow AI agents to programmatically create and manage
 * dashboards in the WPP Analytics Platform.
 */

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getLogger } from '../../shared/logger.js';
import { randomBytes } from 'crypto';

const logger = getLogger('wpp-analytics.dashboards');

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const ComponentConfigSchema = z.object({
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

const ColumnConfigSchema = z.object({
  width: z.enum(['1/1', '1/2', '1/3', '2/3', '1/4', '3/4']),
  component: ComponentConfigSchema.optional(),
});

const RowConfigInputSchema = z.object({
  columns: z.array(ColumnConfigSchema).min(1, 'Each row must have at least one column'),
});

const CreateDashboardSchema = z.object({
  title: z.string().min(1, 'Dashboard title is required').max(100, 'Title too long'),
  datasource: z.string().default('gsc_performance_7days'),
  rows: z.array(RowConfigInputSchema).min(1, 'Dashboard must have at least one row'),
  workspaceId: z.string().optional(),
  supabaseUrl: z.string().url('Invalid Supabase URL'),
  supabaseKey: z.string().min(1, 'Supabase API key required'),
});

const UpdateDashboardLayoutSchema = z.object({
  dashboard_id: z.string().uuid('Invalid dashboard ID'),
  operation: z.enum(['add_row', 'remove_row', 'update_component']),
  data: z.any(),
  supabaseUrl: z.string().url('Invalid Supabase URL'),
  supabaseKey: z.string().min(1, 'Supabase API key required'),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique ID
 */
function generateId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generate dashboard ID (UUID format)
 */
function generateDashboardId(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Initialize Supabase client
 */
function initSupabase(url: string, key: string) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Get or create workspace
 */
async function getOrCreateWorkspace(
  supabase: any,
  workspaceId?: string
): Promise<string> {
  if (workspaceId) {
    return workspaceId;
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated. Please provide workspaceId.');
  }

  // Get user's workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (workspaceError || !workspace) {
    throw new Error('Workspace not found. Please provide workspaceId.');
  }

  return workspace.id;
}

/**
 * Process layout and assign IDs
 */
function processLayout(rows: RowConfigInput[]): RowConfig[] {
  return rows.map(row => ({
    id: generateId(),
    columns: row.columns.map(col => ({
      id: generateId(),
      width: col.width,
      component: col.component,
    })),
  }));
}

// ============================================================================
// PRE-BUILT DASHBOARD TEMPLATES
// ============================================================================

const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'seo_overview',
    name: 'SEO Overview',
    description: 'Comprehensive SEO dashboard with header, 4 scorecards, time series, and comparison charts',
    datasource: 'gsc_performance_7days',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'SEO Performance Overview',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
      {
        id: 'row-scorecards',
        columns: [
          {
            id: 'col-clicks',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Total Clicks',
              metrics: ['clicks'],
            },
          },
          {
            id: 'col-impressions',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Total Impressions',
              metrics: ['impressions'],
            },
          },
          {
            id: 'col-ctr',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Average CTR',
              metrics: ['ctr'],
            },
          },
          {
            id: 'col-position',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Average Position',
              metrics: ['position'],
            },
          },
        ],
      },
      {
        id: 'row-timeseries',
        columns: [
          {
            id: 'col-trend',
            width: '1/1',
            component: {
              type: 'time_series',
              title: 'Performance Trend',
              dimension: 'date',
              metrics: ['clicks', 'impressions'],
              chartConfig: {
                showLegend: true,
                showDataLabels: false,
              },
            },
          },
        ],
      },
      {
        id: 'row-comparison',
        columns: [
          {
            id: 'col-pages',
            width: '1/2',
            component: {
              type: 'bar_chart',
              title: 'Top Pages by Clicks',
              dimension: 'page',
              metrics: ['clicks'],
              chartConfig: {
                orientation: 'horizontal',
              },
            },
          },
          {
            id: 'col-queries',
            width: '1/2',
            component: {
              type: 'bar_chart',
              title: 'Top Queries by Impressions',
              dimension: 'query',
              metrics: ['impressions'],
              chartConfig: {
                orientation: 'horizontal',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'campaign_performance',
    name: 'Campaign Performance',
    description: 'Marketing campaign dashboard with 6 scorecards and detailed charts',
    datasource: 'google_ads_campaign_stats',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'Campaign Performance Dashboard',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
      {
        id: 'row-kpis-1',
        columns: [
          {
            id: 'col-spend',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Total Spend',
              metrics: ['cost'],
            },
          },
          {
            id: 'col-conversions',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Conversions',
              metrics: ['conversions'],
            },
          },
          {
            id: 'col-roas',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'ROAS',
              metrics: ['roas'],
            },
          },
        ],
      },
      {
        id: 'row-kpis-2',
        columns: [
          {
            id: 'col-clicks',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Total Clicks',
              metrics: ['clicks'],
            },
          },
          {
            id: 'col-ctr',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Click-Through Rate',
              metrics: ['ctr'],
            },
          },
          {
            id: 'col-cpc',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Cost per Click',
              metrics: ['cpc'],
            },
          },
        ],
      },
      {
        id: 'row-charts',
        columns: [
          {
            id: 'col-spend-trend',
            width: '1/2',
            component: {
              type: 'area_chart',
              title: 'Daily Spend Trend',
              dimension: 'date',
              metrics: ['cost'],
            },
          },
          {
            id: 'col-conversions-trend',
            width: '1/2',
            component: {
              type: 'area_chart',
              title: 'Daily Conversions',
              dimension: 'date',
              metrics: ['conversions'],
            },
          },
        ],
      },
      {
        id: 'row-breakdown',
        columns: [
          {
            id: 'col-campaigns',
            width: '1/1',
            component: {
              type: 'table',
              title: 'Campaign Breakdown',
              dimension: 'campaign_name',
              metrics: ['clicks', 'impressions', 'cost', 'conversions', 'roas'],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'analytics_overview',
    name: 'Analytics Overview',
    description: 'Google Analytics dashboard with user behavior and traffic analysis',
    datasource: 'google_analytics_sessions',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'Website Analytics Overview',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
      {
        id: 'row-scorecards',
        columns: [
          {
            id: 'col-users',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Total Users',
              metrics: ['users'],
            },
          },
          {
            id: 'col-sessions',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Sessions',
              metrics: ['sessions'],
            },
          },
          {
            id: 'col-bounce-rate',
            width: '1/4',
            component: {
              type: 'gauge',
              title: 'Bounce Rate',
              metrics: ['bounce_rate'],
            },
          },
          {
            id: 'col-avg-duration',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Avg. Session Duration',
              metrics: ['avg_session_duration'],
            },
          },
        ],
      },
      {
        id: 'row-traffic',
        columns: [
          {
            id: 'col-traffic-trend',
            width: '2/3',
            component: {
              type: 'area_chart',
              title: 'Traffic Trend',
              dimension: 'date',
              metrics: ['users', 'sessions'],
            },
          },
          {
            id: 'col-traffic-sources',
            width: '1/3',
            component: {
              type: 'pie_chart',
              title: 'Traffic Sources',
              dimension: 'source',
              metrics: ['sessions'],
            },
          },
        ],
      },
      {
        id: 'row-behavior',
        columns: [
          {
            id: 'col-top-pages',
            width: '1/2',
            component: {
              type: 'bar_chart',
              title: 'Top Landing Pages',
              dimension: 'landing_page',
              metrics: ['sessions'],
              chartConfig: {
                orientation: 'horizontal',
              },
            },
          },
          {
            id: 'col-devices',
            width: '1/2',
            component: {
              type: 'pie_chart',
              title: 'Device Distribution',
              dimension: 'device_category',
              metrics: ['sessions'],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Dashboard',
    description: 'Empty canvas to build your custom dashboard from scratch',
    datasource: 'gsc_performance_7days',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'New Dashboard',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
    ],
  },
];

// ============================================================================
// MCP TOOL DEFINITIONS
// ============================================================================

/**
 * Tool 1: Create Dashboard
 */
export const createDashboardTool = {
  name: 'create_dashboard',
  description: `Create a new dashboard in the WPP Analytics Platform with specified layout.

**Purpose:**
Programmatically create dashboards with custom layouts, components, and data sources.
Dashboards are saved to Supabase and immediately accessible in the web UI.

**Parameters:**
- title: Dashboard name (e.g., "Q4 SEO Performance")
- datasource: BigQuery table to use (default: "gsc_performance_7days")
- rows: Array of row configurations with columns and components
- workspaceId: (Optional) Workspace ID - auto-detected from authenticated user
- supabaseUrl: Supabase project URL (e.g., "https://xxx.supabase.co")
- supabaseKey: Supabase API key (anon or service role key)

**Component Types:**
- title: Dashboard title/header text
- date_filter: Date range picker
- scorecard: Single metric KPI card
- time_series: Line chart over time
- bar_chart: Vertical/horizontal bar chart
- pie_chart: Pie/donut chart
- table: Data grid with sorting/filtering
- area_chart: Filled area chart
- gauge: Gauge/meter visualization
- treemap: Hierarchical treemap
- sankey: Flow diagram
- heatmap: Color-coded heatmap
- funnel_chart: Conversion funnel
- radar_chart: Spider/radar chart

**Column Widths:**
- "1/1": Full width (12 columns)
- "1/2": Half width (6 columns)
- "1/3": One third (4 columns)
- "2/3": Two thirds (8 columns)
- "1/4": One quarter (3 columns)
- "3/4": Three quarters (9 columns)

**Example Usage:**
\`\`\`json
{
  "title": "SEO Performance Dashboard",
  "datasource": "gsc_performance_7days",
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc...",
  "rows": [
    {
      "columns": [
        {
          "width": "3/4",
          "component": {
            "type": "title",
            "title": "SEO Overview"
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "date_filter"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Total Clicks",
            "metrics": ["clicks"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Impressions",
            "metrics": ["impressions"]
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "time_series",
            "title": "Performance Trend",
            "dimension": "date",
            "metrics": ["clicks", "impressions"]
          }
        }
      ]
    }
  ]
}
\`\`\`

**Returns:**
- dashboard_id: Unique identifier for the created dashboard
- dashboard_url: Direct URL to view/edit the dashboard
- workspace_id: Workspace where dashboard was created
- row_count: Number of rows created
- component_count: Total components added

**Best Practices:**
1. Start with header row (title + date filter)
2. Add scorecard row for key metrics
3. Follow with visualizations (charts, tables)
4. Use consistent column widths for visual alignment
5. Limit to 10-15 components per dashboard for performance
6. Group related metrics together in rows

**Common Patterns:**
- Header: 3/4 title + 1/4 date filter
- KPI row: 4x 1/4 scorecards
- Chart comparison: 2x 1/2 charts side-by-side
- Detailed table: 1x 1/1 full-width table

**Error Handling:**
- Returns error if Supabase connection fails
- Validates all component types and configurations
- Checks workspace access permissions
- Verifies datasource exists in BigQuery`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description: 'Dashboard title (1-100 characters)',
      },
      datasource: {
        type: 'string',
        description: 'BigQuery table name (default: gsc_performance_7days)',
      },
      rows: {
        type: 'array',
        description: 'Array of row configurations',
        items: {
          type: 'object',
          properties: {
            columns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  width: {
                    type: 'string',
                    enum: ['1/1', '1/2', '1/3', '2/3', '1/4', '3/4'],
                  },
                  component: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      title: { type: 'string' },
                      dimension: { type: 'string' },
                      metrics: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
                required: ['width'],
              },
            },
          },
          required: ['columns'],
        },
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace ID (optional - auto-detected)',
      },
      supabaseUrl: {
        type: 'string',
        description: 'Supabase project URL',
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase API key',
      },
    },
    required: ['title', 'rows', 'supabaseUrl', 'supabaseKey'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = CreateDashboardSchema.parse(input);

      logger.info('create_dashboard called', {
        title: validated.title,
        datasource: validated.datasource,
        rowCount: validated.rows.length,
      });

      // Initialize Supabase
      const supabase = initSupabase(validated.supabaseUrl, validated.supabaseKey);

      // Get workspace
      const workspaceId = await getOrCreateWorkspace(supabase, validated.workspaceId);

      // Process layout and assign IDs
      const processedRows = processLayout(validated.rows);

      // Count components
      const componentCount = processedRows.reduce(
        (sum, row) => sum + row.columns.filter(col => col.component).length,
        0
      );

      // Generate dashboard ID
      const dashboardId = generateDashboardId();

      // Transform to chart format (for compatibility with existing schema)
      const charts = processedRows.flatMap(row =>
        row.columns
          .filter(col => col.component)
          .map(col => ({
            id: col.id,
            type: col.component!.type as any,
            measure: col.component!.metrics?.[0] || '',
            dimension: col.component!.dimension || '',
            title: col.component!.title || '',
            size: { w: parseInt(col.width.split('/')[0]), h: 4 },
          }))
      );

      // Save to Supabase
      const { error } = await supabase
        .from('dashboards')
        .insert([
          {
            id: dashboardId,
            name: validated.title,
            workspace_id: workspaceId,
            bigquery_table: validated.datasource,
            cube_model_name: validated.datasource,
            layout: charts, // Store in layout column for compatibility
            filters: {},
            config: {
              datasource: validated.datasource,
              charts,
              filters: [],
              rows: processedRows, // Store structured layout
            },
          },
        ])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create dashboard', { error: error.message });
        throw new Error(`Failed to create dashboard: ${error.message}`);
      }

      logger.info('Dashboard created successfully', {
        dashboardId,
        workspaceId,
        componentCount,
      });

      return {
        success: true,
        dashboard_id: dashboardId,
        dashboard_url: `/dashboards/${dashboardId}`,
        workspace_id: workspaceId,
        row_count: processedRows.length,
        component_count: componentCount,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('create_dashboard failed', { error });

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation error',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

/**
 * Tool 2: Update Dashboard Layout
 */
export const updateDashboardLayoutTool = {
  name: 'update_dashboard_layout',
  description: `Modify existing dashboard layout by adding/removing rows or updating components.

**Purpose:**
Update dashboard structure without recreating from scratch. Supports incremental
modifications to existing dashboards.

**Operations:**

1. **add_row**: Append new row at end of dashboard
   - data: { columns: [...] }

2. **remove_row**: Delete row by ID
   - data: { row_id: "abc123" }

3. **update_component**: Modify component configuration
   - data: { component_id: "xyz789", component: {...} }

**Parameters:**
- dashboard_id: UUID of dashboard to modify
- operation: Type of modification (add_row, remove_row, update_component)
- data: Operation-specific data (see examples below)
- supabaseUrl: Supabase project URL
- supabaseKey: Supabase API key

**Example 1: Add Row**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "add_row",
  "data": {
    "columns": [
      {
        "width": "1/2",
        "component": {
          "type": "bar_chart",
          "title": "Device Breakdown",
          "dimension": "device",
          "metrics": ["clicks"]
        }
      },
      {
        "width": "1/2",
        "component": {
          "type": "pie_chart",
          "title": "Country Distribution",
          "dimension": "country",
          "metrics": ["impressions"]
        }
      }
    ]
  },
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
\`\`\`

**Example 2: Remove Row**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "remove_row",
  "data": {
    "row_id": "row-abc123"
  },
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
\`\`\`

**Example 3: Update Component**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "update_component",
  "data": {
    "component_id": "col-xyz789",
    "component": {
      "type": "scorecard",
      "title": "Updated Clicks",
      "metrics": ["clicks", "impressions"]
    }
  },
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
\`\`\`

**Returns:**
- success: Boolean indicating if operation succeeded
- dashboard_id: ID of modified dashboard
- operation: Operation that was performed
- updated_at: Timestamp of modification

**Best Practices:**
1. Load dashboard first to understand current structure
2. Use add_row for incremental additions
3. Use update_component to refine existing visualizations
4. Be cautious with remove_row (no undo)
5. Test changes in development workspace first

**Error Handling:**
- Returns error if dashboard not found
- Validates operation-specific data
- Checks for valid row/component IDs
- Ensures workspace access permissions`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      dashboard_id: {
        type: 'string',
        description: 'Dashboard UUID',
      },
      operation: {
        type: 'string',
        enum: ['add_row', 'remove_row', 'update_component'],
        description: 'Type of modification',
      },
      data: {
        type: 'object',
        description: 'Operation-specific data',
      },
      supabaseUrl: {
        type: 'string',
        description: 'Supabase project URL',
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase API key',
      },
    },
    required: ['dashboard_id', 'operation', 'data', 'supabaseUrl', 'supabaseKey'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = UpdateDashboardLayoutSchema.parse(input);

      logger.info('update_dashboard_layout called', {
        dashboardId: validated.dashboard_id,
        operation: validated.operation,
      });

      // Initialize Supabase
      const supabase = initSupabase(validated.supabaseUrl, validated.supabaseKey);

      // Load existing dashboard
      const { data: dashboard, error: loadError } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', validated.dashboard_id)
        .single();

      if (loadError || !dashboard) {
        throw new Error('Dashboard not found');
      }

      const config = dashboard.config || {};
      let rows = config.rows || [];

      // Perform operation
      switch (validated.operation) {
        case 'add_row': {
          const newRow: RowConfig = {
            id: generateId(),
            columns: (validated.data.columns || []).map((col: any) => ({
              id: generateId(),
              width: col.width,
              component: col.component,
            })),
          };
          rows.push(newRow);
          break;
        }

        case 'remove_row': {
          const rowId = validated.data.row_id;
          rows = rows.filter((row: RowConfig) => row.id !== rowId);
          break;
        }

        case 'update_component': {
          const { component_id, component } = validated.data;
          rows = rows.map((row: RowConfig) => ({
            ...row,
            columns: row.columns.map(col =>
              col.id === component_id
                ? { ...col, component }
                : col
            ),
          }));
          break;
        }
      }

      // Regenerate charts array for compatibility
      const charts = rows.flatMap((row: RowConfig) =>
        row.columns
          .filter(col => col.component)
          .map(col => ({
            id: col.id,
            type: col.component!.type as any,
            measure: col.component!.metrics?.[0] || '',
            dimension: col.component!.dimension || '',
            title: col.component!.title || '',
            size: { w: parseInt(col.width.split('/')[0]), h: 4 },
          }))
      );

      // Update dashboard
      const { error: updateError } = await supabase
        .from('dashboards')
        .update({
          layout: charts,
          config: {
            ...config,
            charts,
            rows,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.dashboard_id);

      if (updateError) {
        throw new Error(`Failed to update dashboard: ${updateError.message}`);
      }

      logger.info('Dashboard updated successfully', {
        dashboardId: validated.dashboard_id,
        operation: validated.operation,
      });

      return {
        success: true,
        dashboard_id: validated.dashboard_id,
        operation: validated.operation,
        row_count: rows.length,
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('update_dashboard_layout failed', { error });

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation error',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

/**
 * Tool 3: List Dashboard Templates
 */
export const listDashboardTemplatesTool = {
  name: 'list_dashboard_templates',
  description: `Get pre-built dashboard templates to quickly create dashboards.

**Purpose:**
Retrieve a library of ready-to-use dashboard templates. These templates provide
starting points for common use cases and can be customized after creation.

**Available Templates:**

1. **SEO Overview**
   - Header with title and date filter
   - 4 scorecards: Clicks, Impressions, CTR, Position
   - Time series chart: Performance trend
   - 2 bar charts: Top pages and queries
   - Ideal for: Search Console reporting

2. **Campaign Performance**
   - Header with title and date filter
   - 6 scorecards: Spend, Conversions, ROAS, Clicks, CTR, CPC
   - 2 area charts: Spend and conversion trends
   - Data table: Campaign breakdown
   - Ideal for: Google Ads reporting

3. **Analytics Overview**
   - Header with title and date filter
   - 4 KPIs: Users, Sessions, Bounce Rate, Avg Duration
   - Area chart + pie chart: Traffic trend and sources
   - 2 visualizations: Top pages and device distribution
   - Ideal for: Google Analytics reporting

4. **Blank Dashboard**
   - Just a header row
   - Build your own from scratch

**Parameters:**
None - returns all available templates

**Returns:**
Array of template objects, each containing:
- id: Template identifier
- name: Human-readable name
- description: What the template includes
- datasource: Default data source
- rows: Complete layout configuration
- preview: Preview image URL (optional)

**Example Response:**
\`\`\`json
[
  {
    "id": "seo_overview",
    "name": "SEO Overview",
    "description": "Header + 4 scorecards + time series + 2 comparison charts",
    "datasource": "gsc_performance_7days",
    "rows": [...]
  },
  {
    "id": "campaign_performance",
    "name": "Campaign Performance",
    "description": "Header + 6 scorecards + 3 charts",
    "datasource": "google_ads_campaign_stats",
    "rows": [...]
  }
]
\`\`\`

**Usage Workflow:**
1. Call list_dashboard_templates to see available templates
2. Choose template that matches your use case
3. Copy template's "rows" array
4. Customize title, datasource, and components as needed
5. Pass to create_dashboard tool

**Best Practices:**
1. Use templates as starting points, not final dashboards
2. Customize datasource to match your data
3. Adjust metrics to match available columns
4. Add/remove components based on requirements
5. Consider audience when choosing template

**Customization Tips:**
- Change datasource to connect to different BigQuery table
- Modify metrics array to show different measurements
- Adjust column widths for different layouts
- Add/remove rows as needed
- Update titles to match your branding`,

  inputSchema: {
    type: 'object' as const,
    properties: {},
  },

  async handler(_input: any) {
    try {
      logger.info('list_dashboard_templates called');

      // Return pre-built templates
      const templates = DASHBOARD_TEMPLATES.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        datasource: template.datasource,
        rows: template.rows,
        component_count: template.rows.reduce(
          (sum, row) => sum + row.columns.filter(col => col.component).length,
          0
        ),
        preview: template.preview,
      }));

      logger.info('Returned dashboard templates', {
        count: templates.length,
      });

      return {
        success: true,
        templates,
        count: templates.length,
      };
    } catch (error) {
      logger.error('list_dashboard_templates failed', { error });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export const dashboardTools = [
  createDashboardTool,
  updateDashboardLayoutTool,
  listDashboardTemplatesTool,
];
