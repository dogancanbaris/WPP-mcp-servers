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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=keyword-planning.d.ts.map