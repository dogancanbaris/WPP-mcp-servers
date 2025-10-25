# OMA Integration Specification - OAuth Per-Request

## 🎯 Overview

WPP Digital Marketing MCP Server now uses **OAuth per-request** architecture, enabling 1,000+ practitioners to access data using their own Google credentials with automatic multi-tenant isolation.

---

## 🔐 Authentication Flow

### Step 1: User Logs into OMA
- User authenticates with their **Google work account**
- OMA performs OAuth 2.0 flow with Google
- OMA receives both **access token** and **refresh token**

### Step 2: OMA Calls MCP Server
Every MCP API call must include:

```http
POST https://your-mcp-server.com/mcp/execute-tool

Headers:
  X-OMA-API-Key: <your-oma-api-key>
  Authorization: Bearer <user-google-access-token>
  X-Google-Refresh-Token: <user-google-refresh-token>
  Content-Type: application/json

Body:
  {
    "toolName": "query_search_analytics",
    "input": {
      "property": "sc-domain:example.com",
      "startDate": "2025-10-11",
      "endDate": "2025-10-17",
      "dimensions": ["query", "page", "device", "country", "date"]
    }
  }
```

---

## 📋 Required Headers

| Header | Required | Purpose | Example |
|--------|----------|---------|---------|
| `X-OMA-API-Key` | ✅ Always | Authenticates OMA platform | `oma-prod-key-xyz123` |
| `Authorization` | ✅ Always | User's Google access token | `Bearer ya29.a0AfH6SMB...` |
| `X-Google-Refresh-Token` | ⚠️ For Google Ads only | User's refresh token | `1//0gUK9q8w...` |
| `Content-Type` | ✅ Always | Request format | `application/json` |

### Token Types Explained:

**Access Token (in Authorization header):**
- Used by: Google Search Console, Analytics, CrUX, Business Profile
- Lifetime: 1 hour
- OMA must refresh every hour
- Format: `ya29.a0...` (typically 200-500 characters)

**Refresh Token (in X-Google-Refresh-Token header):**
- Used by: Google Ads API only
- Lifetime: Never expires (until revoked)
- Get once during OAuth flow, store securely
- Format: `1//0g...` (typically 100-200 characters)

---

## 🔄 OAuth Flow for OMA

### Initial Setup (One-Time per User):

**When user first logs into OMA:**

1. OMA redirects user to Google OAuth consent screen:
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=<your-client-id>&
  redirect_uri=<your-redirect-uri>&
  scope=https://www.googleapis.com/auth/webmasters
        https://www.googleapis.com/auth/adwords
        https://www.googleapis.com/auth/analytics
        https://www.googleapis.com/auth/business.manage&
  response_type=code&
  access_type=offline&
  prompt=consent
```

**Important:**
- `access_type=offline` - Required to get refresh token
- `prompt=consent` - Forces consent screen to ensure refresh token

2. User authorizes access to their Google accounts

3. Google redirects back with authorization code

4. OMA exchanges code for tokens:
```bash
POST https://oauth2.googleapis.com/token
{
  "code": "<authorization-code>",
  "client_id": "<your-client-id>",
  "client_secret": "<your-client-secret>",
  "redirect_uri": "<your-redirect-uri>",
  "grant_type": "authorization_code"
}
```

5. Response contains BOTH tokens:
```json
{
  "access_token": "ya29.a0AfH6SMB...",
  "refresh_token": "1//0gUK9q8w...",
  "expires_in": 3600,
  "scope": "...",
  "token_type": "Bearer"
}
```

6. **OMA stores BOTH tokens** securely per user

---

### Subsequent Requests:

**For each MCP call:**
1. Check if access token expired (1 hour lifetime)
2. If expired, refresh it:
```bash
POST https://oauth2.googleapis.com/token
{
  "refresh_token": "<stored-refresh-token>",
  "client_id": "<your-client-id>",
  "client_secret": "<your-client-secret>",
  "grant_type": "refresh_token"
}
```
3. Get new access token (refresh token stays same)
4. Include BOTH in MCP request headers
5. MCP uses tokens to access Google APIs on user's behalf

---

## 📊 Example Request/Response

### Request: Pull GSC Data

```http
POST https://your-mcp-server.com/mcp/execute-tool

Headers:
  X-OMA-API-Key: oma-prod-key-xyz123
  Authorization: Bearer ya29.a0AfH6SMBxK8...
  Content-Type: application/json

Body:
  {
    "toolName": "query_search_analytics",
    "input": {
      "property": "sc-domain:keepersdigital.com",
      "startDate": "2025-10-11",
      "endDate": "2025-10-17",
      "dimensions": ["query", "page", "country", "device", "date"],
      "rowLimit": 25000
    }
  }
