/**
 * Export all campaign targeting criteria tools
 */
export { addLocationCriteriaTool } from './add-location-criteria.tool.js';
export { addLanguageCriteriaTool } from './add-language-criteria.tool.js';
export { addDemographicCriteriaTool } from './add-demographic-criteria.tool.js';
export { addAudienceCriteriaTool } from './add-audience-criteria.tool.js';
export { setAdScheduleTool } from './set-ad-schedule.tool.js';
/**
 * All campaign targeting criteria tools
 */
export declare const targetingTools: ({
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
            geoTargetIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            radiusTargeting: {
                type: string;
                properties: {
                    latitude: {
                        type: string;
                    };
                    longitude: {
                        type: string;
                    };
                    radiusMiles: {
                        type: string;
                    };
                };
                description: string;
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
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
            languageIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
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
            ageRanges: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            genders: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            parentalStatuses: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            householdIncomes: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            confirmationToken: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
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
            audienceIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            audienceType: {
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
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
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
            schedules: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        day: {
                            type: string;
                            enum: string[];
                        };
                        startHour: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        startMinute: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        endHour: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        endMinute: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                description: string;
            };
            preset: {
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
    handler(input: any): Promise<import("../../../shared/interactive-workflow.js").McpResponse>;
})[];
//# sourceMappingURL=index.d.ts.map