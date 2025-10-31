/**
 * MCP Tools for BigQuery API
 * Datasets, tables, queries, data loading
 */
/**
 * List datasets
 */
export declare const listDatasetsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    handler(_input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Create dataset
 */
export declare const createDatasetTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            datasetId: {
                type: string;
                description: string;
            };
            location: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            confirmationToken: {
                type: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Run BigQuery SQL query
 */
export declare const runQueryTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sql: {
                type: string;
                description: string;
            };
            maxResults: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Export BigQuery tools
 */
export declare const bigQueryTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    handler(_input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=tools.d.ts.map