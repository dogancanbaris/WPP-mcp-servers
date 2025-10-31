/**
 * Dashboard Management Tools - Main Export
 *
 * Central export point for all dashboard-related types, tools, and utilities.
 */

// Re-export all types
export type {
  ComponentType,
  ColumnWidth,
  ComponentConfig,
  ColumnConfig,
  RowConfigInput,
  RowConfig,
  DashboardLayout,
  DashboardTemplate,
} from './types.js';

// Re-export tools (production-ready essentials only)
export { createDashboardTool } from './create-dashboard.tool.js';
export { getDashboardTool } from './get-dashboard.tool.js';
export { listDashboardsTool } from './list-dashboards.tool.js';
export { updateDashboardLayoutTool } from './update-dashboard.tool.js';
export { deleteDashboardTool } from './delete-dashboard.tool.js';
export { listDatasetsTool } from './list-datasets.tool.js';
export { listDashboardTemplatesTool } from './list-templates.tool.js';

// Import tools for array export
import { createDashboardTool } from './create-dashboard.tool.js';
import { getDashboardTool } from './get-dashboard.tool.js';
import { listDashboardsTool } from './list-dashboards.tool.js';
import { updateDashboardLayoutTool } from './update-dashboard.tool.js';
import { deleteDashboardTool } from './delete-dashboard.tool.js';
import { listDatasetsTool } from './list-datasets.tool.js';
import { listDashboardTemplatesTool } from './list-templates.tool.js';

/**
 * Array of all dashboard tools for MCP server registration
 * (Consolidated production tools)
 */
export const dashboardTools = [
  createDashboardTool,
  getDashboardTool,
  listDashboardsTool,
  updateDashboardLayoutTool,
  deleteDashboardTool,
  listDatasetsTool,
  listDashboardTemplatesTool,
];
