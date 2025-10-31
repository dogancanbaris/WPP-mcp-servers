/**
 * Create Dashboard from BigQuery Table MCP Tool
 *
 * Generates SQL to create a dashboard from an existing BigQuery table.
 * Returns SQL for agent to execute via mcp__supabase__execute_sql.
 */

import { getLogger } from '../../shared/logger.js';
import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../shared/interactive-workflow.js';

const logger = getLogger('wpp-analytics.create-dashboard-from-table');

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

// Executive summary removed - agent provides their own description text

// Templates - DATA ONLY, NO STYLING
// ALL styling applied by reporting platform components from global theme
const SEO_OVERVIEW_TEMPLATE = {
  rows: [
    // Row 1: Header (components will auto-apply header theme)
    {
      id: 'row-header',
      columns: [
        { id: 'col-header-title', width: '3/4', component: { type: 'title', title: '{{TITLE}}', componentRole: 'header' }},
        { id: 'col-header-date', width: '1/4', component: { type: 'date_range_filter', initialRange: '{{DATE_RANGE}}' }}
      ]
    },
    // Row 2: Description (component will auto-apply description theme)
    {
      id: 'row-description',
      columns: [
        { id: 'col-description', width: '1/1', component: { type: 'title', title: '{{DESCRIPTION}}', componentRole: 'description' }}
      ]
    },
    // Row 3: Scorecards (components will auto-apply scorecard theme)
    {
      id: 'row-scorecards',
      columns: [
        { id: 'col-sc-impressions', width: '1/4', component: { type: 'scorecard', title: 'Total Impressions', dataset_id: '{{DATASET_ID}}', metrics: ['impressions'], dateRange: '{{DATE_RANGE}}' }},
        { id: 'col-sc-clicks', width: '1/4', component: { type: 'scorecard', title: 'Total Clicks', dataset_id: '{{DATASET_ID}}', metrics: ['clicks'], dateRange: '{{DATE_RANGE}}' }},
        { id: 'col-sc-position', width: '1/4', component: { type: 'scorecard', title: 'Avg Position', dataset_id: '{{DATASET_ID}}', metrics: ['position'], dateRange: '{{DATE_RANGE}}' }},
        { id: 'col-sc-ctr', width: '1/4', component: { type: 'scorecard', title: 'Click-Through Rate', dataset_id: '{{DATASET_ID}}', metrics: ['ctr'], dateRange: '{{DATE_RANGE}}' }}
      ]
    },
    // Row 4: Time Series (component will auto-apply chart theme)
    {
      id: 'row-timeseries',
      columns: [
        { id: 'col-timeseries', width: '1/1', component: { type: 'time_series', title: 'Performance Trend - Last 3 Months', dataset_id: '{{DATASET_ID}}', dimension: 'date', metrics: ['clicks', 'impressions'], dateRange: '{{DATE_RANGE}}' }}
      ]
    },
    // Row 5: Tables (components will auto-apply table theme)
    {
      id: 'row-tables',
      columns: [
        { id: 'col-table-pages', width: '1/2', component: { type: 'table', title: 'Top Landing Pages', dataset_id: '{{DATASET_ID}}', dimension: 'page', metrics: ['clicks', 'impressions', 'ctr'], dateRange: '{{DATE_RANGE}}' }},
        { id: 'col-table-queries', width: '1/2', component: { type: 'table', title: 'Top Search Queries', dataset_id: '{{DATASET_ID}}', dimension: 'query', metrics: ['clicks', 'impressions', 'position'], dateRange: '{{DATE_RANGE}}' }}
      ]
    },
    // Row 6: Pies (components will auto-apply pie theme)
    {
      id: 'row-pies',
      columns: [
        { id: 'col-pie-device', width: '1/2', component: { type: 'pie_chart', title: 'Traffic by Device', dataset_id: '{{DATASET_ID}}', dimension: 'device', metrics: ['clicks'], dateRange: '{{DATE_RANGE}}' }},
        { id: 'col-pie-country', width: '1/2', component: { type: 'pie_chart', title: 'Traffic by Country', dataset_id: '{{DATASET_ID}}', dimension: 'country', metrics: ['clicks'], dateRange: '{{DATE_RANGE}}' }}
      ]
    }
  ]
};

