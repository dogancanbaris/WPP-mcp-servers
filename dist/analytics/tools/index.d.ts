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
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
    handler(input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
//# sourceMappingURL=index.d.ts.map