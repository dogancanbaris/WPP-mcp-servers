/**
 * Get Dashboard Tool
 *
 * MCP tool for retrieving existing dashboard configuration.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { GetDashboardSchema } from './schemas.js';
import { initSupabase, initSupabaseFromEnv } from './helpers.js';
import type { RowConfig, PageConfig } from './types.js';
import { injectGuidance, formatDiscoveryResponse } from '../../../shared/interactive-workflow.js';

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
    "pages": [
      {
        "id": "page-1",
        "name": "Overview",
        "order": 0,
        "filters": [],
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
                  "type": "date_range_filter"
                }
              }
            ]
          }
        ]
      }
    ],
    "rows": [],
    "filters": {
      "pages": [
        {
          "pageId": "page-1",
          "pageName": "Overview",
          "filters": []
        }
      ]
    },
    "theme": {
      "primaryColor": "#2563eb",
      "backgroundColor": "#ffffff",
      "textColor": "#000000",
      "borderColor": "#e5e7eb"
    },
    "metadata": {
      "page_count": 1,
      "row_count": 2,
      "component_count": 5,
      "has_multi_page": false,
      "has_filters": false,
      "component_types": ["title", "date_range_filter", "scorecard"]
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
      // Initialize Supabase (from ENV or parameters)
      const supabase = input.supabaseUrl && input.supabaseKey
        ? initSupabase(input.supabaseUrl, input.supabaseKey)
        : initSupabaseFromEnv();

      // Step 1: Dashboard Discovery (if dashboard_id not provided)
      if (!input.dashboard_id) {
        logger.info('get_dashboard: dashboard_id missing, listing available dashboards');

        // Get all dashboards (limited to 20 for discovery)
        const { data: dashboards, error } = await supabase
          .from('dashboards')
          .select('id, name, updated_at, workspace_id')
          .order('updated_at', { ascending: false })
          .limit(20);

        if (error) {
          throw new Error(`Failed to list dashboards: ${error.message}`);
        }

        if (!dashboards || dashboards.length === 0) {
          return {
            success: false,
            error: 'No dashboards found. Create a dashboard first using create_dashboard.',
          };
        }

        return formatDiscoveryResponse({
          step: '1/1',
          title: 'SELECT DASHBOARD',
          items: dashboards,
          itemFormatter: (d, i) => `${i + 1}. **${d.name}**
   • ID: ${d.id}
   • Workspace: ${d.workspace_id}
   • Last Updated: ${new Date(d.updated_at).toLocaleDateString()}`,
          prompt: 'Which dashboard would you like to retrieve?',
          nextParam: 'dashboard_id',
        });
      }

      // Validate input after discovery
      const validated = GetDashboardSchema.parse(input);

      logger.info('get_dashboard called', {
        dashboardId: validated.dashboard_id,
      });

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
      const pages = config.pages || [];
      const legacyRows = config.rows || [];

      // Calculate metadata across all pages
      let totalRowCount = 0;
      let totalComponentCount = 0;
      const uniqueComponentTypes = new Set<string>();
      let hasPageFilters = false;

      pages.forEach((page: PageConfig) => {
        if (page.rows) {
          totalRowCount += page.rows.length;

          page.rows.forEach((row: RowConfig) => {
            row.columns.forEach(col => {
              if (col.component) {
                totalComponentCount++;
                uniqueComponentTypes.add(col.component.type);
              }
            });
          });
        }

        if (page.filters && page.filters.length > 0) {
          hasPageFilters = true;
        }
      });

      // If no pages, calculate from legacy rows
      if (pages.length === 0 && legacyRows.length > 0) {
        totalRowCount = legacyRows.length;
        legacyRows.forEach((row: RowConfig) => {
          row.columns.forEach(col => {
            if (col.component) {
              totalComponentCount++;
              uniqueComponentTypes.add(col.component.type);
            }
          });
        });
      }

      // Build filter structure from pages
      const pageFilters = pages.map((page: PageConfig) => ({
        pageId: page.id,
        pageName: page.name,
        filters: page.filters || [],
      }));

      // Build response
      const response: any = {
        id: dashboard.id,
        name: dashboard.name,
        datasource: dashboard.bigquery_table || config.datasource,
        workspace_id: dashboard.workspace_id,
        created_at: dashboard.created_at,
        updated_at: dashboard.updated_at,

        // Return pages array (new multi-page structure)
        pages,

        // Legacy rows for backward compatibility
        rows: legacyRows,

        // Page-level filter information
        filters: {
          pages: pageFilters,
        },

        // Theme configuration
        theme: config.theme,
      };

      // Add metadata if requested
      if (validated.includeMetadata) {
        response.metadata = {
          page_count: pages.length,
          row_count: totalRowCount,
          component_count: totalComponentCount,
          has_multi_page: pages.length > 1,
          has_filters: hasPageFilters,
          component_types: Array.from(uniqueComponentTypes),
        };
      }

      logger.info('Dashboard retrieved successfully', {
        dashboardId: validated.dashboard_id,
        pageCount: pages.length,
        rowCount: totalRowCount,
        componentCount: totalComponentCount,
      });

      // Build rich guidance response
      const guidanceText = `📊 DASHBOARD DETAILS: ${response.name}

**📌 OVERVIEW:**
   • ID: ${response.id}
   • Workspace: ${response.workspace_id}
   • Data Source: ${response.datasource}
   • Created: ${new Date(response.created_at).toLocaleDateString()}
   • Last Updated: ${new Date(response.updated_at).toLocaleDateString()}

**📐 STRUCTURE:**
   • Pages: ${response.metadata?.page_count || 0}
   • Rows: ${response.metadata?.row_count || 0}
   • Components: ${response.metadata?.component_count || 0}
   • Component Types: ${response.metadata?.component_types?.join(', ') || 'None'}
   • Has Filters: ${response.metadata?.has_filters ? 'Yes' : 'No'}
   • Multi-Page: ${response.metadata?.has_multi_page ? 'Yes' : 'No'}

${pages.length > 0 ? `**📄 PAGES:**\n${pages.map((p: any, i: number) => `   ${i + 1}. ${p.name} (${p.rows?.length || 0} rows, ${p.filters?.length || 0} filters)`).join('\n')}` : ''}

💡 WHAT YOU CAN DO NEXT:
   • Update layout: use update_dashboard_layout
   • View in browser: /dashboards/${response.id}
   • Delete dashboard: use delete_dashboard
   • List all dashboards: use list_dashboards

🎯 COMPONENT INSPECTION:
   • Full structure is in the 'dashboard' field
   • Use component IDs for targeted updates
   • Check pages[].rows[].columns[].component for details

${response.metadata?.component_count === 0 ? '\n⚠️ **Warning:** Dashboard has no components. Add visualizations using update_dashboard_layout.\n' : ''}`;

      return injectGuidance(
        {
          dashboard: response,
        },
        guidanceText
      );
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
