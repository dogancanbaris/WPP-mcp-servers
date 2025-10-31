/**
 * OAuth Client Factory
 * Creates Google API clients from user OAuth tokens (per-request)
 */

import { google } from 'googleapis';
import { GoogleAdsApi } from 'google-ads-api';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { BigQuery } from '@google-cloud/bigquery';
import { getLogger } from './logger.js';
import * as fs from 'fs';

const logger = getLogger('oauth-client-factory');

// OAuth configuration constants (SECURITY: Load from environment, never hardcode)
// NOTE: These are functions to ensure we get env vars AFTER dotenv loads (lazy evaluation)
const getClientId = () => process.env.GOOGLE_CLIENT_ID || '';
const getClientSecret = () => process.env.GOOGLE_CLIENT_SECRET || '';
const TOKENS_PATH = process.env.GSC_TOKENS_PATH || '/home/dogancanbaris/projects/MCP Servers/config/gsc-tokens.json';

/**
 * Create OAuth2Client from access token
 */
export function createOAuth2ClientFromToken(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });
  return oauth2Client;
}

/**
 * Create Google Search Console client from OAuth token
 */
export function createGSCClient(accessToken: string) {
  const auth = createOAuth2ClientFromToken(accessToken);
  return google.searchconsole({ version: 'v1', auth: auth as any });
}

/**
 * Create Google Ads client from OAuth tokens
 * @param refreshToken - OAuth refresh token (REQUIRED for Google Ads)
 * @param developerToken - Google Ads developer token
 * @param customerId - Optional customer ID
 */
export function createGoogleAdsClient(refreshToken: string, developerToken: string, customerId?: string) {
  if (!refreshToken) {
    throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
  }

  const client = new GoogleAdsApi({
    client_id: getClientId(),
    client_secret: getClientSecret(),
    developer_token: developerToken,
  });

  // Set OAuth credentials with refresh token
  const customer = client.Customer({
    customer_id: customerId || '',
    refresh_token: refreshToken, // Google Ads requires refresh token
  });

  return { client, customer };
}

/**
 * Create Google Analytics Data API client from OAuth token
 */
export function createAnalyticsDataClient(accessToken: string): BetaAnalyticsDataClient {
  const auth = createOAuth2ClientFromToken(accessToken);

  return new BetaAnalyticsDataClient({
    auth: auth as any,
  });
}

/**
 * Create Google Analytics Admin API client from OAuth token
 */
export function createAnalyticsAdminClient(accessToken: string): AnalyticsAdminServiceClient {
  const auth = createOAuth2ClientFromToken(accessToken);

  return new AnalyticsAdminServiceClient({
    auth: auth as any,
  });
}

/**
 * Create PageSpeed Insights (CrUX) client from OAuth token
 */
export function createPageSpeedClient(accessToken: string) {
  const auth = createOAuth2ClientFromToken(accessToken);
  return google.pagespeedonline({ version: 'v5', auth: auth as any });
}

/**
 * Create Google Business Profile client from OAuth token
 */
export function createBusinessProfileClient(accessToken: string) {
  const auth = createOAuth2ClientFromToken(accessToken);
  return {
    businessinformation: google.mybusinessbusinessinformation({ version: 'v1', auth: auth as any }),
    accountmanagement: google.mybusinessaccountmanagement({ version: 'v1', auth: auth as any }),
  };
}

/**
 * Create BigQuery client with USER'S OAuth token
 * NOTE: BigQuery now uses OAuth for complete user isolation (100% OAuth architecture!)
 * Each user writes/reads BigQuery with THEIR credentials
 * Automatic multi-tenant isolation via Google IAM - no service account needed!
 */
export function createBigQueryClient(accessToken: string): BigQuery {
  // Create OAuth2 client with user's access token
  const auth = createOAuth2ClientFromToken(accessToken);

  // Create BigQuery client with user's OAuth credentials
  // User must have BigQuery permissions: bigquery.datasets.create, bigquery.tables.create, bigquery.tables.updateData
  return new BigQuery({
    projectId: 'mcp-servers-475317',
    authClient: auth as any,
  });
}

/**
 * Validate OAuth token format
 */
export function validateOAuthToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Basic validation - OAuth tokens are typically 100+ characters
  if (token.length < 20) {
    return false;
  }

  // Should not contain spaces or newlines
  if (/\s/.test(token)) {
    return false;
  }

  return true;
}

