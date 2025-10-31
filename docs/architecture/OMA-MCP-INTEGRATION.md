# OMA ↔ MCP Integration Architecture

**Purpose:** Connect WPP's OMA (AI platform) to WPP Digital Marketing MCP Server
**Scope:** Two-layer account authorization + secure API communication
**Status:** Design Complete, Implementation Pending

---

> **⚠️ IMPORTANT UPDATE - RECOMMENDED INTEGRATION APPROACH:**
>
> This document describes the **two-layer authorization architecture** (account approval workflow).
>
> For **web UI integration with native tool mounting** (recommended technical approach), see:
> **📖 `docs/architecture/MCP-WEB-UI-COMPLETE-GUIDE.md`**
>
> **What each document covers:**
> - **THIS DOCUMENT (OMA-MCP-INTEGRATION.md):** Account authorization, approval workflows, security architecture
> - **MCP-WEB-UI-COMPLETE-GUIDE.md:** Technical integration (MCP SDK, OAuth metadata, native tool access)
>
> **Read both for complete understanding!**

---

## ARCHITECTURE OVERVIEW

### The Problem:

**Scenario:** Practitioner john.doe@wpp.com
- Has MCC access to 100+ Google Ads accounts (all Toronto office clients)
- Should only work on assigned clients: Client A, Client B, Client C (3 accounts)
- Without protection: Could accidentally modify wrong client's account
- Same issue for GSC (50+ properties) and Analytics (200+ properties)

### The Solution: Two-Layer Authorization

**Layer 1: Google API Access (OAuth)**
- OMA stores each user's Google OAuth tokens
- Tokens give access to ALL accounts user has in Google
- Example: john.doe's tokens see all 100+ Google Ads accounts

**Layer 2: WPP Account Authorization (Manager Approval)**
- User requests access to specific accounts in OMA
- Manager approves which accounts user can work on
- MCP enforces: Only approved accounts accessible
- Example: john.doe approved for only 3 accounts

**Result:**
- Google OAuth: User HAS ACCESS to 100 accounts
- WPP Authorization: User CAN USE only 3 accounts
- Attempted access to account #4 → Blocked by MCP

---

## DATA FLOW: END-TO-END

### Step 1: User Onboarding (One-Time Setup)

**In OMA Platform:**
```
1. New user john.doe@wpp.com joins WPP Toronto office

2. Admin creates user in OMA:
   - Email: john.doe@wpp.com
   - Agency: Toronto Office
   - Role: Practitioner
   - Manager: manager-toronto@wpp.com
   - Global Admin: dogancanbaris@wpp.com

3. OMA guides user through Google OAuth:
   - "Connect your Google Account"
   - User authorizes: GSC, Google Ads, Analytics scopes
   - OMA stores OAuth tokens securely (encrypted)
   - Tokens associated with john.doe@wpp.com

4. User now has OMA account + Google OAuth tokens stored
```

### Step 2: Account Access Request

**User Flow in OMA:**
```
1. John logs into OMA platform

2. Navigates to "Request Account Access"

3. OMA queries Google APIs using john's OAuth tokens:
   - Discovers: 100+ Google Ads accounts john has access to
   - Discovers: 50+ GSC properties
   - Discovers: 200+ Analytics properties
   - Shows full list to john

4. John selects accounts he wants to work on:
   ☑ Google Ads: 1234567890 (Client A - Retail Campaign)
   ☑ Google Ads: 0987654321 (Client B - Lead Gen)
   ☑ GSC: sc-domain:clienta.com
   ☑ GSC: sc-domain:clientb.com
   ☑ Analytics: properties/111111 (Client A website)

5. John provides reason:
   "Managing Q4 campaigns for Client A and Client B. Need to optimize budgets and add seasonal keywords."

6. John clicks "Submit Access Request"
```

**OMA Backend:**
```
7. OMA creates access request record:
   {
     requestId: "req_20251017_001",
     userId: "john.doe@wpp.com",
     userName: "John Doe",
     agency: "Toronto Office",
     requestedAccounts: [
       {
         api: "Google Ads",
         accountId: "1234567890",
         accountName: "Client A - Retail",
         currentAccess: true // User has Google OAuth access
       },
       {
         api: "Google Ads",
         accountId: "0987654321",
         accountName: "Client B - Lead Gen",
         currentAccess: true
       },
       // ... 3 more accounts
     ],
     reason: "Managing Q4 campaigns...",
     requestDate: "2025-10-17T14:30:00Z",
     status: "PENDING",
     localManager: "manager-toronto@wpp.com",
     globalAdmin: "dogancanbaris@wpp.com"
   }

8. OMA sends notifications:
   - Email to manager-toronto@wpp.com (primary approver)
   - Email to dogancanbaris@wpp.com (cc, visibility)
   - In-app notification in OMA

9. OMA stores request in database (pending approval)
```

