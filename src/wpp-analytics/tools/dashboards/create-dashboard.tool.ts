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
  processLayout,
  processPages,
  generateDashboardId,
} from './helpers.js';
import { randomBytes } from 'crypto';

const logger = getLogger('wpp-analytics.dashboards.create');

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Helper function to recursively inject dataset_id into all components
 */
function injectDatasetId(obj: any, currentDatasetId: string): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => injectDatasetId(item, currentDatasetId));
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = injectDatasetId(obj[key], currentDatasetId);
    }
    // If this is a component object, inject dataset_id
    if (result.type && !result.dataset_id) {
      result.dataset_id = currentDatasetId;
    }
    return result;
  }
  return obj;
}

export const createDashboardTool = {
  name: 'create_dashboard',
  description: `Create a new dashboard in the WPP Analytics Platform with specified layout.

**Purpose:**
Programmatically create dashboards with custom layouts, components, and data sources.
Dashboards are saved to Supabase and immediately accessible in the web UI.
Support interactive filtering via page-level controls that affect all components.

**QUICK START (For Agents) - 3 STEPS TO SUCCESS:**

**Step 1: Get Required Parameters**
- workspaceId: Use list_workspaces tool to get valid UUID
- datasource: MUST use FULL BigQuery reference format
  - ✅ CORRECT: "mcp-servers-475317.wpp_marketing.gsc_performance_shared"
  - ❌ WRONG: "gsc_performance_shared" (will cause validation error)

**Step 2: Build Minimal Dashboard Structure**
\`\`\`json
{
  "title": "My Dashboard",
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "datasource": "mcp-servers-475317.wpp_marketing.gsc_performance_shared",
  "pages": [{
    "name": "Overview",
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
  }]
}
\`\`\`

**Step 3: Verify Success**
- Check returned dashboard_url field
- Open URL in browser to verify components show data
- If components show "No data available", check datasource format

**MANDATORY FIELDS (Will Error Without These):**
1. ✅ **workspaceId**: Valid UUID (get from list_workspaces)
2. ✅ **datasource**: Full BigQuery format (project.dataset.table)
3. ✅ **title**: Dashboard name (1-100 characters)
4. ✅ **At least 1 component**: Must have scorecard, chart, or table

**FLEXIBLE FIELDS (Your Choice):**
- Layout arrangement (rows, columns, widths)
- Styling (themes, colors, fonts)
- Filters (optional, any configuration)
- Component properties (showTitle, showLegend, etc.)

**PROFESSIONAL DEFAULTS - ZERO CONFIGURATION NEEDED:**

The platform applies BI industry best practices automatically. Charts work professionally without any configuration.

**Automatic Sorting:**
- **Pie/Donut Charts** → Top 10 items by metric value (DESC)
- **Bar Charts** → Top 20 items by metric value (DESC)
- **Stacked Bar/Column** → Top 15 items by metric total (DESC)
- **Time-Series (Line/Area)** → Chronological order (date ASC), all data points
- **Tables** → First metric DESC, clickable column headers, 100 rows per page
- **Treemap** → Top 20 items by metric value (DESC)
- **Funnel/Waterfall** → Sequential order preserved (dimension ASC)
- **Heatmap/Radar** → Alphabetical order (dimension ASC)

**Automatic Limits:**
- **Pie/Donut** → 10 items (prevents unreadable legends)
- **Bar Charts** → 20 items (optimal vertical space)
- **Horizontal Bar** → 25 items (more vertical space)
- **Stacked Charts** → 15 items (less space per bar when stacked)
- **Tables** → 100 rows per page with pagination controls
- **Time-Series** → No limit (shows all trend data)
- **Treemap** → 20 items (optimal hierarchy display)

**Automatic Pagination:**
- **Tables** → Enabled automatically for 100+ rows
- **Other Charts** → No pagination (limited by top N)

**Override Only When Needed:**

\`\`\`json
{
  "type": "bar_chart",
  "dataset_id": "abc123",
  "dimension": "country",
  "metrics": ["clicks"],
  // OPTIONAL OVERRIDES (omit to use smart defaults):
  "sortBy": "country",          // Sort alphabetically instead of by metric
  "sortDirection": "ASC",       // Ascending instead of descending
  "limit": 50,                  // Top 50 instead of default 20
  "legendPosition": "bottom"    // Bottom instead of default top-right
}
\`\`\`

**Trust the Platform - These Work Automatically:**
- Top performers shown first (ranking charts)
- Chronological order (time-series)
- Reasonable limits per chart type
- Sortable table columns
- Professional legend positioning
- Pagination for large tables

**IMPORTANT: Page-Level Controls**

Controls are special components that emit filters affecting ALL components on the same page.
Use controls to give users interactive filtering without editing queries.

**Control Types:**

1. **date_range_filter** - Date filtering with optional comparison mode
   - Affects all charts' date ranges dynamically
   - Supports comparison modes (WoW, MoM, YoY)
   - Best for: Dashboards with time-series data
   - Example: User selects "Last 30 Days" → all charts update
   - Properties:
     - title: Control label (optional, default "Date Range")
     - defaultRange: "last7Days", "last30Days", "last90Days", "thisMonth", "lastMonth"
     - showComparison: true/false (adds prior period comparison)
     - dimension: "date" (usually)

2. **checkbox_filter** - Boolean dimension filtering
   - Filter specific dimension by true/false/both
   - Best for: Segment toggles, enabled/disabled states
   - Example: "Active Campaigns Only" checkbox
   - Properties:
     - title: Control label
     - dimension: Field to filter (e.g., "is_active")
     - label: Checkbox label text

3. **list_filter** - Multi-select filtering
   - Select multiple dimension values
   - Best for: Country, device, campaign selection
   - Example: Select countries (USA, UK, Canada)
   - Properties:
     - title: Control label
     - dimension: Field to filter
     - searchable: true/false (enables search box)

4. **dimension_control** - Dynamic dimension switching
   - Switches breakdown dimension across all charts
   - Best for: Exploring data by different attributes
   - Example: Switch from "Country" to "Device" grouping
   - Properties:
     - title: Control label
     - options: ["country", "device", "campaign"] (available dimensions)

5. **slider_filter** - Numeric range filtering
   - Min/max range selection
   - Best for: Cost, impression, click filtering
   - Example: Filter by cost $0-$10,000
   - Properties:
     - title: Control label
     - dimension: Field to filter
     - min: Minimum value
     - max: Maximum value
     - step: Increment step (optional)

**When to Use Controls:**

✓ DO use controls when:
  - Dashboard will be used interactively by practitioners
  - Users need to filter/explore data dynamically
  - Date range needs to be adjustable
  - Multiple charts should respond to same filter
  - Building exploratory or "drill-down" dashboards

✗ DON'T use controls when:
  - Dashboard is static/report-style
  - Specific date range is required (use component-level dateRange instead)
  - Each chart needs independent filtering
  - Dashboard is for automated reporting

**Control Placement:**

Controls are placed in rows like any other component:
\`\`\`json
{
  "rows": [
    {
      "columns": [
        {
          "width": "1/2",
          "component": {
            "type": "date_range_filter",
            "title": "Period",
            "defaultRange": "last30Days",
            "showComparison": true
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "list_filter",
            "title": "Countries",
            "dimension": "country",
            "searchable": true
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "scorecard",
            "title": "Clicks",
            "metrics": ["clicks"]
          }
        }
      ]
    }
  ]
}
\`\`\`

**Component-Level Overrides:**

Individual components can opt-out of page-level filters:
\`\`\`json
{
  "type": "scorecard",
  "title": "All-Time Total",
  "metrics": ["impressions"],
  "usePageFilters": false  // Ignores page controls
}
\`\`\`

Use this sparingly to show context metrics (e.g., year-to-date totals while viewing daily data).

**Comparison Mode:**

When \`showComparison: true\` on date_range_filter, charts automatically display:
- Scorecards: % change badges (e.g., "↑ 15.3% vs previous period")
- Line charts: Dashed comparison line
- Bar charts: Grouped bars (current vs previous)
- Tables: Change % columns

This is powerful for trend analysis.

**Parameters:**
- title: Dashboard name (e.g., "Q4 SEO Performance")
- datasource: BigQuery table to use (default: "gsc_performance_7days")
- rows: Array of row configurations with columns and components
- workspaceId: (Optional) Workspace ID - auto-detected from authenticated user
- supabaseUrl: Supabase project URL (e.g., "https://xxx.supabase.co")
- supabaseKey: Supabase API key (anon or service role key)

**CHARTS (20 types) - Organized by Category:**

**Basic Charts (4):**
- pie_chart: Pie chart for categorical distribution
- donut_chart: Donut chart (pie variant with center hole)
- bar_chart: Vertical bar chart for comparisons
- horizontal_bar: Horizontal bar chart (rotated)

**Stacked Charts (2):**
- stacked_bar: Stacked vertical bars for composition
- stacked_column: Stacked columns (synonym for stacked_bar)

**Time-Series Charts (3):**
- line_chart: Line chart for trends
- area_chart: Filled area chart for trends with accumulation
- time_series: Time-indexed line chart with advanced features

**Advanced Charts (4):**
- scatter_chart: Scatter plot for correlation analysis
- bubble_chart: Bubble chart with 3 dimensions
- heatmap: Color-coded heatmap for matrix data
- waterfall: Waterfall chart for sequential composition

**Hierarchical Charts (3):**
- treemap: Hierarchical rectangular treemap
- sunburst: Hierarchical sunburst/radial chart
- tree: Tree/dendogram visualization

**Specialized Charts (4):**
- sankey: Flow/Sankey diagram
- funnel: Funnel chart for conversion funnels
- geomap: Geographic map visualization
- word_cloud: Word cloud for text analysis

**Data Display (2):**
- table: Data grid with sorting/pagination
- scorecard: Single metric KPI card

**Other Components:**
- title: Dashboard title/header text
- date_range_filter: Date picker with comparison (PAGE CONTROL)
- checkbox_filter: Boolean toggle (PAGE CONTROL)
- list_filter: Multi-select dropdown (PAGE CONTROL)
- dimension_control: Dimension switcher (PAGE CONTROL)
- slider_filter: Numeric range (PAGE CONTROL)

**Column Widths:**
- "1/1": Full width (12 columns)
- "1/2": Half width (6 columns)
- "1/3": One third (4 columns)
- "2/3": Two thirds (8 columns)
- "1/4": One quarter (3 columns)
- "3/4": Three quarters (9 columns)

**Example 1: Simple Dashboard with Date Control**
\`\`\`json
{
  "title": "SEO Performance Dashboard",
  "datasource": "gsc_performance_7days",
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
            "type": "date_range_filter",
            "defaultRange": "last30Days"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Clicks",
            "metrics": ["clicks"]
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Impressions",
            "metrics": ["impressions"]
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "CTR",
            "metrics": ["ctr"]
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

**Example 2: Interactive Dashboard with Multiple Controls**
\`\`\`json
{
  "title": "Campaign Performance Dashboard",
  "datasource": "google_ads_campaigns",
  "rows": [
    {
      "columns": [
        {
          "width": "2/3",
          "component": {
            "type": "title",
            "title": "Campaign Performance"
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "date_range_filter",
            "defaultRange": "last30Days",
            "showComparison": true
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/2",
          "component": {
            "type": "list_filter",
            "title": "Campaigns",
            "dimension": "campaign_name",
            "searchable": true
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "list_filter",
            "title": "Status",
            "dimension": "campaign_status",
            "searchable": false
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
            "title": "Clicks",
            "metrics": ["clicks"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Cost",
            "metrics": ["cost"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Conversions",
            "metrics": ["conversions"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "ROAS",
            "metrics": ["roas"]
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
            "title": "Daily Performance",
            "dimension": "date",
            "metrics": ["clicks", "cost", "conversions"]
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "table",
            "title": "Campaign Details",
            "dimension": "campaign_name",
            "metrics": ["clicks", "cost", "conversions", "roas"]
          }
        }
      ]
    }
  ]
}
\`\`\`

**Example 3: Dashboard with Component Override**
\`\`\`json
{
  "title": "Quarterly Analysis",
  "datasource": "analytics_data",
  "rows": [
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "date_range_filter",
            "title": "Current Period",
            "defaultRange": "thisMonth"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "This Month",
            "metrics": ["revenue"]
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Year-to-Date",
            "metrics": ["revenue"],
            "usePageFilters": false
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Last Year (YTD)",
            "metrics": ["revenue"],
            "usePageFilters": false
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
1. Place controls in first row (after title) for visibility
2. Use date_range_filter on most dashboards with time-series data
3. Combine 2-3 controls maximum to avoid filter fatigue
4. Test comparison mode to ensure charts display correctly
5. Use component overrides (usePageFilters: false) sparingly
6. Limit to 10-15 components per dashboard for performance
7. Group related metrics together in rows
8. Provide sensible default ranges/values for controls

**Control Design Patterns:**
- Header: Title + date filter (3/4 + 1/4)
- KPI section: 4x 1/4 scorecards
- Exploration controls: 2-3 filters side-by-side (1/2 or 1/3 width)
- Chart comparison: 2x 1/2 charts side-by-side
- Detailed table: 1x 1/1 full-width table

**Error Handling:**
- Returns error if Supabase connection fails
- Validates all component types and configurations
- Checks workspace access permissions
- Verifies datasource exists in BigQuery
- Validates control dimension references

**TROUBLESHOOTING - Common Errors & Solutions:**

**Error: "workspaceId must be valid UUID and is required for multi-tenant isolation"**
→ Solution: Run list_workspaces tool to get valid workspace UUID
→ Make sure workspaceId is provided and is a valid UUID format

**Error: "datasource must be full BigQuery reference in format: project.dataset.table"**
→ Solution: Change from table name to full format:
   - ❌ Wrong: "gsc_performance_shared"
   - ✅ Correct: "mcp-servers-475317.wpp_marketing.gsc_performance_shared"

**Error: "Dashboard must have at least one component"**
→ Solution: Add at least one scorecard, chart, or table to pages[0].rows
→ Empty dashboards are not allowed - must have visualizations

**Error: "Workspace not found"**
→ Solution: Verify workspace ID is correct by running list_workspaces
→ Make sure you have access to the workspace

**Components show "No data available"**
→ Solution 1: Check datasource uses full BigQuery reference (project.dataset.table)
→ Solution 2: Verify workspace_id matches data in BigQuery table
→ Solution 3: Check that dataset_id was properly injected into components

**Dashboard created but components missing dataset_id**
→ Solution: Ensure datasource uses full BigQuery format (not just table name)
→ The tool auto-creates/reuses dataset entries based on BigQuery table reference

**EXAMPLE: Creating Dashboard with Shared Table (Table Sharing)**

This example shows how multiple dashboards can share the same BigQuery table
without creating duplicate dataset entries, reducing storage costs:

\`\`\`json
// First dashboard using GSC data
{
  "title": "GSC Performance Dashboard",
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "datasource": "mcp-servers-475317.wpp_marketing.gsc_performance_shared",
  "pages": [{
    "name": "Overview",
    "rows": [{
      "columns": [{
        "width": "1/2",
        "component": {
          "type": "scorecard",
          "title": "Total Clicks",
          "metrics": ["clicks"]
        }
      }, {
        "width": "1/2",
        "component": {
          "type": "scorecard",
          "title": "Total Impressions",
          "metrics": ["impressions"]
        }
      }]
    }]
  }]
}

// Second dashboard using SAME BigQuery table
{
  "title": "GSC Quick Overview",
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "datasource": "mcp-servers-475317.wpp_marketing.gsc_performance_shared",  // Same table!
  "pages": [{
    "name": "Quick Stats",
    "rows": [{
      "columns": [{
        "width": "1/1",
        "component": {
          "type": "table",
          "title": "Top Pages",
          "dimension": "page",
          "metrics": ["clicks", "impressions"]
        }
      }]
    }]
  }]
}

// Result: Both dashboards share the SAME dataset_id
// No duplicate data, reduced storage costs, consistent data!
\`\`\``,

  inputSchema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description: 'Dashboard title (1-100 characters)',
      },
      description: {
        type: 'string',
        description: 'Dashboard description (optional)',
      },
      datasource: {
        type: 'string',
        description: 'BigQuery table name (REQUIRED - e.g., "gsc_performance_shared")',
      },
      dataset_id: {
        type: 'string',
        description: 'Dataset UUID (optional - links to datasets table)',
      },
      pages: {
        type: 'array',
        description: 'Array of page configurations (multi-page dashboards)',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Page name (e.g., "Overview", "Performance")',
            },
            order: {
              type: 'number',
              description: 'Page order (0, 1, 2...) - optional, defaults to array index',
            },
            filters: {
              type: 'array',
              description: 'Page-level filters (optional)',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  operator: { type: 'string' },
                  values: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            pageStyles: {
              type: 'object',
              description: 'Page-level style overrides (optional)',
              properties: {
                backgroundColor: { type: 'string' },
                padding: { type: 'number' },
                gap: { type: 'number' },
              },
            },
            rows: {
              type: 'array',
              description: 'Array of row configurations for this page',
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
          },
          required: ['name', 'rows'],
        },
      },
      rows: {
        type: 'array',
        description: 'Array of row configurations (legacy single-page - use pages for new dashboards)',
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
      theme: {
        type: 'object',
        description: 'Dashboard theme (optional)',
        properties: {
          primaryColor: { type: 'string' },
          backgroundColor: { type: 'string' },
          textColor: { type: 'string' },
          borderColor: { type: 'string' },
        },
      },
      globalStyles: {
        type: 'object',
        description: 'Global dashboard styles (optional)',
        properties: {
          backgroundColor: { type: 'string' },
          padding: { type: 'number' },
          gap: { type: 'number' },
        },
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace ID (REQUIRED)',
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
    required: ['title', 'workspaceId', 'datasource'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = CreateDashboardSchema.parse(input);

      logger.info('create_dashboard called', {
        title: validated.title,
        datasource: validated.datasource,
        hasPages: !!validated.pages,
        hasRows: !!validated.rows,
      });

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

      // Get workspace (now required - no auto-creation)
      const workspaceId = validated.workspaceId;
      if (!workspaceId) {
        throw new Error('workspaceId is required');
      }

      // Pre-flight check: Verify workspace exists
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .single();

      if (workspaceError || !workspace) {
        throw new Error(
          `Workspace not found: ${workspaceId}\n` +
          `Hint: Run list_workspaces tool to see available workspaces`
        );
      }

      logger.info('Workspace verified', { workspaceId });

      // Generate dashboard ID
      const dashboardId = generateDashboardId();

      // Parse BigQuery table reference
      const [projectId, datasetIdBq, tableId] = validated.datasource.split('.');

      // Handle dataset registration for table sharing (gracefully skip if datasets table doesn't exist)
      let finalDatasetId = validated.dataset_id;

      if (!finalDatasetId && projectId && datasetIdBq && tableId) {
        // Check if dataset already exists for this BigQuery table
        try {
          const { data: existingDataset, error: datasetQueryError } = await supabase
            .from('datasets')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('bigquery_project_id', projectId)
            .eq('bigquery_dataset_id', datasetIdBq)
            .eq('bigquery_table_id', tableId)
            .single();

          if (existingDataset) {
            // Reuse existing dataset (table sharing enabled!)
            finalDatasetId = existingDataset.id;
            logger.info('Reusing existing dataset (table sharing)', {
              dataset_id: finalDatasetId,
              bigquery_table: tableId
            });
          } else if (!datasetQueryError || datasetQueryError.code === 'PGRST116') {
            // Create new dataset entry (PGRST116 = row not found, which is OK)
            finalDatasetId = generateUUID();
            const { error: datasetInsertError } = await supabase
              .from('datasets')
              .insert({
                id: finalDatasetId,
                workspace_id: workspaceId,
                name: `${validated.title} - Dataset`,
                bigquery_project_id: projectId,
                bigquery_dataset_id: datasetIdBq,
                bigquery_table_id: tableId,
                platform_metadata: { platform: 'auto-created' },
                refresh_interval_days: 1
              })
              .select()
              .single();

            if (!datasetInsertError) {
              logger.info('Created new dataset entry', {
                dataset_id: finalDatasetId,
                bigquery_table: tableId
              });
            } else {
              logger.warn('Dataset insert failed (table might not exist yet), continuing without dataset_id', {
                error: datasetInsertError.message
              });
              finalDatasetId = undefined; // Continue without dataset_id if table doesn't exist
            }
          }
        } catch (err: any) {
          // Gracefully handle case where datasets table doesn't exist yet
          logger.warn('Dataset registration skipped (datasets table might not exist)', {
            hint: 'Run migration: supabase/migrations/20251029000000_add_datasets.sql',
            error: err.message
          });
          finalDatasetId = undefined;
        }
      }

      // Process layout - support both multi-page and legacy single-page
      let processedPages;
      let processedRows;
      let componentCount = 0;
      let pageCount = 0;

      // If pages provided, use multi-page structure
      if (validated.pages && validated.pages.length > 0) {
        processedPages = processPages(validated.pages as any);

        // Inject dataset_id into all components if we have one
        if (finalDatasetId) {
          processedPages = injectDatasetId(processedPages, finalDatasetId);
        }

        pageCount = processedPages.length;

        // Count components across all pages
        componentCount = processedPages.reduce(
          (sum: number, page: any) => sum + page.rows.reduce(
            (rowSum: number, row: any) => rowSum + row.columns.filter((col: any) => col.component).length,
            0
          ),
          0
        );

        logger.info('Processing multi-page dashboard', {
          pageCount,
          componentCount,
        });
      }
      // If only rows provided (legacy), wrap in single page
      else if (validated.rows && validated.rows.length > 0) {
        processedRows = processLayout(validated.rows as any);

        // Inject dataset_id into rows if we have one
        if (finalDatasetId) {
          processedRows = injectDatasetId(processedRows, finalDatasetId);
        }

        // Wrap legacy rows in a single page
        processedPages = [{
          id: generateDashboardId(),
          name: 'Page 1',
          order: 0,
          filters: [],
          rows: processedRows,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
        pageCount = 1;

        // Count components in single page
        componentCount = processedRows.reduce(
          (sum: number, row: any) => sum + row.columns.filter((col: any) => col.component).length,
          0
        );

        logger.info('Processing legacy single-page dashboard', {
          rowCount: processedRows.length,
          componentCount,
        });
      }
      // If neither, create empty page
      else {
        processedPages = [{
          id: generateDashboardId(),
          name: 'Page 1',
          order: 0,
          filters: [],
          rows: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
        pageCount = 1;
        componentCount = 0;

        logger.info('Creating empty dashboard');
      }

      // Build config object with pages (new format)
      const config: any = {
        datasource: validated.datasource,
        dataset_id: finalDatasetId,
        pages: processedPages, // Always save as pages (with dataset_id injected into components)
        theme: validated.theme,
        globalStyles: validated.globalStyles,
      };

      // Save to Supabase
      const { error } = await supabase
        .from('dashboards')
        .insert([
          {
            id: dashboardId,
            name: validated.title,
            description: validated.description,
            workspace_id: workspaceId,
            bigquery_table: validated.datasource,
            dataset_id: finalDatasetId || null, // Link to dataset for table sharing
            config: config, // Store full config object in config column
            filters: {}, // No global filters
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
        pageCount,
        componentCount,
      });

      return {
        success: true,
        dashboard_id: dashboardId,
        dashboard_url: `/dashboard/${dashboardId}/builder`,
        workspace_id: workspaceId,
        page_count: pageCount,
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
