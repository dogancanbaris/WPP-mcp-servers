/**
 * Add Audience Targeting Criteria Tool
 *
 * MCP tool for adding audience targeting (in-market, affinity, custom audiences) to campaigns.
 */
export declare const addAudienceCriteriaTool: {
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
            audienceIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            audienceType: {
                type: string;
                enum: string[];
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
//# sourceMappingURL=add-audience-criteria.tool.d.ts.map