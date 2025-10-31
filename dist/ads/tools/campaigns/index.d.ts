/**
 * Google Ads Campaign Tools - Main Export
 *
 * Central export point for all campaign management tools.
 */
export { updateCampaignStatusTool } from './update-status.tool.js';
export { createCampaignTool } from './create-campaign.tool.js';
/**
 * Array of all campaign tools for MCP server registration
 */
export declare const campaignTools: ({
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            budgetId: {
                type: string;
                description: string;
            };
            campaignType: {
                type: string;
                enum: string[];
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            name: any;
            campaignType: any;
            status: any;
            message: string;
        };
        warning: string[];
    }>;
})[];
//# sourceMappingURL=index.d.ts.map