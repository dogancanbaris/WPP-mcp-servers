/**
 * MCP Tools for Google Ads Assets & Creative
 * Includes: AssetService, AssetGroupService
 */
/**
 * List assets
 */
export declare const listAssetsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            assetType: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            assets: {
                id: string;
                name: string;
                type: string;
                imageUrl: string | undefined;
                youtubeVideoId: string | undefined;
                text: string | undefined;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Export asset tools
 */
export declare const assetTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            assetType: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            assets: {
                id: string;
                name: string;
                type: string;
                imageUrl: string | undefined;
                youtubeVideoId: string | undefined;
                text: string | undefined;
            }[];
            count: number;
            message: string;
        };
    }>;
}[];
//# sourceMappingURL=assets.d.ts.map