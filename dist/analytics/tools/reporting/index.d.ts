/**
 * Google Analytics Reporting Tools - Main Export
 *
 * Central export point for all analytics reporting tools.
 */
export { runAnalyticsReportTool } from './run-report.tool.js';
export { getRealtimeUsersTool } from './get-realtime-users.tool.js';
/**
 * Array of all analytics reporting tools for MCP server registration
 */
export declare const reportingTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
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
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            dateRange: {
                startDate: any;
                endDate: any;
            };
            dimensions: any[];
            metrics: any[];
            rows: import("@google-analytics/data/build/protos/protos.js").google.analytics.data.v1beta.IRow[];
            rowCount: number;
            message: string;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
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
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            timeframe: string;
            dimensions: any[];
            metrics: any[];
            rows: import("@google-analytics/data/build/protos/protos.js").google.analytics.data.v1beta.IRow[];
            rowCount: number;
            message: string;
        };
    }>;
})[];
//# sourceMappingURL=index.d.ts.map