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
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=create-ad-group.tool.d.ts.map