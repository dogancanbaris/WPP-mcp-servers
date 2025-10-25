/**
 * OAuth 2.0 Authentication for Google Search Console
 */
import { google } from 'googleapis';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AuthenticationError, TokenError, ConfigurationError } from '../shared/errors.js';
import { getLogger } from '../shared/logger.js';
import { readJsonFile, writeJsonFile, ensureDir } from '../shared/utils.js';
const logger = getLogger('gsc.auth');
/**
 * Authentication manager for GSC
 */
export class GSCAuthManager {
    constructor(clientId, clientSecret, redirectUri, tokensPath) {
        this.tokens = null;
        if (!clientId || !clientSecret) {
            throw new ConfigurationError('Google OAuth credentials not provided');
        }
        this.tokensPath = tokensPath || process.env.GSC_TOKENS_PATH || './config/gsc-tokens.json';
        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        // Set up token refresh listener
        this.oauth2Client.on('tokens', (tokens) => {
            this.handleTokenRefresh(tokens);
        });
        logger.debug('GSC Auth Manager initialized', { redirectUri });
    }
    /**
     * Get authorization URL for OAuth flow
     */
    getAuthorizationUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/adwords', // Google Ads API scope
            'https://www.googleapis.com/auth/analytics.readonly', // Google Analytics Data API (read-only)
            'https://www.googleapis.com/auth/analytics', // Google Analytics Data API (full access)
            'https://www.googleapis.com/auth/bigquery', // BigQuery API - read/write access
            'https://www.googleapis.com/auth/cloud-platform', // Google Cloud Platform - for project access
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent', // Force consent to always get refresh token
        });
    }
    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code) {
        try {
            logger.debug('Exchanging authorization code for tokens');
            const { tokens } = await this.oauth2Client.getToken(code);
            if (!tokens.access_token) {
                throw new TokenError('No access token in response');
            }
            const oauthTokens = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || undefined,
                expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                tokenType: tokens.token_type || 'Bearer',
            };
            // Set credentials on client
            this.oauth2Client.setCredentials(tokens);
            // Save tokens
            await this.saveTokens(oauthTokens);
            logger.info('Authorization successful, tokens obtained and saved');
            return oauthTokens;
        }
        catch (error) {
            logger.error('Failed to exchange authorization code for tokens', error);
            throw new AuthenticationError(`OAuth authentication failed: ${error.message}`);
        }
    }
    /**
     * Load tokens from file
     */
    async loadTokens() {
        try {
            const tokens = await readJsonFile(this.tokensPath);
            // Convert date strings back to Date objects
            if (tokens.expiryDate && typeof tokens.expiryDate === 'string') {
                tokens.expiryDate = new Date(tokens.expiryDate);
            }
            this.tokens = tokens;
            this.oauth2Client.setCredentials({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expiry_date: tokens.expiryDate?.getTime(),
                token_type: tokens.tokenType,
            });
            logger.debug('Tokens loaded from file', { tokensPath: this.tokensPath });
            // Check if token needs refresh
            if (this.isTokenExpiringSoon()) {
                logger.debug('Token expiring soon, attempting refresh');
                await this.refreshAccessToken();
            }
            return this.tokens;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                logger.debug('Tokens file not found', { tokensPath: this.tokensPath });
                return null;
            }
            logger.error('Failed to load tokens from file', error);
            throw new TokenError(`Failed to load tokens: ${error.message}`);
        }
    }
    /**
     * Save tokens to file
     */
    async saveTokens(tokens) {
        try {
            await ensureDir(path.dirname(this.tokensPath));
            await writeJsonFile(this.tokensPath, tokens);
            this.tokens = tokens;
            logger.debug('Tokens saved to file', { tokensPath: this.tokensPath });
        }
        catch (error) {
            logger.error('Failed to save tokens to file', error);
            throw new TokenError(`Failed to save tokens: ${error.message}`);
        }
    }
    /**
     * Handle token refresh
     */
    handleTokenRefresh(tokens) {
        if (tokens.refresh_token) {
            // Update our stored refresh token
        }
        // Save updated tokens
        if (this.tokens) {
            this.tokens.accessToken = tokens.access_token;
            if (tokens.refresh_token) {
                this.tokens.refreshToken = tokens.refresh_token;
            }
            if (tokens.expiry_date) {
                this.tokens.expiryDate = new Date(tokens.expiry_date);
            }
            this.saveTokens(this.tokens).catch((error) => {
                logger.error('Failed to save refreshed tokens', error);
            });
        }
    }
    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        try {
            if (!this.tokens?.refreshToken) {
                throw new TokenError('No refresh token available');
            }
            logger.debug('Refreshing access token');
            this.oauth2Client.setCredentials({
                refresh_token: this.tokens.refreshToken,
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            if (!credentials.access_token) {
                throw new TokenError('No access token in refresh response');
            }
            const updated = {
                accessToken: credentials.access_token,
                refreshToken: this.tokens.refreshToken, // Keep existing refresh token
                expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
                tokenType: credentials.token_type || 'Bearer',
            };
            await this.saveTokens(updated);
            logger.debug('Access token refreshed successfully');
        }
        catch (error) {
            logger.error('Failed to refresh access token', error);
            throw new TokenError(`Failed to refresh access token: ${error.message}`);
        }
    }
    /**
     * Check if token is expiring soon (within 5 minutes)
     */
    isTokenExpiringSoon() {
        if (!this.tokens?.expiryDate) {
            return true; // Assume expiring if no expiry date
        }
        const now = new Date();
        const expiryBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
        return this.tokens.expiryDate.getTime() - now.getTime() < expiryBuffer;
    }
    /**
     * Get authenticated Google APIs client
     */
    getAuthenticatedClient() {
        return this.oauth2Client;
    }
    /**
     * Get current tokens
     */
    getTokens() {
        return this.tokens ? { ...this.tokens } : null;
    }
    /**
     * Check if authenticated
     */
    isAuthenticated() {
        return this.tokens !== null && this.tokens.accessToken !== null;
    }
    /**
     * Revoke tokens
     */
    async revokeTokens() {
        try {
            if (this.tokens?.accessToken) {
                await this.oauth2Client.revokeToken(this.tokens.accessToken);
                logger.info('Tokens revoked successfully');
            }
            // Remove tokens file
            try {
                await fs.unlink(this.tokensPath);
                logger.debug('Tokens file deleted');
            }
            catch (error) {
                // File might not exist, that's okay
            }
            this.tokens = null;
            this.oauth2Client.setCredentials({});
        }
        catch (error) {
            logger.warn('Failed to revoke tokens', error);
            // Don't throw, continue with cleanup
        }
    }
}
/**
 * Start OAuth callback server
 */
