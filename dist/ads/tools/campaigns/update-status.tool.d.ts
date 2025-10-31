/**
 * Update Campaign Status Tool
 *
 * MCP tool for pausing, enabling, or removing campaigns.
 */
/**
 * Update campaign status
 */
export declare const updateCampaignStatusTool: {
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
            status: {
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
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
    }>;
};
//# sourceMappingURL=update-status.tool.d.ts.map