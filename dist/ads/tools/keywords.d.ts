/**
 * MCP Tools for Google Ads Keyword Write Operations
 */
/**
 * Add keywords
 */
export declare const addKeywordsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            adGroupId: {
                type: string;
                description: string;
            };
            keywords: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        text: {
                            type: string;
                            description: string;
                        };
                        matchType: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        maxCpcDollars: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
    }>;
};
/**
 * Add negative keywords
 */
export declare const addNegativeKeywordsTool: {
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
            keywords: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        text: {
                            type: string;
                            description: string;
                        };
                        matchType: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
    }>;
};
//# sourceMappingURL=keywords.d.ts.map