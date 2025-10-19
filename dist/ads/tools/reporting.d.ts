/**
 * MCP Tools for Google Ads Performance Reporting
 */
/**
 * List campaigns
 */
export declare const listCampaignsTool: {
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
            campaigns: any[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Get campaign performance
 */
export declare const getCampaignPerformanceTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            campaignId: {
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
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            dateRange: string | {
                startDate: any;
                endDate: any;
            };
            campaigns: any[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Get search terms report
 */
export declare const getSearchTermsReportTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            campaignId: {
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
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            dateRange: string | {
                startDate: any;
                endDate: any;
            };
            searchTerms: any[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * List budgets
 */
export declare const listBudgetsTool: {
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
            budgets: any[];
            count: number;
            message: string;
        };
    }>;
};
/**
 * Get keyword performance
 */
export declare const getKeywordPerformanceTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            campaignId: {
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
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            dateRange: string | {
                startDate: any;
                endDate: any;
            };
            keywords: any[];
            count: number;
            message: string;
        };
    }>;
};
//# sourceMappingURL=reporting.d.ts.map