/**
 * Audit logging for GSC MCP server
 */
import * as path from 'path';
import { appendToJsonLog, ensureDir } from '../shared/utils.js';
import { getLogger } from '../shared/logger.js';
const logger = getLogger('gsc.audit');
/**
 * Audit logger for tracking all operations
 */
export class AuditLogger {
    constructor(logPath, enabled = true) {
        this.logPath = logPath || process.env.AUDIT_LOG_PATH || './logs/audit.log';
        this.enabled = enabled;
        if (this.enabled) {
            ensureDir(path.dirname(this.logPath)).catch((error) => {
                logger.error('Failed to create audit log directory', error);
            });
        }
    }
    /**
     * Log an operation
     */
    async logOperation(entry) {
        if (!this.enabled) {
            return;
        }
        try {
            await appendToJsonLog(this.logPath, entry);
            logger.debug('Operation logged to audit trail', {
                action: entry.action,
                result: entry.result,
                property: entry.property,
            });
        }
        catch (error) {
            logger.error('Failed to write to audit log', error);
            // Don't throw, just log the error
        }
    }
    /**
     * Log a successful read operation
     */
    async logReadOperation(user, action, property, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action,
            property,
            operationType: 'read',
            result: 'success',
            details,
        };
        await this.logOperation(entry);
    }
    /**
     * Log a successful write operation
     */
    async logWriteOperation(user, action, property, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action,
            property,
            operationType: 'write',
            result: 'success',
            details,
        };
        await this.logOperation(entry);
    }
    /**
     * Log a failed operation
     */
    async logFailedOperation(user, action, property, errorMessage, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action,
            property,
            operationType: 'read', // Default to read, can be overridden
            result: 'failure',
            details,
            errorMessage,
        };
        await this.logOperation(entry);
    }
    /**
     * Log a blocked operation
     */
    async logBlockedOperation(user, action, property, reason, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action,
            property,
            operationType: 'write',
            result: 'blocked',
            details: {
                ...details,
                reason,
            },
        };
        await this.logOperation(entry);
    }
    /**
     * Log an approval event
     */
    async logApprovalEvent(user, action, property, approved, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action,
            property,
            operationType: 'write',
            result: approved ? 'success' : 'blocked',
            details: {
                ...details,
                approved,
            },
        };
        await this.logOperation(entry);
    }
    /**
     * Log unauthorized access attempt
     */
    async logUnauthorizedAccessAttempt(user, property, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action: 'unauthorized_access_attempt',
            property,
            operationType: 'read',
            result: 'blocked',
            details,
            errorMessage: 'Unauthorized access to property',
        };
        await this.logOperation(entry);
    }
    /**
     * Log authentication event
     */
    async logAuthenticationEvent(user, success, details = {}) {
        const entry = {
            timestamp: new Date(),
            user,
            action: 'authentication',
            property: 'system',
            operationType: 'read',
            result: success ? 'success' : 'failure',
            details,
            errorMessage: success ? undefined : 'Authentication failed',
        };
        await this.logOperation(entry);
    }
    /**
     * Enable/disable audit logging
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            logger.info('Audit logging enabled');
        }
        else {
            logger.info('Audit logging disabled');
        }
    }
    /**
     * Check if audit logging is enabled
     */
    isEnabled() {
        return this.enabled;
    }
}
// Singleton instance
let instance = null;
/**
 * Get audit logger instance
 */
export function getAuditLogger(logPath, enabled) {
    if (!instance) {
        instance = new AuditLogger(logPath, enabled);
    }
    return instance;
}
/**
 * Reset audit logger (for testing)
 */
export function resetAuditLogger() {
    instance = null;
}
//# sourceMappingURL=audit.js.map