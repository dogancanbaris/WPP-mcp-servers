/**
 * Configuration loader for MCP Router
 */
import type { BackendConfig } from './types.js';
/**
 * Load backend configurations from environment variables
 */
export declare function loadBackendConfigs(): BackendConfig[];
/**
 * Get router configuration
 */
export interface RouterConfig {
    /** Port for HTTP transport (0 = disabled) */
    httpPort: number;
    /** Transport mode: 'stdio' | 'http' | 'both' */
    transport: 'stdio' | 'http' | 'both';
    /** Refresh interval for backend tools (ms, 0 = disabled) */
    refreshInterval: number;
    /** Enable health checks for backends */
    healthCheckEnabled: boolean;
    /** Health check interval (ms) */
    healthCheckInterval: number;
}
/**
 * Load router configuration from environment
 */
export declare function loadRouterConfig(): RouterConfig;
/**
 * Validate backend configuration
 */
export declare function validateBackendConfig(config: BackendConfig): string[];
//# sourceMappingURL=config.d.ts.map