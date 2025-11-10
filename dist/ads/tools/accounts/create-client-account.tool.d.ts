/**
 * Create Client Account Tool
 * Creates a new Google Ads client account under a manager account
 */
export declare const createClientAccountTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            managerCustomerId: {
                type: string;
                description: string;
            };
            descriptiveName: {
                type: string;
                description: string;
            };
            currencyCode: {
                type: string;
                description: string;
            };
            timeZone: {
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
    handler: (args: {
        managerCustomerId?: string;
        descriptiveName?: string;
        currencyCode?: string;
        timeZone?: string;
        confirmationToken?: string;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
        success?: undefined;
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
        content?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            customerId: any;
            resourceName: any;
            descriptiveName: string;
            currencyCode: string;
            timeZone: string;
            message: string;
        };
        content?: undefined;
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
//# sourceMappingURL=create-client-account.tool.d.ts.map