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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            accounts: {
                resourceName: string;
                customerId: string;
            }[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=accounts.d.ts.map