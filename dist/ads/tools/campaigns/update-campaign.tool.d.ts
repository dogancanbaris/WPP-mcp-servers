/**
 * Update Campaign Tool
 *
 * MCP tool for updating existing Google Ads campaign settings.
 */
/**
 * Update campaign settings
 */
export declare const updateCampaignTool: {
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
            name: {
                type: string;
                description: string;
            };
            budgetId: {
                type: string;
                description: string;
            };
            targetGoogleSearch: {
                type: string;
                description: string;
            };
            targetSearchNetwork: {
                type: string;
                description: string;
            };
            targetContentNetwork: {
                type: string;
                description: string;
            };
            targetPartnerSearchNetwork: {
                type: string;
                description: string;
            };
            startDate: {
                type: string;
                description: string;
            };
            endDate: {
                type: string;
                description: string;
            };
            trackingTemplate: {
                type: string;
                description: string;
            };
            finalUrlSuffix: {
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
    handler(input: any): Promise<any>;
};
//# sourceMappingURL=update-campaign.tool.d.ts.map