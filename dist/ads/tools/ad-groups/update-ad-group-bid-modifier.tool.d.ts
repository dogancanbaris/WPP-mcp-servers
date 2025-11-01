/**
 * Update Ad Group Bid Modifier Tool
 *
 * Adjust ad group CPC bid by a percentage increase/decrease.
 * More intuitive than setting absolute micros values.
 */
/**
 * Update ad group bid by percentage
 */
export declare const updateAdGroupBidModifierTool: {
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
            adGroupId: {
                type: string;
                description: string;
            };
            percentageChange: {
                type: string;
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
//# sourceMappingURL=update-ad-group-bid-modifier.tool.d.ts.map