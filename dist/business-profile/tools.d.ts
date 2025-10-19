/**
 * MCP Tools for Google Business Profile API
 * Location management, reviews, posts, media, performance
 */
/**
 * List business locations
 */
export declare const listLocationsTool: {
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            accountId: any;
            locations: {
                name: any;
                locationId: any;
                title: any;
                address: any;
                websiteUri: any;
                phoneNumbers: any;
                categories: any;
            }[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Get location details
 */
export declare const getLocationTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            locationName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            location: any;
            message: string;
        };
    }>;
};
/**
 * Update business location
 */
export declare const updateLocationTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            locationName: {
                type: string;
                description: string;
            };
            updates: {
                type: string;
                description: string;
                properties: {
                    title: {
                        type: string;
                    };
                    websiteUri: {
                        type: string;
                    };
                    phoneNumbers: {
                        type: string;
                    };
                    regularHours: {
                        type: string;
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
        data?: undefined;
    } | {
        success: boolean;
        data: {
            locationName: any;
            updatedFields: string[];
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
    }>;
};
/**
 * Export Business Profile tools
 */
export declare const businessProfileTools: ({
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
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            accountId: any;
            locations: {
                name: any;
                locationId: any;
                title: any;
                address: any;
                websiteUri: any;
                phoneNumbers: any;
                categories: any;
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
            locationName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            location: any;
            message: string;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            locationName: {
                type: string;
                description: string;
            };
            updates: {
                type: string;
                description: string;
                properties: {
                    title: {
                        type: string;
                    };
                    websiteUri: {
                        type: string;
                    };
                    phoneNumbers: {
                        type: string;
                    };
                    regularHours: {
                        type: string;
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
        data?: undefined;
    } | {
        success: boolean;
        data: {
            locationName: any;
            updatedFields: string[];
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
    }>;
})[];
//# sourceMappingURL=tools.d.ts.map