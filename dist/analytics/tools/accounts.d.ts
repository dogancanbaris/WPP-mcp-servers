/**
 * MCP Tools for Google Analytics Account & Property Management
 */
/**
 * List Analytics accounts
 */
export declare const listAnalyticsAccountsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
    handler(_input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * List Analytics properties
 */
export declare const listAnalyticsPropertiesTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
        };
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * List data streams
 */
export declare const listDataStreamsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=accounts.d.ts.map