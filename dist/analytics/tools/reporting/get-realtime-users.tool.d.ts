/**
 * Get Realtime Users Tool
 *
 * MCP tool for retrieving real-time active user data.
 */
/**
 * Get realtime users
 */
export declare const getRealtimeUsersTool: {
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
};
//# sourceMappingURL=get-realtime-users.tool.d.ts.map