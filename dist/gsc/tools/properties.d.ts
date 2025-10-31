/**
 * MCP Tools for GSC Properties (Sites) operations
 */
/**
 * List all properties tool
 */
export declare const listPropertiesTool: {
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
 * Get property details tool
 */
export declare const getPropertyTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Add property tool (WRITE)
 */
export declare const addPropertyTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            siteUrl: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            requiresApproval: boolean;
            dryRun: import("../types.js").DryRunResult;
            message: string;
            property?: undefined;
        };
    } | {
        success: boolean;
        data: {
            property: any;
            message: string;
            requiresApproval?: undefined;
            dryRun?: undefined;
        };
    }>;
};
//# sourceMappingURL=properties.d.ts.map