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
export declare const reportingTools: {
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
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=index.d.ts.map