### Step 3: Manager Approval

**Manager Experience in OMA:**
```
1. Manager gets email: "Access Request from John Doe"

2. Manager logs into OMA → "Pending Approvals" section

3. Manager sees request:
   User: John Doe (Toronto Office)
   Requested Access:
   - Google Ads Account 1234567890 (Client A)
   - Google Ads Account 0987654321 (Client B)
   - GSC Property sc-domain:clienta.com
   - GSC Property sc-domain:clientb.com
   - Analytics Property 111111 (Client A)

   Reason: "Managing Q4 campaigns for Client A and B"

   Manager's Context (OMA shows):
   - John's current clients: Client A, Client B ✓
   - Request matches assigned clients ✓
   - No unusual accounts requested ✓
   - Reason seems legitimate ✓

4. Manager clicks: [Approve All] [Approve Partial] [Reject]

5. Manager selects "Approve All" and adds note:
   "Approved for Q4 campaign management. Access expires Dec 31."

6. Manager sets expiration: 2025-12-31

7. Manager clicks "Confirm Approval"
```

**OMA Backend:**
```
8. OMA updates access request:
   status: "APPROVED",
   approvedBy: "manager-toronto@wpp.com",
   approvedAt: "2025-10-17T15:00:00Z",
   expiresAt: "2025-12-31T23:59:59Z",
   approverNote: "Approved for Q4 campaign management"

9. OMA creates approved account records:
   FOR EACH approved account:
     INSERT INTO approved_accounts (
       userId: "john.doe@wpp.com",
       api: "Google Ads",
       accountId: "1234567890",
       accountName: "Client A",
       approvedBy: "manager-toronto@wpp.com",
       approvedAt: "2025-10-17T15:00:00Z",
       expiresAt: "2025-12-31T23:59:59Z"
     )

10. OMA sends notifications:
    - Email to john.doe@wpp.com: "Access approved!"
    - Email to dogancanbaris@wpp.com: "FYI: John Doe approved for 5 accounts"

11. John can now use MCP through OMA
```

### Step 4: Using MCP Through OMA

**User Interaction:**
```
John in OMA platform:
Types: "Show me campaign performance for Client A"

OMA AI Assistant (Claude/GPT):
- Recognizes need for Google Ads data
- Prepares MCP tool call: get_campaign_performance
```

**OMA → MCP Communication:**

**Option A: Native MCP SDK (Recommended)**
```typescript
// MCP SDK handles all HTTP communication automatically
const result = await mcpClient.callTool({
  name: 'get_campaign_performance',
  arguments: {
    customerId: '1234567890', // Client A
    startDate: '2024-10-01',
    endDate: '2024-10-17'
  }
});

// SDK automatically:
// - Adds Authorization: Bearer {oauth_token} header
// - Manages session ID
// - Handles token refresh
// - Retries on 401

// See: MCP-WEB-UI-COMPLETE-GUIDE.md for complete implementation
```

**Option B: Manual HTTP API (Legacy/Reference)**
```
OMA Backend sends HTTPS request:

POST https://mcp.wpp.com/mcp
Headers:
  Authorization: Bearer {user_google_access_token}
    (User's Google OAuth access token)
  X-Google-Refresh-Token: {user_google_refresh_token}
    (For Google Ads API only)
  Mcp-Session-Id: {session_id}
  Content-Type: application/json

Body:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_campaign_performance",
    "arguments": {
      "customerId": "1234567890",
      "startDate": "2024-10-01",
      "endDate": "2024-10-17"
    }
  }
}

Note: Manual HTTP requires:
- Session management
- OAuth token injection
- Error handling
- Retry logic

Recommended: Use MCP SDK instead
```

**MCP Server Processing:**
```
1. AWS API Gateway receives request
   ↓
2. Lambda Authorizer validates:
   - Cognito JWT signature valid?
   - Token not expired?
   - User is WPP employee? (custom:employeeId starts with WPP-)
   - ✅ All pass → Forward to MCP server

3. MCP Server (ECS Fargate):

   a) Decrypt approved accounts:
      approvedAccounts = decrypt(body.approvedAccounts.encrypted)

   b) Verify signature (ensure OMA sent this, not tampered):
      if (!verifySignature(approvedAccounts, signature)) {
        return 403: "Invalid approved accounts signature"
      }

   c) Check account authorization:
      requestedAccount = "1234567890"
      isApproved = approvedAccounts.some(
        acc => acc.api === "Google Ads" && acc.accountId === "1234567890"
      )

      if (!isApproved) {
        log: "Unauthorized account access attempt"
        notify: Security team
        return 403: "You don't have access to account 1234567890"
      }

   d) Execute tool:
      - Use john's Google OAuth token (from header)
      - Call Google Ads API: getCampaignPerformance
      - Get results

   e) Log operation:
      DynamoDB.put({
        userId: "john.doe@wpp.com",
        timestamp: now(),
        tool: "get_campaign_performance",
        accountId: "1234567890",
        result: "success",
        dataReturned: "50 rows"
      })

   f) Return results:
      {
        success: true,
        data: {campaigns: [...performance data...]},
        operationId: "op_12345"
      }

4. API Gateway returns to OMA

5. OMA presents results to user via AI assistant
```

