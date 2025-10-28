/**
 * List Dashboards Tool
 *
 * MCP tool for discovering and searching user's dashboards.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { ListDashboardsSchema } from './schemas.js';
import { initSupabase, initSupabaseFromEnv } from './helpers.js';

const logger = getLogger('wpp-analytics.dashboards.list');

export const listDashboardsTool = {
  name: 'list_dashboards',
  description: `List all dashboards with optional filtering and search.

**Purpose:**
Discover available dashboards, search by name, and get dashboard IDs/URLs for access or editing.
Essential for agents to find dashboards without knowing exact UUID.

**Use Cases:**
- User: "Find my report link" → Search by name, return URL
- Agent: "Which dashboard to edit?" → List all, user selects
- User: "Show my GSC dashboards" → Filter by datasource
- Agent workflow: Search → Get ID → Get structure → Update

**Parameters:**
- workspaceId: Filter to specific workspace (optional - auto-detected from user if not provided)
- search: Search term for dashboard name (case-insensitive, optional)
- limit: Max results to return (optional, default: 50, max: 100)
- supabaseUrl: Supabase project URL (required)
- supabaseKey: Supabase API key (required)

**Example 1: Search by Name**
\`\`\`json
{
  "search": "Mindful Steward",
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
\`\`\`

**Example 2: List All in Workspace**
\`\`\`json
{
  "workspaceId": "workspace-uuid",
  "limit": 20,
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
\`\`\`

**Example 3: Find GSC Dashboards**
\`\`\`json
{
  "search": "gsc",
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
\`\`\`

**Returns:**
\`\`\`json
{
  "success": true,
  "dashboards": [
    {
      "id": "c90e22de-b8ad-49dc-9f88-d60f5be085af",
      "name": "Mindful Steward Organic Search Performance (Copy)",
      "description": null,
      "workspace_id": "workspace-uuid",
      "datasource": "google_search_console",
      "dashboard_url": "/dashboards/c90e22de-b8ad-49dc-9f88-d60f5be085af",
      "created_at": "2025-10-27T15:40:44.209Z",
      "updated_at": "2025-10-27T15:40:44.209Z",
      "view_count": 0
    }
  ],
  "count": 1,
  "total": 2
}
\`\`\`

**Agent Workflow Examples:**

**Workflow 1: Find Dashboard Link**
\`\`\`
User: "Find my report link"
Agent: "What's the name?"
User: "Mindful Steward"
Agent: list_dashboards(search: "Mindful Steward")
  → Returns 2 matches
Agent: "Found 2 dashboards:
  1. Mindful Steward Organic Search Performance
  2. Mindful Steward Organic Search Performance (Copy)
  Which one?"
User: "The copy"
Agent: "Link: /dashboards/c90e22de-b8ad-49dc-9f88-d60f5be085af"
\`\`\`

**Workflow 2: Edit Dashboard**
\`\`\`
User: "Edit the Mindful Steward dashboard"
Agent: list_dashboards(search: "Mindful Steward")
  → Gets ID: "c90e22de..."
Agent: get_dashboard(id: "c90e22de...")
  → Gets structure
Agent: Proceeds with updates using update_dashboard_layout
\`\`\`

**Best Practices:**
1. Use search parameter for name-based lookup
2. If multiple matches, ask user to clarify
3. Return dashboard_url for easy access
4. Check total vs count to see if results are truncated

**Error Handling:**
- Returns empty array if no matches found
- Validates workspace access via Supabase RLS
- Returns error if Supabase connection fails`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      workspaceId: {
        type: 'string',
        description: 'Workspace ID to filter (optional - auto-detected from user)',
      },
      search: {
        type: 'string',
        description: 'Search term for dashboard name (case-insensitive)',
      },
      limit: {
        type: 'number',
        description: 'Max results (default: 50, max: 100)',
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
    required: [],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = ListDashboardsSchema.parse(input);

      logger.info('list_dashboards called', {
        search: validated.search,
        workspaceId: validated.workspaceId,
        limit: validated.limit,
      });

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

      // Build query
      let query = supabase
        .from('dashboards')
        .select('id, name, description, workspace_id, bigquery_table, config, created_at, updated_at, view_count', { count: 'exact' });

      // Apply filters
      if (validated.workspaceId) {
        query = query.eq('workspace_id', validated.workspaceId);
      }

      if (validated.search) {
        query = query.ilike('name', `%${validated.search}%`);
      }

      // Order and limit
      query = query
        .order('updated_at', { ascending: false })
        .limit(validated.limit);

      // Execute query
      const { data: dashboards, error, count } = await query;

      if (error) {
        logger.error('Failed to list dashboards', { error: error.message });
        throw new Error(`Failed to list dashboards: ${error.message}`);
      }

      // Format results
      const formatted = (dashboards || []).map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        workspace_id: d.workspace_id,
        datasource: d.bigquery_table || d.config?.datasource || 'unknown',
        dashboard_url: `/dashboards/${d.id}`,
        created_at: d.created_at,
        updated_at: d.updated_at,
        view_count: d.view_count || 0,
      }));

      logger.info('Dashboards listed successfully', {
        count: formatted.length,
        total: count,
      });

      return {
        success: true,
        dashboards: formatted,
        count: formatted.length,
        total: count || formatted.length,
        filters: {
          workspaceId: validated.workspaceId || 'all',
          search: validated.search || 'none',
        },
      };
    } catch (error) {
      logger.error('list_dashboards failed', { error });

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
