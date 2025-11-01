/**
 * List Ads Tool
 *
 * MCP tool for listing all ads in a Google Ads account or ad group.
 */
/**
 * List ads
 */
export declare const listAdsTool: {
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
            campaignId: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=list-ads.tool.d.ts.map