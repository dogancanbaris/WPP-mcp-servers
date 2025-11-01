/**
 * Pause Ad Tool
 *
 * Quick wrapper around update_ad for the common operation of pausing/enabling ads.
 * Provides simplified workflow focused on status changes only.
 */
/**
 * Pause or enable an ad (quick status toggle)
 */
export declare const pauseAdTool: {
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
            adId: {
                type: string;
                description: string;
            };
            action: {
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
//# sourceMappingURL=pause-ad.tool.d.ts.map