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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
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
        required: never[];
    };
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse | {
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        message: string;
    }>;
})[];
//# sourceMappingURL=conversions.d.ts.map