/**
 * Get Keyword Performance Tool
 *
 * MCP tool for retrieving detailed keyword-level performance metrics.
 */
/**
 * Get keyword performance
 */
export declare const getKeywordPerformanceTool: {
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
            startDate: {
                type: string;
                description: string;
            };
            endDate: {
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
            campaignId: any;
            dateRange: string | {
                startDate: any;
                endDate: any;
            };
            keywords: any[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=get-keyword-performance.tool.d.ts.map