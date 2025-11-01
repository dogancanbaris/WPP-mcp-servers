/**
 * Create Ad Schedule Bid Modifier Tool
 *
 * MCP tool for creating ad schedule bid modifiers (adjust bids by +/-% for specific days/hours).
 */
/**
 * Create ad schedule bid modifier
 */
export declare const createAdScheduleBidModifierTool: {
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
            dayOfWeek: {
                type: string;
                enum: string[];
                description: string;
            };
            startHour: {
                type: string;
                description: string;
            };
            endHour: {
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
            dayOfWeek: any;
            startHour: any;
            endHour: any;
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
//# sourceMappingURL=create-ad-schedule-bid-modifier.tool.d.ts.map