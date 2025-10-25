# OAuth Per-Request Architecture Migration Guide

## 🎯 Goal

Migrate from static service account to per-request OAuth tokens for all Google API access.

**Why:** Enable 1,000+ practitioners to use their OWN Google credentials, seeing only THEIR client data (Nike, Dell, Colgate, etc.) with automatic access control.

---

## ✅ What's Completed

### 1. HTTP Server (src/http-server/server.ts)
- ✅ Extracts `Authorization: Bearer <token>` header
- ✅ Validates OAuth token format
- ✅ Passes token to tool execution via `__oauthToken` parameter
- ✅ Returns 401 if token missing/invalid

### 2. OAuth Client Factory (src/shared/oauth-client-factory.ts)
- ✅ `createGSCClient(accessToken)` - Google Search Console
- ✅ `createGoogleAdsClient(accessToken, developerToken)` - Google Ads
- ✅ `createAnalyticsDataClient(accessToken)` - GA4 Data API
- ✅ `createAnalyticsAdminClient(accessToken)` - GA4 Admin API
- ✅ `createPageSpeedClient(accessToken)` - CrUX / PageSpeed Insights
- ✅ `createBigQueryClient()` - BigQuery (uses service account for infrastructure)
- ✅ `extractOAuthToken(input)` - Helper to get token from tool input
- ✅ `validateOAuthToken(token)` - Token validation

---

## 🔧 Required Changes for Each Tool

### Pattern (Before):
```typescript
// ❌ OLD: Uses global client
import { getGoogleClient } from '../google-client.js';

export const querySearchAnalyticsTool = {
  name: 'query_search_analytics',
  async handler(input: any) {
    const client = getGoogleClient(); // Global client
    const response = await client.searchanalytics.query({...});
    return response.data;
  }
};
```

### Pattern (After):
```typescript
// ✅ NEW: Uses per-request OAuth token
import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';

export const querySearchAnalyticsTool = {
  name: 'query_search_analytics',
  async handler(input: any) {
    // Extract OAuth token from input
    const oauthToken = extractOAuthToken(input);

    if (!oauthToken) {
      throw new Error('OAuth token required but not provided');
    }

    // Create client with user's OAuth token
    const client = createGSCClient(oauthToken);

    // Execute API call with user's credentials
    const response = await client.searchanalytics.query({...});
    return response.data;
  }
};
```

---

## 📋 Files That Need Updates

### Google Search Console Tools (src/gsc/tools/)
- ✅ `list-properties.ts` - Use `createGSCClient(token)`
- ✅ `query-search-analytics.ts` - Use `createGSCClient(token)`
- ✅ `inspect-url.ts` - Use `createGSCClient(token)`
- ✅ `sitemaps.ts` - Use `createGSCClient(token)`
- ✅ `crux.ts` - Use `createPageSpeedClient(token)`

### Google Ads Tools (src/ads/tools/)
**All 25 tool files need same pattern:**
- `campaigns.ts`, `budgets.ts`, `keywords.ts`, etc.
- Use: `createGoogleAdsClient(token, developerToken, customerId)`

### Google Analytics Tools (src/analytics/tools/)
- `reporting.ts` - Use `createAnalyticsDataClient(token)`
- `admin.ts` - Use `createAnalyticsAdminClient(token)`

### BigQuery Tools (src/bigquery/tools/)
- ✅ NO CHANGE - Already uses service account (shared infrastructure)

### Business Profile Tools (src/business-profile/tools/)
- Update to use OAuth token (create factory method)

---

## 🏗️ Implementation Steps

### Step 1: Update Each Tool File
For EACH tool file:
1. Import: `import { extractOAuthToken, create<API>Client } from '../../shared/oauth-client-factory.js';`
2. At start of handler: `const token = extractOAuthToken(input);`
3. Validate: `if (!token) throw new Error('OAuth token required');`
4. Create client: `const client = create<API>Client(token);`
5. Use client for API calls

