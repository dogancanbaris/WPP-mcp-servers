/**
 * List Ad Groups Tool
 *
 * MCP tool for listing all ad groups in a Google Ads campaign with performance analysis.
 */
/**
 * List ad groups
 */
export declare const listAdGroupsTool: {
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
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=list-ad-groups.tool.d.ts.map