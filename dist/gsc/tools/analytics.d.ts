/**
 * MCP Tools for Search Analytics operations
 */
/**
 * Query search analytics tool
 */
export declare const querySearchAnalyticsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
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
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            searchType: {
                type: string;
                enum: string[];
                description: string;
            };
            rowLimit: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=analytics.d.ts.map