---

## OAUTH INTEGRATION: TWO APPROACHES

### Recommended: MCP SDK with Native Tool Access

**Use MCP TypeScript SDK for web UI integration:**

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Create MCP client in browser
const mcpClient = new Client({ name: 'OMA-WebUI', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(new URL('https://mcp.wpp.com/mcp'));
await mcpClient.connect(transport);

// ✅ Tools natively available to agents (like CLI)
const tools = await mcpClient.listTools();

// Agent calls tools directly
const result = await mcpClient.callTool({
  name: 'query_search_analytics',
  arguments: { ... }
});
```

**OAuth Flow:**
1. MCP server advertises OAuth metadata via RFC 9728
2. OMA client automatically discovers scopes and endpoints
3. OMA redirects practitioner to authorization
4. Tokens managed automatically by SDK
5. Dynamic scope updates (no code changes)

**📖 Complete Guide:** See `MCP-WEB-UI-COMPLETE-GUIDE.md` for full implementation with OAuth metadata endpoints, PKCE flow, and production code.

### Alternative: Manual HTTP API (Legacy)

OMA handles complete OAuth flow independently and makes manual HTTP requests.

**See sections below for manual HTTP API details** (legacy reference).

---

## OMA PLATFORM REQUIREMENTS

### What OMA Must Build:

**0. MCP SDK Integration (Foundation - Recommended)**
```
Install MCP SDK:
npm install @modelcontextprotocol/sdk

Create MCP Client Service:
- Streamable HTTP transport to MCP server
- OAuth handler with PKCE (automatic via SDK)
- Token refresh management
- Native tool calling (no manual HTTP)

See: MCP-WEB-UI-COMPLETE-GUIDE.md for complete implementation
```

**1. User Google OAuth Management**
```
Feature: Google Account Connection
- UI: "Connect Google Account" button
- Flow: OAuth authorization → Store tokens
- Storage: Encrypted tokens in OMA database
- Refresh: Automatic token refresh before expiry
- Per user: Each WPP practitioner has their own tokens

Implementation Options:
A) Via MCP SDK (automatic OAuth discovery)
B) Manual OAuth flow (if not using SDK)
```

**2. Account Access Request UI**
```
Page: "Request Account Access"

Sections:
A) Discover Available Accounts
   - Button: "Scan My Google Accounts"
   - OMA uses user's OAuth tokens to query:
     * Google Ads: listAccessibleCustomers
     * GSC: listProperties
     * Analytics: listProperties
   - Shows: Full list of accounts user CAN access via Google

B) Select Accounts to Request
   - Checkboxes for each account
   - Group by client
   - Show account metadata (name, ID, type)
   - Multi-select allowed

C) Justification
   - Text field: "Why do you need access to these accounts?"
   - Required field
   - Suggestions: "Campaign management", "Q4 optimization", "Client onboarding"

D) Submit Request
   - Button: "Submit for Approval"
   - Sends to local manager + global admin
   - User sees: "Request submitted. You'll be notified when approved."
```

**3. Manager Approval UI**
```
Page: "Pending Access Requests" (Manager View)

Request Card:
┌────────────────────────────────────────────────┐
│ Access Request from John Doe                    │
│ Agency: Toronto Office                          │
│ Submitted: Oct 17, 2025 2:30 PM                │
│                                                 │
│ Requested Accounts (5):                         │
│ ☑ Google Ads: 1234567890 (Client A)            │
│ ☑ Google Ads: 0987654321 (Client B)            │
│ ☑ GSC: sc-domain:clienta.com                   │
│ ☑ GSC: sc-domain:clientb.com                   │
│ ☑ Analytics: properties/111111 (Client A)      │
│                                                 │
│ Reason: "Managing Q4 campaigns for Client A&B" │
│                                                 │
│ Manager Context:                                │
│ - John's assigned clients: Client A, B ✓       │
│ - Request aligns with assignments ✓             │
│                                                 │
│ Actions:                                        │
│ [Approve All] [Approve Selected] [Reject]      │
│                                                 │
│ Optional: Set Expiration Date                   │
│ [Date Picker] Default: Dec 31, 2025            │
│                                                 │
│ Optional: Add Note                              │
│ [Text field]                                    │
└────────────────────────────────────────────────┘
```

**4. Approved Accounts API**
```
Endpoint: GET /api/v1/approved-accounts/{userId}

