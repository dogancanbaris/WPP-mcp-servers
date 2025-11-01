/**
 * Set Ad Schedule Tool
 *
 * MCP tool for setting ad scheduling (day-parting) for campaigns.
 */
export declare const setAdScheduleTool: {
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
};
//# sourceMappingURL=set-ad-schedule.tool.d.ts.map