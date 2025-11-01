/**
 * Add Demographic Targeting Criteria Tool
 *
 * MCP tool for adding demographic targeting (age, gender, income, parental status) to campaigns.
 */
export declare const addDemographicCriteriaTool: {
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
            ageRanges: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            genders: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            parentalStatuses: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            householdIncomes: {
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
//# sourceMappingURL=add-demographic-criteria.tool.d.ts.map