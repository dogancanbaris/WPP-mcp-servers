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