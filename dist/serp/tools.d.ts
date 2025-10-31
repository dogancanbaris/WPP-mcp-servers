/**
 * MCP Tools for Bright Data SERP API
 * Google search results, rank tracking, SERP features
 */
/**
 * Search Google (web results)
 */
export declare const searchGoogleTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            numResults: {
                type: string;
                description: string;
            };
            location: {
                type: string;
                description: string;
            };
            device: {
                type: string;
                enum: string[];
                description: string;
            };
            gl: {
                type: string;
                description: string;
            };
            hl: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Export SERP tools
 */
export declare const serpTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            numResults: {
                type: string;
                description: string;
            };
            location: {
                type: string;
                description: string;
            };
            device: {
                type: string;
                enum: string[];
                description: string;
            };
            gl: {
                type: string;
                description: string;
            };
            hl: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=tools.d.ts.map