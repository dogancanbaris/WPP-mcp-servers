/**
 * MCP Tools for Google Ads Keyword Planning
 * Includes: KeywordPlanService, KeywordPlanIdeaService
 */
/**
 * Generate keyword ideas
 */
export declare const generateKeywordIdeasTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            seedKeywords: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            pageUrl: {
                type: string;
                description: string;
            };
            languageCode: {
                type: string;
                description: string;
            };
            geoTargetIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            keywordIdeas: {
                keyword: any;
                avgMonthlySearches: number;
                competition: any;
                lowTopPageBid: number | undefined;
                highTopPageBid: number | undefined;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Export keyword planning tools
 */
export declare const keywordPlanningTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            seedKeywords: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            pageUrl: {
                type: string;
                description: string;
            };
            languageCode: {
                type: string;
                description: string;
            };
            geoTargetIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            keywordIdeas: {
                keyword: any;
                avgMonthlySearches: number;
                competition: any;
                lowTopPageBid: number | undefined;
                highTopPageBid: number | undefined;
            }[];
            count: number;
            message: string;
        };
    }>;
}[];
//# sourceMappingURL=keyword-planning.d.ts.map