/**
 * MCP Tools for Google Ads Bidding Strategies
 * Includes: BiddingStrategyService, BiddingSeasonalityAdjustmentService
 */
/**
 * List bidding strategies
 */
export declare const listBiddingStrategiesTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Export bidding tools
 */
export declare const biddingTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=bidding.d.ts.map