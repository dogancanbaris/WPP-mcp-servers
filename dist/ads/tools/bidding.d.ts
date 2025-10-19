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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            strategies: {
                id: string;
                name: string;
                type: string;
                campaignCount: number;
                targetCpa: number | undefined;
                targetRoas: number | undefined;
                status: string;
            }[];
            count: number;
            message: string;
        };
    }>;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            strategies: {
                id: string;
                name: string;
                type: string;
                campaignCount: number;
                targetCpa: number | undefined;
                targetRoas: number | undefined;
                status: string;
            }[];
            count: number;
            message: string;
        };
    }>;
}[];
//# sourceMappingURL=bidding.d.ts.map