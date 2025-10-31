---
name: oauth
description: Guide for OAuth 2.0 authentication with Google APIs (100% OAuth - no service accounts or API keys). Use when setting up auth, token refresh issues, permission errors, or connecting platforms. Triggers: "authorization", "connect platform", "oauth flow", "token refresh", "authenticate", "permission denied", "auth error"
---

# OAuth Skill - Single Authentication System

**Keywords that trigger this skill:** "authorization", "connect platform", "oauth flow", "token refresh", "authenticate", "auth error", "permission denied"

## ⚠️ CRITICAL: This Project Uses OAuth 2.0 for ALL Authentication

**NO service accounts, NO API keys, NO static credentials.**

Every Google API call uses the user's personal OAuth access token.

This is the ONLY authentication method supported by this project.

## 🏗️ Architecture

**Main File:** src/shared/oauth-client-factory.ts (271 lines)

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
- Token fresh → Return immediately (no refresh needed)

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
- Auto-refresh for expired tokens (< 5 min check)
- Token file loading (temporary until OMA connected)
- All 65 MCP tools use OAuth
- GSCAuthManager for complete auth flow

⏳ **Pending:**
- OMA platform integration (token injection via `input.__oauthToken`)
- Remove file-based token loading when OMA connected

## 🐛 Common Issues & Solutions

### "OAuth token required" Error
**Cause:** Token not loaded from file or OMA
**Fix:**
1. Check config/gsc-tokens.json exists
2. OR ensure OMA passes `__oauthToken` in input
3. OR re-run OAuth flow to get new tokens

### "Token expired" Error
**Cause:** Refresh token invalid, revoked, or too old
**Fix:** Re-run OAuth flow to get new tokens

### "Insufficient permissions" Error
**Cause:** Missing required OAuth scopes
**Fix:** Re-authorize with updated scopes (see Required OAuth Scopes above)

### "User location not allowed" Error (Google Ads)
**Cause:** Your location restricted by Google Ads
**Fix:** Contact Google Ads support or use different location

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

- **OAUTH-MIGRATION-GUIDE.md** - Why OAuth, how it works
- **OAUTH-MIGRATION-STATUS.md** - Migration history
- **OAUTH-TOKEN-SOLUTION.md** - Current implementation details
- **docs/oauth/** - Complete OAuth documentation
- **claude.md** - Central architecture guide

## ✨ Why OAuth Only?

✅ **Security:** Each user's credentials, isolated access
✅ **Compliance:** Follows Google security best practices
✅ **Multi-tenant:** No shared credentials across users
✅ **Audit trail:** Google tracks which user made changes
✅ **Revocation:** Easy to revoke without affecting others
✅ **Scalability:** Supports 1,000+ concurrent users
✅ **No secrets:** Never store API keys in code

## 🔒 Security Best Practices

### ✅ DO:
- Treat refresh tokens as secrets
- Store tokens encrypted (done in OMA)
- Use HTTPS for all OAuth exchanges
- Validate OAuth responses
- Auto-refresh before expiry (< 5 min)
- Log OAuth events for audit

### ❌ DON'T:
- Expose access tokens in logs
- Share refresh tokens between users
- Store tokens in plain text
- Use expired tokens (always refresh)
- Hardcode scopes (define in config)

## 🔄 Token Flow Diagram

```
User Authorizes
    ↓
Authorization Code Received
    ↓
Exchange Code → Access Token + Refresh Token
    ↓
Store Refresh Token (keep long-term)
    ↓
API Calls Use Access Token
    ↓
Token Expires? → Use Refresh Token → Get New Access Token
    ↓
Save New Token
    ↓
Continue API Calls
```

## 📝 Example: Setting Up OAuth for New Platform

1. **Define scopes needed** for the platform
2. **Add to oauth-client-factory.ts** if new API
3. **User authorizes** via `GSCAuthManager.getAuthorizationUrl()`
4. **Exchange code** for tokens
5. **Create API client** via appropriate factory method
6. **Tool calls** automatically refresh tokens

## 🎯 For Developers Integrating New APIs

1. **Check if OAuth scope exists** for your platform
2. **Create factory method** in oauth-client-factory.ts if needed
3. **Import factory** in your API client
4. **Call autoRefreshToken()** before API calls
5. **Extract token** from input or file
6. **Initialize API client** with OAuth access token

## 📚 Reference Links

**File:** src/shared/oauth-client-factory.ts
**Configuration:** config/gsc-tokens.json
**Reference:** docs/oauth/
**Related:** src/gsc/auth.ts (authorization flow)

## 🆘 Need Help?

**For token issues:**
- Check config/gsc-tokens.json exists
- Run `node refresh-oauth-token.cjs`
- Check token expiry date
- Re-authorize if token too old

**For permission issues:**
- Verify all required scopes in authorization URL
- Re-authorize with updated scopes
- Check user has access to requested resources

**For API-specific issues:**
- See that API's documentation
- Check OAuth scope support for that API
- Verify access token not expired

## 💡 Remember

OAuth is the ONLY authentication method. All 65 tools use user's OAuth credentials. No service accounts, no API keys, no workarounds.

This ensures security, compliance, and proper audit trails for 1,000+ WPP practitioners.
