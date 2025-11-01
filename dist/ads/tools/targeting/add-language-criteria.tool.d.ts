/**
 * Add Language Targeting Criteria Tool
 *
 * MCP tool for adding language targeting to campaigns.
 */
export declare const addLanguageCriteriaTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            campaignId: {
                type: string;
                description: string;
            };
            languageIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=add-language-criteria.tool.d.ts.map