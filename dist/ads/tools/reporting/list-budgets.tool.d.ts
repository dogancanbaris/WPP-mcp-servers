/**
 * List Budgets Tool
 *
 * MCP tool for listing all campaign budgets.
 */
/**
 * List budgets
 */
export declare const listBudgetsTool: {
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
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=list-budgets.tool.d.ts.map