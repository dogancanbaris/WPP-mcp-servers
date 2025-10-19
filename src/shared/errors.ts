/**
 * Custom error classes for MCP server
 */

/**
 * Base error class for all MCP server errors
 */
export class MCPError extends Error {
  constructor(message: string, public code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'MCPError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends MCPError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (user doesn't have permission)
 */
export class AuthorizationError extends MCPError {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message, 'AUTHZ_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends MCPError {
  constructor(message: string = 'Configuration error') {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

/**
 * Validation error (invalid input)
 */
export class ValidationError extends MCPError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * API error (error from Google API)
 */
export class APIError extends MCPError {
  constructor(
    message: string,
    public statusCode?: number,
    public apiError?: any
  ) {
    super(message, 'API_ERROR');
    this.name = 'APIError';
  }
}

/**
 * Account access error (user trying to access account they don't have access to)
 */
export class AccountAccessError extends MCPError {
  constructor(
    public account: string,
    message: string = `Access denied to account: ${account}`
  ) {
    super(message, 'ACCOUNT_ACCESS_ERROR');
    this.name = 'AccountAccessError';
  }
}

/**
 * Operation blocked error (e.g., write operation blocked by approval workflow)
 */
export class OperationBlockedError extends MCPError {
  constructor(message: string = 'Operation blocked') {
    super(message, 'OPERATION_BLOCKED');
    this.name = 'OperationBlockedError';
  }
}

/**
 * Token error
 */
export class TokenError extends MCPError {
  constructor(message: string = 'Token error') {
    super(message, 'TOKEN_ERROR');
    this.name = 'TokenError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends MCPError {
  constructor(message: string = 'Operation timed out') {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}