export const createDashboardFromTableTool = {
  name: 'create_dashboard_from_table',
  description: 'Create dashboard from existing BigQuery table.',

  inputSchema: {
    type: 'object' as const,
    properties: {
      bigqueryTable: { type: 'string', description: 'Full BigQuery table reference' },
      title: { type: 'string', description: 'Dashboard title (agent writes)' },
      description: { type: 'string', description: 'Executive summary/description text (agent writes full text with formatting)' },
      dateRange: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
      platform: { type: 'string', enum: ['gsc', 'google_ads', 'analytics'] },
      workspace_id: { type: 'string' },

      // NEW: Multi-page support
      pages: {
        type: 'array',
        description: 'Array of page configurations (optional - if not provided, creates single page)',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Page name' },
            template: { type: 'string', description: 'Template ID for this page (optional)' },
            filters: {
              type: 'array',
              description: 'Page-level filters (optional)',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  operator: { type: 'string' },
                  values: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          },
          required: ['name']
        }
      },

      // Keep template for backward compatibility (single page)
      template: { type: 'string', description: 'Template ID (for single-page dashboards - e.g., "seo_overview")' },
      rows: { type: 'array', description: 'Custom rows (advanced usage - if not using template)' }
    },
    required: []
  },

  async handler(input: any) {
    try {
      // Initialize Supabase for discovery queries
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // ═══ DISCOVERY MODE: Guide step-by-step if params missing ═══

      // STEP 1: Workspace Discovery
      if (!input.workspace_id) {
        const { data: workspaces } = await supabase
          .from('workspaces')
          .select('id, name')
          .limit(20);

        return formatDiscoveryResponse({
          step: '1/5',
          title: 'SELECT WORKSPACE',
          items: workspaces || [],
          itemFormatter: (w, i) => `${i + 1}. ${w.name || 'Unnamed'} (ID: ${w.id})`,
          prompt: 'Which workspace should contain this dashboard?',
          nextParam: 'workspace_id',
        });
      }

      // STEP 2: BigQuery Table Discovery
      if (!input.bigqueryTable) {
        // Query datasets table to show available BigQuery tables
        const { data: datasets } = await supabase
          .from('datasets')
          .select('id, platform, bigquery_table, created_at')
          .eq('workspace_id', input.workspace_id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!datasets || datasets.length === 0) {
          return injectGuidance({}, `💾 NO BIGQUERY TABLES FOUND (Step 2/5)

Workspace: ${input.workspace_id}

No BigQuery tables exist yet. You need to push data first.

💡 Push data to BigQuery:
- Use: push_platform_data_to_bigquery

Then return to create dashboard from the table.

Or provide a BigQuery table name directly (format: "project.dataset.table")`);
        }

        return formatDiscoveryResponse({
          step: '2/5',
          title: 'SELECT BIGQUERY TABLE',
          items: datasets,
          itemFormatter: (d, i) => `${i + 1}. ${d.platform.toUpperCase()} - ${d.bigquery_table}
   Created: ${new Date(d.created_at).toLocaleDateString()}`,
          prompt: 'Which table contains the data for this dashboard?',
          nextParam: 'bigqueryTable',
          context: { workspace_id: input.workspace_id }
        });
      }

      // STEP 3: Platform Selection
      if (!input.platform) {
        return injectGuidance({}, `📊 SELECT PLATFORM (Step 3/5)

BigQuery Table: ${input.bigqueryTable}

Which platform is this data from?

**Options:**
1. **gsc** - Google Search Console
2. **google_ads** - Google Ads
3. **analytics** - Google Analytics 4

💡 Platform determines which chart templates and metrics are available.

Provide: platform (e.g., "gsc", "google_ads", "analytics")`);
      }

      // STEP 4: Dashboard Title
      if (!input.title) {
        return injectGuidance({}, `📝 DASHBOARD TITLE (Step 4/5)

Enter a descriptive title for this dashboard.

**Examples:**
- "Search Performance - ClientA.com"
- "Google Ads Campaign Analysis - Q4 2025"
- "Multi-Channel Analytics Dashboard"
- "Weekly SEO Report"

💡 Make it descriptive and include:
- Platform name (SEO, Ads, Analytics)
- Client/property name
- Time period or purpose

What should the dashboard be titled?`);
      }

      // STEP 5: Date Range
      if (!input.dateRange || !Array.isArray(input.dateRange) || input.dateRange.length !== 2) {
        return injectGuidance({}, `📅 DATE RANGE (Step 5/5)

Provide date range as array: [startDate, endDate]

**Quick Options:**
- Last 7 days: ["2025-10-24", "2025-10-31"]
- Last 30 days: ["2025-10-01", "2025-10-31"]
- Last 90 days: ["2025-08-02", "2025-10-31"]

**Custom Range:**
Format: ["YYYY-MM-DD", "YYYY-MM-DD"]

💡 Dashboard will use date presets (last7Days, last30Days) for dynamic updates.

What date range should I use?`);
      }

      // ═══ EXECUTION MODE: All params provided ═══

      const workspaceId = input.workspace_id;
      const dashboardId = generateUUID();
      const datasetId = generateUUID();
      const [projectId, datasetIdBq, tableId] = input.bigqueryTable.split('.');

      // Use agent-provided description or default
      const description = input.description || 'Dashboard showing performance metrics for the selected time period.';

      // Helper function to recursively replace template variables
      function replaceTemplateVars(obj: any): any {
        if (typeof obj === 'string') {
          return obj
            .replace(/\{\{DATASET_ID\}\}/g, datasetId)
            .replace(/\{\{DATE_RANGE\}\}/g, JSON.stringify(input.dateRange))
            .replace(/\{\{TITLE\}\}/g, input.title)
            .replace(/\{\{DESCRIPTION\}\}/g, description);
        }
        if (Array.isArray(obj)) {
          return obj.map(replaceTemplateVars);
        }
        if (obj && typeof obj === 'object') {
          const result: any = {};
          for (const key in obj) {
            result[key] = replaceTemplateVars(obj[key]);
          }
          return result;
        }
        return obj;
      }

      // Helper function to get template rows by template ID
      function getTemplateRows(templateId: string) {
        switch (templateId) {
          case 'seo_overview':
          case 'seo_overview_summary':
          case 'seo_queries_detail':
          case 'seo_pages_detail':
            return SEO_OVERVIEW_TEMPLATE.rows;
          // Add more templates as needed
          default:
            return SEO_OVERVIEW_TEMPLATE.rows;
        }
      }

      // DETECT: Multi-page vs single-page
      let pages: any[];

      if (input.pages && Array.isArray(input.pages) && input.pages.length > 0) {
        // MULTI-PAGE MODE
        pages = input.pages.map((pageInput: any, index: number) => {
          const templateRows = pageInput.template
            ? getTemplateRows(pageInput.template)
            : SEO_OVERVIEW_TEMPLATE.rows;

          return {
            id: generateUUID(),
            name: pageInput.name,
            order: index,
            rows: replaceTemplateVars(templateRows),
            filters: pageInput.filters || [],
            createdAt: new Date().toISOString()
          };
        });
      } else {
        // SINGLE-PAGE MODE (backward compatible)
        const templateRows = input.template === 'seo_overview' ? SEO_OVERVIEW_TEMPLATE.rows : input.rows;

        if (!templateRows) {
          return { success: false, error: 'Either template, rows, or pages required' };
        }

        pages = [
          {
            id: generateUUID(),
            name: 'Page 1',
            order: 0,
            rows: replaceTemplateVars(templateRows),
            filters: [],
            createdAt: new Date().toISOString()
          }
        ];
      }

      const config = {
        title: input.title,
        pages, // NEW: Use pages instead of rows
        theme: { primaryColor: '#191D63' }
      };

      // Supabase already initialized at top of handler for discovery
      // Reuse the same client for execution

      // Insert dataset
      const { error: datasetError } = await supabase
        .from('datasets')
        .insert({
          id: datasetId,
          workspace_id: workspaceId,
          name: `${input.title} - Dataset`,
          bigquery_project_id: projectId,
          bigquery_dataset_id: datasetIdBq,
          bigquery_table_id: tableId,
          platform_metadata: { platform: input.platform, property: 'auto-created' },
          refresh_interval_days: 1
        })
        .select()
        .single();

      if (datasetError) {
        logger.error('[create_dashboard_from_table] Dataset insert failed', { error: datasetError });
        return {
          success: false,
          error: `Failed to create dataset: ${datasetError.message}`
        };
      }

      // Insert dashboard
      const { error: dashboardError } = await supabase
        .from('dashboards')
        .insert({
          id: dashboardId,
          name: input.title,
          description: 'Dashboard created via MCP tool',
          workspace_id: workspaceId,
          dataset_id: datasetId,
          config: config
        })
        .select()
        .single();

      if (dashboardError) {
        logger.error('[create_dashboard_from_table] Dashboard insert failed', { error: dashboardError });
        return {
          success: false,
          error: `Failed to create dashboard: ${dashboardError.message}`
        };
      }

      logger.info('[create_dashboard_from_table] Dashboard created successfully', {
        dashboard_id: dashboardId,
        dataset_id: datasetId
      });

      const pageCount = config.pages?.length || 1;
      const componentCount = config.pages?.reduce((sum: number, p: any) =>
        sum + p.rows.reduce((rowSum: number, r: any) => rowSum + r.columns.length, 0), 0
      ) || 0;

      const successText = formatSuccessSummary({
        title: 'Dashboard Created Successfully',
        operation: 'create_dashboard_from_table',
        details: {
          'Dashboard Name': input.title,
          'Dashboard ID': dashboardId,
          'Dataset ID': datasetId,
          'BigQuery Table': input.bigqueryTable,
          'Platform': input.platform.toUpperCase(),
          'Pages': pageCount.toString(),
          'Components': componentCount.toString(),
          'Builder URL': `http://localhost:3000/dashboard/${dashboardId}/builder`,
          'View URL': `http://localhost:3000/dashboard/${dashboardId}/view`,
        },
        nextSteps: [
          'View dashboard: Open the View URL in browser',
          'Edit layout: Open the Builder URL to customize',
          'Add components: use update_dashboard_layout',
          'Share dashboard: Configure sharing permissions',
          'Test with filters: Dashboard includes date range control',
        ],
      });

      return injectGuidance(
        {
          success: true,
          dashboard_id: dashboardId,
          dataset_id: datasetId,
          dashboard_url: `http://localhost:3000/dashboard/${dashboardId}/builder`,
          view_url: `http://localhost:3000/dashboard/${dashboardId}/view`,
        },
        successText
      );

    } catch (error) {
      logger.error('[create_dashboard_from_table] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

export const dashboardCreationTools = [
  createDashboardFromTableTool
];
