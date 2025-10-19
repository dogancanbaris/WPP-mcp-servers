/**
 * Audit logging for GSC MCP server
 */
import { AuditLogEntry } from './types.js';
/**
 * Audit logger for tracking all operations
 */
export declare class AuditLogger {
    private logPath;
    private enabled;
    constructor(logPath?: string, enabled?: boolean);
    /**
     * Log an operation
     */
    logOperation(entry: AuditLogEntry): Promise<void>;
    /**
     * Log a successful read operation
     */
    logReadOperation(user: string, action: string, property: string, details?: Record<string, any>): Promise<void>;
    /**
     * Log a successful write operation
     */
    logWriteOperation(user: string, action: string, property: string, details?: Record<string, any>): Promise<void>;
    /**
     * Log a failed operation
     */
    logFailedOperation(user: string, action: string, property: string, errorMessage: string, details?: Record<string, any>): Promise<void>;
    /**
     * Log a blocked operation
     */
    logBlockedOperation(user: string, action: string, property: string, reason: string, details?: Record<string, any>): Promise<void>;
    /**
     * Log an approval event
     */
    logApprovalEvent(user: string, action: string, property: string, approved: boolean, details?: Record<string, any>): Promise<void>;
    /**
     * Log unauthorized access attempt
     */
    logUnauthorizedAccessAttempt(user: string, property: string, details?: Record<string, any>): Promise<void>;
    /**
     * Log authentication event
     */
    logAuthenticationEvent(user: string, success: boolean, details?: Record<string, any>): Promise<void>;
    /**
     * Enable/disable audit logging
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if audit logging is enabled
     */
    isEnabled(): boolean;
}
/**
 * Get audit logger instance
 */
export declare function getAuditLogger(logPath?: string, enabled?: boolean): AuditLogger;
/**
 * Reset audit logger (for testing)
 */
export declare function resetAuditLogger(): void;
//# sourceMappingURL=audit.d.ts.map