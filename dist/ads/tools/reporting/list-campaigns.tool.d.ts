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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            campaigns: any[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=list-campaigns.tool.d.ts.map