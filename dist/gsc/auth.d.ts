/**
 * OAuth 2.0 Authentication for Google Search Console
 */
import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import { OAuthTokens } from './types.js';
/**
 * Authentication manager for GSC
 */
export declare class GSCAuthManager {
    private oauth2Client;
    private tokensPath;
    private tokens;
    constructor(clientId: string, clientSecret: string, redirectUri: string, tokensPath?: string);
    /**
     * Get authorization URL for OAuth flow
     */
    getAuthorizationUrl(): string;
    /**
     * Exchange authorization code for tokens
     */
    exchangeCodeForTokens(code: string): Promise<OAuthTokens>;
    /**
     * Load tokens from file
     */
    loadTokens(): Promise<OAuthTokens | null>;
    /**
     * Save tokens to file
     */
    private saveTokens;
    /**
     * Handle token refresh
     */
    private handleTokenRefresh;
    /**
     * Refresh access token
     */
    refreshAccessToken(): Promise<void>;
    /**
     * Check if token is expiring soon (within 5 minutes)
     */
    private isTokenExpiringSoon;
    /**
     * Get authenticated Google APIs client
     */
    getAuthenticatedClient(): OAuth2Client;
    /**
     * Get current tokens
     */
    getTokens(): OAuthTokens | null;
    /**
     * Check if authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Revoke tokens
     */
    revokeTokens(): Promise<void>;
}
/**
 * Start OAuth callback server
 */
export declare function startOAuthCallbackServer(port?: number): Promise<{
    server: http.Server;
    codePromise: Promise<string>;
}>;
//# sourceMappingURL=auth.d.ts.map