/**
 * Update Ad Group Tool
 *
 * MCP tool for updating ad group settings in Google Ads.
 */
/**
 * Update ad group
 */
export declare const updateAdGroupTool: {
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
            adGroupId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            cpcBidMicros: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            trackingUrlTemplate: {
                type: string;
                description: string;
            };
            urlCustomParameters: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        key: {
                            type: string;
                        };
                        value: {
                            type: string;
                        };
                    };
                };
                description: string;
            };
            adRotationMode: {
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
    }>;
};
//# sourceMappingURL=update-ad-group.tool.d.ts.map