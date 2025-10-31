/**
 * MCP Tools for Sitemaps operations
 */
/**
 * List sitemaps tool
 */
export declare const listSitemapsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Get sitemap details tool
 */
export declare const getSitemapTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
            sitemapUrl: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Submit sitemap tool (WRITE)
 */
export declare const submitSitemapTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
            sitemapUrl: {
                type: string;
                description: string;
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
 * Delete sitemap tool (WRITE - DESTRUCTIVE)
 */
export declare const deleteSitemapTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
            sitemapUrl: {
                type: string;
                description: string;
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
//# sourceMappingURL=sitemaps.d.ts.map