export async function startOAuthCallbackServer(port = 3000) {
    return new Promise((resolve, reject) => {
        let authCode = null;
        const codeResolvers = [];
        const server = http.createServer((req, res) => {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            if (url.pathname === '/callback') {
                const code = url.searchParams.get('code');
                const error = url.searchParams.get('error');
                if (error) {
                    logger.error('OAuth callback error', { error });
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end(`<h1>Authorization Error</h1><p>Error: ${error}</p>`);
                    // Don't resolve, let it timeout
                    return;
                }
                if (code) {
                    authCode = code;
                    logger.debug('Authorization code received', { code: code.substring(0, 20) + '...' });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
            <html>
              <head><title>Google Search Console Authorization</title></head>
              <body>
                <h1>Authorization Successful</h1>
                <p>You can close this window and return to the MCP server.</p>
                <script>
                  window.close();
                </script>
              </body>
            </html>
          `);
                    // Resolve all waiters
                    for (const resolveCode of codeResolvers) {
                        resolveCode(code);
                    }
                }
                else {
                    logger.error('No authorization code in callback');
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>Error</h1><p>No authorization code received</p>');
                }
            }
            else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>Not Found</h1>');
            }
        });
        const codePromise = new Promise((resolve) => {
            if (authCode) {
                resolve(authCode);
            }
            else {
                codeResolvers.push(resolve);
            }
        });
        server.listen(port, () => {
            logger.info('OAuth callback server started', { port });
            resolve({ server, codePromise });
        });
        server.on('error', (error) => {
            logger.error('OAuth callback server error', error);
            reject(error);
        });
    });
}
//# sourceMappingURL=auth.js.map