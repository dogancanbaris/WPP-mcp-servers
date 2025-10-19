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
    handler(_input: any): Promise<{
        success: boolean;
        data: {
            accounts: import("../types.js").AnalyticsAccount[];
            count: number;
            message: string;
        };
    }>;
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
            properties: import("../types.js").AnalyticsProperty[];
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
            streams: import("../types.js").DataStream[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=accounts.d.ts.map