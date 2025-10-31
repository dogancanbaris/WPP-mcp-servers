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

const logger = getLogger('wpp-analytics.dashboards.update');

export const updateDashboardLayoutTool = {
  name: 'update_dashboard_layout',
  description: `Modify existing dashboard layout with multi-page architecture support.

**Purpose:**
Update dashboard structure without recreating from scratch. Supports both legacy
(flat rows) and new multi-page dashboards. All operations work with pages structure.

**IMPORTANT - Multi-Page Architecture:**
- All dashboards use config.pages[] structure (not config.rows)
- Each page has its own rows, filters, and styles
- Operations require page_id to specify which page to modify
- Legacy dashboards auto-migrate to pages structure on first update

**Page Management Operations:**

1. **add_page**: Create new page in dashboard
   - data: { name: string, order?: number, filters?: [], rows?: [] }

2. **remove_page**: Delete page by ID
   - data: { page_id: string }

3. **update_page**: Update page properties (name, filters, styles)
   - data: { page_id: string, name?: string, filters?: [], pageStyles?: {} }

4. **reorder_pages**: Change page order
   - data: { page_order: ["page-id-1", "page-id-2", ...] }

**Row Operations (within specific page):**

5. **add_row_to_page**: Append row to specific page
   - data: { page_id: string, columns: [...] }

6. **remove_row_from_page**: Delete row from specific page
   - data: { page_id: string, row_id: string }

**Component Operations (within specific page):**

7. **update_component_in_page**: Modify component in specific page
   - data: { page_id: string, component_id: string, component: {...} }

**Filter Operations:**

8. **set_page_filters**: Set page-level filters
   - data: { page_id: string, filters: [...] }

9. **set_component_filters**: Set component-level filters
   - data: { page_id: string, component_id: string, filters: [...] }

**Parameters:**
- dashboard_id: UUID of dashboard to modify (required)
- workspaceId: UUID of workspace for access control (required)
- operation: Type of modification (see operations above)
- data: Operation-specific data (see examples below)
- supabaseUrl: Supabase project URL (optional)
- supabaseKey: Supabase API key (optional)

**QUICK START (For Agents) - 3 STEPS:**

**Step 1: Get Dashboard Structure**
Use get_dashboard to see current layout and get IDs:
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`
Note the page_id, row_id, or component_id you want to modify, and the workspace_id.

**Step 2: Choose Operation**
- add_page: Add new page to dashboard
- update_page: Change page name, filters, or styles
- add_row_to_page: Add new row with components to specific page
- update_component_in_page: Modify existing component in specific page
- set_page_filters: Add filters affecting entire page

**Step 3: Execute Update**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "operation": "add_row_to_page",
  "data": {
    "page_id": "page-abc123",
    "columns": [...]
  }
}
\`\`\`

**MANDATORY FIELDS (Will Error Without These):**
1. ✅ **dashboard_id**: Valid UUID (get from list_dashboards or get_dashboard)
2. ✅ **workspaceId**: Valid UUID (required for access control)
3. ✅ **operation**: One of the 9 supported operations
4. ✅ **data**: Operation-specific data (varies by operation)

**FLEXIBLE FIELDS (Your Choice):**
- What operation to use (based on what you want to modify)
- Data structure (depends on operation - see examples)
- Styling and themes (in update_page operation)

**TROUBLESHOOTING - Common Errors & Solutions:**

**Error: "dashboard_id must be valid UUID"**
→ Solution: Use list_dashboards to get valid UUID
→ UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

**Error: "workspaceId must be valid UUID and is required for access control"**
→ Solution: Run list_workspaces to get valid workspace UUID
→ Required to prevent unauthorized modifications
→ Must match the dashboard's workspace

**Error: "Workspace not found"**
→ Solution: Verify workspace ID with list_workspaces tool
→ Check you have access to this workspace

**Error: "Dashboard not found in workspace"**
→ Solution: Dashboard may be in different workspace
→ Run get_dashboard(dashboard_id) to check which workspace it belongs to
→ Verify you have access to that workspace

**Error: "Page not found"**
→ Solution: Run get_dashboard to see available page IDs
→ Use exact page_id from the response.pages[] array
→ Page IDs are UUIDs, not page names

**Error: "Component not found"**
→ Solution: Run get_dashboard to see available component IDs
→ Navigate to pages[].rows[].columns[].component.id
→ Component IDs are generated hashes, get from dashboard structure

**Error: "Cannot remove the last page"**
→ Solution: Dashboard must have at least one page
→ Add a new page before removing the last one
→ Use add_page operation first, then remove_page

**Error: "Page name is required for add_page operation"**
→ Solution: Include name in data: { name: "My Page", rows: [...] }
→ Page names help organize multi-page dashboards

**Example 1: Add Page**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "add_page",
  "data": {
    "name": "Performance Metrics",
    "order": 1,
    "rows": [{
      "columns": [{
        "width": "1/1",
        "component": {
          "type": "scorecard",
          "title": "Total Clicks",
          "metrics": ["clicks"]
        }
      }]
    }]
  }
}
\`\`\`

**Example 2: Add Row to Page**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "add_row_to_page",
  "data": {
    "page_id": "page-abc123",
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
  }
}
\`\`\`

**Example 3: Update Component in Page**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "update_component_in_page",
  "data": {
    "page_id": "page-abc123",
    "component_id": "col-xyz789",
    "component": {
      "type": "scorecard",
      "title": "Updated Clicks",
      "metrics": ["clicks", "impressions"]
    }
  }
}
\`\`\`

**Example 4: Set Page Filters**
\`\`\`json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "set_page_filters",
  "data": {
    "page_id": "page-abc123",
    "filters": [
      {
        "field": "country",
        "operator": "in",
        "values": ["US", "UK", "CA"]
      }
    ]
  }
}
\`\`\`

**Returns:**
- success: Boolean indicating if operation succeeded
- dashboard_id: ID of modified dashboard
- operation: Operation that was performed
- page_count: Number of pages in dashboard
- updated_at: Timestamp of modification

**Best Practices:**
1. Load dashboard first to understand current structure
2. Specify page_id for all row/component operations
3. Use page filters for page-wide filtering
4. Use component filters for component-specific overrides
5. Test changes in development workspace first

**Error Handling:**
- Returns error if dashboard not found
- Returns error if page_id not found
- Validates operation-specific data
- Auto-migrates legacy dashboards to pages structure
- Ensures workspace access permissions`,

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
    required: ['dashboard_id', 'workspaceId', 'operation', 'data'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = UpdateDashboardLayoutSchema.parse(input);

      logger.info('update_dashboard_layout called', {
        dashboardId: validated.dashboard_id,
        workspaceId: validated.workspaceId,
        operation: validated.operation,
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

      return {
        success: true,
        dashboard_id: validated.dashboard_id,
        operation: validated.operation,
        page_count: pages.length,
        ...(affectedPageId && { page_id: affectedPageId }),
        updated_at: new Date().toISOString(),
      };
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
