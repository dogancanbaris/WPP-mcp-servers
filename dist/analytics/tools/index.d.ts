/**
 * Export all Google Analytics MCP tools
 */
export { listAnalyticsAccountsTool, listAnalyticsPropertiesTool, listDataStreamsTool, } from './accounts.js';
export { runAnalyticsReportTool, getRealtimeUsersTool } from './reporting/index.js';
export { analyticsAdminTools } from './admin.js';
/**
 * All Google Analytics tools
 */
export declare const analyticsTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
    handler(_input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
        };
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            accountId: any;
            properties: {
                name: any;
                displayName: any;
                timeZone: any;
                currencyCode: any;
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
            propertyId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            streams: {
                name: any;
                type: any;
                displayName: any;
                webStreamData: any;
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
            startDate: {
                type: string;
                description: string;
            };
            endDate: {
                type: string;
                description: string;
            };
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            dateRange: {
                startDate: any;
                endDate: any;
            };
            dimensions: any[];
            metrics: any[];
            rows: import("@google-analytics/data/build/protos/protos.js").google.analytics.data.v1beta.IRow[];
            rowCount: number;
            message: string;
        };
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
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            timeframe: string;
            dimensions: any[];
            metrics: any[];
            rows: import("@google-analytics/data/build/protos/protos.js").google.analytics.data.v1beta.IRow[];
            rowCount: number;
            message: string;
        };
    }>;
})[];
/**
 * Read-only tools (all Analytics tools are read-only)
 */
export declare const readOnlyAnalyticsTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
    handler(_input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            accountId: {
                type: string;
                description: string;
            };
        };
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            accountId: any;
            properties: {
                name: any;
                displayName: any;
                timeZone: any;
                currencyCode: any;
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
            propertyId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            streams: {
                name: any;
                type: any;
                displayName: any;
                webStreamData: any;
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
            startDate: {
                type: string;
                description: string;
            };
            endDate: {
                type: string;
                description: string;
            };
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            dateRange: {
                startDate: any;
                endDate: any;
            };
            dimensions: any[];
            metrics: any[];
            rows: import("@google-analytics/data/build/protos/protos.js").google.analytics.data.v1beta.IRow[];
            rowCount: number;
            message: string;
        };
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
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            metrics: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            propertyId: any;
            timeframe: string;
            dimensions: any[];
            metrics: any[];
            rows: import("@google-analytics/data/build/protos/protos.js").google.analytics.data.v1beta.IRow[];
            rowCount: number;
            message: string;
        };
    }>;
})[];
//# sourceMappingURL=index.d.ts.map