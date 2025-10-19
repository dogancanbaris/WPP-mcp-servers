/**
 * Export all Google Analytics MCP tools
 */
// Account & property management
export { listAnalyticsAccountsTool, listAnalyticsPropertiesTool, listDataStreamsTool, } from './accounts.js';
// Reporting tools
export { runAnalyticsReportTool, getRealtimeUsersTool } from './reporting.js';
// Admin API tools
export { analyticsAdminTools } from './admin.js';
// Re-export as collection
import { listAnalyticsAccountsTool, listAnalyticsPropertiesTool, listDataStreamsTool, } from './accounts.js';
import { runAnalyticsReportTool, getRealtimeUsersTool } from './reporting.js';
import { analyticsAdminTools } from './admin.js';
/**
 * All Google Analytics tools
 */
export const analyticsTools = [
    // Account & property discovery
    listAnalyticsAccountsTool,
    listAnalyticsPropertiesTool,
    listDataStreamsTool,
    // Reporting (flexible tool covers most needs)
    runAnalyticsReportTool,
    getRealtimeUsersTool,
    // Admin API (property management, custom dimensions/metrics, conversions)
    ...analyticsAdminTools,
];
/**
 * Read-only tools (all Analytics tools are read-only)
 */
export const readOnlyAnalyticsTools = analyticsTools;
//# sourceMappingURL=index.js.map