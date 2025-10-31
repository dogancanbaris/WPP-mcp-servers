/**
 * MCP Tools for Google Analytics Account & Property Management
 */
/**
 * List Analytics accounts
 */
export declare const listAnalyticsAccountsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
    handler(_input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * List Analytics properties
 */
export declare const listAnalyticsPropertiesTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
        };
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            accountId: any;
            properties: {
                name: any;
                displayName: any;
                timeZone: any;
                currencyCode: any;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * List data streams
 */
export declare const listDataStreamsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
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
            streams: {
                name: any;
                type: any;
                displayName: any;
                webStreamData: any;
            }[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=accounts.d.ts.map