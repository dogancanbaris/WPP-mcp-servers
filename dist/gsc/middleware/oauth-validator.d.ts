/**
 * OAuth Validation Middleware
 *
 * Validates OAuth tokens for HTTP MCP requests with bypass mode for development.
 */
import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    userOAuthToken?: string;
    googleRefreshToken?: string;
    bypassAuth?: boolean;
}
export interface OAuthValidatorOptions {
    /**
     * Enable development bypass mode (skips OAuth validation if X-Dev-Bypass header is present)
     */
    enableBypass?: boolean;
    /**
     * Google OAuth client ID (required for token validation in production)
     */
    clientId?: string;
    /**
     * Google OAuth client secret (required for token validation in production)
     */
    clientSecret?: string;
}
/**
 * Creates OAuth validation middleware for MCP HTTP server
 */
export declare function createOAuthValidator(options?: OAuthValidatorOptions): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Creates Google OAuth client from request tokens (for per-request authentication)
 */
export declare function createOAuthClientFromRequest(req: AuthenticatedRequest, clientId: string, clientSecret: string): any;
//# sourceMappingURL=oauth-validator.d.ts.map