/**
 * Get Campaign Performance Tool
 *
 * MCP tool for retrieving detailed performance metrics for campaigns.
 */
/**
 * Get campaign performance
 */
export declare const getCampaignPerformanceTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            campaignId: {
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
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            dateRange: string | {
                startDate: any;
                endDate: any;
            };
            campaigns: any[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=get-campaign-performance.tool.d.ts.map