/**
 * WPP Analytics Platform MCP Tools
 *
 * Export all dashboard management tools for registration
 * in the main MCP server.
 */

import { dataPushTools } from './push-data-to-bigquery.js';
import { insightsTools } from './analyze-data-insights.js';
import { dashboardTools } from './dashboards/index.js';

export { dataPushTools, insightsTools, dashboardTools };

// Re-export individual tools for convenience
export {
  pushPlatformDataToBigQueryTool
} from './push-data-to-bigquery.js';

export {
  analyzeGSCDataForInsightsTool
} from './analyze-data-insights.js';

// Re-export create_dashboard_from_table (the robust tool)
export { createDashboardFromTableTool } from './create-dashboard-from-table.js';

// Import for array
import { createDashboardFromTableTool } from './create-dashboard-from-table.js';

// Export all tools combined
export const allWppAnalyticsTools = [
  ...dataPushTools,
  ...insightsTools,
  ...dashboardTools,
  createDashboardFromTableTool
];
