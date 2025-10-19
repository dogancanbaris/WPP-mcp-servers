/**
 * MCP Tools for Google Ads Extensions (Assets)
 * Includes: CallAssetService, SitelinkAssetService, etc.
 */
/**
 * List ad extensions (now called assets)
 */
export declare const listAdExtensionsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            extensions: {
                id: string;
                name: string;
                type: string;
                sitelinkText: string | undefined;
                phoneNumber: string | undefined;
                snippetHeader: string | undefined;
                promotionTarget: string | undefined;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Export extension tools
 */
export declare const extensionTools: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            extensions: {
                id: string;
                name: string;
                type: string;
                sitelinkText: string | undefined;
                phoneNumber: string | undefined;
                snippetHeader: string | undefined;
                promotionTarget: string | undefined;
            }[];
            count: number;
            message: string;
        };
    }>;
}[];
//# sourceMappingURL=extensions.d.ts.map