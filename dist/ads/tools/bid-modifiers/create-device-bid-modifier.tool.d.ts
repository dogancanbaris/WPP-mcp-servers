/**
 * Create Device Bid Modifier Tool
 *
 * MCP tool for creating device bid modifiers (adjust bids by +/-% for mobile/desktop/tablet).
 */
/**
 * Create device bid modifier
 */
export declare const createDeviceBidModifierTool: {
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
            deviceType: {
                type: string;
                enum: string[];
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
            deviceType: any;
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
//# sourceMappingURL=create-device-bid-modifier.tool.d.ts.map