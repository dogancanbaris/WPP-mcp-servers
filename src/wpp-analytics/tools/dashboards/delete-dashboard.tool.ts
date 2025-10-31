/**
 * Delete Dashboard Tool
 *
 * MCP tool to delete an existing dashboard from Supabase.
 * Performs a hard delete by dashboard ID with ownership verification.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { initSupabase, initSupabaseFromEnv } from './helpers.js';
import { DeleteDashboardSchema } from './schemas.js';

const logger = getLogger('wpp-analytics.dashboards.delete');

export const deleteDashboardTool = {
  name: 'delete_dashboard',
  description: `Delete a dashboard by ID with safety checks and confirmation.

**Purpose:**
Remove an existing dashboard from the WPP Analytics Platform. This performs a hard delete
of the dashboard record. This operation is IRREVERSIBLE.

**⚠️ SAFETY WARNINGS:**
- Dashboard configuration permanently deleted
- Operation cannot be undone
- BigQuery data NOT affected (only dashboard metadata removed)
- Requires explicit confirmation (confirm: true)
- Requires workspace ownership verification

**QUICK START (For Agents) - 3 STEPS TO DELETE SAFELY:**

**Step 1: Verify Dashboard**
Use get_dashboard to confirm this is the correct dashboard:
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`
Check the name, workspace_id, and contents before proceeding.

**Step 2: Delete with Confirmation**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "confirm": true
}
\`\`\`

**Step 3: Verify Deletion**
- Response includes deleted: true
- Dashboard no longer appears in list_dashboards
- BigQuery data remains unchanged

**MANDATORY FIELDS (Will Error Without These):**
1. ✅ **dashboard_id**: Valid UUID (get from list_dashboards)
2. ✅ **workspaceId**: Valid UUID (required for safety)
3. ✅ **confirm**: Must be true (prevents accidental deletion)

**WHAT GETS DELETED:**
- ✅ Dashboard record in Supabase
- ✅ Dashboard configuration (pages, components, filters)
- ✅ Dashboard metadata (name, description, theme)
- ❌ BigQuery data (NOT affected - data remains)
- ❌ Dataset entries (NOT affected - shared by other dashboards)

**TROUBLESHOOTING - Common Errors & Solutions:**

**Error: "dashboard_id must be valid UUID"**
→ Solution: Use list_dashboards to get valid dashboard UUID
→ UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

**Error: "workspaceId must be valid UUID and is required for safety"**
→ Solution: Run list_workspaces to get your workspace UUID
→ Safety: Required to prevent accidental cross-workspace deletion
→ Get from your environment or list_workspaces tool

**Error: "Workspace not found"**
→ Solution: Verify workspace ID with list_workspaces tool
→ Check you have access to this workspace

**Error: "Dashboard not found"**
→ Solution: Verify dashboard ID with list_dashboards
→ Dashboard may have already been deleted
→ Check workspace access permissions

**Error: "Workspace mismatch: cannot delete dashboard in another workspace"**
→ Solution: Dashboard belongs to different workspace
→ Check ownership with get_dashboard(dashboard_id)
→ You can only delete dashboards in your own workspace

**Error: "Deletion requires explicit confirmation"**
→ Solution: Add "confirm": true to your request
→ This safety feature prevents accidental deletions
→ Review dashboard with get_dashboard first, then confirm

**Example 1: Basic Deletion (Safe Workflow)**
\`\`\`json
// Step 1: Verify first (optional but recommended)
{
  "tool": "get_dashboard",
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000"
}

// Step 2: Delete with confirmation
{
  "tool": "delete_dashboard",
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "confirm": true
}
\`\`\`

**Example 2: Delete After Listing**
\`\`\`json
// Step 1: Find dashboard
{
  "tool": "list_dashboards",
  "search": "Old Dashboard"
}
// Returns: dashboard_id and workspace_id

// Step 2: Delete with info from listing
{
  "tool": "delete_dashboard",
  "dashboard_id": "<id-from-listing>",
  "workspaceId": "<workspace-id-from-listing>",
  "confirm": true
}
\`\`\`

**Returns:**
- success: Boolean indicating if deletion succeeded
- dashboard_id: ID of deleted dashboard
- deleted: true
- deleted_at: Timestamp of deletion`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      dashboard_id: {
        type: 'string',
        description: 'Dashboard UUID to delete (required)'
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace UUID (REQUIRED for safety - prevents cross-workspace deletion)'
      },
      confirm: {
        type: 'boolean',
        description: 'Explicit confirmation required (must be true) - safety feature to prevent accidents'
      },
      supabaseUrl: {
        type: 'string',
        description: 'Supabase project URL (optional - loads from ENV if not provided)'
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase service key (optional - loads from ENV if not provided)'
      }
    },
    required: ['dashboard_id', 'workspaceId', 'confirm']
  },

  async handler(input: any) {
    try {
      // Validate input using imported schema
      const validated = DeleteDashboardSchema.parse(input);

      logger.info('delete_dashboard called', {
        dashboardId: validated.dashboard_id,
        workspaceId: validated.workspaceId,
        confirm: validated.confirm,
      });

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

      // PRE-FLIGHT CHECK 1: Verify workspace exists
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', validated.workspaceId)
        .single();

      if (workspaceError || !workspace) {
        throw new Error(
          `Workspace not found: ${validated.workspaceId}\n` +
          `Hint: Run list_workspaces to see available workspaces`
        );
      }

      logger.info('Workspace verified', { workspaceId: validated.workspaceId });

      // PRE-FLIGHT CHECK 2: Load dashboard to verify existence and ownership
      const { data: dashboard, error: loadError } = await supabase
        .from('dashboards')
        .select('id, workspace_id, name')
        .eq('id', validated.dashboard_id)
        .single();

      if (loadError || !dashboard) {
        throw new Error(
          `Dashboard not found: ${validated.dashboard_id}\n` +
          `Hint: Run list_dashboards to see available dashboards\n` +
          `Check workspace access permissions`
        );
      }

      // PRE-FLIGHT CHECK 3: Verify ownership
      if (dashboard.workspace_id !== validated.workspaceId) {
        throw new Error(
          `Workspace mismatch: Cannot delete dashboard in another workspace\n` +
          `Dashboard "${dashboard.name}" is in workspace: ${dashboard.workspace_id}\n` +
          `You provided workspace: ${validated.workspaceId}\n` +
          `Hint: Check ownership with get_dashboard tool`
        );
      }

      logger.info('Dashboard ownership verified', {
        dashboardId: validated.dashboard_id,
        dashboardName: dashboard.name,
        workspaceId: dashboard.workspace_id
      });

      // Perform delete
      const { error: deleteError } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', validated.dashboard_id);

      if (deleteError) {
        throw new Error(
          `Failed to delete dashboard: ${deleteError.message}\n` +
          `Dashboard ID: ${validated.dashboard_id}\n` +
          `Hint: Check database connection and permissions`
        );
      }

      logger.info('Dashboard deleted successfully', {
        dashboardId: validated.dashboard_id,
        dashboardName: dashboard.name,
        workspaceId: validated.workspaceId
      });

      return {
        success: true,
        dashboard_id: validated.dashboard_id,
        dashboard_name: dashboard.name,
        deleted: true,
        deleted_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('delete_dashboard failed', { error });

      if (error instanceof z.ZodError) {
        // Enhanced Zod validation errors with hints
        const enhancedErrors = error.errors.map(e => {
          const field = e.path.join('.');
          let hint = '';

          // Add context-specific hints
          if (field === 'dashboard_id') {
            hint = '\nHint: Run list_dashboards to get valid dashboard UUID';
          } else if (field === 'workspaceId') {
            hint = '\nHint: Run list_workspaces to get your workspace UUID';
          } else if (field === 'confirm') {
            hint = '\nHint: Add "confirm": true to proceed with deletion';
          }

          return `${field}: ${e.message}${hint}`;
        });

        return {
          success: false,
          error: 'Validation error',
          details: enhancedErrors,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
