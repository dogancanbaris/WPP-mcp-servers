/**
 * Add Location Targeting Criteria Tool
 *
 * MCP tool for adding geographic location targeting to campaigns.
 */
export declare const addLocationCriteriaTool: {
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
};
//# sourceMappingURL=add-location-criteria.tool.d.ts.map