/**
 * Automatically refresh OAuth access token if expired
 * Reads current token from file, checks expiry, refreshes if needed
 * @returns Fresh access token
 */
export async function autoRefreshToken(): Promise<string | null> {
  try {
    const tokensData = fs.readFileSync(TOKENS_PATH, 'utf8');
    const tokens = JSON.parse(tokensData);

    // Check if token will expire in next 5 minutes
    const expiryDate = new Date(tokens.expiryDate);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiryDate <= fiveMinutesFromNow) {
      logger.info('[autoRefreshToken] Token expired or expiring soon, refreshing...', {
        expiryDate: tokens.expiryDate,
        now: now.toISOString()
      });

      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        getClientId(),
        getClientSecret(),
        'http://localhost:6000/callback'
      );

      oauth2Client.setCredentials({
        refresh_token: tokens.refreshToken
      });

      // Get new access token
      const { token } = await oauth2Client.getAccessToken();

      if (!token) {
        throw new Error('Failed to refresh access token');
      }

      // Save new token
      const newTokens = {
        accessToken: token,
        refreshToken: tokens.refreshToken,
        expiryDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        tokenType: 'Bearer'
      };

      fs.writeFileSync(TOKENS_PATH, JSON.stringify(newTokens, null, 2));

      logger.info('[autoRefreshToken] Token refreshed successfully', {
        expiryDate: newTokens.expiryDate
      });

      return token;
    }

    // Token still valid
    return tokens.accessToken;
  } catch (error: any) {
    logger.error('[autoRefreshToken] Failed to refresh token', {
      error: error.message,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Extract OAuth access token from tool input
 *
 * TEMPORARY HACK: Until OMA is connected, load token from file with auto-refresh
 * Once OMA is integrated, it will pass __oauthToken in every request
 */
export async function extractOAuthToken(input: any): Promise<string | null> {
  // If OMA provides token, use it
  if (input.__oauthToken) {
    return input.__oauthToken;
  }

  // TEMPORARY: Load from file until OMA connected
  try {
    // Use absolute path to ensure it works regardless of process.cwd()
    const tokensPath = '/home/dogancanbaris/projects/MCP Servers/config/gsc-tokens.json';

    logger.debug('[extractOAuthToken] Loading token from file', { tokensPath });

    const tokensData = fs.readFileSync(tokensPath, 'utf8');
    const tokens = JSON.parse(tokensData);

    // Check expiry
    const expiryDate = new Date(tokens.expiryDate);
    const now = new Date();
    const isExpired = expiryDate <= now;

    logger.debug('[extractOAuthToken] Token loaded', {
      hasAccessToken: !!tokens.accessToken,
      tokenLength: tokens.accessToken?.length || 0,
      expiryDate: tokens.expiryDate,
      isExpired,
      minutesUntilExpiry: Math.floor((expiryDate.getTime() - now.getTime()) / 60000)
    });

    if (isExpired) {
      logger.warn('[extractOAuthToken] Token expired, auto-refreshing...');
      return await autoRefreshToken();
    }

    return tokens.accessToken;
  } catch (error: any) {
    logger.error('[extractOAuthToken] Failed to load token from file', {
      error: error.message,
      stack: error.stack,
      tokensPath: '/home/dogancanbaris/projects/MCP Servers/config/gsc-tokens.json'
    });
    return null;
  }
}

/**
 * Extract OAuth refresh token from tool input (for Google Ads)
 *
 * TEMPORARY HACK: Until OMA is connected, load refresh token from file
 * Once OMA is integrated, it will pass __refreshToken in every request
 */
export function extractRefreshToken(input: any): string | null {
  // If OMA provides refresh token, use it
  if (input.__refreshToken) {
    return input.__refreshToken;
  }

  // TEMPORARY: Load from file until OMA connected (DEV MODE)
  try {
    const tokensPath = '/home/dogancanbaris/projects/MCP Servers/config/gsc-tokens.json';
    const tokensData = fs.readFileSync(tokensPath, 'utf8');
    const tokens = JSON.parse(tokensData);

    logger.debug('[extractRefreshToken] Loaded refresh token from file for development');

    return tokens.refreshToken || null;
  } catch (error: any) {
    logger.error('[extractRefreshToken] Failed to load refresh token from file', {
      error: error.message
    });
    return null;
  }
}

logger.info('OAuth client factory initialized');
