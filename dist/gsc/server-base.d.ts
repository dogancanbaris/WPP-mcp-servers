/**
 * Base GSC MCP Server Class
 *
 * Shared logic for both stdio and HTTP transports.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { GSCAuthManager } from './auth.js';
export interface ServerInitOptions {
    /**
     * Skip OAuth initialization (for per-request OAuth mode)
     */
    skipOAuthInit?: boolean;
    /**
     * Custom auth manager (for per-request OAuth)
     */
    authManager?: GSCAuthManager;
}
/**
 * Base server class with shared logic
 */
export declare class GSCMCPServerBase {
    protected server: Server;
    protected authManager: GSCAuthManager | null;
    private initialized;
    constructor();
    /**
     * Get the MCP server instance
     */
    getServer(): Server;
    /**
     * Setup request handlers for tools
     */
    protected setupHandlers(): void;
    /**
     * Initialize server (configuration, auth, API clients)
     */
    initialize(options?: ServerInitOptions): Promise<void>;
}
//# sourceMappingURL=server-base.d.ts.map