/**
 * Logger utility for MCP servers
 *
 * Important: For STDIO-based MCP servers, we must write to stderr, NOT stdout.
 * Stdout is reserved for JSON-RPC messages. Any other output to stdout corrupts the protocol.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: any;
}

class Logger {
  private component: string;
  private minLevel: LogLevel;
  private readonly levelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor(component: string, minLevel: LogLevel = 'INFO') {
    this.component = component;
    this.minLevel = minLevel;
  }

  /**
   * Format timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Check if we should log this level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  /**
   * Format log entry as JSON
   */
  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Write to stderr (CRITICAL for MCP servers on STDIO)
   */
  private writeToStderr(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);
    console.error(formatted);
  }

  /**
   * Generic log method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: any
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
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
  private sanitizeData(data: any): any {
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

    const removeSensitive = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
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
  private formatError(error: any): any {
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
  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any, error?: any): void {
    this.log('WARN', message, data, error);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: any, data?: any): void {
    this.log('ERROR', message, data, error);
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// Create a map of loggers by component
const loggers: Map<string, Logger> = new Map();

/**
 * Get or create a logger for a component
 */
export function getLogger(component: string, minLevel: LogLevel = 'INFO'): Logger {
  if (!loggers.has(component)) {
    loggers.set(component, new Logger(component, minLevel));
  }
  return loggers.get(component)!;
}

/**
 * Set log level for all loggers
 */
export function setGlobalLogLevel(level: LogLevel): void {
  for (const logger of loggers.values()) {
    logger.setLevel(level);
  }
}

// Export main logger singleton for default use
export const logger = getLogger('mcp');
