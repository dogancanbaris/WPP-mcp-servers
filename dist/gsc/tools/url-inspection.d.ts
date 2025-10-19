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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: any;
    }>;
};
//# sourceMappingURL=url-inspection.d.ts.map