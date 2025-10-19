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
            accountId: any;
            propertyId: any;
            displayName: any;
            timeZone: any;
            currencyCode: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
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
            propertyId: any;
            streamId: any;
            measurementId: any;
            displayName: any;
            streamType: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
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
            propertyId: any;
            dimensionId: any;
            displayName: any;
            parameterName: any;
            scope: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            propertyId: any;
            metricId: any;
            displayName: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            propertyId: any;
            eventName: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            propertyId: any;
            googleAdsCustomerId: any;
            linkId: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
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
            accountId: any;
            propertyId: any;
            displayName: any;
            timeZone: any;
            currencyCode: any;
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
            propertyId: any;
            streamId: any;
            measurementId: any;
            displayName: any;
            streamType: any;
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
            propertyId: any;
            dimensionId: any;
            displayName: any;
            parameterName: any;
            scope: any;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            propertyId: any;
            metricId: any;
            displayName: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            propertyId: any;
            eventName: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        requiresApproval: boolean;
        preview: string;
        confirmationToken: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            propertyId: any;
            googleAdsCustomerId: any;
            linkId: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
    }>;
})[];
//# sourceMappingURL=admin.d.ts.map