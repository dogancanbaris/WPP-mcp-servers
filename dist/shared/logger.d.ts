/**
 * Logger utility for MCP servers
 *
 * Important: For STDIO-based MCP servers, we must write to stderr, NOT stdout.
 * Stdout is reserved for JSON-RPC messages. Any other output to stdout corrupts the protocol.
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
declare class Logger {
    private component;
    private minLevel;
    private readonly levelPriority;
    constructor(component: string, minLevel?: LogLevel);
    /**
     * Format timestamp in ISO format
     */
    private getTimestamp;
    /**
     * Check if we should log this level
     */
    private shouldLog;
    /**
     * Format log entry as JSON
     */
    private formatEntry;
    /**
     * Write to stderr (CRITICAL for MCP servers on STDIO)
     */
    private writeToStderr;
    /**
     * Generic log method
     */
    private log;
    /**
     * Remove sensitive data before logging
     */
    private sanitizeData;
    /**
     * Format error for logging
     */
    private formatError;
    /**
     * Debug level logging
     */
    debug(message: string, data?: any): void;
    /**
     * Info level logging
     */
    info(message: string, data?: any): void;
    /**
     * Warning level logging
     */
    warn(message: string, data?: any, error?: any): void;
    /**
     * Error level logging
     */
    error(message: string, error?: any, data?: any): void;
    /**
     * Set minimum log level
     */
    setLevel(level: LogLevel): void;
}
/**
 * Get or create a logger for a component
 */
export declare function getLogger(component: string, minLevel?: LogLevel): Logger;
/**
 * Set log level for all loggers
 */
export declare function setGlobalLogLevel(level: LogLevel): void;
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map