/**
 * Custom error classes for MCP server
 */
/**
 * Base error class for all MCP server errors
 */
export class MCPError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR') {
        super(message);
        this.code = code;
        this.name = 'MCPError';
    }
}
/**
 * Authentication error
 */
export class AuthenticationError extends MCPError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTH_ERROR');
        this.name = 'AuthenticationError';
    }
}
/**
 * Authorization error (user doesn't have permission)
 */
export class AuthorizationError extends MCPError {
    constructor(message = 'Not authorized to perform this action') {
        super(message, 'AUTHZ_ERROR');
        this.name = 'AuthorizationError';
    }
}
/**
 * Configuration error
 */
export class ConfigurationError extends MCPError {
    constructor(message = 'Configuration error') {
        super(message, 'CONFIG_ERROR');
        this.name = 'ConfigurationError';
    }
}
/**
 * Validation error (invalid input)
 */
export class ValidationError extends MCPError {
    constructor(message = 'Validation failed') {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
/**
 * API error (error from Google API)
 */
export class APIError extends MCPError {
    constructor(message, statusCode, apiError) {
        super(message, 'API_ERROR');
        this.statusCode = statusCode;
        this.apiError = apiError;
        this.name = 'APIError';
    }
}
/**
 * Account access error (user trying to access account they don't have access to)
 */
export class AccountAccessError extends MCPError {
    constructor(account, message = `Access denied to account: ${account}`) {
        super(message, 'ACCOUNT_ACCESS_ERROR');
        this.account = account;
        this.name = 'AccountAccessError';
    }
}
/**
 * Operation blocked error (e.g., write operation blocked by approval workflow)
 */
export class OperationBlockedError extends MCPError {
    constructor(message = 'Operation blocked') {
        super(message, 'OPERATION_BLOCKED');
        this.name = 'OperationBlockedError';
    }
}
/**
 * Token error
 */
export class TokenError extends MCPError {
    constructor(message = 'Token error') {
        super(message, 'TOKEN_ERROR');
        this.name = 'TokenError';
    }
}
/**
 * Timeout error
 */
export class TimeoutError extends MCPError {
    constructor(message = 'Operation timed out') {
        super(message, 'TIMEOUT_ERROR');
        this.name = 'TimeoutError';
    }
}
//# sourceMappingURL=errors.js.map