Response:
{
  "userId": "john.doe@wpp.com",
  "accounts": [
    {
      "api": "Google Ads",
      "accountId": "1234567890",
      "accountName": "Client A - Retail",
      "approvedBy": "manager-toronto@wpp.com",
      "approvedAt": "2025-10-17T15:00:00Z",
      "expiresAt": "2025-12-31T23:59:59Z"
    },
    // ... 4 more
  ],
  "lastUpdated": "2025-10-17T15:00:00Z"
}

Used by: MCP server on every request to validate access
```

**5. MCP Proxy API**
```
Endpoint: POST /api/v1/mcp/execute-tool

Flow:
1. OMA receives AI agent's tool call
2. OMA looks up user's Google OAuth token
3. OMA looks up user's approved accounts
4. OMA constructs request to MCP
5. OMA forwards to MCP server
6. MCP executes and returns results
7. OMA passes results to AI agent
8. AI agent presents to user
```

---

## API CONTRACT: OMA ↔ MCP

> **📝 Note:** When using MCP SDK (recommended), most of this low-level API contract
> is handled automatically by the SDK. The sections below describe the manual HTTP API
> for reference and legacy integrations.
>
> **For SDK-based integration:** See `MCP-WEB-UI-COMPLETE-GUIDE.md`

### Authentication Between Systems:

**OMA Authenticates to MCP:**
```
Method: API Key (server-to-server)

OMA has: WPP_MCP_API_KEY (stored in OMA secrets)
MCP validates: Every request must have valid API key

Header:
  X-OMA-API-Key: {wpp_mcp_api_key}

MCP checks:
  if (request.headers['x-oma-api-key'] !== process.env.OMA_API_KEY) {
    return 401: "Invalid OMA API key"
  }
```

**User Authorization in MCP:**
```
Method: Approved Accounts List + Google OAuth Token

