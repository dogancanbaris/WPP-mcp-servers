/**
 * MCP Tools for Google Analytics Admin API
 * Property management, data streams, custom dimensions/metrics, audiences, conversion events
 */
/**
 * Create GA4 property
 */
export declare const createPropertyTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            timeZone: {
                type: string;
                description: string;
            };
            currencyCode: {
                type: string;
                description: string;
            };
            industryCategory: {
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
 * Create data stream
 */
export declare const createDataStreamTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
            streamType: {
                type: string;
                enum: string[];
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            websiteUrl: {
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
 * Create custom dimension
 */
export declare const createCustomDimensionTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            parameterName: {
                type: string;
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
                description: string;
            };
            description: {
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
 * Create custom metric
 */
export declare const createCustomMetricTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            parameterName: {
                type: string;
                description: string;
            };
            measurementUnit: {
                type: string;
                enum: string[];
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
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
 * Create conversion event
 */
export declare const createConversionEventTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
            };
            eventName: {
                type: string;
                description: string;
            };
            confirmationToken: {
                type: string;
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
 * Link Google Ads to GA4
 */
export declare const createGoogleAdsLinkTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
            };
            googleAdsCustomerId: {
                type: string;
                description: string;
            };
            confirmationToken: {
                type: string;
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
 * Export analytics admin tools
 */
export declare const analyticsAdminTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            timeZone: {
                type: string;
                description: string;
            };
            currencyCode: {
                type: string;
                description: string;
            };
            industryCategory: {
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
            streamType: {
                type: string;
                enum: string[];
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            websiteUrl: {
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            parameterName: {
                type: string;
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
                description: string;
            };
            description: {
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
                description: string;
            };
            displayName: {
                type: string;
                description: string;
            };
            parameterName: {
                type: string;
                description: string;
            };
            measurementUnit: {
                type: string;
                enum: string[];
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            propertyId: {
                type: string;
            };
            eventName: {
                type: string;
                description: string;
            };
            confirmationToken: {
                type: string;
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
            propertyId: {
                type: string;
            };
            googleAdsCustomerId: {
                type: string;
                description: string;
            };
            confirmationToken: {
                type: string;
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
//# sourceMappingURL=admin.d.ts.map