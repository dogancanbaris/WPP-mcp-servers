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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            message: string;
            lcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            inp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            cls?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            fcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            ttfb?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            collectionPeriod?: {
                start: string;
                end: string;
            };
            origin: any;
            formFactor: any;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            message: string;
            lcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            inp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            cls?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            fcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            ttfb?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            collectionPeriod?: {
                start: string;
                end: string;
            };
            url: any;
            formFactor: any;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            origin: any;
            formFactor: any;
            history: import("./types.js").HistoricalRecord;
            collectionPeriods: import("./types.js").CollectionPeriod[];
            message: string;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            url: any;
            formFactor: any;
            history: import("./types.js").HistoricalRecord;
            collectionPeriods: import("./types.js").CollectionPeriod[];
            message: string;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: any;
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            message: string;
            lcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            inp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            cls?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            fcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            ttfb?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            collectionPeriod?: {
                start: string;
                end: string;
            };
            origin: any;
            formFactor: any;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            message: string;
            lcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            inp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            cls?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            fcp?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            ttfb?: {
                p75: number;
                good: number;
                needsImprovement: number;
                poor: number;
            };
            collectionPeriod?: {
                start: string;
                end: string;
            };
            url: any;
            formFactor: any;
        };
    }>;
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
            formFactor: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            origin: any;
            formFactor: any;
            history: import("./types.js").HistoricalRecord;
            collectionPeriods: import("./types.js").CollectionPeriod[];
            message: string;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: {
            url: any;
            formFactor: any;
            history: import("./types.js").HistoricalRecord;
            collectionPeriods: import("./types.js").CollectionPeriod[];
            message: string;
        };
    }>;
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
    handler(input: any): Promise<{
        success: boolean;
        data: any;
    }>;
})[];
//# sourceMappingURL=tools.d.ts.map