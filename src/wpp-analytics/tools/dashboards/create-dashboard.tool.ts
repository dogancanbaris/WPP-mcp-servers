/**
 * Create Dashboard Tool
 *
 * MCP tool for creating new dashboards in the WPP Analytics Platform.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { CreateDashboardSchema } from './schemas.js';
import {
  initSupabase,
  initSupabaseFromEnv,
  getOrCreateWorkspace,
  processLayout,
  generateDashboardId,
} from './helpers.js';

const logger = getLogger('wpp-analytics.dashboards.create');

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
        description: 'Supabase project URL (optional - loads from ENV if not provided)',
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase API key (optional - loads from ENV if not provided)',
      },
    },
    required: ['title', 'rows'],
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

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

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