OMA passes per request:
1. User's Google OAuth token (for Google API calls)
2. User's approved accounts (encrypted, signed)
3. User identification (JWT from OMA's Cognito)

MCP validates:
1. OMA API key valid (server-to-server auth)
2. User JWT valid (OMA issued this for valid user)
3. Approved accounts signature valid (not tampered)
4. Requested account in approved list
```

---

### API Specification:

> **💡 Tip:** Using MCP SDK? You don't need to manually construct these requests.
> The SDK handles JSON-RPC formatting, session management, and headers automatically.
>
> **See:** `MCP-WEB-UI-COMPLETE-GUIDE.md` for SDK usage examples

**POST /mcp** (MCP Standard Endpoint)

**Request (Manual HTTP API):**
```json
{
  "tool": "update_budget",
  "params": {
    "customerId": "1234567890",
    "budgetId": "456",
    "newDailyAmountDollars": 150
  },
  "userId": "john.doe@wpp.com",
  "googleOAuthToken": "{user_google_oauth_refresh_token}",
  "approvedAccounts": {
    "data": "{encrypted_json}",
    "signature": "{hmac_signature}"
  },
  "omaRequestId": "oma_req_12345"
}
```

**Headers:**
```
Authorization: Bearer {cognito_jwt}
X-OMA-API-Key: {oma_api_key}
Content-Type: application/json
```

**Response (Success - Read Operation):**
```json
{
  "success": true,
  "operationId": "op_20251017_150000_abc",
  "tool": "get_campaign_performance",
  "data": {
    "campaigns": [...],
    "count": 15
  },
  "executionTime": 1.2,
  "timestamp": "2025-10-17T15:00:00Z"
}
```

**Response (Requires Approval - Write Operation):**
```json
{
  "success": false,
  "requiresApproval": true,
  "operationId": "op_20251017_150000_abc",
  "preview": {
    "operation": "update_budget",
    "account": "1234567890",
    "changes": [
      "Budget will change from $100/day to $150/day",
      "Daily impact: +$50",
      "Monthly impact: +$1,500",
      "Percentage change: +50%"
    ],
    "warnings": [],
    "riskLevel": "MEDIUM"
  },
  "message": "User confirmation required. Present preview and request approval.",
  "confirmationToken": "{token_to_include_when_confirming}"
}
```

**Follow-up (User Approves):**
```
POST /mcp/confirm-operation

{
  "operationId": "op_20251017_150000_abc",
  "confirmationToken": "{token_from_preview}",
  "userConfirmation": "APPROVED",
  "userId": "john.doe@wpp.com"
}

Response:
{
  "success": true,
  "operationId": "op_20251017_150000_abc",
  "data": {
    "budgetId": "456",
    "previousAmount": "$100/day",
    "newAmount": "$150/day",
    "result": "Budget updated successfully"
  },
  "auditLogId": "audit_12345",
  "notificationsSent": [
    "dogancanbaris@wpp.com",
    "manager-toronto@wpp.com"
  ]
}
```

**Response (Account Not Approved):**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_NOT_AUTHORIZED",
    "message": "You don't have access to Google Ads account 1234567890",
    "approvedAccounts": [
      "1234567890",
      "0987654321",
      "..."
    ],
    "requestedAccount": "9999999999",
    "action": "Request access in OMA platform"
  }
}
```

**Response (Blocked by Safety Limits):**
```json
{
  "success": false,
  "error": {
    "code": "SAFETY_LIMIT_EXCEEDED",
    "message": "Budget increase of 900% exceeds maximum allowed (500%)",
    "details": {
      "currentBudget": "$100/day",
      "requestedBudget": "$1000/day",
      "percentChange": "900%",
      "limit": "500%"
    },
    "action": "Make this change in Google Ads UI directly, or reduce to a smaller increase"
  }
}
```

---

## SECURITY CONSIDERATIONS

### Token Storage in OMA:

**Google OAuth Tokens (Per User):**
```
Storage: OMA Database (encrypted at rest)
Encryption: AES-256
Key Management: AWS KMS or equivalent
Access: Only OMA backend (never sent to browser)

Schema:
{
  userId: "john.doe@wpp.com",
  googleOAuthTokens: {
    accessToken: "{encrypted}",
    refreshToken: "{encrypted}",
    expiresAt: "2025-10-17T16:00:00Z",
    scopes: ["webmasters", "adwords", "analytics"]
  },
  encryptedAt: "2025-10-17T12:30:00Z",
  lastRefreshed: "2025-10-17T15:00:00Z"
}
```

### Approved Accounts Transmission:

**Why Encrypt + Sign:**
```
Encryption: Prevents eavesdropping (even over HTTPS)
Signature: Prevents tampering (ensures OMA sent this list, not modified in transit)

Process:
1. OMA retrieves approved accounts from database
2. OMA serializes to JSON
3. OMA encrypts with shared secret (OMA + MCP both have)
4. OMA signs with HMAC (OMA + MCP both can verify)
5. OMA sends encrypted + signature to MCP
6. MCP verifies signature (ensures authenticity)
7. MCP decrypts (gets actual approved accounts)
8. MCP validates (checks expiration, format)
9. MCP uses for authorization
```

### Shared Secrets Management:

**Shared Between OMA and MCP:**
```
Secret: OMA_MCP_SHARED_SECRET
Purpose: Encrypt/decrypt approved accounts
Storage:
  - OMA: In OMA's secret manager
  - MCP: In AWS Secrets Manager
Rotation: Every 90 days (automated)
Access: Only OMA backend and MCP server
```

---

## FAILURE MODES & HANDLING

### Scenario 1: OMA Down, MCP Up

**Problem:** Users can't access OMA to make requests
**Impact:** No MCP usage (OMA is gateway)
**Mitigation:** OMA high availability (multi-region, load balanced)

### Scenario 2: MCP Down, OMA Up

**Problem:** MCP not responding
**OMA Behavior:**
- Show user: "Marketing automation temporarily unavailable"
- Queue requests (if possible)
- Retry with exponential backoff
- Fall back to: "Please use Google Ads/Analytics UI directly"

### Scenario 3: Approved Accounts Out of Sync

**Problem:** User's access revoked in OMA, but MCP still has old list cached
**Solution:**
- MCP queries OMA for approved accounts on EVERY request (no caching)
- OR: Short cache (5 minutes) with invalidation webhook
- OR: OMA sends revocation notification to MCP immediately

**Recommended:** Query every request (adds 10ms latency but ensures accuracy)

### Scenario 4: Google OAuth Token Expired

**Problem:** User's Google token expired/revoked
**OMA Behavior:**
- Detect: 401 error from Google APIs
- Action: Prompt user to re-authorize Google account
- User flow: Click "Reconnect Google" → OAuth flow → New tokens

**MCP Behavior:**
- Return error: "Google authentication expired"
- OMA interprets and guides user

---

## ACCESS REQUEST WORKFLOW - DETAILED

### Approval Matrix:

**Who Can Approve What:**
```
Request from: Practitioner (john.doe)
Requested: 5 accounts

Primary Approver: Local Manager (manager-toronto)
- Can approve: Accounts within their agency's clients
- Can reject: Any request
- Notification: Real-time email + in-app

Secondary Approver/Observer: Global Admin (dogancanbaris)
- Sees: ALL requests globally
- Can override: Any decision (approve/reject)
- Can set policies: "All Client A requests auto-approved"
- Notification: Daily summary + real-time for high-risk

Auto-Approval Rules (Optional):
- If user previously had access and it expired → Auto-approve renewal
- If requesting access to already-assigned client → Auto-approve
- If manager set rule: "Toronto team can access Client A without approval" → Auto-approve
```

### Access Expiration:

**Time-Based:**
```
Manager can set:
- Expire: 2025-12-31 (end of project)
- Expire: +90 days (quarterly review)
- Expire: Never (permanent access)

OMA checks daily:
- Query: SELECT * FROM approved_accounts WHERE expiresAt < NOW()
- For expired: Send notification to user + manager
- Action: User must re-request access
```

**Activity-Based (Optional):**
```
If user doesn't use account for 30 days:
- OMA flags: "Inactive access"
- Notification: "You haven't used Client A account in 30 days. Do you still need access?"
- If no response in 7 days: Auto-revoke
```

---

## SCALABILITY & PERFORMANCE

### Expected Load (1000 WPP Practitioners):

**Assumptions:**
- Average practitioner: 10 MCP operations/day
- Peak hours: 9 AM - 5 PM in each timezone
- Geographic distribution: Americas, Europe, Asia

**Traffic:**
```
Daily: 10,000 requests (1000 users × 10 ops)
Peak: ~100 requests/minute (during business hours)
Burst: Up to 500 requests/minute (campaign launches, month-end reporting)
```

**AWS ECS Fargate Sizing:**
```
Base Configuration:
- 3 tasks (containers) always running
- Each task: 1 vCPU, 2GB RAM
- Can handle: ~100 concurrent requests

Auto-Scaling:
- Scale up: When CPU > 70% or requests queued > 10
- Scale to: Max 10 tasks
- Scale down: When CPU < 30% for 10 minutes
- Max capacity: 10 tasks × 100 req = 1000 concurrent requests

Cost:
- Base (3 tasks): ~$130/month
- Peak (10 tasks): ~$430/month
- Average with auto-scaling: ~$200-250/month
```

**Database Sizing:**
```
DynamoDB:
- Approved accounts: ~1000 users × 10 accounts = 10,000 records (~1MB)
- Audit logs: 10,000 ops/day × 365 days = 3.6M records/year (~5GB/year)
- Snapshots: 10,000 ops/day × 30 day retention = 300K records (~3GB)

Cost:
- Storage: ~$2.50/month
- Read/Write: ~$10/month (on-demand pricing)
- Total: ~$12.50/month
```

---

## COMPLETE DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    OMA PLATFORM                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Frontend (React/Next.js)                        │    │
│  │ - User auth (Cognito)                           │    │
│  │ - Account request UI                            │    │
│  │ - AI chat interface                             │    │
│  │ - Manager approval dashboard                    │    │
│  └────────────────────┬───────────────────────────┘    │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────┐    │
│  │ OMA Backend (Node.js/Python)                    │    │
│  │ - User Google OAuth token storage               │    │
│  │ - Approved accounts database                    │    │
│  │ - Access request workflow                       │    │
│  │ - MCP proxy (forwards requests to MCP server)   │    │
│  └────────────────────┬───────────────────────────┘    │
└────────────────────────┼────────────────────────────────┘
                         │ HTTPS (TLS 1.3)
                         │ API Key + JWT Auth
                         ▼
        ┌────────────────────────────────────────┐
        │      AWS CLOUDFRONT (CDN + WAF)         │
        │  - DDoS protection                      │
        │  - HTTPS only                           │
        │  - WAF rules (rate limit, geo-block)    │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │   AWS API GATEWAY (HTTP API)            │
        │  - Lambda Authorizer (validates JWT)    │
        │  - Request validation                   │
        │  - Throttling                           │
        │  - CORS (only oma.wpp.com)              │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │  APPLICATION LOAD BALANCER (Private)    │
        │  - Health checks                        │
        │  - Multi-AZ distribution                │
        │  - Target: ECS Fargate tasks            │
        └────────────────┬───────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │ ECS Task 1   │          │ ECS Task 2   │  ... (3-10 tasks)
    │ (Private     │          │ (Private     │
    │  Subnet AZ1) │          │  Subnet AZ2) │
    │              │          │              │
    │ MCP Server   │          │ MCP Server   │
    │ Container    │          │ Container    │
    │ - Validates  │          │ - Validates  │
    │   accounts   │          │   accounts   │
    │ - Executes   │          │ - Executes   │
    │   tools      │          │   tools      │
    │ - Calls      │          │ - Calls      │
    │   Google     │          │   Google     │
    │   APIs       │          │   APIs       │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           └────────┬────────────────┘
                    │
        ┌───────────┴───────────┬──────────────┬─────────────┐
        ▼                       ▼               ▼             ▼
┌──────────────┐    ┌─────────────────┐   ┌────────┐  ┌────────────┐
│  DynamoDB    │    │ AWS Secrets     │   │  SES   │  │ CloudWatch │
│  - Approved  │    │ Manager         │   │ Email  │  │ Logs +     │
│    Accounts  │    │ - Google OAuth  │   │ Notif  │  │ Metrics    │
│  - Audit Log │    │   credentials   │   │        │  │            │
│  - Snapshots │    │ - API keys      │   │        │  │            │
└──────────────┘    └─────────────────┘   └────────┘  └────────────┘
```

---

## INTEGRATION APPROACHES SUMMARY

### Quick Decision Matrix

| Aspect | MCP SDK (Recommended) | Manual HTTP API (Legacy) |
|--------|----------------------|--------------------------|
| **Complexity** | Low (SDK handles everything) | High (manual session, OAuth, JSON-RPC) |
| **Tool Access** | Native (like CLI) | Manual HTTP requests |
| **OAuth Discovery** | Automatic (RFC 9728) | Manual configuration |
| **Scope Updates** | Dynamic (no code changes) | Requires code updates |
| **Maintenance** | Easy (SDK updates) | Complex (manual updates) |
| **Best For** | New integrations, web UIs | Legacy systems, special cases |

**📖 Recommendation:** Use MCP SDK for all new web UI integrations. See `MCP-WEB-UI-COMPLETE-GUIDE.md`

---

## DEPLOYMENT STEPS

### Prerequisites:
1. AWS Account with admin access
2. AWS CLI installed and configured
3. Docker installed
4. Node.js and npm installed
5. AWS CDK installed (`npm install -g aws-cdk`)

### Step-by-Step Deployment:

**Step 1: Create Infrastructure (AWS CDK)**

```bash
# Create infrastructure directory
mkdir infrastructure
cd infrastructure
cdk init app --language typescript

# Install dependencies
npm install @aws-cdk/aws-ecs @aws-cdk/aws-ecs-patterns @aws-cdk/aws-ec2 \
            @aws-cdk/aws-dynamodb @aws-cdk/aws-secretsmanager \
            @aws-cdk/aws-apigateway @aws-cdk/aws-lambda

# Deploy
cdk bootstrap  # One-time setup
cdk deploy WppMcpStack  # Deploy infrastructure (~15 minutes)
```

**Step 2: Build and Push Container**

```bash
# Build MCP server
cd /path/to/MCP Servers
npm run build

# Build Docker image
docker build -t wpp-mcp-server:v1.0.0 .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account}.dkr.ecr.us-east-1.amazonaws.com
docker tag wpp-mcp-server:v1.0.0 {account}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:v1.0.0
docker push {account}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:v1.0.0
```

**Step 3: Configure Secrets**

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret --name wpp-mcp/google-client-id --secret-string "{your_client_id}"
aws secretsmanager create-secret --name wpp-mcp/google-client-secret --secret-string "{your_secret}"
aws secretsmanager create-secret --name wpp-mcp/google-ads-dev-token --secret-string "{dev_token}"
aws secretsmanager create-secret --name wpp-mcp/crux-api-key --secret-string "{api_key}"
aws secretsmanager create-secret --name wpp-mcp/oma-api-key --secret-string "{generated_key}"
```

