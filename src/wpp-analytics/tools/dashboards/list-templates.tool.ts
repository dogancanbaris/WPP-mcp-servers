/**
 * List Dashboard Templates Tool
 *
 * MCP tool for retrieving pre-built dashboard templates.
 */

import { getLogger } from '../../../shared/logger.js';
import { DASHBOARD_TEMPLATES } from './templates.js';

const logger = getLogger('wpp-analytics.dashboards.list-templates');

export const listDashboardTemplatesTool = {
  name: 'list_dashboard_templates',
  description: `Get pre-built dashboard templates to quickly create dashboards.

**Purpose:**
Retrieve a library of ready-to-use dashboard templates. These templates provide
starting points for common use cases and can be customized after creation.

**Available Templates:**

1. **SEO Overview**
   - Header with title and date filter
   - 4 scorecards: Clicks, Impressions, CTR, Position
   - Time series chart: Performance trend
   - 2 bar charts: Top pages and queries
   - Ideal for: Search Console reporting

2. **Campaign Performance**
   - Header with title and date filter
   - 6 scorecards: Spend, Conversions, ROAS, Clicks, CTR, CPC
   - 2 area charts: Spend and conversion trends
   - Data table: Campaign breakdown
   - Ideal for: Google Ads reporting

3. **Analytics Overview**
   - Header with title and date filter
   - 4 KPIs: Users, Sessions, Bounce Rate, Avg Duration
   - Area chart + pie chart: Traffic trend and sources
   - 2 visualizations: Top pages and device distribution
   - Ideal for: Google Analytics reporting

4. **Blank Dashboard**
   - Just a header row
   - Build your own from scratch

**Parameters:**
None - returns all available templates

**Returns:**
Array of template objects, each containing:
- id: Template identifier
- name: Human-readable name
- description: What the template includes
- datasource: Default data source
- rows: Complete layout configuration
- preview: Preview image URL (optional)

**Example Response:**
\`\`\`json
[
  {
    "id": "seo_overview",
    "name": "SEO Overview",
    "description": "Header + 4 scorecards + time series + 2 comparison charts",
    "datasource": "gsc_performance_7days",
    "rows": [...]
  },
  {
    "id": "campaign_performance",
    "name": "Campaign Performance",
    "description": "Header + 6 scorecards + 3 charts",
    "datasource": "google_ads_campaign_stats",
    "rows": [...]
  }
]
\`\`\`

**Usage Workflow:**
1. Call list_dashboard_templates to see available templates
2. Choose template that matches your use case
3. Copy template's "rows" array
4. Customize title, datasource, and components as needed
5. Pass to create_dashboard tool

**Best Practices:**
1. Use templates as starting points, not final dashboards
2. Customize datasource to match your data
3. Adjust metrics to match available columns
4. Add/remove components based on requirements
5. Consider audience when choosing template

**Customization Tips:**
- Change datasource to connect to different BigQuery table
- Modify metrics array to show different measurements
- Adjust column widths for different layouts
- Add/remove rows as needed
- Update titles to match your branding`,

  inputSchema: {
    type: 'object' as const,
    properties: {},
  },

  async handler(_input: any) {
    try {
      logger.info('list_dashboard_templates called');

      // Return pre-built templates
      const templates = DASHBOARD_TEMPLATES.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        datasource: template.datasource,
        rows: template.rows,
        component_count: template.rows.reduce(
          (sum, row) => sum + row.columns.filter(col => col.component).length,
          0
        ),
        preview: template.preview,
      }));

      logger.info('Returned dashboard templates', {
        count: templates.length,
      });

      return {
        success: true,
        templates,
        count: templates.length,
      };
    } catch (error) {
      logger.error('list_dashboard_templates failed', { error });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
