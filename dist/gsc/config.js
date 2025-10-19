/**
 * Configuration management for GSC MCP server
 */
import { ConfigurationError, AccountAccessError } from '../shared/errors.js';
import { readJsonFile, writeJsonFile, validateGSCProperty, deepMerge } from '../shared/utils.js';
import { getLogger } from '../shared/logger.js';
const logger = getLogger('gsc.config');
/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
    selectedProperties: [], // Optional - not required for property discovery
    role: 'admin',
    auditLogging: true,
    requireApproval: {
        writeOperations: true,
        deleteOperations: true,
    },
};
/**
 * Configuration manager
 */
class ConfigManager {
    constructor(configPath) {
        this.loaded = false;
        this.configPath = configPath || process.env.GSC_CONFIG_PATH || './config/gsc-config.json';
        this.config = { ...DEFAULT_CONFIG };
    }
    /**
     * Load configuration from file
     */
    async load() {
        try {
            const fileConfig = await readJsonFile(this.configPath);
            this.config = deepMerge(DEFAULT_CONFIG, fileConfig);
            this.validateConfig();
            this.loaded = true;
            logger.info('Configuration loaded successfully', {
                configPath: this.configPath,
                propertiesCount: this.config.selectedProperties?.length || 0,
                role: this.config.role,
            });
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, use defaults
                logger.info('Config file not found, using defaults', { configPath: this.configPath });
                this.loaded = true;
            }
            else {
                logger.error('Failed to load configuration', error);
                throw new ConfigurationError(`Failed to load configuration from ${this.configPath}: ${error.message}`);
            }
        }
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        // Validate properties format if specified
        if (this.config.selectedProperties) {
            for (const property of this.config.selectedProperties) {
                try {
                    validateGSCProperty(property);
                }
                catch (error) {
                    throw new ConfigurationError(`Invalid property in configuration: ${error.message}`);
                }
            }
        }
        // Validate role
        if (!['admin', 'editor', 'viewer'].includes(this.config.role)) {
            throw new ConfigurationError(`Invalid role: ${this.config.role}`);
        }
        // Validate approval requirements
        if (typeof this.config.requireApproval.writeOperations !== 'boolean') {
            throw new ConfigurationError('Invalid requireApproval.writeOperations setting');
        }
        if (typeof this.config.requireApproval.deleteOperations !== 'boolean') {
            throw new ConfigurationError('Invalid requireApproval.deleteOperations setting');
        }
    }
    /**
     * Save configuration to file
     */
    async save() {
        try {
            this.validateConfig();
            await writeJsonFile(this.configPath, this.config);
            logger.info('Configuration saved successfully', { configPath: this.configPath });
        }
        catch (error) {
            logger.error('Failed to save configuration', error);
            throw new ConfigurationError(`Failed to save configuration to ${this.configPath}: ${error.message}`);
        }
    }
    /**
     * Get full configuration
     */
    getConfig() {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        return Object.freeze({ ...this.config });
    }
    /**
     * Get selected properties
     */
    getSelectedProperties() {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        return this.config.selectedProperties ? [...this.config.selectedProperties] : [];
    }
    /**
     * Check if user has access to property
     * Note: With full property discovery enabled, all properties are accessible
     */
    hasAccessToProperty(property) {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        // If selectedProperties is empty or undefined, allow all properties (discovery mode)
        if (!this.config.selectedProperties || this.config.selectedProperties.length === 0) {
            return true;
        }
        return this.config.selectedProperties.includes(property);
    }
    /**
     * Verify access to property (throws if no access)
     * Note: With full property discovery enabled, this allows all properties
     */
    verifyAccess(property) {
        if (!this.hasAccessToProperty(property)) {
            throw new AccountAccessError(property);
        }
    }
    /**
     * Get role
     */
    getRole() {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        return this.config.role;
    }
    /**
     * Check if role has permission
     */
    hasPermission(requiredRole) {
        const roleLevel = {
            viewer: 1,
            editor: 2,
            admin: 3,
        };
        const requiredLevel = roleLevel[requiredRole];
        const currentLevel = roleLevel[this.config.role];
        return currentLevel >= requiredLevel;
    }
    /**
     * Check if approval is required for write operations
     */
    requiresApprovalForWrite() {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        return this.config.requireApproval.writeOperations;
    }
    /**
     * Check if approval is required for delete operations
     */
    requiresApprovalForDelete() {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        return this.config.requireApproval.deleteOperations;
    }
    /**
     * Check if audit logging is enabled
     */
    isAuditLoggingEnabled() {
        if (!this.loaded) {
            throw new ConfigurationError('Configuration not loaded. Call load() first.');
        }
        return this.config.auditLogging;
    }
    /**
     * Add property to selected properties
     */
    async addProperty(property) {
        try {
            validateGSCProperty(property);
        }
        catch (error) {
            throw new ConfigurationError(`Invalid property: ${error.message}`);
        }
        if (!this.config.selectedProperties) {
            this.config.selectedProperties = [];
        }
        if (!this.config.selectedProperties.includes(property)) {
            this.config.selectedProperties.push(property);
            await this.save();
            logger.info('Property added to configuration', { property });
        }
    }
    /**
     * Remove property from selected properties
     */
    async removeProperty(property) {
        if (!this.config.selectedProperties) {
            return;
        }
        const index = this.config.selectedProperties.indexOf(property);
        if (index !== -1) {
            this.config.selectedProperties.splice(index, 1);
            await this.save();
            logger.info('Property removed from configuration', { property });
        }
    }
    /**
     * Set role
     */
    async setRole(role) {
        if (!['admin', 'editor', 'viewer'].includes(role)) {
            throw new ConfigurationError(`Invalid role: ${role}`);
        }
        this.config.role = role;
        await this.save();
        logger.info('Role updated in configuration', { role });
    }
    /**
     * Reset to defaults
     */
    async reset() {
        this.config = { ...DEFAULT_CONFIG };
        await this.save();
        logger.info('Configuration reset to defaults');
    }
}
// Singleton instance
let instance = null;
/**
 * Get configuration manager instance
 */
export function getConfigManager(configPath) {
    if (!instance) {
        instance = new ConfigManager(configPath);
    }
    return instance;
}
/**
 * Reset configuration manager (for testing)
 */
export function resetConfigManager() {
    instance = null;
}
//# sourceMappingURL=config.js.map