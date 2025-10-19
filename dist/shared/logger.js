/**
 * Logger utility for MCP servers
 *
 * Important: For STDIO-based MCP servers, we must write to stderr, NOT stdout.
 * Stdout is reserved for JSON-RPC messages. Any other output to stdout corrupts the protocol.
 */
class Logger {
    constructor(component, minLevel = 'INFO') {
        this.levelPriority = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
        };
        this.component = component;
        this.minLevel = minLevel;
    }
    /**
     * Format timestamp in ISO format
     */
    getTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Check if we should log this level
     */
    shouldLog(level) {
        return this.levelPriority[level] >= this.levelPriority[this.minLevel];
    }
    /**
     * Format log entry as JSON
     */
    formatEntry(entry) {
        return JSON.stringify(entry);
    }
    /**
     * Write to stderr (CRITICAL for MCP servers on STDIO)
     */
    writeToStderr(entry) {
        const formatted = this.formatEntry(entry);
        console.error(formatted);
    }
    /**
     * Generic log method
     */
    log(level, message, data, error) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
            timestamp: this.getTimestamp(),
            level,
            component: this.component,
            message,
        };
        if (data !== undefined) {
            entry.data = this.sanitizeData(data);
        }
        if (error !== undefined) {
            entry.error = this.formatError(error);
        }
        this.writeToStderr(entry);
    }
    /**
     * Remove sensitive data before logging
     */
    sanitizeData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }
        const sanitized = JSON.parse(JSON.stringify(data));
        // Remove sensitive fields
        const sensitiveFields = [
            'accessToken',
            'refreshToken',
            'token',
            'apiKey',
            'password',
            'secret',
            'credential',
            'credentials',
            'auth',
            'authorization',
        ];
        const removeSensitive = (obj) => {
            for (const key in obj) {
                if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
                    obj[key] = '[REDACTED]';
                }
                else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    removeSensitive(obj[key]);
                }
            }
        };
        removeSensitive(sanitized);
        return sanitized;
    }
    /**
     * Format error for logging
     */
    formatError(error) {
        if (!error) {
            return null;
        }
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        return error;
    }
    /**
     * Debug level logging
     */
    debug(message, data) {
        this.log('DEBUG', message, data);
    }
    /**
     * Info level logging
     */
    info(message, data) {
        this.log('INFO', message, data);
    }
    /**
     * Warning level logging
     */
    warn(message, data, error) {
        this.log('WARN', message, data, error);
    }
    /**
     * Error level logging
     */
    error(message, error, data) {
        this.log('ERROR', message, data, error);
    }
    /**
     * Set minimum log level
     */
    setLevel(level) {
        this.minLevel = level;
    }
}
// Create a map of loggers by component
const loggers = new Map();
/**
 * Get or create a logger for a component
 */
export function getLogger(component, minLevel = 'INFO') {
    if (!loggers.has(component)) {
        loggers.set(component, new Logger(component, minLevel));
    }
    return loggers.get(component);
}
/**
 * Set log level for all loggers
 */
export function setGlobalLogLevel(level) {
    for (const logger of loggers.values()) {
        logger.setLevel(level);
    }
}
// Export main logger singleton for default use
export const logger = getLogger('mcp');
//# sourceMappingURL=logger.js.map