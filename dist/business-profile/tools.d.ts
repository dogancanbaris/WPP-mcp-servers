/**
 * MCP Tools for Google Business Profile API
 * Location management, reviews, posts, media, performance
 */
/**
 * List business locations
 */
export declare const listLocationsTool: {
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
        required: never[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Get location details
 */
export declare const getLocationTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
            locationId: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Update business location
 */
export declare const updateLocationTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
            locationId: {
                type: string;
                description: string;
            };
            updates: {
                type: string;
                description: string;
                properties: {
                    title: {
                        type: string;
                    };
                    websiteUri: {
                        type: string;
                    };
                    phoneNumbers: {
                        type: string;
                    };
                    regularHours: {
                        type: string;
                    };
                };
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Export Business Profile tools
 */
export declare const businessProfileTools: {
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
        required: never[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=tools.d.ts.map