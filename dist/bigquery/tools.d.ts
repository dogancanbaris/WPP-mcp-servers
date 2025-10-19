/**
 * MCP Tools for BigQuery API
 * Datasets, tables, queries, data loading
 */
/**
 * List datasets
 */
export declare const listDatasetsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    handler(_input: any): Promise<{
        success: boolean;
        data: {
            datasets: {
                id: any;
                friendlyName: any;
                location: any;
                creationTime: any;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Create dataset
 */
export declare const createDatasetTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            datasetId: {
                type: string;
                description: string;
            };
            location: {
                type: string;
                description: string;
            };
            description: {
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
            datasetId: any;
            location: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
    }>;
};
/**
 * Run BigQuery SQL query
 */
export declare const runQueryTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sql: {
                type: string;
                description: string;
            };
            maxResults: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            rows: any;
            rowCount: any;
            jobId: any;
            message: string;
        };
    }>;
};
/**
 * Export BigQuery tools
 */
export declare const bigQueryTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    handler(_input: any): Promise<{
        success: boolean;
        data: {
            datasets: {
                id: any;
                friendlyName: any;
                location: any;
                creationTime: any;
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
            datasetId: {
                type: string;
                description: string;
            };
            location: {
                type: string;
                description: string;
            };
            description: {
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
            datasetId: any;
            location: any;
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
            sql: {
                type: string;
                description: string;
            };
            maxResults: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            rows: any;
            rowCount: any;
            jobId: any;
            message: string;
        };
    }>;
})[];
//# sourceMappingURL=tools.d.ts.map