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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
}[];
//# sourceMappingURL=extensions.d.ts.map