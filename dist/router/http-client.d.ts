/**
 * HTTP Client for calling backend MCP servers
 */
export declare class McpHttpClient {
    private requestId;
    /**
     * Call a backend MCP server via HTTP
     */
    call(backendUrl: string, method: string, params?: any, timeout?: number): Promise<any>;
    /**
     * Check if backend is healthy
     */
    healthCheck(backendUrl: string, timeout?: number): Promise<boolean>;
}
//# sourceMappingURL=http-client.d.ts.map