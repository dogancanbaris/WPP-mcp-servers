/**
 * Get Ad Group Quality Score Tool
 *
 * GAQL query for Quality Score metrics by ad group with analysis and recommendations.
 * Quality Score is critical for CPC optimization and ad rank.
 */
/**
 * Get Quality Score analysis for ad groups
 */
export declare const getAdGroupQualityScoreTool: {
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
            adGroupId: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=get-ad-group-quality-score.tool.d.ts.map