/**
 * Get Search Terms Report Tool
 *
 * MCP tool for retrieving actual search queries that triggered ads.
 */
/**
 * Get search terms report
 */
export declare const getSearchTermsReportTool: {
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
            searchTerms: any[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=get-search-terms.tool.d.ts.map