```

### Response: Success

```json
{
  "success": true,
  "toolName": "query_search_analytics",
  "result": {
    "rows": [
      {
        "keys": ["best running shoes", "https://keepersdigital.com/shoes", "US", "MOBILE", "2025-10-17"],
        "clicks": 125,
        "impressions": 3500,
        "ctr": 0.0357,
        "position": 8.5
      },
      ...
    ],
    "rowCount": 850
  },
  "timestamp": "2025-10-19T23:45:12.345Z"
}
```

### Response: Missing Token

```json
{
  "success": false,
  "error": "Missing OAuth access token",
  "message": "Authorization: Bearer <access-token> header is required for Google API access"
}
```

### Response: Expired Token

```json
{
  "success": false,
  "error": "OAuth token expired",
  "message": "The credentials do not have the required scopes. Please refresh the token."
}
```

**OMA Action:** Refresh access token and retry request

---

## 🔧 Tool-Specific Requirements

### Google Search Console Tools (9 tools):
- **Requires:** Access token only
- **Header:** `Authorization: Bearer <access-token>`
- **User sees:** Only GSC properties they have access to

### Google Ads Tools (25 tools):
- **Requires:** BOTH access and refresh tokens
- **Headers:**
  - `Authorization: Bearer <access-token>`
  - `X-Google-Refresh-Token: <refresh-token>`
- **User sees:** Only Google Ads accounts they manage

### Google Analytics Tools (8 tools):
- **Requires:** Access token only
- **Header:** `Authorization: Bearer <access-token>`
- **User sees:** Only GA4 properties they have access to

### Business Profile Tools (3 tools):
- **Requires:** Access token only
- **Header:** `Authorization: Bearer <access-token>`
- **User sees:** Only business locations they manage

### BigQuery & Metabase:
- **Requires:** Nothing (uses infrastructure service account)
- **No user OAuth needed** - shared resources

---

## 🛡️ Security Features

### Automatic Multi-Tenant Isolation:
- User A (manages Nike + Dell) queries Google Ads
- MCP uses User A's OAuth token
- Google Ads API returns ONLY Nike + Dell accounts
- User A cannot see Colgate, P&G, or other clients

### Token Security:
- Access tokens expire every hour (automatic rotation)
- Refresh tokens stored securely by OMA (encrypted database)
- Tokens never logged or stored by MCP
- Each request creates fresh API clients (no token caching)

### Audit Trail:
- Every API call includes userId
- Logs show which user accessed what data
- Easy compliance for data access audits

---

## ⚡ Performance Considerations

### Token Refresh Strategy:
**Option A: Proactive Refresh (Recommended)**
```typescript
// Before calling MCP, check token age
if (Date.now() - tokenIssuedAt > 50 * 60 * 1000) { // 50 minutes
  // Refresh proactively
  accessToken = await refreshAccessToken(refreshToken);
}
```

**Option B: Reactive Refresh**
```typescript
// Call MCP
const response = await callMCP(accessToken);

// If 401, refresh and retry
if (response.status === 401) {
  accessToken = await refreshAccessToken(refreshToken);
  response = await callMCP(accessToken); // Retry once
}
```

### Caching:
- OMA should cache user's tokens in session
- Don't call OAuth endpoint for every MCP request
- Refresh only when needed (hourly)

---

## 🧪 Testing OAuth Integration

### Test Script (for OMA team):

```bash
# 1. Get OAuth tokens (one-time setup)
# Follow Google OAuth flow, save tokens

# 2. Test MCP endpoint
curl -X POST http://localhost:3000/mcp/execute-tool \
  -H "X-OMA-API-Key: test-key-123" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Google-Refresh-Token: $REFRESH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "list_properties",
    "input": {}
  }'

# Should return: GSC properties user has access to
```

### Expected Results:
- ✅ 200 OK with data user can access
- ❌ 401 if tokens missing/invalid
- ❌ 403 if user lacks permissions for requested resource

---

## 📝 OMA Implementation Checklist

### Phase 1: OAuth Setup
- [ ] Register OAuth 2.0 application in Google Cloud Console
- [ ] Configure redirect URI for OMA callback
- [ ] Store client ID and client secret securely
- [ ] Implement OAuth consent flow for users
- [ ] Store refresh tokens securely (encrypted database)

### Phase 2: Token Management
- [ ] Implement access token refresh logic
- [ ] Cache access tokens in user session (1-hour TTL)
- [ ] Handle token expiry gracefully (refresh + retry)
- [ ] Log token refresh events for debugging

### Phase 3: MCP Integration
- [ ] Add `Authorization` header to all MCP requests
- [ ] Add `X-Google-Refresh-Token` header for Google Ads requests
- [ ] Handle 401 responses (refresh token, retry once)
- [ ] Test with multiple user accounts

### Phase 4: Multi-Tenant Validation
- [ ] Test User A sees only their clients
- [ ] Test User B sees different clients
- [ ] Verify data isolation between users
- [ ] Test with 10+ concurrent users

---

## 🚨 Error Handling

### Common Errors and Solutions:

**Error: "Missing OAuth access token"**
- Cause: OMA didn't send `Authorization` header
- Fix: Add `Authorization: Bearer <token>` to request

**Error: "Refresh token required for Google Ads API"**
- Cause: Google Ads tool called without `X-Google-Refresh-Token` header
- Fix: Add refresh token header for Google Ads requests

**Error: "OAuth token expired"**
- Cause: Access token older than 1 hour
- Fix: OMA refreshes access token and retries

**Error: "Invalid refresh token"**
- Cause: Refresh token revoked or invalid
- Fix: User must re-authorize via OAuth flow

---

## 🎯 Benefits of This Architecture

### For Practitioners:
- ✅ Login once with Google account (SSO)
- ✅ See only their clients automatically
- ✅ No manual provisioning needed
- ✅ Familiar Google login experience

### For WPP IT:
- ✅ Zero per-user setup
- ✅ Automatic access control (Google enforces)
- ✅ Easy onboarding/offboarding (manage Google workspace permissions)
- ✅ Scales to unlimited users

### For Security/Compliance:
- ✅ No shared credentials
- ✅ Automatic token rotation (hourly)
- ✅ Audit trail per user
- ✅ Easy to revoke access (remove Google permissions)

---

## 📊 Workflow Example

**Scenario:** Practitioner asks: "Show me Colgate Google Ads performance last 7 days"

```
1. User → OMA (with Google work account)
   ↓
