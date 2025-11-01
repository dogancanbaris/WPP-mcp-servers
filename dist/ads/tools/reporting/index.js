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
export { runCustomReportTool } from './run-custom-report.tool.js';
export { getAdGroupPerformanceTool } from './get-ad-group-performance.tool.js';
export { getAdPerformanceTool } from './get-ad-performance.tool.js';
export { getQualityScoreReportTool } from './get-quality-score-report.tool.js';
export { getAuctionInsightsTool } from './get-auction-insights.tool.js';
// Import tools for array export
import { listCampaignsTool } from './list-campaigns.tool.js';
import { getCampaignPerformanceTool } from './get-campaign-performance.tool.js';
import { getSearchTermsReportTool } from './get-search-terms.tool.js';
import { listBudgetsTool } from './list-budgets.tool.js';
import { getKeywordPerformanceTool } from './get-keyword-performance.tool.js';
import { runCustomReportTool } from './run-custom-report.tool.js';
import { getAdGroupPerformanceTool } from './get-ad-group-performance.tool.js';
import { getAdPerformanceTool } from './get-ad-performance.tool.js';
import { getQualityScoreReportTool } from './get-quality-score-report.tool.js';
import { getAuctionInsightsTool } from './get-auction-insights.tool.js';
/**
 * Array of all reporting tools for MCP server registration
 */
export const reportingTools = [
    listCampaignsTool,
    getCampaignPerformanceTool,
    getSearchTermsReportTool,
    listBudgetsTool,
    getKeywordPerformanceTool,
    runCustomReportTool,
    getAdGroupPerformanceTool,
    getAdPerformanceTool,
    getQualityScoreReportTool,
    getAuctionInsightsTool,
];
//# sourceMappingURL=index.js.map