/**
 * MCP Tools for Search Analytics operations
 */
/**
 * Query search analytics tool
 */
export declare const querySearchAnalyticsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
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
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            searchType: {
                type: string;
                enum: string[];
                description: string;
            };
            rowLimit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            property: any;
            dateRange: {
                start: any;
                end: any;
            };
            dimensions: any;
            searchType: any;
            rows: {
                keys: any;
                clicks: any;
                impressions: any;
                ctr: any;
                position: any;
            }[];
            rowCount: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=analytics.d.ts.map