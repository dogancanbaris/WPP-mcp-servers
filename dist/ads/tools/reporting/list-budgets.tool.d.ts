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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            budgets: any[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=list-budgets.tool.d.ts.map