/**
 * Google Ads Reporting Tools - Main Export
 *
 * Central export point for all reporting-related tools.
 */
// Re-export tools
export { listCampaignsTool } from './list-campaigns.tool.js';
export { getCampaignPerformanceTool } from './get-campaign-performance.tool.js';
export { getSearchTermsReportTool } from './get-search-terms.tool.js';
export { listBudgetsTool } from './list-budgets.tool.js';
export { getKeywordPerformanceTool } from './get-keyword-performance.tool.js';
// Import tools for array export
import { listCampaignsTool } from './list-campaigns.tool.js';
import { getCampaignPerformanceTool } from './get-campaign-performance.tool.js';
import { getSearchTermsReportTool } from './get-search-terms.tool.js';
import { listBudgetsTool } from './list-budgets.tool.js';
import { getKeywordPerformanceTool } from './get-keyword-performance.tool.js';
/**
 * Array of all reporting tools for MCP server registration
 */
export const reportingTools = [
    listCampaignsTool,
    getCampaignPerformanceTool,
    getSearchTermsReportTool,
    listBudgetsTool,
    getKeywordPerformanceTool,
];
//# sourceMappingURL=index.js.map