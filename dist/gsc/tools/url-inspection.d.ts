/**
 * MCP Tools for URL Inspection operations
 */
/**
 * Inspect URL tool
 */
export declare const inspectUrlTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
            url: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=url-inspection.d.ts.map