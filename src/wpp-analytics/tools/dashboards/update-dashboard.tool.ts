/**
 * Update Dashboard Layout Tool
 *
 * MCP tool for modifying existing multi-page dashboards.
 * Supports page-level operations (add/remove/update pages) and
 * component-level operations within specific pages.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { UpdateDashboardLayoutSchema } from './schemas.js';
import { initSupabase, initSupabaseFromEnv, generateId } from './helpers.js';
import type { RowConfig, PageConfig } from './types.js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../../shared/interactive-workflow.js';

const logger = getLogger('wpp-analytics.dashboards.update');

export const updateDashboardLayoutTool = {
  name: 'update_dashboard_layout',
  description: 'Modify existing dashboard layout with multi-page architecture support.',

  inputSchema: {
    type: 'object' as const,
    properties: {
      dashboard_id: {
        type: 'string',
        description: 'Dashboard UUID (required)',
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace UUID (REQUIRED for access control)',
      },
      operation: {
        type: 'string',
        enum: [
          'add_page',
          'remove_page',
          'update_page',
          'reorder_pages',
          'add_row_to_page',
          'remove_row_from_page',
          'update_component_in_page',
          'set_page_filters',
          'set_component_filters',
        ],
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
    required: [],
  },

  async handler(input: any) {
    try {
      // Initialize Supabase (used for both discovery and execution)
      const supabase = input.supabaseUrl && input.supabaseKey
        ? initSupabase(input.supabaseUrl, input.supabaseKey)
        : initSupabaseFromEnv();

      // ═══ DISCOVERY MODE: Guide step-by-step if params missing ═══

      // STEP 1: Workspace Discovery
      if (!input.workspaceId) {
        const { data: workspaces } = await supabase
          .from('workspaces')
          .select('id, name')
          .limit(20);

        return formatDiscoveryResponse({
          step: '1/4',
          title: 'SELECT WORKSPACE',
          items: workspaces || [],
          itemFormatter: (w, i) => `${i + 1}. ${w.name || 'Unnamed'} (ID: ${w.id})`,
          prompt: 'Which workspace contains the dashboard?',
          nextParam: 'workspaceId',
        });
      }

      // STEP 2: Dashboard Discovery
      if (!input.dashboard_id) {
        const { data: dashboards } = await supabase
          .from('dashboards')
          .select('id, name, config')
          .eq('workspace_id', input.workspaceId)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (!dashboards || dashboards.length === 0) {
          return injectGuidance({}, `⚠️ NO DASHBOARDS FOUND (Step 2/4)

Workspace: ${input.workspaceId}

No dashboards exist in this workspace yet.

💡 Create a dashboard first:
- Use: create_dashboard or create_dashboard_from_table

Then return to modify it.`);
        }

        return formatDiscoveryResponse({
          step: '2/4',
          title: 'SELECT DASHBOARD TO MODIFY',
          items: dashboards,
          itemFormatter: (d, i) => {
            const pageCount = d.config?.pages?.length || 0;
            return `${i + 1}. ${d.name}
   ID: ${d.id}
   Pages: ${pageCount}`;
          },
          prompt: 'Which dashboard do you want to modify?',
          nextParam: 'dashboard_id',
          context: { workspaceId: input.workspaceId }
        });
      }

      // STEP 3: Operation Type Selection
      if (!input.operation) {
        // Load dashboard to show current structure
        const { data: dashboard } = await supabase
          .from('dashboards')
          .select('*')
          .eq('id', input.dashboard_id)
          .eq('workspace_id', input.workspaceId)
          .single();

        if (!dashboard) {
          throw new Error(`Dashboard ${input.dashboard_id} not found in workspace`);
        }

        const pageCount = dashboard.config?.pages?.length || 0;

        return injectGuidance({}, `📐 DASHBOARD LAYOUT OPERATIONS (Step 3/4)

**Dashboard:** ${dashboard.name}
**Current Pages:** ${pageCount}

**Available Operations:**

**📄 Page Management:**
1. **add_page** - Create new page
2. **remove_page** - Delete existing page
3. **update_page** - Modify page properties (name, filters, styles)
4. **reorder_pages** - Change page order

**📊 Row Operations:**
5. **add_row_to_page** - Add chart row to specific page
6. **remove_row_from_page** - Delete row from page

**🎨 Component Operations:**
7. **update_component_in_page** - Modify chart/component in page

**🔍 Filter Operations:**
8. **set_page_filters** - Set page-level filters
9. **set_component_filters** - Set component-specific filters

💡 Which operation do you want to perform?
Provide: operation (e.g., "add_page", "update_component_in_page")`);
      }

      // STEP 4: Operation-Specific Data Guidance
      if (!input.data) {
        const operationGuidance: Record<string, string> = {
          add_page: `📄 ADD PAGE (Step 4/4)

Provide data object with:
- **name**: Page name (e.g., "Performance Overview")
- **order**: Page position (0, 1, 2...) - optional
- **rows**: Array of row configurations - optional
- **filters**: Page-level filters - optional

Example:
{
  "name": "Device Analysis",
  "order": 2,
  "rows": []
}

What data should I use to create the page?`,

          remove_page: `🗑️ REMOVE PAGE (Step 4/4)

⚠️ WARNING: This will permanently delete the page and all its components.

Provide data object with:
- **page_id**: ID of page to delete

To find page IDs, use get_dashboard first.

What page_id should I delete?`,

          update_page: `📝 UPDATE PAGE (Step 4/4)

Provide data object with:
- **page_id**: Page to update (required)
- **name**: New page name - optional
- **filters**: New page filters - optional
- **pageStyles**: Style overrides - optional

Example:
{
  "page_id": "page-abc-123",
  "name": "Updated Page Name",
  "filters": [{"field": "device", "operator": "equals", "values": ["MOBILE"]}]
}

What data should I use?`,

          reorder_pages: `🔄 REORDER PAGES (Step 4/4)

Provide data object with:
- **page_order**: Array of page IDs in desired order

Example:
{
  "page_order": ["page-3", "page-1", "page-2"]
}

Use get_dashboard to see current page IDs.

What is the new page order?`,

          add_row_to_page: `➕ ADD ROW TO PAGE (Step 4/4)

Provide data object with:
- **page_id**: Which page to add row to
- **columns**: Array of column configurations

Example:
{
  "page_id": "page-abc-123",
  "columns": [
    {
      "width": "1/2",
      "component": {"type": "line_chart", "title": "Trend", "dimension": "date", "metrics": ["clicks"]}
    },
    {
      "width": "1/2",
      "component": {"type": "bar_chart", "title": "Breakdown", "dimension": "device", "metrics": ["clicks"]}
    }
  ]
}

What row should I add?`,

          remove_row_from_page: `🗑️ REMOVE ROW FROM PAGE (Step 4/4)

Provide data object with:
- **page_id**: Which page contains the row
- **row_id**: ID of row to delete

Use get_dashboard to see current row IDs.

What row should I remove?`,

          update_component_in_page: `🎨 UPDATE COMPONENT (Step 4/4)

Provide data object with:
- **page_id**: Which page contains the component
- **component_id**: ID of component to update
- **component**: New component configuration

Example:
{
  "page_id": "page-abc-123",
  "component_id": "comp-xyz-456",
  "component": {
    "type": "bar_chart",
    "title": "Updated Chart",
    "metrics": ["clicks", "ctr"]
  }
}

What component should I update?`,

          set_page_filters: `🔍 SET PAGE FILTERS (Step 4/4)

Provide data object with:
- **page_id**: Which page to filter
- **filters**: Array of filter configurations

Example:
{
  "page_id": "page-abc-123",
  "filters": [
    {"field": "device", "operator": "equals", "values": ["MOBILE"]},
    {"field": "country", "operator": "in", "values": ["US", "UK"]}
  ]
}

What filters should I apply?`,

          set_component_filters: `🔍 SET COMPONENT FILTERS (Step 4/4)

Provide data object with:
- **page_id**: Which page contains the component
- **component_id**: Which component to filter
- **filters**: Array of filter configurations

Example:
{
  "page_id": "page-abc-123",
  "component_id": "comp-xyz-456",
  "filters": [
    {"field": "device", "operator": "equals", "values": ["DESKTOP"]}
  ]
}

What filters should I apply?`,
        };

        const guidance = operationGuidance[input.operation] || 'Provide data object for operation';
        return injectGuidance({}, guidance);
      }

      // ═══ EXECUTION MODE: All params provided ═══

      // Validate input
      const validated = UpdateDashboardLayoutSchema.parse(input);

      logger.info('update_dashboard_layout called', {
        dashboardId: validated.dashboard_id,
        workspaceId: validated.workspaceId,
        operation: validated.operation,
      });

      // Supabase already initialized at top of handler

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

      // PRE-FLIGHT CHECK 2: Load existing dashboard with workspace filter
      const { data: dashboard, error: loadError } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', validated.dashboard_id)
        .eq('workspace_id', validated.workspaceId)
        .single();

      if (loadError || !dashboard) {
        throw new Error(
          `Dashboard not found in workspace ${validated.workspaceId}\n` +
          `Dashboard ID: ${validated.dashboard_id}\n` +
          `Hint: Run list_dashboards with workspaceId to see available dashboards\n` +
          `Or run get_dashboard(dashboard_id) to check which workspace it belongs to`
        );
      }

      logger.info('Dashboard loaded successfully', {
        dashboardId: validated.dashboard_id,
        dashboardName: dashboard.name,
        workspaceId: dashboard.workspace_id,
        operation: validated.operation
      });

      const config = dashboard.config || {};

      // Ensure pages structure exists (migrate from legacy if needed)
      let pages: PageConfig[] = config.pages || [];

      if (!pages || pages.length === 0) {
        // Auto-migrate legacy rows to pages structure
        const legacyRows = config.rows || [];
        pages = [{
          id: generateId(),
          name: 'Main Page',
          order: 0,
          rows: legacyRows.length > 0 ? legacyRows : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
        logger.info('Auto-migrated legacy dashboard to pages structure');
      }

      // Track affected page_id for response
      let affectedPageId: string | undefined;

      // Perform operation
      switch (validated.operation) {
        // =====================================================
        // PAGE MANAGEMENT OPERATIONS
        // =====================================================

        case 'add_page': {
          const { name, order, filters, rows, pageStyles } = validated.data;

          const newPage: PageConfig = {
            id: generateId(),
            name: name || 'New Page',
            order: order !== undefined ? order : pages.length,
            filters: filters || [],
            rows: rows ? rows.map((row: any) => ({
              id: generateId(),
              columns: row.columns.map((col: any) => ({
                id: generateId(),
                width: col.width,
                component: col.component ? { id: generateId(), ...col.component } : undefined,
              })),
              height: row.height,
            })) : [],
            pageStyles: pageStyles || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          pages.push(newPage);
          affectedPageId = newPage.id;
          logger.info('Page added', { pageId: newPage.id, pageName: newPage.name });
          break;
        }

        case 'remove_page': {
          const { page_id } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            const availablePageIds = pages.map(p => `${p.name} (${p.id})`).join(', ');
            throw new Error(
              `Page not found: ${page_id}\n` +
              `Hint: Run get_dashboard to see available page IDs\n` +
              `Available pages: ${availablePageIds}`
            );
          }

          // Cannot remove last page
          if (pages.length === 1) {
            throw new Error(
              'Cannot remove the last page\n' +
              'Dashboard must have at least one page\n' +
              'Hint: Add a new page before removing this one (use add_page operation)'
            );
          }

          pages = pages.filter(p => p.id !== page_id);

          // Reorder remaining pages
          pages = pages.map((page, index) => ({
            ...page,
            order: index,
            updatedAt: new Date().toISOString(),
          }));

          logger.info('Page removed', { pageId: page_id });
          break;
        }

        case 'update_page': {
          const { page_id, name, filters, pageStyles } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            throw new Error(`Page not found: ${page_id}`);
          }

          pages[pageIndex] = {
            ...pages[pageIndex],
            ...(name !== undefined && { name }),
            ...(filters !== undefined && { filters }),
            ...(pageStyles !== undefined && { pageStyles }),
            updatedAt: new Date().toISOString(),
          };

          affectedPageId = page_id;
          logger.info('Page updated', { pageId: page_id });
          break;
        }

        case 'reorder_pages': {
          const { page_order } = validated.data;

          if (!Array.isArray(page_order)) {
            throw new Error('page_order must be an array of page IDs');
          }

          if (page_order.length !== pages.length) {
            throw new Error(`page_order length (${page_order.length}) must match number of pages (${pages.length})`);
          }

          // Verify all page IDs are valid
          const pageIds = new Set(pages.map(p => p.id));
          for (const pageId of page_order) {
            if (!pageIds.has(pageId)) {
              throw new Error(`Invalid page ID in page_order: ${pageId}`);
            }
          }

          // Reorder pages
          const reorderedPages: PageConfig[] = [];
          for (let i = 0; i < page_order.length; i++) {
            const page = pages.find(p => p.id === page_order[i])!;
            reorderedPages.push({
              ...page,
              order: i,
              updatedAt: new Date().toISOString(),
            });
          }
          pages = reorderedPages;

          logger.info('Pages reordered');
          break;
        }

        // =====================================================
        // ROW OPERATIONS (within specific page)
        // =====================================================

        case 'add_row_to_page': {
          const { page_id, columns } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            throw new Error(`Page not found: ${page_id}`);
          }

          const newRow: RowConfig = {
            id: generateId(),
            columns: (columns || []).map((col: any) => ({
              id: generateId(),
              width: col.width,
              component: col.component ? { id: generateId(), ...col.component } : undefined,
            })),
          };

          pages[pageIndex].rows.push(newRow);
          pages[pageIndex].updatedAt = new Date().toISOString();

          affectedPageId = page_id;
          logger.info('Row added to page', { pageId: page_id, rowId: newRow.id });
          break;
        }

        case 'remove_row_from_page': {
          const { page_id, row_id } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            throw new Error(`Page not found: ${page_id}`);
          }

          const rowIndex = pages[pageIndex].rows.findIndex(r => r.id === row_id);
          if (rowIndex === -1) {
            throw new Error(`Row not found in page: ${row_id}`);
          }

          pages[pageIndex].rows = pages[pageIndex].rows.filter(r => r.id !== row_id);
          pages[pageIndex].updatedAt = new Date().toISOString();

          affectedPageId = page_id;
          logger.info('Row removed from page', { pageId: page_id, rowId: row_id });
          break;
        }

        // =====================================================
        // COMPONENT OPERATIONS (within specific page)
        // =====================================================

        case 'update_component_in_page': {
          const { page_id, component_id, component } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            const availablePageIds = pages.map(p => `${p.name} (${p.id})`).join(', ');
            throw new Error(
              `Page not found: ${page_id}\n` +
              `Hint: Run get_dashboard to see available page IDs\n` +
              `Available pages: ${availablePageIds}`
            );
          }

          let componentFound = false;
          const componentIds: string[] = [];

          pages[pageIndex].rows = pages[pageIndex].rows.map((row: RowConfig) => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.component) {
                componentIds.push(col.id);
              }
              if (col.id === component_id) {
                componentFound = true;
                return {
                  ...col,
                  component: { ...col.component, ...component, id: col.component?.id || component_id },
                };
              }
              return col;
            }),
          }));

          if (!componentFound) {
            throw new Error(
              `Component not found: ${component_id} in page: ${page_id}\n` +
              `Hint: Run get_dashboard to see available component IDs\n` +
              `Available components in this page: ${componentIds.slice(0, 10).join(', ')}${componentIds.length > 10 ? '...' : ''}`
            );
          }

          pages[pageIndex].updatedAt = new Date().toISOString();

          affectedPageId = page_id;
          logger.info('Component updated in page', { pageId: page_id, componentId: component_id });
          break;
        }

        // =====================================================
        // FILTER OPERATIONS
        // =====================================================

        case 'set_page_filters': {
          const { page_id, filters } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            throw new Error(`Page not found: ${page_id}`);
          }

          pages[pageIndex].filters = filters || [];
          pages[pageIndex].updatedAt = new Date().toISOString();

          affectedPageId = page_id;

          logger.info('Page filters set', { pageId: page_id, filterCount: filters?.length || 0 });
          break;
        }

        case 'set_component_filters': {
          const { page_id, component_id, filters } = validated.data;

          const pageIndex = pages.findIndex(p => p.id === page_id);
          if (pageIndex === -1) {
            throw new Error(`Page not found: ${page_id}`);
          }

          let componentFound = false;

          pages[pageIndex].rows = pages[pageIndex].rows.map((row: RowConfig) => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.id === component_id && col.component) {
                componentFound = true;
                return {
                  ...col,
                  component: {
                    ...col.component,
                    filters: filters || [],
                  },
                };
              }
              return col;
            }),
          }));

          if (!componentFound) {
            throw new Error(`Component not found in page: ${component_id}`);
          }

          pages[pageIndex].updatedAt = new Date().toISOString();

          affectedPageId = page_id;
          logger.info('Component filters set', { pageId: page_id, componentId: component_id, filterCount: filters?.length || 0 });
          break;
        }

        default:
          throw new Error(`Unknown operation: ${validated.operation}`);
      }

      // Regenerate charts array for backward compatibility
      const charts = pages.flatMap((page: PageConfig) =>
        page.rows.flatMap((row: RowConfig) =>
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
        )
      );

      // Update dashboard with new pages structure
      const { error: updateError } = await supabase
        .from('dashboards')
        .update({
          layout: charts,
          config: {
            ...config,
            pages,
            charts,
            // Keep legacy rows for backward compatibility (deprecated)
            rows: pages[0]?.rows || [],
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.dashboard_id);

      if (updateError) {
        throw new Error(
          `Failed to update dashboard: ${updateError.message}\n` +
          `Dashboard ID: ${validated.dashboard_id}\n` +
          `Operation: ${validated.operation}\n` +
          `Hint: Check database connection and permissions`
        );
      }

      logger.info('Dashboard updated successfully', {
        dashboardId: validated.dashboard_id,
        operation: validated.operation,
        pageCount: pages.length,
      });

      // Load dashboard name for success message
      const { data: updatedDashboard } = await supabase
        .from('dashboards')
        .select('name')
        .eq('id', validated.dashboard_id)
        .single();

      const operationNames: Record<string, string> = {
        add_page: 'Page Added',
        remove_page: 'Page Removed',
        update_page: 'Page Updated',
        reorder_pages: 'Pages Reordered',
        add_row_to_page: 'Row Added',
        remove_row_from_page: 'Row Removed',
        update_component_in_page: 'Component Updated',
        set_page_filters: 'Page Filters Set',
        set_component_filters: 'Component Filters Set',
      };

      const successText = formatSuccessSummary({
        title: operationNames[validated.operation] || 'Dashboard Updated',
        operation: validated.operation,
        details: {
          Dashboard: updatedDashboard?.name || validated.dashboard_id,
          'Page Count': pages.length.toString(),
          ...(affectedPageId && { 'Affected Page': affectedPageId }),
          'Updated At': new Date().toISOString(),
        },
        nextSteps: [
          'View changes: use get_dashboard',
          'Add more components: use add_row_to_page',
          'Test dashboard: Open in reporting platform',
          'Share dashboard: use share_dashboard (if available)',
        ],
      });

      return injectGuidance(
        {
          success: true,
          dashboard_id: validated.dashboard_id,
          operation: validated.operation,
          page_count: pages.length,
          ...(affectedPageId && { page_id: affectedPageId }),
          updated_at: new Date().toISOString(),
        },
        successText
      );
    } catch (error) {
      logger.error('update_dashboard_layout failed', { error });

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
          } else if (field === 'operation') {
            hint = '\nHint: Use one of: add_page, remove_page, update_page, reorder_pages, add_row_to_page, remove_row_from_page, update_component_in_page, set_page_filters, set_component_filters';
          } else if (field === 'data') {
            hint = '\nHint: Check operation-specific data requirements in tool description';
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
