/**
 * OAuth Validation Middleware
 *
 * Validates OAuth tokens for HTTP MCP requests with bypass mode for development.
 */
import { getLogger } from '../../shared/logger.js';
import { google } from 'googleapis';
const logger = getLogger('gsc.oauth-validator');
/**
 * Creates OAuth validation middleware for MCP HTTP server
 */
export function createOAuthValidator(options = {}) {
    const { enableBypass = false, clientId, clientSecret } = options;
    return async (req, res, next) => {
        try {
            // Check for bypass mode (development only)
            if (enableBypass && req.headers['x-dev-bypass'] === 'true') {
                logger.warn('OAuth validation bypassed (development mode)');
                req.bypassAuth = true;
                return next();
            }
            // Extract OAuth token from Authorization header
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Unauthorized: Missing or invalid Authorization header. Expected "Bearer {token}"'
                    },
                    id: null
                });
            }
            const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
            // Extract optional refresh token
            const refreshToken = req.headers['x-google-refresh-token'];
            // Validate token (in production, verify with Google OAuth2 API)
            if (!enableBypass) {
                try {
                    await validateGoogleToken(accessToken, clientId, clientSecret);
                }
                catch (error) {
                    logger.error('OAuth token validation failed', error);
                    return res.status(401).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32000,
                            message: 'Unauthorized: Invalid or expired OAuth token'
                        },
                        id: null
                    });
                }
            }
            // Attach tokens to request for downstream use
            req.userOAuthToken = accessToken;
            req.googleRefreshToken = refreshToken;
            logger.debug('OAuth token validated successfully');
            next();
        }
        catch (error) {
            logger.error('OAuth validation error', error);
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error during authentication'
                },
                id: null
            });
        }
    };
}
/**
 * Validates Google OAuth token
 */
async function validateGoogleToken(accessToken, clientId, clientSecret) {
    if (!clientId || !clientSecret) {
        throw new Error('OAuth client ID and secret must be configured for token validation');
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ access_token: accessToken });
    try {
        // Verify token by making a test API call
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        await oauth2.userinfo.get();
    }
    catch (error) {
        throw new Error('Token validation failed: ' + error.message);
    }
}
/**
 * Creates Google OAuth client from request tokens (for per-request authentication)
 */
export function createOAuthClientFromRequest(req, clientId, clientSecret) {
    if (req.bypassAuth) {
        // In bypass mode, return a mock client or handle differently
        logger.warn('Using bypass mode - OAuth client not fully authenticated');
        return null;
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({
        access_token: req.userOAuthToken,
        refresh_token: req.googleRefreshToken
    });
    return oauth2Client;
}
//# sourceMappingURL=oauth-validator.js.map