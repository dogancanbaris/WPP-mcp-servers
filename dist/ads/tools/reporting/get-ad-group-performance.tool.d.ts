/**
 * Get Ad Group Performance Tool
 *
 * MCP tool for retrieving detailed performance metrics for ad groups.
 */
/**
 * Get ad group performance
 */
export declare const getAdGroupPerformanceTool: {
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
            startDate: {
                type: string;
                description: string;
            };
            endDate: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=get-ad-group-performance.tool.d.ts.map