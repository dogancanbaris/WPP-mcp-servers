/**
 * Custom error classes for MCP server
 */
/**
 * Base error class for all MCP server errors
 */
export declare class MCPError extends Error {
    code: string;
    constructor(message: string, code?: string);
}
/**
 * Authentication error
 */
export declare class AuthenticationError extends MCPError {
    constructor(message?: string);
}
/**
 * Authorization error (user doesn't have permission)
 */
export declare class AuthorizationError extends MCPError {
    constructor(message?: string);
}
/**
 * Configuration error
 */
export declare class ConfigurationError extends MCPError {
    constructor(message?: string);
}
/**
 * Validation error (invalid input)
 */
export declare class ValidationError extends MCPError {
    constructor(message?: string);
}
/**
 * API error (error from Google API)
 */
export declare class APIError extends MCPError {
    statusCode?: number | undefined;
    apiError?: any | undefined;
    constructor(message: string, statusCode?: number | undefined, apiError?: any | undefined);
}
/**
 * Account access error (user trying to access account they don't have access to)
 */
export declare class AccountAccessError extends MCPError {
    account: string;
    constructor(account: string, message?: string);
}
/**
 * Operation blocked error (e.g., write operation blocked by approval workflow)
 */
export declare class OperationBlockedError extends MCPError {
    constructor(message?: string);
}
/**
 * Token error
 */
export declare class TokenError extends MCPError {
    constructor(message?: string);
}
/**
 * Timeout error
 */
export declare class TimeoutError extends MCPError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map