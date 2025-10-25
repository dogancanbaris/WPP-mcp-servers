/**
 * WPP Analytics Platform MCP Tools
 *
 * Export all dashboard management tools for registration
 * in the main MCP server.
 */

import { dashboardTools } from './dashboards.js';
import { dataPushTools } from './push-data-to-bigquery.js';
import { dashboardCreationTools } from './create-dashboard-from-table.js';
import { insightsTools } from './analyze-data-insights.js';

export { dashboardTools, dataPushTools, dashboardCreationTools, insightsTools };

// Re-export individual tools for convenience
export {
  createDashboardTool,
  updateDashboardLayoutTool,
  listDashboardTemplatesTool,
} from './dashboards.js';

export {
  pushPlatformDataToBigQueryTool
} from './push-data-to-bigquery.js';

export {
  createDashboardFromTableTool
} from './create-dashboard-from-table.js';

export {
  analyzeGSCDataForInsightsTool
} from './analyze-data-insights.js';

// Re-export types for external use
export type {
  ComponentType,
  ColumnWidth,
  ComponentConfig,
  ColumnConfig,
  RowConfig,
  DashboardLayout,
  DashboardTemplate,
} from './dashboards.js';

// Export all tools combined
export const allWppAnalyticsTools = [
  ...dashboardTools,
  ...dataPushTools,
  ...dashboardCreationTools,
  ...insightsTools
];