**Step 4: Deploy ECS Service**

```bash
# Update ECS service with new container
aws ecs update-service --cluster wpp-mcp-cluster --service wpp-mcp-service --force-new-deployment

# Monitor deployment
aws ecs describe-services --cluster wpp-mcp-cluster --services wpp-mcp-service
```

**Step 5: Configure API Gateway**

```bash
# Already created by CDK, but verify:
aws apigatewayv2 get-apis
# Note the API endpoint URL
```

**Step 6: Test Deployment**

```bash
# Health check
curl https://mcp.wpp.com/health
# Should return: {"status": "healthy", "version": "1.0.0"}

# List tools (with auth)
curl -H "Authorization: Bearer {jwt}" \
     -H "X-OMA-API-Key: {api_key}" \
     https://mcp.wpp.com/tools/list
# Should return: 65 tools
```

---

## CI/CD PIPELINE (GitHub Actions)

```yaml
name: Deploy WPP MCP Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build TypeScript
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to ECR
        id: ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        run: |
          docker build -t wpp-mcp-server:${{ github.sha }} .
          docker tag wpp-mcp-server:${{ github.sha }} $ECR_REGISTRY/wpp-mcp-server:latest
          docker push $ECR_REGISTRY/wpp-mcp-server:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster wpp-mcp-cluster \
                                 --service wpp-mcp-service \
                                 --force-new-deployment

      - name: Wait for deployment
        run: aws ecs wait services-stable --cluster wpp-mcp-cluster --services wpp-mcp-service

      - name: Run smoke tests
        run: npm run test:smoke

      - name: Notify deployment
        run: |
          curl -X POST https://oma.wpp.com/api/webhook/mcp-deployed \
               -H "Content-Type: application/json" \
               -d '{"version": "${{ github.sha }}", "status": "success"}'
```

