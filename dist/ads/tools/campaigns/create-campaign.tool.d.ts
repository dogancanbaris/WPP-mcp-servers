/**
 * Create Campaign Tool
 *
 * MCP tool for creating new Google Ads campaigns.
 */
/**
 * Create campaign
 */
export declare const createCampaignTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            budgetId: {
                type: string;
                description: string;
            };
            campaignType: {
                type: string;
                enum: string[];
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            name: any;
            campaignType: any;
            status: any;
            message: string;
        };
        warning: string[];
    }>;
};
//# sourceMappingURL=create-campaign.tool.d.ts.map