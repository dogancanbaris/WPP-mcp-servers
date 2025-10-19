/**
 * Utility functions for MCP servers
 */
/**
 * Ensure directory exists, create if it doesn't
 */
export declare function ensureDir(dirPath: string): Promise<void>;
/**
 * Read JSON file safely
 */
export declare function readJsonFile<T>(filePath: string): Promise<T>;
/**
 * Write JSON file safely
 */
export declare function writeJsonFile<T>(filePath: string, data: T): Promise<void>;
/**
 * Append to JSON log file (array of objects)
 */
export declare function appendToJsonLog<T>(filePath: string, entry: T): Promise<void>;
/**
 * Generate unique ID
 */
export declare function generateId(prefix?: string): string;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxRetries?: number, initialDelayMs?: number): Promise<T>;
/**
 * Parse date string (YYYY-MM-DD)
 */
export declare function parseDate(dateStr: string): Date;
/**
 * Format date as YYYY-MM-DD
 */
export declare function formatDate(date: Date): string;
/**
 * Validate date range
 */
export declare function validateDateRange(startDate: string, endDate: string): void;
/**
 * Validate URL format
 */
export declare function validateUrl(url: string): void;
/**
 * Validate GSC property format
 */
export declare function validateGSCProperty(property: string): void;
/**
 * Merge objects deeply
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
/**
 * Flatten nested object to dot notation
 */
export declare function flattenObject(obj: any, prefix?: string): Record<string, any>;
/**
 * Check if two objects are deeply equal
 */
export declare function deepEqual(obj1: any, obj2: any): boolean;
//# sourceMappingURL=utils.d.ts.map