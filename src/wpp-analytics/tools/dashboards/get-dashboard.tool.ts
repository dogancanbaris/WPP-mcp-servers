/**
 * Get Dashboard Tool
 *
 * MCP tool for retrieving existing dashboard configuration.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { GetDashboardSchema } from './schemas.js';
import { initSupabase, initSupabaseFromEnv } from './helpers.js';
import type { RowConfig } from './types.js';

const logger = getLogger('wpp-analytics.dashboards.get');

export const getDashboardTool = {
  name: 'get_dashboard',
  description: `Retrieve complete dashboard configuration including all rows, columns, and component details.

**Purpose:**
Get the full structure of an existing dashboard to inspect its layout, identify component IDs
for updates, or verify changes after modifications.

**Use Cases:**
- Inspect dashboard structure before making changes
- Get component IDs for targeted updates with update_dashboard_layout
- Debug dashboard configuration issues
- Verify changes after updates
- Export/backup dashboard configuration

**Parameters:**
- dashboard_id: UUID of dashboard to retrieve (required)
- supabaseUrl: Supabase project URL (required)
- supabaseKey: Supabase API key (required)
- includeMetadata: Include row/component counts and types (optional, default: true)

**Example Usage:**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc...",
  "includeMetadata": true
}
\`\`\`

**Returns:**
\`\`\`json
{
  "success": true,
  "dashboard": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "SEO Performance Dashboard",
    "datasource": "gsc_performance_7days",
    "workspace_id": "workspace-uuid",
    "created_at": "2025-10-27T10:00:00.000Z",
    "updated_at": "2025-10-27T12:00:00.000Z",
    "rows": [
      {
        "id": "row-header",
        "columns": [
          {
            "id": "col-title",
            "width": "3/4",
            "component": {
              "type": "title",
              "title": "SEO Overview"
            }
          },
          {
            "id": "col-date-filter",
            "width": "1/4",
            "component": {
              "type": "date_filter"
            }
          }
        ]
      },
      {
        "id": "row-scorecards",
        "columns": [
          {
            "id": "col-clicks",
            "width": "1/4",
            "component": {
              "type": "scorecard",
              "title": "Clicks",
              "metrics": ["clicks"]
            }
          }
        ]
      }
    ],
    "metadata": {
      "row_count": 2,
      "component_count": 5,
      "component_types": ["title", "date_filter", "scorecard"]
    }
  }
}
\`\`\`

**Workflow for Updating Components:**
1. Call get_dashboard to see current structure
2. Identify component IDs that need changes
3. Call update_dashboard_layout with update_component operation
4. Call get_dashboard again to verify changes

**Best Practices:**
1. Always call get_dashboard before making updates
2. Use component IDs from the response for update_component operations
3. Check metadata to understand dashboard complexity
4. Verify workspace_id matches expected workspace

**Error Handling:**
- Returns error if dashboard not found
- Returns error if user doesn't have access to workspace
- Validates dashboard_id format`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      dashboard_id: {
        type: 'string',
        description: 'Dashboard UUID to retrieve',
      },
      supabaseUrl: {
        type: 'string',
        description: 'Supabase project URL (optional - loads from ENV if not provided)',
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase API key (optional - loads from ENV if not provided)',
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Include metadata (row/component counts, default: true)',
      },
    },
    required: ['dashboard_id'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = GetDashboardSchema.parse(input);

      logger.info('get_dashboard called', {
        dashboardId: validated.dashboard_id,
      });

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

      // Load dashboard
      const { data: dashboard, error: loadError } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', validated.dashboard_id)
        .single();

      if (loadError || !dashboard) {
        logger.error('Dashboard not found', { error: loadError?.message });
        throw new Error('Dashboard not found');
      }

      const config = dashboard.config || {};
      const rows = config.rows || [];

      // Build response
      const response: any = {
        id: dashboard.id,
        name: dashboard.name,
        datasource: dashboard.bigquery_table || config.datasource,
        workspace_id: dashboard.workspace_id,
        created_at: dashboard.created_at,
        updated_at: dashboard.updated_at,
        rows,
      };

      // Add metadata if requested
      if (validated.includeMetadata) {
        const componentCount = rows.reduce(
          (sum: number, row: RowConfig) =>
            sum + row.columns.filter(col => col.component).length,
          0
        );

        const componentTypes = new Set<string>();
        rows.forEach((row: RowConfig) => {
          row.columns.forEach(col => {
            if (col.component) {
              componentTypes.add(col.component.type);
            }
          });
        });

        response.metadata = {
          row_count: rows.length,
          component_count: componentCount,
          component_types: Array.from(componentTypes),
        };
      }

      logger.info('Dashboard retrieved successfully', {
        dashboardId: validated.dashboard_id,
        rowCount: rows.length,
      });

      return {
        success: true,
        dashboard: response,
      };
    } catch (error) {
      logger.error('get_dashboard failed', { error });

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
