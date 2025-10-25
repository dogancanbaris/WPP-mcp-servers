# OAuth Skill - Single Authentication System

**Keywords that trigger this skill:** "authorization", "connect platform", "oauth flow", "token refresh", "authenticate", "auth error", "permission denied"

## ⚠️ CRITICAL: This Project Uses OAuth 2.0 for ALL Authentication

NO service accounts, NO API keys, NO static credentials.

Every Google API call uses the user's personal OAuth access token.

## 🏗️ Architecture

**File:** src/shared/oauth-client-factory.ts (271 lines)

**How it works:**
1. User authorizes via OAuth flow (one-time)
2. System receives access token + refresh token
3. Access token used for API calls (expires in 1 hour)
4. Refresh token gets new access token automatically
5. Every MCP tool call uses user's OAuth credentials

## 🔐 OAuth Flow (First-Time Setup)

### Step 1: User Authorization
```typescript
// GSCAuthManager generates authorization URL
const authUrl = authManager.getAuthorizationUrl();
// User visits URL, grants permissions
// Google redirects back with authorization code
```

### Step 2: Exchange Code for Tokens
```typescript
// Exchange one-time code for long-lived tokens
const tokens = await authManager.exchangeCodeForTokens(code);
// Returns: { accessToken, refreshToken, expiryDate, tokenType }
```

### Step 3: Save Tokens
```typescript
// Tokens saved to file (temporary until OMA integration)
// File: config/gsc-tokens.json
{
  "accessToken": "ya29.a0...",
  "refreshToken": "1//050...",
  "expiryDate": "2025-10-25T12:00:00Z",
  "tokenType": "Bearer"
}
```

## 🔄 Auto-Refresh System

**Function:** `autoRefreshToken()` in oauth-client-factory.ts

```typescript
// Automatically checks token expiry
if (expiresInLessThan5Minutes || alreadyExpired) {
  // Use refresh token to get new access token
  const newAccessToken = await refreshTokenFromGoogle(refreshToken);
  // Save updated token to file
  // Return fresh token
}
```

**Triggers:**
- Token expires in < 5 minutes → Auto-refresh
- Token already expired → Auto-refresh
- Token fresh → Return immediately

## 🔓 Supported Google APIs (All via OAuth)

1. **Search Console** - `googleapis` webmasters API
2. **Google Ads** - `google-ads-api` library
3. **Analytics (GA4)** - `@google-analytics/data`
4. **Analytics Admin** - `@google-analytics/admin`
5. **BigQuery** - `@google-cloud/bigquery`
6. **Business Profile** - `googleapis` mybusinessbusinessinformation API
7. **Core Web Vitals** - Chrome UX Report API

**All APIs use same OAuth flow, different scopes.**

## 🔑 Required OAuth Scopes

```typescript
const scopes = [
  'https://www.googleapis.com/auth/webmasters',            // Search Console
  'https://www.googleapis.com/auth/webmasters.readonly',   // Search Console (read)
  'https://www.googleapis.com/auth/adwords',               // Google Ads
  'https://www.googleapis.com/auth/analytics.readonly',    // Analytics (read)
  'https://www.googleapis.com/auth/analytics',             // Analytics (write)
  'https://www.googleapis.com/auth/bigquery',              // BigQuery
  'https://www.googleapis.com/auth/cloud-platform',        // GCP
];
```

## 📊 Current Implementation Status

✅ **Implemented:**
- oauth-client-factory.ts with 9 client creation methods
- Auto-refresh for expired tokens
- Token file loading (temporary until OMA connected)
- All 31 MCP tools use OAuth
- GSCAuthManager for complete auth flow

⏳ **Pending:**
- OMA platform integration (token injection via `input.__oauthToken`)
- Remove file-based token loading when OMA connected

## 🐛 Common Issues & Solutions

### "OAuth token required" Error
**Cause:** Token not loaded from file or OMA
**Fix:** Check config/gsc-tokens.json exists OR ensure OMA passes `__oauthToken`

### "Token expired" Error
**Cause:** Refresh token invalid or revoked
**Fix:** Re-run OAuth flow to get new tokens

### "Insufficient permissions" Error
**Cause:** Missing required OAuth scopes
**Fix:** Re-authorize with updated scopes (see Required OAuth Scopes above)

### Manual Token Refresh (Temporary)
```bash
cd "/home/dogancanbaris/projects/MCP Servers"
node refresh-oauth-token.cjs
# Uses refresh token to get new access token
# Updates config/gsc-tokens.json
```

## 🔧 Code References

**Main file:** src/shared/oauth-client-factory.ts
- `extractOAuthToken(input)` - Gets token from input or file
- `createOAuth2ClientFromToken(accessToken)` - Base OAuth client
- `createGoogleAdsClient(refreshToken, developerToken)` - Ads API
- `createAnalyticsDataClient(accessToken)` - GA4 Data API
- `createAnalyticsAdminClient(accessToken)` - GA4 Admin API
- `createBigQueryClient(accessToken)` - BigQuery with user OAuth
- `autoRefreshToken()` - Auto-refresh expired tokens

**Auth flow:** src/gsc/auth.ts
- `GSCAuthManager` class - Complete OAuth flow
- `getAuthorizationUrl()` - Generate auth URL
- `exchangeCodeForTokens(code)` - Get tokens
- `refreshAccessToken()` - Manual refresh

## 📚 Documentation References

- OAUTH-MIGRATION-GUIDE.md - Why OAuth, how it works
- OAUTH-MIGRATION-STATUS.md - Migration history
- OAUTH-TOKEN-SOLUTION.md - Current implementation
- claude.md - Central architecture guide

## ✨ Why OAuth Only?

✅ **Security:** Each user's credentials, isolated access
✅ **Compliance:** Follows Google security best practices
✅ **Multi-tenant:** No shared credentials across users
✅ **Audit trail:** Google tracks which user made changes
✅ **Revocation:** Easy to revoke without affecting others
✅ **Scalability:** Supports 1,000+ concurrent users
