/**
 * Configuration management for GSC MCP server
 */
import { GSCConfig } from './types.js';
/**
 * Configuration manager
 */
declare class ConfigManager {
    private config;
    private configPath;
    private loaded;
    constructor(configPath?: string);
    /**
     * Load configuration from file
     */
    load(): Promise<void>;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Save configuration to file
     */
    save(): Promise<void>;
    /**
     * Get full configuration
     */
    getConfig(): Readonly<GSCConfig>;
    /**
     * Get selected properties
     */
    getSelectedProperties(): string[];
    /**
     * Check if user has access to property
     * Note: With full property discovery enabled, all properties are accessible
     */
    hasAccessToProperty(property: string): boolean;
    /**
     * Verify access to property (throws if no access)
     * Note: With full property discovery enabled, this allows all properties
     */
    verifyAccess(property: string): void;
    /**
     * Get role
     */
    getRole(): string;
    /**
     * Check if role has permission
     */
    hasPermission(requiredRole: 'viewer' | 'editor' | 'admin'): boolean;
    /**
     * Check if approval is required for write operations
     */
    requiresApprovalForWrite(): boolean;
    /**
     * Check if approval is required for delete operations
     */
    requiresApprovalForDelete(): boolean;
    /**
     * Check if audit logging is enabled
     */
    isAuditLoggingEnabled(): boolean;
    /**
     * Add property to selected properties
     */
    addProperty(property: string): Promise<void>;
    /**
     * Remove property from selected properties
     */
    removeProperty(property: string): Promise<void>;
    /**
     * Set role
     */
    setRole(role: 'admin' | 'editor' | 'viewer'): Promise<void>;
    /**
     * Reset to defaults
     */
    reset(): Promise<void>;
}
/**
 * Get configuration manager instance
 */
export declare function getConfigManager(configPath?: string): ConfigManager;
/**
 * Reset configuration manager (for testing)
 */
export declare function resetConfigManager(): void;
export {};
//# sourceMappingURL=config.d.ts.map