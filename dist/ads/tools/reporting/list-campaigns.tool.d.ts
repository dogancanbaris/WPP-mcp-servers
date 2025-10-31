/**
 * List Campaigns Tool
 *
 * MCP tool for listing all campaigns in a Google Ads account.
 */
/**
 * List campaigns
 */
export declare const listCampaignsTool: {
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
};
//# sourceMappingURL=list-campaigns.tool.d.ts.map