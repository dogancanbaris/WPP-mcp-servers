/**
 * HTTP Server for OMA Integration
 * Provides REST API endpoints for OMA platform to execute MCP tools
 */
/**
 * HTTP server for MCP operations
 */
export declare class MCPHttpServer {
    private app;
    private port;
    constructor(port?: number);
    /**
     * Setup middleware
     */
    private setupMiddleware;
    /**
     * Authenticate OMA API requests
     */
    private authenticateRequest;
    /**
     * Setup routes
     */
    private setupRoutes;
    /**
     * List available tools
     */
    private listTools;
    /**
     * Execute MCP tool
     */
    private executeTool;
    /**
     * Confirm pending operation
     */
    private confirmOperation;
    /**
     * Rollback operation
     */
    private rollbackOperation;
    /**
     * Get snapshots for account
     */
    private getSnapshots;
    /**
     * Get snapshot details
     */
    private getSnapshotDetails;
    /**
     * Error handler
     */
    private errorHandler;
    /**
     * Start server
     */
    start(): Promise<void>;
}
/**
 * Create and start HTTP server
 */
export declare function startHttpServer(port?: number): Promise<MCPHttpServer>;
//# sourceMappingURL=server.d.ts.map