/**
 * Update Dashboard Layout Tool
 *
 * MCP tool for modifying existing dashboards.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { UpdateDashboardLayoutSchema } from './schemas.js';
import { initSupabase, initSupabaseFromEnv, generateId } from './helpers.js';
import type { RowConfig } from './types.js';

const logger = getLogger('wpp-analytics.dashboards.update');

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
        description: 'Supabase project URL (optional - loads from ENV if not provided)',
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase API key (optional - loads from ENV if not provided)',
      },
    },
    required: ['dashboard_id', 'operation', 'data'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = UpdateDashboardLayoutSchema.parse(input);

      logger.info('update_dashboard_layout called', {
        dashboardId: validated.dashboard_id,
        operation: validated.operation,
      });

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

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
