/**
 * MCP Tools for Chrome UX Report API operations
 */
/**
 * Get Core Web Vitals for an origin (entire domain)
 */
export declare const getCoreWebVitalsOriginTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            origin: {
                type: string;
                description: string;
            };
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Get Core Web Vitals for a specific URL
 */
export declare const getCoreWebVitalsUrlTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            url: {
                type: string;
                description: string;
            };
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Get historical Core Web Vitals for an origin
 */
export declare const getCwvHistoryOriginTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            origin: {
                type: string;
                description: string;
            };
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Get historical Core Web Vitals for a specific URL
 */
export declare const getCwvHistoryUrlTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            url: {
                type: string;
                description: string;
            };
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Compare Core Web Vitals across form factors
 */
export declare const compareCwvFormFactorsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            origin: {
                type: string;
                description: string;
            };
            url: {
                type: string;
                description: string;
            };
        };
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
};
/**
 * Export all CrUX tools
 */
export declare const cruxTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            origin: {
                type: string;
                description: string;
            };
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            url: {
                type: string;
                description: string;
            };
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            origin: {
                type: string;
                description: string;
            };
            url: {
                type: string;
                description: string;
            };
        };
    };
    handler(input: any): Promise<import("../shared/interactive-workflow.js").McpResponse>;
})[];
//# sourceMappingURL=tools.d.ts.map