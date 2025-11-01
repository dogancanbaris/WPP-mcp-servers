/**
 * Google Ads Reporting Tools - Main Export
 *
 * Central export point for all reporting-related tools.
 */
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
/**
 * Array of all reporting tools for MCP server registration
 */
export declare const reportingTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=index.d.ts.map