/**
 * Create Location Bid Modifier Tool
 *
 * MCP tool for creating location bid modifiers (adjust bids by +/-% for specific geographic locations).
 */
/**
 * Create location bid modifier
 */
export declare const createLocationBidModifierTool: {
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
            locationId: {
                type: string;
                description: string;
            };
            locationName: {
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
            campaignId: any;
            locationId: any;
            locationName: any;
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
//# sourceMappingURL=create-location-bid-modifier.tool.d.ts.map