### Step 2: Remove Global Client Initialization
- `src/gsc/google-client.ts` - Remove singleton, convert to factory
- `src/ads/client.ts` - Remove global initialization
- `src/analytics/client.ts` - Remove global initialization

### Step 3: Update Server Startup
- `src/gsc/server.ts` - Remove OAuth file loading at startup
- `src/http-server/index.ts` - Don't initialize global clients

---

## 🧪 Testing OAuth Flow

### Setup OAuth Credentials:
1. Go to: https://console.cloud.google.com/apis/credentials?project=mcp-servers-475317
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `http://localhost:3000/callback`
4. Save Client ID and Secret to `.env`

### Get Your OAuth Token:
```bash
# Run OAuth flow
npm run setup:auth

# Token saved to config/gsc-tokens.json
```

### Test API Call with OAuth:
```bash
# Read your token
TOKEN=$(cat config/gsc-tokens.json | jq -r '.accessToken')

# Test HTTP endpoint
curl -X POST http://localhost:3000/mcp/execute-tool \
  -H "X-OMA-API-Key: test-key" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "list_properties",
    "input": {}
  }'
```

---

## 🔐 Service Account vs OAuth Usage

| Component | Auth Method | Why |
|-----------|-------------|-----|
| **Google Search Console** | 🔵 OAuth (User) | User sees only their properties |
| **Google Ads** | 🔵 OAuth (User) | User sees only their accounts |
| **Google Analytics** | 🔵 OAuth (User) | User sees only their properties |
| **PageSpeed / CrUX** | 🔵 OAuth (User) | Per-user API quotas |
| **BigQuery (Write)** | 🟢 Service Account | Shared data lake infrastructure |
| **BigQuery (Read)** | 🔵 OAuth (User) | Row-level security filters by client |
| **Metabase** | 🟢 Service Account | Shared dashboard platform |

**Key Principle:**
- OAuth for DATA ACCESS (what user can see)
- Service Account for INFRASTRUCTURE (where data is stored)

---

## 📊 Benefits of OAuth Architecture

### Security:
- ✅ User can't see other clients' data (Google enforces)
- ✅ No shared credentials = no credential leakage risk
- ✅ Tokens expire = automatic security rotation

### Scale:
- ✅ Zero provisioning (user brings their own access)
- ✅ Works for 1 user or 10,000 users
- ✅ No manual service account management

### Compliance:
- ✅ Audit trail shows which user accessed what
- ✅ Easy to revoke access (remove user's Google permissions)
- ✅ Aligns with enterprise IAM policies

---

## ⚠️ Important Notes

### Google Ads Specifics:
- May need REFRESH token (not just access token) for some operations
- OMA should provide both access_token and refresh_token
- Developer token still required (from environment variable)

### Token Expiry:
- Access tokens expire in 1 hour
- OMA responsible for refreshing tokens
- MCP returns 401 if token expired → OMA refreshes and retries

### Backward Compatibility:
- STDIO transport can still use file-based OAuth for development
- HTTP transport REQUIRES per-request OAuth for production

---

## 🎯 Estimated Effort

- ✅ HTTP Server updates: DONE
- ✅ Client factory: DONE
- ⏳ Update 58 tools: 3-4 hours (15 tools/hour = ~240 mins)
- ⏳ Testing: 30 minutes
- ⏳ Documentation: 30 minutes

**Total: ~5 hours for complete migration**

---

## 🚀 Quick Start (After Migration)

**OMA sends request:**
```http
POST /mcp/execute-tool
Headers:
  X-OMA-API-Key: <oma-key>
  Authorization: Bearer <user-google-oauth-token>
Body:
  {
    "toolName": "query_search_analytics",
    "input": {
      "property": "sc-domain:example.com",
      "startDate": "2025-10-10",
      "endDate": "2025-10-17"
    }
  }
```

**MCP:**
1. Validates OMA API key ✅
2. Extracts OAuth token ✅
3. Creates GSC client with user's token ✅
4. Queries GSC (user sees only their properties) ✅
5. Returns data ✅

**Result:** Automatic multi-tenant isolation, zero provisioning, infinite scale!
