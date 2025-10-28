/**
 * Google Analytics Reporting Tools - Main Export
 *
 * Central export point for all analytics reporting tools.
 */
// Re-export tools
export { runAnalyticsReportTool } from './run-report.tool.js';
export { getRealtimeUsersTool } from './get-realtime-users.tool.js';
// Import tools for array export
import { runAnalyticsReportTool } from './run-report.tool.js';
import { getRealtimeUsersTool } from './get-realtime-users.tool.js';
/**
 * Array of all analytics reporting tools for MCP server registration
 */
export const reportingTools = [
    runAnalyticsReportTool,
    getRealtimeUsersTool,
];
//# sourceMappingURL=index.js.map