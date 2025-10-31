/**
 * Delete Dashboard Tool
 *
 * MCP tool to delete an existing dashboard from Supabase with interactive discovery and approval workflow.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { initSupabase, initSupabaseFromEnv } from './helpers.js';
// import { DeleteDashboardSchema } from './schemas.js'; // Currently unused
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';

const logger = getLogger('wpp-analytics.dashboards.delete');

export const deleteDashboardTool = {
  name: 'delete_dashboard',
  description: `Delete a dashboard by ID.`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      dashboard_id: {
        type: 'string',
        description: 'Dashboard UUID to delete (optional - will be discovered if not provided)'
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace UUID (optional - will be discovered if not provided)'
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (required for execution)'
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
    required: []
  },

  async handler(input: any) {
    try {
      // Initialize Supabase
      const supabase = input.supabaseUrl && input.supabaseKey
        ? initSupabase(input.supabaseUrl, input.supabaseKey)
        : initSupabaseFromEnv();

      // STEP 1: Workspace Discovery
      if (!input.workspaceId) {
        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name')
          .order('name');

        if (workspaceError || !workspaces || workspaces.length === 0) {
          return injectGuidance(
            { success: false },
            `⚠️ NO WORKSPACES FOUND

Unable to find any workspaces in the system.

💡 TROUBLESHOOTING:
• Check Supabase connection and credentials
• Verify workspaces table exists
• Ensure you have appropriate permissions

Please contact system administrator if the issue persists.`
          );
        }

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT WORKSPACE',
          items: workspaces,
          itemFormatter: (ws, i) => `${i + 1}. ${ws.name || 'Unnamed'} (ID: ${ws.id})`,
          prompt: 'Which workspace contains the dashboard to delete?',
          nextParam: 'workspaceId',
          emoji: '🗑️'
        });
      }

      // STEP 2: Verify workspace exists
      const { data: workspace, error: workspaceVerifyError } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('id', input.workspaceId)
        .single();

      if (workspaceVerifyError || !workspace) {
        return injectGuidance(
          { success: false },
          `❌ WORKSPACE NOT FOUND

The workspace "${input.workspaceId}" does not exist.

💡 SOLUTION:
Call this tool without parameters to see available workspaces.`
        );
      }

      logger.info('Workspace verified', { workspaceId: input.workspaceId });

      // STEP 3: Dashboard Discovery
      if (!input.dashboard_id) {
        const { data: dashboards, error: dashboardError } = await supabase
          .from('dashboards')
          .select('id, name, created_at, config')
          .eq('workspace_id', input.workspaceId)
          .order('created_at', { ascending: false });

        if (dashboardError || !dashboards || dashboards.length === 0) {
          return injectGuidance(
            { success: false },
            `📊 NO DASHBOARDS FOUND

Workspace "${workspace.name}" has no dashboards yet.

💡 WHAT YOU CAN DO:
• Create a dashboard using create_dashboard tool
• Check if you're looking in the correct workspace
• Verify workspace permissions`
          );
        }

        // Count components in each dashboard
        const dashboardsWithCounts = dashboards.map((d) => {
          const pages = d.config?.pages || [];
          const componentCount = pages.reduce((total: number, page: any) => {
            return total + (page.rows || []).reduce((rowTotal: number, row: any) => {
              return rowTotal + (row.columns || []).filter((col: any) => col.component).length;
            }, 0);
          }, 0);

          return {
            ...d,
            componentCount,
            pageCount: pages.length
          };
        });

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT DASHBOARD TO DELETE',
          items: dashboardsWithCounts,
          itemFormatter: (d, i) =>
            `${i + 1}. ${d.name}\n   ID: ${d.id}\n   Pages: ${d.pageCount}, Components: ${d.componentCount}\n   Created: ${new Date(d.created_at).toLocaleDateString()}`,
          prompt: '⚠️ WARNING: Deletion is PERMANENT and cannot be undone.\n\nWhich dashboard do you want to delete?',
          nextParam: 'dashboard_id',
          context: { workspace: workspace.name },
          emoji: '🗑️'
        });
      }

      // STEP 4: Load dashboard and verify ownership
      const { data: dashboard, error: loadError } = await supabase
        .from('dashboards')
        .select('id, workspace_id, name, config, created_at')
        .eq('id', input.dashboard_id)
        .single();

      if (loadError || !dashboard) {
        return injectGuidance(
          { success: false },
          `❌ DASHBOARD NOT FOUND

Dashboard "${input.dashboard_id}" does not exist.

💡 SOLUTION:
Call this tool with workspaceId to see available dashboards in that workspace.`
        );
      }

      // Verify ownership
      if (dashboard.workspace_id !== input.workspaceId) {
        return injectGuidance(
          { success: false },
          `❌ WORKSPACE MISMATCH

Dashboard "${dashboard.name}" belongs to a different workspace.

**Dashboard workspace:** ${dashboard.workspace_id}
**Provided workspace:** ${input.workspaceId}

💡 SOLUTION:
Use the correct workspace ID for this dashboard, or call without parameters to discover correct workspace.`
        );
      }

      logger.info('Dashboard ownership verified', {
        dashboardId: input.dashboard_id,
        dashboardName: dashboard.name,
        workspaceId: dashboard.workspace_id
      });

      // Calculate component count
      const pages = dashboard.config?.pages || [];
      const componentCount = pages.reduce((total: number, page: any) => {
        return total + (page.rows || []).reduce((rowTotal: number, row: any) => {
          return rowTotal + (row.columns || []).filter((col: any) => col.component).length;
        }, 0);
      }, 0);

      // STEP 5: Dry-Run Preview (if no confirmation token)
      if (!input.confirmationToken) {
        const approvalEnforcer = getApprovalEnforcer();

        const dryRunBuilder = new DryRunResultBuilder(
          'delete_dashboard',
          'WPP Analytics',
          input.workspaceId
        );

        dryRunBuilder.addChange({
          resource: 'Dashboard',
          resourceId: dashboard.name,
          field: 'status',
          currentValue: 'exists',
          newValue: 'PERMANENTLY DELETED',
          changeType: 'delete'
        });

        dryRunBuilder.addRisk('⚠️ This operation is IRREVERSIBLE - dashboard cannot be recovered');
        dryRunBuilder.addRisk('⚠️ All dashboard configuration will be permanently lost');
        dryRunBuilder.addRisk(`⚠️ ${componentCount} components will be removed`);
        dryRunBuilder.addRisk(`⚠️ ${pages.length} pages will be removed`);

        dryRunBuilder.addRecommendation('✅ BigQuery data will NOT be affected');
        dryRunBuilder.addRecommendation('✅ Dataset entries preserved for other dashboards');
        dryRunBuilder.addRecommendation('💡 Consider exporting dashboard config before deletion');

        const dryRun = dryRunBuilder.build();

        const { confirmationToken } = await approvalEnforcer.createDryRun(
          'delete_dashboard',
          'WPP Analytics',
          input.workspaceId,
          { dashboard_id: input.dashboard_id }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return injectGuidance(
          {
            success: true,
            requiresApproval: true,
            confirmationToken,
            preview
          },
          `🗑️ CONFIRM DASHBOARD DELETION (Step 3/3)

**Dashboard:** ${dashboard.name}
**ID:** ${dashboard.id}
**Workspace:** ${workspace.name}
**Pages:** ${pages.length}
**Components:** ${componentCount}
**Created:** ${new Date(dashboard.created_at).toLocaleString()}

🚨 THIS WILL PERMANENTLY:
✗ Delete dashboard configuration
✗ Remove all ${pages.length} pages and ${componentCount} components
✗ Remove all filters and styling
✗ Cannot be undone or recovered

✅ WHAT WILL NOT BE AFFECTED:
✓ BigQuery data (completely safe)
✓ Dataset entries (preserved for other dashboards)
✓ Other dashboards in workspace

💡 RECOMMENDATION:
Consider exporting the dashboard configuration before deletion if you might need it later.

⚠️ Are you absolutely sure you want to delete "${dashboard.name}"?

${preview}

To proceed, call this tool again with confirmationToken: "${confirmationToken}"`
        );
      }

      // STEP 6: Execute Deletion (with confirmation)
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'delete_dashboard',
        'WPP Analytics',
        input.workspaceId
      );

      dryRunBuilder.addChange({
        resource: 'Dashboard',
        resourceId: dashboard.name,
        field: 'status',
        currentValue: 'exists',
        newValue: 'PERMANENTLY DELETED',
        changeType: 'delete'
      });

      const dryRun = dryRunBuilder.build();

      await approvalEnforcer.validateAndExecute(
        input.confirmationToken,
        dryRun,
        async () => {
          const { error: deleteError } = await supabase
            .from('dashboards')
            .delete()
            .eq('id', input.dashboard_id);

          if (deleteError) {
            throw new Error(`Failed to delete dashboard: ${deleteError.message}`);
          }

          return { dashboard_id: input.dashboard_id };
        }
      );

      logger.info('Dashboard deleted successfully', {
        dashboardId: input.dashboard_id,
        dashboardName: dashboard.name,
        workspaceId: input.workspaceId
      });

      return injectGuidance(
        {
          success: true,
          dashboard_id: input.dashboard_id,
          dashboard_name: dashboard.name,
          deleted: true,
          deleted_at: new Date().toISOString()
        },
        `✅ DASHBOARD DELETED SUCCESSFULLY

**Dashboard:** ${dashboard.name}
**ID:** ${input.dashboard_id}
**Components removed:** ${componentCount}
**Pages removed:** ${pages.length}
**Deleted at:** ${new Date().toLocaleString()}

✅ CONFIRMATION:
• Dashboard configuration permanently removed
• BigQuery data remains intact
• Dataset entries preserved
• Dashboard no longer appears in list_dashboards

💡 NEXT STEPS:
• Verify deletion with list_dashboards tool
• Create new dashboard if needed with create_dashboard
• Check other dashboards in this workspace`
      );

    } catch (error) {
      logger.error('delete_dashboard failed', { error });

      if (error instanceof z.ZodError) {
        const enhancedErrors = error.errors.map(e => {
          const field = e.path.join('.');
          let hint = '';

          if (field === 'dashboard_id') {
            hint = '\n💡 Hint: Call without parameters to discover available dashboards';
          } else if (field === 'workspaceId') {
            hint = '\n💡 Hint: Call without parameters to discover available workspaces';
          } else if (field === 'confirmationToken') {
            hint = '\n💡 Hint: First call will show preview and provide confirmation token';
          }

          return `${field}: ${e.message}${hint}`;
        });

        return injectGuidance(
          { success: false },
          `❌ VALIDATION ERROR

${enhancedErrors.join('\n')}

💡 SOLUTION:
Call this tool without any parameters to start the interactive workflow.`
        );
      }

      return injectGuidance(
        { success: false },
        `❌ ERROR IN DASHBOARD DELETION

${error instanceof Error ? error.message : String(error)}

💡 TROUBLESHOOTING:
• Check database connection
• Verify dashboard exists
• Ensure you have appropriate permissions
• Check Supabase credentials

If the issue persists, contact system administrator.`
      );
    }
  },
};
