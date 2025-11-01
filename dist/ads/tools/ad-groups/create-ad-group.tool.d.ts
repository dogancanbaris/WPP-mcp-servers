/**
 * Create Ad Group Tool
 *
 * MCP tool for creating new ad groups in Google Ads campaigns.
 */
/**
 * Create ad group
 */
export declare const createAdGroupTool: {
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
            name: {
                type: string;
                description: string;
            };
            cpcBidMicros: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
        data?: undefined;
        nextSteps?: undefined;
    } | {
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            adGroupId: any;
            name: any;
            status: any;
            cpcBid: string;
            message: string;
        };
        nextSteps: (string | null)[];
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
//# sourceMappingURL=create-ad-group.tool.d.ts.map