2. OMA has user's OAuth tokens (access + refresh)
   ↓
3. OMA → MCP HTTP Request:
   POST /mcp/execute-tool
   Authorization: Bearer ya29.a0AfH6SMB...
   X-Google-Refresh-Token: 1//0gUK9q8w...
   Body: { toolName: "get_campaign_performance", input: {...} }
   ↓
4. MCP extracts tokens
   ↓
5. MCP creates Google Ads client with USER'S refresh token
   ↓
6. MCP queries Google Ads API (as the user)
   ↓
7. Google Ads returns ONLY accounts user can access
   ↓
8. MCP loads data to BigQuery (service account)
   ↓
9. MCP returns results to OMA
   ↓
10. LLM creates Metabase dashboard
   ↓
11. User sees dashboard with ONLY their client data
```

**Result:** Automatic client isolation, zero provisioning, perfect security!

---

## 🔗 API Reference

### Endpoint: Execute Tool
```
POST /mcp/execute-tool
```

**Required Headers:**
- `X-OMA-API-Key`: OMA platform API key
- `Authorization`: Bearer token with user's Google access token
- `X-Google-Refresh-Token`: User's Google refresh token (for Google Ads tools)

**Request Body:**
```json
{
  "toolName": "<tool-name>",
  "input": {
    // Tool-specific parameters
  },
  "userId": "<optional-user-identifier>",
  "confirmationToken": "<optional-for-approval-workflow>"
}
```

**Response (Success):**
```json
{
  "success": true,
  "toolName": "<tool-name>",
  "result": {
    // Tool-specific results
  },
  "timestamp": "2025-10-19T23:45:12.345Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "<error-type>",
  "message": "<detailed-error-message>"
}
```

---

## 🎓 For OMA Development Team

### Quick Start Checklist:

1. **Get OAuth Credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials?project=mcp-servers-475317
   - Create OAuth 2.0 Client ID
   - Add your redirect URI
   - Save Client ID and Secret

2. **Implement OAuth Flow:**
   - Use `access_type=offline` to get refresh token
   - Use `prompt=consent` to force consent screen
   - Store both access and refresh tokens

3. **Test with MCP:**
   - Start with `list_properties` tool (simple, no approval needed)
   - Verify you see properties user has access to
   - Test token refresh logic

4. **Scale Up:**
   - Test with multiple users simultaneously
   - Verify data isolation
   - Test with Google Ads tools (need refresh token)

---

## 💡 Best Practices

### Do:
- ✅ Cache access tokens in user session (1-hour TTL)
- ✅ Refresh proactively before expiry (at 50 minutes)
- ✅ Store refresh tokens encrypted in database
- ✅ Log all token refresh events
- ✅ Implement retry logic for 401 errors

### Don't:
- ❌ Don't send access token in query parameters (security risk)
- ❌ Don't store access tokens in cookies (XSS risk)
- ❌ Don't skip token validation
- ❌ Don't share refresh tokens between users
- ❌ Don't log full tokens (PII/security risk)

---

## 🎉 What This Enables

**Multi-Client Practitioner Example:**

Practitioner manages: Nike, Dell

**When they query Google Ads:**
- MCP uses THEIR OAuth token
- Google Ads API returns: Nike account, Dell account
- Dashboard shows: Nike + Dell data only
- **Cannot see:** Colgate, P&G, or other clients

**Automatic Access Control:**
- If practitioner loses Dell access (in Google Ads)
- Next MCP request shows only Nike
- No MCP configuration change needed
- **Google IAM is source of truth**

---

## 🔗 Additional Resources

- **OAuth Migration Guide:** See `OAUTH-MIGRATION-GUIDE.md`
- **Service Account Requirements:** See `SERVICE-ACCOUNT-REQUIREMENTS.md`
- **Project Architecture:** See `PROJECT-BACKBONE.md`
- **Comprehensive Report:** See `COMPREHENSIVE-REPORT-OUTLINE.md`

---

**This architecture supports 1,000+ practitioners with ZERO per-user provisioning!**
