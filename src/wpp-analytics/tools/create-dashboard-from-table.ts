/**
 * Create Dashboard from BigQuery Table MCP Tool
 *
 * Generates SQL to create a dashboard from an existing BigQuery table.
 * Returns SQL for agent to execute via mcp__supabase__execute_sql.
 */

import { getLogger } from '../../shared/logger.js';
import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

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
  description: `Create dashboard from existing BigQuery table.

**Purpose:**
Second step in dashboard creation - creates dashboard from data already in BigQuery.
Supports both single-page and multi-page dashboards.

**WHEN TO USE MULTIPLE PAGES:**

Use multi-page dashboards when:
- Dashboard has 10+ components (split into logical pages)
- Different audiences need different views (Overview for executives, Details for analysts)
- Distinct data domains (Traffic, Conversions, Technical in separate pages)

**SINGLE-PAGE EXAMPLE:**
\`\`\`json
{
  "bigqueryTable": "project.dataset.table",
  "title": "SEO Dashboard",
  "template": "seo_overview",
  "dateRange": ["2024-01-01", "2024-12-31"],
  "platform": "gsc"
}
\`\`\`

**MULTI-PAGE EXAMPLE:**
\`\`\`json
{
  "bigqueryTable": "project.dataset.table",
  "title": "SEO Performance Dashboard",
  "dateRange": ["2024-01-01", "2024-12-31"],
  "platform": "gsc",
  "pages": [
    {
      "name": "Overview",
      "template": "seo_overview_summary"
    },
    {
      "name": "Query Analysis",
      "template": "seo_queries_detail",
      "filters": [{ "field": "impressions", "operator": "gt", "values": ["100"] }]
    },
    {
      "name": "Page Performance",
      "template": "seo_pages_detail"
    }
  ]
}
\`\`\`

**FILTER HIERARCHY:**
Filters apply at 3 levels (Component > Page > Global):
- Global filters: Applied at dashboard level (entire dashboard)
- Page filters: Override global for specific page
- Component filters: Override page for specific component

**BEST PRACTICES:**
1. Start with broad filters (global date range)
2. Add page filters for page-specific context (e.g., filter to high-traffic pages on one page)
3. Use component filters sparingly (only when truly different from page)
4. Keep pages focused (4-8 components per page ideal)
5. Name pages clearly (Overview, Details, Analysis, Technical, etc.)

**Parameters:**
- bigqueryTable: Full table reference (e.g., "project.dataset.table")
- template: Template ID (for single-page dashboards)
- pages: Array of page configurations (for multi-page dashboards)
- title: Dashboard title
- dateRange: [startDate, endDate]
- platform: Platform type ("gsc", "google_ads", "analytics")

**Returns:**
Dashboard ID, dataset ID, and URLs for viewing/editing`,

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
    required: ['bigqueryTable', 'title', 'dateRange', 'platform']
  },

  async handler(input: any) {
    try {
      const workspaceId = input.workspace_id || '945907d8-7e88-45c4-8fde-9db35d5f5ce2';
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

      // Initialize Supabase from ENV
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return {
          success: false,
          error: 'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        };
      }

      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });

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

      return {
        success: true,
        dashboard_id: dashboardId,
        dataset_id: datasetId,
        dashboard_url: `http://localhost:3000/dashboard/${dashboardId}/builder`,
        view_url: `http://localhost:3000/dashboard/${dashboardId}/view`,
        message: `Dashboard "${input.title}" created successfully! Open in browser at the URLs above.`
      };

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
