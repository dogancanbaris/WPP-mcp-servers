/**
 * Run Custom Report Tool
 *
 * MCP tool for running flexible Google Ads reports via GAQL (Google Ads Query Language).
 * Supports both direct GAQL queries and query builder mode.
 */
/**
 * Run custom report tool
 */
export declare const runCustomReportTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            resource: {
                type: string;
                enum: string[];
                description: string;
            };
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            filters: {
                type: string;
                description: string;
            };
            dateRange: {
                type: string;
                properties: {
                    start: {
                        type: string;
                    };
                    end: {
                        type: string;
                    };
                };
                description: string;
            };
            orderBy: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
};
//# sourceMappingURL=run-custom-report.tool.d.ts.map