---

## MONITORING & OBSERVABILITY

### Metrics to Track:

**Operational:**
- Requests per minute (overall, per tool, per user)
- Response times (p50, p95, p99)
- Error rates (overall, per tool, per user)
- Success rates
- Concurrent users

**Business:**
- Budget changes per day
- Total budget under management
- Campaign status changes
- Accounts accessed
- Most-used tools

**Security:**
- Failed auth attempts
- Unauthorized account access attempts
- Safety limit violations
- Unusual activity patterns

**CloudWatch Dashboard:**
```
┌─────────────────────────────────────────┐
│ WPP MCP Server - Live Dashboard          │
├─────────────────────────────────────────┤
│ Operations/Minute: [Graph]      142      │
│ Active Users: [Graph]            47      │
│ Error Rate: [Graph]             0.2%     │
│ Avg Response Time: [Graph]      890ms    │
├─────────────────────────────────────────┤
│ Top Tools (Last Hour):                   │
│ 1. get_campaign_performance      234     │
│ 2. run_analytics_report          189     │
│ 3. list_campaigns                145     │
│ 4. get_search_terms_report       98      │
│ 5. update_budget                 23      │
├─────────────────────────────────────────┤
│ Recent Safety Events:                    │
│ ⚠️ Budget cap violation (1)              │
│ ⚠️ Unauthorized access (0)               │
│ ⚠️ Failed approvals (2)                  │
├─────────────────────────────────────────┤
│ Infrastructure Health:                   │
│ ECS Tasks: 5/10 ✅                       │
│ API Gateway: ✅ Healthy                  │
│ DynamoDB: ✅ Normal                      │
│ Secrets Manager: ✅ Current              │
└─────────────────────────────────────────┘
```

