/**
 * Export all MCP tools
 */
export { listPropertiesTool, getPropertyTool, addPropertyTool } from './properties.js';
export { querySearchAnalyticsTool } from './analytics.js';
export { listSitemapsTool, getSitemapTool, submitSitemapTool, deleteSitemapTool, } from './sitemaps.js';
export { inspectUrlTool } from './url-inspection.js';
export declare const allTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            customerId: {
                type: string;
                description: string;
            };
            assetType: {
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
            customerId: any;
            assets: {
                id: string;
                name: string;
                type: string;
                imageUrl: string | undefined;
                youtubeVideoId: string | undefined;
                text: string | undefined;
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
            userLists: {
                id: string;
                name: string;
                type: string;
                sizeForDisplay: number;
                sizeForSearch: number;
                membershipDays: number;
                matchRate: number | undefined;
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
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            membershipDays: {
                type: string;
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
            customerId: any;
            userListId: any;
            name: any;
            membershipDays: any;
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
            customerId: {
                type: string;
                description: string;
            };
            userListId: {
                type: string;
                description: string;
            };
            customers: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        hashedEmail: {
                            type: string;
                            description: string;
                        };
                        hashedPhoneNumber: {
                            type: string;
                            description: string;
                        };
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
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            customerId: any;
            userListId: any;
            customersUploaded: any;
            result: any;
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
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
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
            customerId: any;
            audienceId: any;
            name: any;
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
            strategies: {
                id: string;
                name: string;
                type: string;
                campaignCount: number;
                targetCpa: number | undefined;
                targetRoas: number | undefined;
                status: string;
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
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            dailyAmountDollars: {
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
            customerId: any;
            budgetId: any;
            name: any;
            dailyAmount: string;
            monthlyEstimate: string;
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
            customerId: {
                type: string;
                description: string;
            };
            budgetId: {
                type: string;
                description: string;
            };
            newDailyAmountDollars: {
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
            conversionActions: {
                id: string;
                name: string;
                category: string;
                status: string;
                type: string;
                countingType: string;
                attributionWindow: number;
                defaultValue: number | undefined;
                alwaysUseDefaultValue: boolean;
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
            customerId: any;
            conversionActionId: any;
            name: any;
            category: any;
            countingType: any;
            attributionWindowDays: any;
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
            customerId: any;
            conversionActionId: any;
            conversionsUploaded: any;
            totalValue: string;
            result: any;
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
            customerId: any;
            conversionActionId: any;
            adjustmentsUploaded: any;
            retractions: any;
            restatements: number;
            totalValueChange: string;
            result: any;
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
            customerId: {
                type: string;
                description: string;
            };
            conversionActionId: {
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
            conversionAction: {
                id: string;
                name: string;
                category: string;
                status: string;
                type: string;
                countingType: string;
                clickThroughWindow: number;
                viewThroughWindow: number;
                defaultValue: number | undefined;
                alwaysUseDefaultValue: boolean;
                tagSnippets: import("google-ads-node/build/protos/protos.js").google.ads.googleads.v21.common.ITagSnippet[];
            };
            message: string;
        };
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
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            extensions: {
                id: string;
                name: string;
                type: string;
                sitelinkText: string | undefined;
                phoneNumber: string | undefined;
                snippetHeader: string | undefined;
                promotionTarget: string | undefined;
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
            campaignId: {
                type: string;
                description: string;
            };
            status: {
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
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            customerId: any;
            campaignId: any;
            campaignName: any;
            previousStatus: any;
            newStatus: any;
            result: any;
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
            customerId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            budgetId: {
                type: string;
                description: string;
            };
            campaignType: {
                type: string;
                enum: string[];
                description: string;
            };
            status: {
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
            customerId: any;
            campaignId: any;
            name: any;
            campaignType: any;
            status: any;
            message: string;
        };
        warning: string[];
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
            adGroupId: {
                type: string;
                description: string;
            };
            keywords: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        text: {
                            type: string;
                            description: string;
                        };
                        matchType: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        maxCpcDollars: {
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
            customerId: any;
            adGroupId: any;
            keywordsAdded: any;
            matchTypeBreakdown: any;
            keywords: any;
            result: any;
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
            customerId: {
                type: string;
                description: string;
            };
            campaignId: {
                type: string;
                description: string;
            };
            keywords: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        text: {
                            type: string;
                            description: string;
                        };
                        matchType: {
                            type: string;
                            enum: string[];
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
            customerId: any;
            campaignId: any;
            negativesAdded: any;
            keywords: any;
            result: any;
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
            customerId: {
                type: string;
                description: string;
            };
            seedKeywords: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            pageUrl: {
                type: string;
                description: string;
            };
            languageCode: {
                type: string;
                description: string;
            };
            geoTargetIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            customerId: any;
            keywordIdeas: {
                keyword: any;
                avgMonthlySearches: number;
                competition: any;
                lowTopPageBid: number | undefined;
                highTopPageBid: number | undefined;
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            siteUrl: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            requiresApproval: boolean;
            dryRun: import("../types.js").DryRunResult;
            message: string;
            property?: undefined;
        };
    } | {
        success: boolean;
        data: {
            property: any;
            message: string;
            requiresApproval?: undefined;
            dryRun?: undefined;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
            sitemapUrl: {
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
            property: any;
            sitemapUrl: any;
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
            property: {
                type: string;
                description: string;
            };
            url: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: any;
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
            history: import("../../crux/types.js").HistoricalRecord;
            collectionPeriods: import("../../crux/types.js").CollectionPeriod[];
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
            history: import("../../crux/types.js").HistoricalRecord;
            collectionPeriods: import("../../crux/types.js").CollectionPeriod[];
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
            location: import("googleapis").mybusinessbusinessinformation_v1.Schema$Location;
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    handler(_input: any): Promise<import("../../shared/interactive-workflow.js").McpResponse>;
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
            rows: any[];
            rowCount: number;
            jobId: string | undefined;
            message: string;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            numResults: {
                type: string;
                description: string;
            };
            location: {
                type: string;
                description: string;
            };
            device: {
                type: string;
                enum: string[];
                description: string;
            };
            gl: {
                type: string;
                description: string;
            };
            hl: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            query: any;
            results: any;
            message: string;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            platform: {
                type: string;
                enum: string[];
                description: string;
            };
            property: {
                type: string;
                description: string;
            };
            dateRange: {
                type: string;
                items: {
                    type: string;
                };
                minItems: number;
                maxItems: number;
                description: string;
            };
            dimensions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            tableName: {
                type: string;
                description: string;
            };
            workspaceId: {
                type: string;
                description: string;
            };
            useSharedTable: {
                type: string;
                description: string;
                default: boolean;
            };
            __oauthToken: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        error: string;
        table?: undefined;
        tableName?: undefined;
        rows_inserted?: undefined;
        dimensions_pulled?: undefined;
        platform?: undefined;
        property?: undefined;
        dateRange?: undefined;
    } | {
        success: boolean;
        table: string;
        tableName: string;
        rows_inserted: number;
        dimensions_pulled: any;
        platform: any;
        property: any;
        dateRange: any;
        error?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            bigqueryTable: {
                type: string;
            };
            dateRange: {
                type: string;
                items: {
                    type: string;
                };
                minItems: number;
                maxItems: number;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        insights: {
            totals: {
                clicks: any;
                impressions: any;
                ctr: string;
                position: any;
            };
            trends: {
                firstWeekAvg: string;
                lastWeekAvg: string;
                clicksChange: string;
                direction: string;
            };
            topPerformers: {
                topPage: {
                    url: any;
                    clicks: any;
                    share: string;
                    position: any;
                };
                topQuery: {
                    query: any;
                    clicks: any;
                    position: any;
                };
                top5Pages: {
                    url: any;
                    clicks: any;
                }[];
                top5Queries: {
                    query: any;
                    clicks: any;
                    position: any;
                }[];
            };
            deviceInsights: {
                mobileShare: string;
                mobileCTR: string;
                desktopCTR: string;
                mobileAdvantage: string;
            };
            geoInsights: {
                topCountry: any;
                topCountryShare: string;
                highestCTRCountry: any;
                highestCTR: string;
                top5Countries: {
                    country: any;
                    clicks: any;
                    ctr: string;
                }[];
            };
        };
        usage_instructions: string[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        insights?: undefined;
        usage_instructions?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            title: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            datasource: {
                type: string;
                description: string;
            };
            dataset_id: {
                type: string;
                description: string;
            };
            pages: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        name: {
                            type: string;
                            description: string;
                        };
                        order: {
                            type: string;
                            description: string;
                        };
                        filters: {
                            type: string;
                            description: string;
                            items: {
                                type: string;
                                properties: {
                                    field: {
                                        type: string;
                                    };
                                    operator: {
                                        type: string;
                                    };
                                    values: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                        pageStyles: {
                            type: string;
                            description: string;
                            properties: {
                                backgroundColor: {
                                    type: string;
                                };
                                padding: {
                                    type: string;
                                };
                                gap: {
                                    type: string;
                                };
                            };
                        };
                        rows: {
                            type: string;
                            description: string;
                            items: {
                                type: string;
                                properties: {
                                    columns: {
                                        type: string;
                                        items: {
                                            type: string;
                                            properties: {
                                                width: {
                                                    type: string;
                                                    enum: string[];
                                                };
                                                component: {
                                                    type: string;
                                                    properties: {
                                                        type: {
                                                            type: string;
                                                        };
                                                        title: {
                                                            type: string;
                                                        };
                                                        dimension: {
                                                            type: string;
                                                        };
                                                        metrics: {
                                                            type: string;
                                                            items: {
                                                                type: string;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    required: string[];
                };
            };
            rows: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        columns: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    width: {
                                        type: string;
                                        enum: string[];
                                    };
                                    component: {
                                        type: string;
                                        properties: {
                                            type: {
                                                type: string;
                                            };
                                            title: {
                                                type: string;
                                            };
                                            dimension: {
                                                type: string;
                                            };
                                            metrics: {
                                                type: string;
                                                items: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    required: string[];
                };
            };
            theme: {
                type: string;
                description: string;
                properties: {
                    primaryColor: {
                        type: string;
                    };
                    backgroundColor: {
                        type: string;
                    };
                    textColor: {
                        type: string;
                    };
                    borderColor: {
                        type: string;
                    };
                };
            };
            globalStyles: {
                type: string;
                description: string;
                properties: {
                    backgroundColor: {
                        type: string;
                    };
                    padding: {
                        type: string;
                    };
                    gap: {
                        type: string;
                    };
                };
            };
            workspaceId: {
                type: string;
                description: string;
            };
            supabaseUrl: {
                type: string;
                description: string;
            };
            supabaseKey: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        dashboard_id: string;
        dashboard_url: string;
        workspace_id: string;
        page_count: number;
        component_count: number;
        created_at: string;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: string[];
        dashboard_id?: undefined;
        dashboard_url?: undefined;
        workspace_id?: undefined;
        page_count?: undefined;
        component_count?: undefined;
        created_at?: undefined;
    } | {
        success: boolean;
        error: string;
        dashboard_id?: undefined;
        dashboard_url?: undefined;
        workspace_id?: undefined;
        page_count?: undefined;
        component_count?: undefined;
        created_at?: undefined;
        details?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            dashboard_id: {
                type: string;
                description: string;
            };
            supabaseUrl: {
                type: string;
                description: string;
            };
            supabaseKey: {
                type: string;
                description: string;
            };
            includeMetadata: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        dashboard: any;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: string[];
        dashboard?: undefined;
    } | {
        success: boolean;
        error: string;
        dashboard?: undefined;
        details?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            workspaceId: {
                type: string;
                description: string;
            };
            search: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            supabaseUrl: {
                type: string;
                description: string;
            };
            supabaseKey: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<{
        success: boolean;
        dashboards: {
            id: any;
            name: any;
            description: any;
            workspace_id: any;
            datasource: any;
            dashboard_url: string;
            created_at: any;
            updated_at: any;
            view_count: any;
        }[];
        count: number;
        total: number;
        filters: {
            workspaceId: string;
            search: string;
        };
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: string[];
        dashboards?: undefined;
        count?: undefined;
        total?: undefined;
        filters?: undefined;
    } | {
        success: boolean;
        error: string;
        dashboards?: undefined;
        count?: undefined;
        total?: undefined;
        filters?: undefined;
        details?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            dashboard_id: {
                type: string;
                description: string;
            };
            workspaceId: {
                type: string;
                description: string;
            };
            operation: {
                type: string;
                enum: string[];
                description: string;
            };
            data: {
                type: string;
                description: string;
            };
            supabaseUrl: {
                type: string;
                description: string;
            };
            supabaseKey: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        updated_at: string;
        page_id?: string | undefined;
        success: boolean;
        dashboard_id: string;
        operation: "add_page" | "remove_page" | "update_page" | "reorder_pages" | "add_row_to_page" | "remove_row_from_page" | "update_component_in_page" | "set_page_filters" | "set_component_filters";
        page_count: number;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: string[];
    } | {
        success: boolean;
        error: string;
        details?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            dashboard_id: {
                type: string;
                description: string;
            };
            workspaceId: {
                type: string;
                description: string;
            };
            confirm: {
                type: string;
                description: string;
            };
            supabaseUrl: {
                type: string;
                description: string;
            };
            supabaseKey: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        dashboard_id: string;
        dashboard_name: any;
        deleted: boolean;
        deleted_at: string;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: string[];
        dashboard_id?: undefined;
        dashboard_name?: undefined;
        deleted?: undefined;
        deleted_at?: undefined;
    } | {
        success: boolean;
        error: string;
        dashboard_id?: undefined;
        dashboard_name?: undefined;
        deleted?: undefined;
        deleted_at?: undefined;
        details?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            workspace_id: {
                type: string;
                description: string;
            };
            platform: {
                type: string;
                description: string;
            };
            supabaseUrl: {
                type: string;
                description: string;
            };
            supabaseKey: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        datasets: never[];
        total_count: number;
        by_platform: {};
        message: string;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        datasets: {
            id: any;
            name: any;
            description: any;
            bigquery_table: any;
            platform: any;
            property: any;
            dashboard_count: number;
            last_refreshed: any;
            estimated_rows: any;
            data_freshness_days: any;
            created_at: any;
            updated_at: any;
        }[];
        total_count: number;
        by_platform: Record<string, number>;
        message?: undefined;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: string[];
        datasets?: undefined;
        total_count?: undefined;
        by_platform?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        datasets?: undefined;
        total_count?: undefined;
        by_platform?: undefined;
        message?: undefined;
        details?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            bigqueryTable: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            dateRange: {
                type: string;
                items: {
                    type: string;
                };
                minItems: number;
                maxItems: number;
            };
            platform: {
                type: string;
                enum: string[];
            };
            workspace_id: {
                type: string;
            };
            pages: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        name: {
                            type: string;
                            description: string;
                        };
                        template: {
                            type: string;
                            description: string;
                        };
                        filters: {
                            type: string;
                            description: string;
                            items: {
                                type: string;
                                properties: {
                                    field: {
                                        type: string;
                                    };
                                    operator: {
                                        type: string;
                                    };
                                    values: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    required: string[];
                };
            };
            template: {
                type: string;
                description: string;
            };
            rows: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        error: string;
        dashboard_id?: undefined;
        dataset_id?: undefined;
        dashboard_url?: undefined;
        view_url?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        dashboard_id: string;
        dataset_id: string;
        dashboard_url: string;
        view_url: string;
        message: string;
        error?: undefined;
    }>;
})[];
export declare const readTools: ({
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
            property: {
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
            property: {
                type: string;
                description: string;
            };
            url: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: any;
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
            history: import("../../crux/types.js").HistoricalRecord;
            collectionPeriods: import("../../crux/types.js").CollectionPeriod[];
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
            history: import("../../crux/types.js").HistoricalRecord;
            collectionPeriods: import("../../crux/types.js").CollectionPeriod[];
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
export declare const writeTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            siteUrl: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        success: boolean;
        data: {
            requiresApproval: boolean;
            dryRun: import("../types.js").DryRunResult;
            message: string;
            property?: undefined;
        };
    } | {
        success: boolean;
        data: {
            property: any;
            message: string;
            requiresApproval?: undefined;
            dryRun?: undefined;
        };
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            property: {
                type: string;
                description: string;
            };
            sitemapUrl: {
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
            property: any;
            sitemapUrl: any;
            message: string;
        };
        requiresApproval?: undefined;
        preview?: undefined;
        confirmationToken?: undefined;
        message?: undefined;
    }>;
})[];
//# sourceMappingURL=index.d.ts.map