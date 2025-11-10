/**
 * MCP Tools for Google Ads Account Management
 */
/**
 * List accessible Google Ads accounts
 */
export declare const listAccessibleAccountsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Get account information including test account flag
 */
export declare const getAccountInfoTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=accounts.d.ts.map