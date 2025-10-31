/**
 * Backend Registry - Manages backend MCP servers
 */
import type { BackendConfig, PrefixedTool, BackendHealth, RouterStats } from './types.js';
export declare class BackendRegistry {
    private backends;
    private httpClient;
    private toolCache;
    private lastRefresh;
    constructor();
    /**
     * Register a backend MCP server
     */
    registerBackend(config: BackendConfig): void;
    /**
     * Get backend configuration
     */
    getBackend(name: string): BackendConfig | undefined;
    /**
     * List all registered backends
     */
    listBackends(): BackendConfig[];
    /**
     * List only active backends
     */
    listActiveBackends(): BackendConfig[];
    /**
     * Activate a backend
     */
    activateBackend(name: string): Promise<void>;
    /**
     * Deactivate a backend
     */
    deactivateBackend(name: string): void;
    /**
     * Refresh tools from a specific backend
     */
    refreshBackendTools(backendName: string): Promise<void>;
    /**
     * Refresh tools from all active backends
     */
    refreshAllTools(): Promise<void>;
    /**
     * Remove all tools from a specific backend
     */
    private removeBackendTools;
    /**
     * Get all cached tools (aggregated from all active backends)
     */
    getAllTools(): PrefixedTool[];
    /**
     * Get a specific tool by prefixed name
     */
    getTool(prefixedName: string): PrefixedTool | undefined;
    /**
     * Get tools from a specific backend
     */
    getToolsByBackend(backendName: string): PrefixedTool[];
    /**
     * Check health of all backends
     */
    checkAllBackendsHealth(): Promise<BackendHealth[]>;
    /**
     * Get router statistics
     */
    getStats(startTime: number): RouterStats;
    /**
     * Call a tool on its backend
     */
    callTool(prefixedToolName: string, args: any): Promise<any>;
}
//# sourceMappingURL=backend-registry.d.ts.map