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
            targetGoogleSearch: {
                type: string;
                description: string;
            };
            targetSearchNetwork: {
                type: string;
                description: string;
            };
            targetContentNetwork: {
                type: string;
                description: string;
            };
            targetPartnerSearchNetwork: {
                type: string;
                description: string;
            };
            startDate: {
                type: string;
                description: string;
            };
            endDate: {
                type: string;
                description: string;
            };
            trackingTemplate: {
                type: string;
                description: string;
            };
            finalUrlSuffix: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=create-campaign.tool.d.ts.map