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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            property: any;
            sitemaps: {
                url: any;
                lastSubmitted: any;
                lastDownloaded: any;
                errors: any;
                warnings: any;
                contents: any;
            }[];
            count: number;
            message: string;
        };
    }>;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            url: string | null | undefined;
            lastSubmitted: string | null | undefined;
            lastDownloaded: string | null | undefined;
            errors: string | number;
            warnings: string | number;
            contents: import("googleapis").webmasters_v3.Schema$WmxSitemapContent[];
        };
    }>;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            property: any;
            sitemapUrl: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            property: any;
            sitemapUrl: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
//# sourceMappingURL=sitemaps.d.ts.map