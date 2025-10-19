/**
 * MCP Tools for Google Ads Conversion Tracking
 * Includes: ConversionActionService, ConversionUploadService, ConversionAdjustmentService
 */
/**
 * List conversion actions
 */
export declare const listConversionActionsTool: {
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
            conversionActions: {
                id: string;
                name: string;
                category: string;
                status: string;
                type: string;
                countingType: string;
                attributionWindow: number;
                defaultValue: number | undefined;
                alwaysUseDefaultValue: boolean;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Create conversion action
 */
export declare const createConversionActionTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                enum: string[];
                description: string;
            };
            countingType: {
                type: string;
                enum: string[];
                description: string;
            };
            attributionWindowDays: {
                type: string;
                description: string;
            };
            valueSettings: {
                type: string;
                properties: {
                    defaultValue: {
                        type: string;
                        description: string;
                    };
                    alwaysUseDefaultValue: {
                        type: string;
                        description: string;
                    };
                };
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
            customerId: any;
            conversionActionId: any;
            name: any;
            category: any;
            countingType: any;
            attributionWindowDays: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
/**
 * Upload click conversions (offline conversion import)
 */
export declare const uploadClickConversionsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
                type: string;
                description: string;
            };
            conversions: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        gclid: {
                            type: string;
                            description: string;
                        };
                        conversionDateTime: {
                            type: string;
                            description: string;
                        };
                        conversionValue: {
                            type: string;
                            description: string;
                        };
                        currencyCode: {
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
            customerId: any;
            conversionActionId: any;
            conversionsUploaded: any;
            totalValue: string;
            result: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
/**
 * Upload conversion adjustments
 */
export declare const uploadConversionAdjustmentsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
                type: string;
                description: string;
            };
            adjustments: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        gclid: {
                            type: string;
                            description: string;
                        };
                        conversionDateTime: {
                            type: string;
                            description: string;
                        };
                        adjustmentType: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        adjustedValue: {
                            type: string;
                            description: string;
                        };
                        adjustmentDateTime: {
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
            customerId: any;
            conversionActionId: any;
            adjustmentsUploaded: any;
            retractions: any;
            restatements: number;
            totalValueChange: string;
            result: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
};
/**
 * Get conversion action
 */
export declare const getConversionActionTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
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
            conversionAction: {
                id: string;
                name: string;
                category: string;
                status: string;
                type: string;
                countingType: string;
                clickThroughWindow: number;
                viewThroughWindow: number;
                defaultValue: number | undefined;
                alwaysUseDefaultValue: boolean;
                tagSnippets: import("google-ads-node/build/protos/protos.js").google.ads.googleads.v21.common.ITagSnippet[];
            };
            message: string;
        };
    }>;
};
/**
 * Export conversion tools
 */
export declare const conversionTools: ({
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
            conversionActions: {
                id: string;
                name: string;
                category: string;
                status: string;
                type: string;
                countingType: string;
                attributionWindow: number;
                defaultValue: number | undefined;
                alwaysUseDefaultValue: boolean;
            }[];
            count: number;
            message: string;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                enum: string[];
                description: string;
            };
            countingType: {
                type: string;
                enum: string[];
                description: string;
            };
            attributionWindowDays: {
                type: string;
                description: string;
            };
            valueSettings: {
                type: string;
                properties: {
                    defaultValue: {
                        type: string;
                        description: string;
                    };
                    alwaysUseDefaultValue: {
                        type: string;
                        description: string;
                    };
                };
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
            customerId: any;
            conversionActionId: any;
            name: any;
            category: any;
            countingType: any;
            attributionWindowDays: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
                type: string;
                description: string;
            };
            conversions: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        gclid: {
                            type: string;
                            description: string;
                        };
                        conversionDateTime: {
                            type: string;
                            description: string;
                        };
                        conversionValue: {
                            type: string;
                            description: string;
                        };
                        currencyCode: {
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
            customerId: any;
            conversionActionId: any;
            conversionsUploaded: any;
            totalValue: string;
            result: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
                type: string;
                description: string;
            };
            adjustments: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        gclid: {
                            type: string;
                            description: string;
                        };
                        conversionDateTime: {
                            type: string;
                            description: string;
                        };
                        adjustmentType: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        adjustedValue: {
                            type: string;
                            description: string;
                        };
                        adjustmentDateTime: {
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
            customerId: any;
            conversionActionId: any;
            adjustmentsUploaded: any;
            retractions: any;
            restatements: number;
            totalValueChange: string;
            result: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
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
            conversionAction: {
                id: string;
                name: string;
                category: string;
                status: string;
                type: string;
                countingType: string;
                clickThroughWindow: number;
                viewThroughWindow: number;
                defaultValue: number | undefined;
                alwaysUseDefaultValue: boolean;
                tagSnippets: import("google-ads-node/build/protos/protos.js").google.ads.googleads.v21.common.ITagSnippet[];
            };
            message: string;
        };
    }>;
})[];
//# sourceMappingURL=conversions.d.ts.map