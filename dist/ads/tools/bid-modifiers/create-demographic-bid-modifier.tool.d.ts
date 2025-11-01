/**
 * Create Demographic Bid Modifier Tool
 *
 * MCP tool for creating demographic bid modifiers (adjust bids by +/-% for age groups and gender).
 */
/**
 * Create demographic bid modifier
 */
export declare const createDemographicBidModifierTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            adGroupId: {
                type: string;
                description: string;
            };
            demographicType: {
                type: string;
                enum: string[];
                description: string;
            };
            demographicValue: {
                type: string;
                description: string;
            };
            bidModifierPercent: {
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
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
        data?: undefined;
        nextSteps?: undefined;
    } | {
        success: boolean;
        data: {
            customerId: any;
            adGroupId: any;
            demographicType: any;
            demographicValue: any;
            bidModifierPercent: any;
            modifierId: any;
            message: string;
        };
        nextSteps: string[];
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
//# sourceMappingURL=create-demographic-bid-modifier.tool.d.ts.map