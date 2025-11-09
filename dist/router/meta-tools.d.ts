/**
 * Meta-Tools for On-Demand Tool Discovery and Execution
 *
 * Enables lazy loading pattern: Only 3 meta-tools loaded upfront (~2K tokens),
 * real tools discovered and loaded on-demand (97% token reduction).
 *
 * Pattern:
 * 1. search_tools - Find tools by keyword/category
 * 2. get_tool_schema - Load full schema for specific tool
 * 3. execute_tool - Execute discovered tool with interactive workflows
 */
import type { BackendRegistry } from './backend-registry.js';
/**
 * Tool metadata for discovery
 */
interface ToolMetadata {
    name: string;
    description: string;
    category?: string;
    platform?: string;
}
/**
 * Create search_tools meta-tool
 */
export declare function createSearchToolsMeta(registry: BackendRegistry): {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                description: string;
            };
            platform: {
                type: string;
                enum: string[];
                description: string;
            };
            detailLevel: {
                type: string;
                enum: string[];
                description: string;
            };
        };
    };
    handler(input: any): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
        categories: string[];
        totalTools: number;
        tools?: undefined;
        count?: undefined;
    } | {
        content: {
            type: "text";
            text: string;
        }[];
        tools: string[];
        count: number;
        categories?: undefined;
        totalTools?: undefined;
    } | {
        content: {
            type: "text";
            text: string;
        }[];
        tools: ToolMetadata[];
        count: number;
        categories?: undefined;
        totalTools?: undefined;
    }>;
};
/**
 * Create get_tool_schema meta-tool
 */
export declare function createGetToolSchemaMeta(registry: BackendRegistry): {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            toolName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
        error: string;
        tool?: undefined;
    } | {
        content: {
            type: "text";
            text: string;
        }[];
        tool: {
            name: any;
            fullName: string;
            description: string | undefined;
            inputSchema: {
                [key: string]: any;
                type: string;
                properties?: Record<string, any>;
                required?: string[];
            };
            category: string | null;
        };
        error?: undefined;
    }>;
};
/**
 * Create execute_tool meta-tool
 */
export declare function createExecuteToolMeta(registry: BackendRegistry): {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            toolName: {
                type: string;
                description: string;
            };
            params: {
                type: string;
                description: string;
            };
            __oauthToken: {
                type: string;
                description: string;
            };
            __refreshToken: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<any>;
};
/**
 * Get all meta-tools for router
 */
export declare function getMetaTools(registry: BackendRegistry): ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                description: string;
            };
            platform: {
                type: string;
                enum: string[];
                description: string;
            };
            detailLevel: {
                type: string;
                enum: string[];
                description: string;
            };
        };
    };
    handler(input: any): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
        categories: string[];
        totalTools: number;
        tools?: undefined;
        count?: undefined;
    } | {
        content: {
            type: "text";
            text: string;
        }[];
        tools: string[];
        count: number;
        categories?: undefined;
        totalTools?: undefined;
    } | {
        content: {
            type: "text";
            text: string;
        }[];
        tools: ToolMetadata[];
        count: number;
        categories?: undefined;
        totalTools?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            toolName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
        error: string;
        tool?: undefined;
    } | {
        content: {
            type: "text";
            text: string;
        }[];
        tool: {
            name: any;
            fullName: string;
            description: string | undefined;
            inputSchema: {
                [key: string]: any;
                type: string;
                properties?: Record<string, any>;
                required?: string[];
            };
            category: string | null;
        };
        error?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            toolName: {
                type: string;
                description: string;
            };
            params: {
                type: string;
                description: string;
            };
            __oauthToken: {
                type: string;
                description: string;
            };
            __refreshToken: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: any): Promise<any>;
})[];
export {};
//# sourceMappingURL=meta-tools.d.ts.map