---

## COST BREAKDOWN (Production - All 3 Environments)

### Development Environment (~$200/month):
- ECS Fargate: 2 tasks @ 0.5 vCPU = ~$65
- RDS (small instance): ~$50
- DynamoDB (minimal): ~$5
- Other services: ~$80

### Staging Environment (~$250/month):
- ECS Fargate: 3 tasks @ 1 vCPU = ~$130
- RDS (medium): ~$75
- DynamoDB (moderate): ~$10
- Other services: ~$35

### Production Environment (~$450/month):
- ECS Fargate: 3-10 tasks (avg 5) @ 1 vCPU = ~$215
- RDS Aurora Serverless (auto-scaling): ~$100
- DynamoDB (production scale): ~$25
- CloudFront + WAF: ~$50
- Backups + Monitoring: ~$30
- API Gateway: ~$10
- Secrets Manager: ~$5
- Data Transfer: ~$15

**Total Across 3 Environments: ~$900/month**

**Plus:**
- Domain + SSL: ~$50/year
- Email service (notifications): ~$50/month
- Backup storage (S3): ~$20/month

**Grand Total: ~$1,020/month**

**For 1000 users: ~$1/user/month** (infrastructure only)

---

## TIMELINE SUMMARY

**Weeks 1-3:** Local safety features (current)
**Week 4:** OMA integration design + API contracts
**Weeks 5-7:** AWS infrastructure setup
**Weeks 8-10:** OMA-MCP integration implementation
**Weeks 11-13:** Testing + production deployment

**Total: ~3 months to fully production-ready system**

**Cost: ~$1,000/month infrastructure + ~$100K development**

**ROI: $2M+/year savings** (breaks even in <2 months)

This plan provides enterprise-grade security, scalability to 1000+ users, two-layer account authorization, and seamless OMA integration. Ready to build!

---

## 📚 RELATED DOCUMENTATION

### Integration Guides
- **🌐 Web UI Integration (START HERE):** `MCP-WEB-UI-COMPLETE-GUIDE.md`
  - Native tool mounting with MCP SDK
  - OAuth metadata discovery (RFC 9728)
  - Complete code examples for browser integration
  - Production-ready implementation guide

- **🔧 HTTP Server Setup:** `../../MCP-HTTP-SERVER-GUIDE.md`
  - Server configuration and deployment
  - OAuth discovery endpoints
  - Testing and troubleshooting

### OAuth & Security
- **🔐 OAuth Implementation:** `../oauth/OMA-INTEGRATION-SPEC.md`
  - OAuth 2.0 per-request architecture
  - Token management and refresh
  - Headers and authentication

- **🔐 OAuth README:** `../oauth/README.md`
  - OAuth documentation index
  - Token solution details
  - Migration guides

### Deployment & Operations
- **☁️ AWS Deployment:** `AWS-DEPLOYMENT-GUIDE.md`
  - Infrastructure setup with CDK
  - ECS Fargate configuration
  - Production deployment steps

- **🔧 Developer Guide:** `../guides/DEVELOPER-GUIDE.md`
  - Safety system integration
  - Tool development guidelines
  - Testing procedures

### Quick Start
1. **OMA Developers:** Read `MCP-WEB-UI-COMPLETE-GUIDE.md` first
2. **Security Team:** Read this document (OMA-MCP-INTEGRATION.md) for architecture
3. **DevOps Team:** Read `AWS-DEPLOYMENT-GUIDE.md` for deployment
