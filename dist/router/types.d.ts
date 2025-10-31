/**
 * TypeScript types for MCP Router
 */
/**
 * Configuration for a backend MCP server
 */
export interface BackendConfig {
    /** Unique identifier for the backend */
    name: string;
    /** HTTP URL of the backend MCP server */
    url: string;
    /** Prefix to add to tool names (e.g., "google", "meta", "amazon_ads") */
    prefix: string;
    /** Description of the backend platform */
    description: string;
    /** Whether this backend is currently active */
    active: boolean;
    /** Optional health check URL */
    healthCheckUrl?: string;
    /** Optional timeout for requests (ms) */
    timeout?: number;
}
/**
 * MCP Tool definition (from tools/list response)
 */
export interface McpTool {
    /** Tool name */
    name: string;
    /** Optional human-readable title */
    title?: string;
    /** Tool description */
    description?: string;
    /** JSON Schema for input parameters */
    inputSchema: {
        type: string;
        properties?: Record<string, any>;
        required?: string[];
        [key: string]: any;
    };
    /** Optional JSON Schema for output */
    outputSchema?: {
        type: string;
        properties?: Record<string, any>;
        [key: string]: any;
    };
    /** Optional annotations */
    annotations?: {
        audience?: string[];
        priority?: number;
        [key: string]: any;
    };
}
/**
 * Prefixed tool with backend metadata
 */
export interface PrefixedTool extends McpTool {
    /** Original tool name (before prefixing) */
    _originalName: string;
    /** Backend name this tool belongs to */
    _backend: string;
    /** Backend prefix used */
    _prefix: string;
}
/**
 * JSON-RPC request message
 */
export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id: number | string;
    method: string;
    params?: any;
}
/**
 * JSON-RPC response message
 */
export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: number | string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
/**
 * JSON-RPC notification (no id)
 */
export interface JsonRpcNotification {
    jsonrpc: '2.0';
    method: string;
    params?: any;
}
/**
 * Backend health status
 */
export interface BackendHealth {
    name: string;
    url: string;
    healthy: boolean;
    lastChecked: Date;
    error?: string;
    responseTime?: number;
}
/**
 * Router statistics
 */
export interface RouterStats {
    totalBackends: number;
    activeBackends: number;
    totalTools: number;
    toolsByBackend: Record<string, number>;
    uptime: number;
}
/**
 * Tool call result from backend
 */
export interface ToolCallResult {
    content: Array<{
        type: string;
        text?: string;
        data?: string;
        mimeType?: string;
        [key: string]: any;
    }>;
    isError?: boolean;
    structuredContent?: any;
}
//# sourceMappingURL=types.d.ts.map