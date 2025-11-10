/**
 * Create Ad Tool
 *
 * MCP tool for creating Responsive Search Ads in Google Ads.
 */
/**
 * Create Responsive Search Ad
 */
export declare const createAdTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            adGroupId: {
                type: string;
                description: string;
            };
            headlines: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            descriptions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            finalUrl: {
                type: string;
                description: string;
            };
            path1: {
                type: string;
                description: string;
            };
            path2: {
                type: string;
                description: string;
            };
            mobileFinalUrl: {
                type: string;
                description: string;
            };
            finalUrlSuffix: {
                type: string;
                description: string;
            };
            trackingTemplate: {
                type: string;
                description: string;
            };
            agentAssistMode: {
                type: string;
                enum: string[];
                description: string;
            };
            productInfo: {
                type: string;
                description: string;
            };
            targetAudience: {
                type: string;
                description: string;
            };
            uniqueSellingPoints: {
                type: string;
                description: string;
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=create-ad.tool.d.ts.map