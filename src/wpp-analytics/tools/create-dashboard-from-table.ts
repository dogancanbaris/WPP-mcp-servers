/**
 * Create Dashboard from BigQuery Table MCP Tool
 *
 * Generates SQL to create a dashboard from an existing BigQuery table.
 * Returns SQL for agent to execute via mcp__supabase__execute_sql.
 */

import { getLogger } from '../../shared/logger.js';
import { randomBytes } from 'crypto';

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

**Workflow:**
1. Call this tool with BigQuery table name
2. Tool returns SQL statements to create dataset + dashboard
3. Agent executes SQL using mcp__supabase__execute_sql
4. Dashboard is ready!

**Parameters:**
- bigqueryTable: Full table reference (e.g., "project.dataset.table")
- template: Template ID ("seo_overview" recommended)
- title: Dashboard title
- dateRange: [startDate, endDate]
- platform: Platform type ("gsc", "google_ads", "analytics")

**Returns:**
SQL statements for agent to execute via mcp__supabase__execute_sql`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      bigqueryTable: { type: 'string', description: 'Full BigQuery table reference' },
      template: { type: 'string', description: 'Template ID (seo_overview, etc.)' },
      rows: { type: 'array', description: 'Custom rows (if not using template)' },
      title: { type: 'string', description: 'Dashboard title (agent writes)' },
      description: { type: 'string', description: 'Executive summary/description text (agent writes full text with formatting)' },
      dateRange: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
      platform: { type: 'string', enum: ['gsc', 'google_ads', 'analytics'] },
      workspace_id: { type: 'string' }
    },
    required: ['bigqueryTable', 'title', 'dateRange', 'platform']
  },

  async handler(input: any) {
    try {
      const workspaceId = input.workspace_id || '945907d8-7e88-45c4-8fde-9db35d5f5ce2';
      const dashboardId = generateUUID();
      const datasetId = generateUUID();
      const [projectId, datasetIdBq, tableId] = input.bigqueryTable.split('.');

      // Load template or use custom
      const templateRows = input.template === 'seo_overview' ? SEO_OVERVIEW_TEMPLATE.rows : input.rows;

      if (!templateRows) {
        return { success: false, error: 'Either template or rows required' };
      }

      // Use agent-provided description or default
      const description = input.description || 'Dashboard showing performance metrics for the selected time period.';

      // Replace variables
      let configJson = JSON.stringify({ title: input.title, rows: templateRows, theme: { primaryColor: '#191D63' }});
      configJson = configJson
        .replace(/\{\{DATASET_ID\}\}/g, datasetId)
        .replace(/\{\{DATE_RANGE\}\}/g, JSON.stringify(input.dateRange))
        .replace(/\{\{TITLE\}\}/g, input.title.replace(/"/g, '\\"'))
        .replace(/\{\{DESCRIPTION\}\}/g, description.replace(/"/g, '\\"')); // Agent-written text

      // Generate SQL statements
      const sql1 = `INSERT INTO datasets (id, workspace_id, name, bigquery_project_id, bigquery_dataset_id, bigquery_table_id, platform_metadata, refresh_interval_days)
VALUES (
  '${datasetId}',
  '${workspaceId}',
  '${input.title} - Dataset',
  '${projectId}',
  '${datasetIdBq}',
  '${tableId}',
  '{"platform": "${input.platform}", "property": "auto-created"}'::jsonb,
  1
) ON CONFLICT (id) DO NOTHING
RETURNING id;`;

      const sql2 = `INSERT INTO dashboards (id, name, description, workspace_id, dataset_id, config)
VALUES (
  '${dashboardId}',
  '${input.title}',
  'Dashboard created via MCP tool',
  '${workspaceId}',
  '${datasetId}',
  '${configJson.replace(/'/g, "''")}'::jsonb
)
RETURNING id, name;`;

      logger.info('[create_dashboard_from_table] Generated SQL', { dashboard_id: dashboardId });

      return {
        success: true,
        dashboard_id: dashboardId,
        dataset_id: datasetId,
        dashboard_url: `/dashboard/${dashboardId}/builder`,
        view_url: `/dashboard/${dashboardId}/view`,
        instructions: 'Execute these SQL statements using mcp__supabase__execute_sql in order:',
        sql_statements: [
          { step: 1, description: 'Register dataset', sql: sql1 },
          { step: 2, description: 'Create dashboard', sql: sql2 }
        ],
        agent_workflow: [
          'Step 1: mcp__supabase__execute_sql(sql_statements[0].sql)',
          'Step 2: mcp__supabase__execute_sql(sql_statements[1].sql)',
          'Step 3: Navigate to dashboard_url'
        ]
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
