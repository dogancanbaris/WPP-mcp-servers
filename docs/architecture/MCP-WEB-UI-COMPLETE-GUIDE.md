# MCP WEB UI INTEGRATION GUIDE - Complete OAuth & Native Tool Mounting

## 1. Executive Summary

This guide explains how to integrate the WPP MCP Server with your web UI application so that agents have **native access to all MCP tools** - just like they would in the CLI, but for browser-based chatbots.

### What This Enables

- **All 60+ MCP tools are available to agents** without manual HTTP requests
- **OAuth credentials are automatically discovered and managed** - no hardcoded scopes
- **Dynamic scope updates** - when we add new scopes to the server, your clients discover them automatically
- **Multi-tenant support** - each practitioner's tokens are managed independently
- **Same SDK, different transport** - use the same MCP SDK you'd use for CLI, just with HTTP instead of STDIO

### Key Difference from CLI

| Aspect | CLI | Web UI |
|--------|-----|--------|
| Process Model | Subprocess with STDIO | Browser client with HTTP |
| Token Management | Single user, manual auth | Per-user, automatic OAuth flow |
| Scope Discovery | Hardcoded or manual | Automatic via metadata endpoints |
| Tool Access | `client.listTools()` and `client.callTool()` | Same SDK methods |

### No Manual HTTP Requests

Developers no longer need to:
```typescript
// BEFORE: Manual HTTP requests
const response = await fetch('http://mcp-server/tools/query_search_analytics', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ property: 'sc-domain:example.com' })
});
```

Instead, you use the MCP SDK:
```typescript
// AFTER: Native MCP tool access
const result = await mcpClient.callTool({
  name: 'query_search_analytics',
  arguments: { property: 'sc-domain:example.com' }
});
```

The SDK handles all the transport, authentication, and serialization automatically.

---

## 2. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / WEB UI                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐         │
│  │           OMA Agent / Chatbot UI                    │         │
│  │                                                     │         │
│  │  - Natural language input from practitioner        │         │
│  │  - Decision to call tool                           │         │
│  │  - Display results to user                         │         │
│  └──────────────────────┬──────────────────────────────┘         │
│                         │                                         │
│  ┌──────────────────────▼──────────────────────────────┐         │
│  │      MCP Client (TypeScript SDK)                   │         │
│  │                                                     │         │
│  │  - mcpClient.listTools()                          │         │
│  │  - mcpClient.callTool(name, arguments)            │         │
│  │  - OAuth token management                         │         │
│  │  - Metadata discovery                             │         │
│  └──────────────────────┬──────────────────────────────┘         │
│                         │                                         │
│  ┌──────────────────────▼──────────────────────────────┐         │
│  │   StreamableHTTPClientTransport                    │         │
│  │                                                     │         │
│  │  - HTTP/1.1 upgrade to streaming connection       │         │
│  │  - Sends requests to MCP Server                   │         │
│  │  - Includes Authorization header with tokens      │         │
│  └──────────────────────┬──────────────────────────────┘         │
│                         │                                         │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          │
┌─────────────────────────▼─────────────────────────────────────────┐
│                     MCP SERVER (HTTP Mode)                         │
│                   (Running on port 3000)                          │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  OAuth Metadata Endpoints                            │      │
│  │  - /.well-known/oauth-protected-resource            │      │
│  │  - /.well-known/oauth-authorization-server          │      │
│  │  - /oauth2/register (Dynamic Client Registration)   │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  OAuth Proxy Endpoints                               │      │
│  │  - /oauth2/authorize (redirect to Google)           │      │
│  │  - /oauth2/callback (receive authorization code)    │      │
│  │  - /oauth2/token (exchange code for tokens)         │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  MCP Tool Endpoints                                  │      │
│  │  - /mcp/initialize                                  │      │
│  │  - /mcp/resources/list                              │      │
│  │  - /mcp/tools/list                                  │      │
│  │  - /mcp/tools/call                                  │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Tool Implementations (60+ tools)                    │      │
│  │  - Google Search Console tools                      │      │
│  │  - Google Ads tools                                 │      │
│  │  - Google Analytics tools                           │      │
│  │  - BigQuery tools                                   │      │
│  │  - Etc.                                             │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
                          │ OAuth Token / Credential Passing
                          │
┌─────────────────────────▼──────────────────────────────┐
│         GOOGLE APIS (Search Console, Ads, etc.)       │
│                                                        │
│  - Scopes: webmasters, adwords, analytics, etc.      │
│  - Token-based authentication                        │
│  - Results returned to MCP Server                    │
└────────────────────────────────────────────────────────┘
```

### Comparison: CLI vs Web UI Transport

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI (STDIO)                              │
│                                                              │
│  Terminal ─→ Claude CLI ─→ [STDIO Subprocess] ←─ MCP Server │
│                             (stdio transport)              │
│                                                              │
│  Same Process, Same Parent, No Network                      │
└─────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                 WEB UI (Streamable HTTP)                     │
│                                                               │
│  Browser ─→ OMA Agent ─→ [Streamable HTTP] ←─ MCP Server    │
│                         (network transport)                 │
│                                                               │
│  Separate Processes, Network Communication, OAuth Tokens    │
└──────────────────────────────────────────────────────────────┘
```

### Key Architectural Points

1. **Same SDK** - Both CLI and Web UI use `@modelcontextprotocol/sdk`
2. **Different Transport** - CLI uses `StdioClientTransport`, Web UI uses `StreamableHTTPClientTransport`
3. **Same Tool Access** - Both call `listTools()` and `callTool()` identically
4. **OAuth Layer Added** - Web UI needs automatic OAuth flow management (CLI uses user's Google credentials)
5. **Multi-tenant** - Web UI manages tokens per practitioner; CLI is single-user

---

## 3. How It Works: Step-by-Step

### Step 1: OMA Installs MCP SDK

In your web UI project, install the MCP SDK:

```bash
npm install @modelcontextprotocol/sdk
```

Or using yarn:
```bash
yarn add @modelcontextprotocol/sdk
```

The SDK provides all the tools needed to communicate with the MCP server.

### Step 2: Create MCP Client in Browser

Create a client instance that connects to your MCP server via HTTP:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Initialize the MCP client
const mcpClient = new Client({
  name: 'OMA-WebUI',
  version: '1.0.0'
});

// Create HTTP transport pointing to your MCP server
const transport = new StreamableHTTPClientTransport({
  url: new URL('http://localhost:3000/mcp'),
  // Add fetch implementation if needed (e.g., in Node.js)
  // fetch: customFetch,
  // Add headers for CORS
  headers: {
    'Content-Type': 'application/json'
  }
});

// Connect the client to the server
await mcpClient.connect(transport);

// Success! Tools are now available
console.log('MCP Client connected');

// Tools are ready to use
const tools = await mcpClient.listTools();
console.log(`Available tools: ${tools.tools.length}`);
// Output: Available tools: 60+
```

### Step 3: OAuth Discovery (Automatic!)

When a tool is called without authentication, an automatic OAuth flow begins:

#### The 401-Driven Discovery Flow

```
┌──────────────────────────────────────────────────────────────┐
│  1. Client calls tool without OAuth tokens                  │
│     POST /mcp/tools/call                                    │
│     { name: "query_search_analytics", arguments: {...} }   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Server returns 401 Unauthorized                         │
│     WWW-Authenticate: Bearer realm="mcp",                  │
│     resource="http://localhost:3000/.../oauth-protected" │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Client fetches resource metadata endpoint               │
│     GET /.well-known/oauth-protected-resource              │
│                                                              │
│     Response includes:                                      │
│     - authorization_servers: [urls]                        │
│     - scopes_supported: [list of Google API scopes]       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Client fetches authorization server metadata            │
│     GET /oauth2/.well-known/oauth-authorization-server    │
│                                                              │
│     Response includes:                                      │
│     - authorization_endpoint: http://.../authorize         │
│     - token_endpoint: http://.../token                     │
│     - registration_endpoint: http://.../register           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  5. Client registers dynamically (if first time)            │
│     POST /oauth2/register                                  │
│     { redirect_uris: ["http://oma.com/callback"] }        │
│                                                              │
│     Response includes:                                      │
│     - client_id, client_secret (if using confidential)     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Client redirects practitioner to authorization URL      │
│     GET /oauth2/authorize?                                 │
│       client_id=xyz                                        │
│       redirect_uri=http://oma.com/callback                │
│       scopes=webmasters,adwords,analytics,...             │
│       state=random_string                                  │
│                                                              │
│     Practitioner sees: "OMA wants to access your Google"   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  7. Practitioner grants permission                          │
│     Google redirects back to:                               │
│     http://oma.com/callback?code=auth_code&state=xyz      │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  8. Client exchanges code for tokens                        │
│     POST /oauth2/token                                     │
│     {                                                       │
│       grant_type: "authorization_code",                   │
│       code: "auth_code",                                  │
│       redirect_uri: "http://oma.com/callback",            │
│       client_id: "xyz"                                    │
│     }                                                       │
│                                                              │
│     Response includes:                                      │
│     - access_token, refresh_token, expires_in             │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  9. Tokens stored securely (httpOnly cookies, secure       │
│     storage, etc.)                                         │
│                                                              │
│  10. Future tool calls automatically include tokens         │
│       POST /mcp/tools/call                                 │
│       Authorization: Bearer {access_token}                │
│                                                              │
│  11. Results returned successfully                         │
└──────────────────────────────────────────────────────────────┘
```

**What the client needs to detect and handle:**

```typescript
// Step 3a: Detect 401 response
const response = await fetch('http://mcp-server:3000/mcp/tools/call', {
  method: 'POST',
  body: JSON.stringify({ name: 'query_search_analytics', arguments: {...} })
});

if (response.status === 401) {
  // Step 3b: Check for WWW-Authenticate header
  const wwwAuthenticate = response.headers.get('WWW-Authenticate');
  if (wwwAuthenticate?.includes('resource=')) {
    // Step 3c: Extract resource metadata URL
    const resourceUrl = extractResourceUrl(wwwAuthenticate);

    // Step 3d: Fetch resource metadata
    const resourceMeta = await fetch(resourceUrl).then(r => r.json());

    // Step 3e: Fetch authorization server metadata
    const authServerUrl = resourceMeta.authorization_servers[0];
    const authServerMeta = await fetch(
      `${authServerUrl}.well-known/oauth-authorization-server`
    ).then(r => r.json());

    // Step 3f: Initiate OAuth flow
    initiateOAuthFlow(authServerMeta);
  }
}
```

The MCP SDK and your OAuth middleware handle all of these steps automatically.

### Step 4: Using Tools (Native!)

Once authenticated, tools are called natively through the SDK:

```typescript
// Simple tool call
const result = await mcpClient.callTool({
  name: 'query_search_analytics',
  arguments: {
    property: 'sc-domain:example.com',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    dimensions: ['date', 'query']
  }
});

console.log(result.content);
// Output: Tool results in JSON format
```

**Tool calls with error handling:**

```typescript
try {
  const result = await mcpClient.callTool({
    name: 'list_accessible_accounts',
    arguments: {}
  });

  // Process results
  const accounts = result.content[0].text;
  console.log('Accounts:', accounts);

} catch (error) {
  if (error.message.includes('401')) {
    // OAuth token expired, refresh needed
    console.log('Refreshing OAuth token...');
    // Trigger re-authentication
  } else if (error.message.includes('403')) {
    // Insufficient scopes
    console.log('Requesting additional scopes...');
    // Trigger re-authorization with new scopes
  } else {
    // Other error
    console.error('Tool call failed:', error);
  }
}
```

**Calling multiple tools in sequence:**

```typescript
// Get accounts first
const accountsResult = await mcpClient.callTool({
  name: 'list_accessible_accounts',
  arguments: {}
});

// Parse the account ID
const accountId = parseAccountId(accountsResult);

// Then get campaign performance
const performanceResult = await mcpClient.callTool({
  name: 'get_campaign_performance',
  arguments: {
    customerId: accountId,
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
});
```

---

## 4. What WE Provide (MCP Server)

The MCP server provides the following endpoints and infrastructure for web UI integration.

### OAuth Protected Resource Metadata Endpoint

**Endpoint:** `GET /.well-known/oauth-protected-resource`

This endpoint advertises that the MCP server is OAuth-protected and lists available scopes.

```typescript
app.get('/.well-known/oauth-protected-resource', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  res.json({
    // The resource being protected
    resource: 'http://localhost:3000/mcp',

    // Where to find authorization server info
    authorization_servers: [
      'http://localhost:3000/oauth2/'
    ],

    // All scopes our tools might need
    scopes_supported: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/analytics',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/bigquery',
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/calendar',
      // ... more scopes as tools grow
    ],

    // How tokens are passed
    bearer_methods_supported: [
      'header'  // Authorization: Bearer <token>
    ],

    // Access control
    access_policies: [
      'public'  // Any client can discover this
    ]
  });
});
```

**Usage:** Clients that receive a 401 check this endpoint to discover scopes and authorization servers.

### Authorization Server Metadata Endpoint

**Endpoint:** `GET /oauth2/.well-known/oauth-authorization-server`

Tells clients where to go for OAuth operations.

```typescript
app.get('/oauth2/.well-known/oauth-authorization-server', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  res.json({
    // The entity offering authorization
    issuer: 'http://localhost:3000',

    // Where to send users for authorization
    authorization_endpoint: 'http://localhost:3000/oauth2/authorize',

    // Where to exchange codes for tokens
    token_endpoint: 'http://localhost:3000/oauth2/token',

    // Where to register new clients dynamically
    registration_endpoint: 'http://localhost:3000/oauth2/register',

    // Revocation endpoint for token revocation
    revocation_endpoint: 'http://localhost:3000/oauth2/revoke',

    // OAuth 2.0 specs we support
    grant_types_supported: [
      'authorization_code',  // Standard OAuth flow
      'refresh_token'        // For refreshing expired tokens
    ],

    // How to authenticate when exchanging codes
    token_endpoint_auth_methods_supported: [
      'client_secret_basic',
      'client_secret_post',
      'none'  // For browser-based clients
    ],

    // Response types for authorization endpoint
    response_types_supported: [
      'code'  // Standard auth code response
    ],

    // URL schemes for redirect URIs
    redirect_uris_supported: [
      'http',
      'https'
    ],

    // Scopes this server can grant
    scopes_supported: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/analytics',
      'https://www.googleapis.com/auth/bigquery',
      // ...
    ],

    // Code challenge methods for PKCE
    code_challenge_methods_supported: [
      'S256',  // SHA256
      'plain'  // Not recommended but supported
    ]
  });
});
```

### Dynamic Client Registration Endpoint

**Endpoint:** `POST /oauth2/register`

Allows web UI clients to register themselves dynamically (RFC 7591).

```typescript
app.post('/oauth2/register', (req, res) => {
  const {
    client_name,                // Name of the client (e.g., "OMA WebUI")
    redirect_uris,              // Where to send users after auth
    response_types,             // Usually ['code']
    token_endpoint_auth_method, // How to auth with token endpoint
    grant_types,                // Usually ['authorization_code', 'refresh_token']
    application_type            // 'web' or 'native'
  } = req.body;

  // Validate required fields
  if (!redirect_uris || !Array.isArray(redirect_uris)) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'redirect_uris is required'
    });
  }

  // Validate redirect URIs are HTTPS (except localhost)
  for (const uri of redirect_uris) {
    const url = new URL(uri);
    if (url.hostname !== 'localhost' && url.protocol !== 'https:') {
      return res.status(400).json({
        error: 'invalid_redirect_uri',
        error_description: 'Redirect URIs must use HTTPS'
      });
    }
  }

  // Generate client credentials
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomBytes(32).toString('hex');

  // Store in database
  const client = {
    client_id: clientId,
    client_secret: clientSecret,
    client_name,
    redirect_uris,
    response_types: response_types || ['code'],
    token_endpoint_auth_method: token_endpoint_auth_method || 'client_secret_basic',
    grant_types: grant_types || ['authorization_code', 'refresh_token'],
    application_type: application_type || 'web',
    registered_at: new Date(),
    contacts: req.body.contacts || []
  };

  db.storeClient(client);

  // Return registration response
  res.status(201).json({
    client_id: clientId,
    client_secret: clientSecret,
    client_name,
    redirect_uris,
    response_types: client.response_types,
    grant_types: client.grant_types,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
    registered_at: client.registered_at.toISOString(),
    registration_client_uri: `http://localhost:3000/oauth2/register/${clientId}`,
    registration_access_token: generateAccessToken()
  });
});
```

### OAuth Authorization Endpoint

**Endpoint:** `GET /oauth2/authorize`

Redirects users to Google's OAuth consent screen.

```typescript
app.get('/oauth2/authorize', (req, res) => {
  const {
    client_id,
    redirect_uri,
    scope,           // Space-separated scopes
    state,           // CSRF protection
    response_type,   // Should be 'code'
    code_challenge,  // PKCE
    code_challenge_method
  } = req.query;

  // Validate client
  const client = db.getClient(client_id);
  if (!client) {
    return res.status(400).json({ error: 'invalid_client' });
  }

  // Validate redirect URI
  if (!client.redirect_uris.includes(redirect_uri)) {
    return res.status(400).json({ error: 'invalid_redirect_uri' });
  }

  // Validate response type
  if (response_type !== 'code') {
    return res.status(400).json({ error: 'unsupported_response_type' });
  }

  // Parse and validate scopes
  const requestedScopes = scope ? scope.split(' ') : [];
  const validScopes = [
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/analytics',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/bigquery',
    'https://www.googleapis.com/auth/cloud-platform'
  ];

  for (const scope of requestedScopes) {
    if (!validScopes.includes(scope)) {
      return res.status(400).json({ error: 'invalid_scope' });
    }
  }

  // Store authorization request for later verification
  const authRequest = {
    client_id,
    redirect_uri,
    scope: requestedScopes,
    state,
    code_challenge,
    code_challenge_method,
    created_at: new Date(),
    expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };

  const authRequestId = crypto.randomUUID();
  db.storeAuthRequest(authRequestId, authRequest);

  // Redirect to Google with our scopes
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', 'http://localhost:3000/oauth2/callback');
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', requestedScopes.join(' '));
  googleAuthUrl.searchParams.set('state', authRequestId);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  res.redirect(googleAuthUrl.toString());
});
```

### OAuth Callback Endpoint

**Endpoint:** `GET /oauth2/callback`

Receives authorization code from Google.

```typescript
app.get('/oauth2/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  // Retrieve the original auth request
  const authRequest = db.getAuthRequest(state);
  if (!authRequest) {
    return res.status(400).send('Invalid state');
  }

  // Check expiration
  if (new Date() > authRequest.expires_at) {
    return res.status(400).send('Authorization request expired');
  }

  try {
    // Exchange code for Google tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000/oauth2/callback',
        grant_type: 'authorization_code'
      })
    });

    const googleTokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: googleTokens.error_description
      });
    }

    // Generate our own tokens for the client
    const accessToken = generateAccessToken({
      scope: authRequest.scope,
      google_access_token: googleTokens.access_token,
      google_refresh_token: googleTokens.refresh_token
    });

    const refreshToken = generateRefreshToken({
      scope: authRequest.scope,
      google_refresh_token: googleTokens.refresh_token
    });

    // Store tokens
    db.storeTokens({
      client_id: authRequest.client_id,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: googleTokens.expires_in,
      token_type: 'Bearer'
    });

    // Redirect back to client with tokens
    const redirectUrl = new URL(authRequest.redirect_uri);
    redirectUrl.searchParams.set('code', accessToken);
    redirectUrl.searchParams.set('state', authRequest.state);

    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).send('Token exchange failed');
  }
});
```

### OAuth Token Endpoint

**Endpoint:** `POST /oauth2/token`

Exchanges authorization codes for tokens or refreshes expired tokens.

```typescript
app.post('/oauth2/token', async (req, res) => {
  const {
    grant_type,
    code,
    client_id,
    client_secret,
    redirect_uri,
    refresh_token,
    code_verifier
  } = req.body;

  // Authenticate the client
  let client = null;
  if (client_id && client_secret) {
    // Confidential client with secret
    client = db.getClient(client_id);
    if (!client || client.client_secret !== client_secret) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Client ID or secret invalid'
      });
    }
  } else if (client_id) {
    // Public client (browser-based)
    client = db.getClient(client_id);
    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Client ID invalid'
      });
    }
  } else {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing client_id'
    });
  }

  if (grant_type === 'authorization_code') {
    // Exchange authorization code for tokens
    // ... (implementation from callback endpoint)

  } else if (grant_type === 'refresh_token') {
    // Use refresh token to get new access token
    if (!refresh_token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing refresh_token'
      });
    }

    const storedToken = db.getRefreshToken(refresh_token);
    if (!storedToken || storedToken.client_id !== client_id) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid refresh token'
      });
    }

    // Refresh Google token
    const googleRefreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: storedToken.google_refresh_token,
        grant_type: 'refresh_token'
      })
    });

    const googleTokens = await googleRefreshResponse.json();

    if (!googleRefreshResponse.ok) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: googleTokens.error_description
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      scope: storedToken.scope,
      google_access_token: googleTokens.access_token
    });

    return res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: googleTokens.expires_in,
      refresh_token: refresh_token // Refresh token stays the same
    });

  } else {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: `Grant type '${grant_type}' not supported`
    });
  }
});
```

### 401 Response with WWW-Authenticate Header

All protected MCP endpoints return 401 with metadata pointing to OAuth:

```typescript
// Middleware to protect all MCP endpoints
app.use('/mcp/*', (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .setHeader(
        'WWW-Authenticate',
        'Bearer realm="mcp-server", ' +
        'resource="http://localhost:3000/.well-known/oauth-protected-resource", ' +
        'error="missing_token"'
      )
      .json({
        error: 'unauthorized',
        message: 'Authorization token required. Check WWW-Authenticate header for OAuth details.'
      });
  }

  const token = authHeader.slice(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res
      .status(401)
      .setHeader(
        'WWW-Authenticate',
        'Bearer realm="mcp-server", ' +
        'resource="http://localhost:3000/.well-known/oauth-protected-resource", ' +
        'error="invalid_token"'
      )
      .json({
        error: 'unauthorized',
        message: 'Invalid or expired authorization token'
      });
  }

  // Attach user context to request
  req.user = decoded;
  req.googleAccessToken = decoded.google_access_token;

  next();
});
```

### MCP Tool Endpoints

The standard MCP endpoints work as before, but now with OAuth:

```typescript
// List available tools
app.post('/mcp/tools/list', (req, res) => {
  // OAuth middleware ensures we have req.user and req.googleAccessToken

  const tools = [
    {
      name: 'query_search_analytics',
      description: 'Query Google Search Console analytics',
      inputSchema: {
        type: 'object',
        properties: {
          property: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        },
        required: ['property', 'startDate', 'endDate']
      }
    },
    // ... 60+ more tools
  ];

  res.json({ tools });
});

// Call a specific tool
app.post('/mcp/tools/call', async (req, res) => {
  const { name, arguments: args } = req.body;

  try {
    // Tools now have access to req.googleAccessToken
    const result = await callTool(name, args, {
      googleAccessToken: req.googleAccessToken,
      userId: req.user.sub
    });

    res.json({
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_SCOPES') {
      res.status(403).json({
        error: 'insufficient_scopes',
        required_scopes: error.required_scopes,
        message: 'Tool requires additional scopes'
      });
    } else {
      res.status(500).json({
        error: 'tool_error',
        message: error.message
      });
    }
  }
});
```

---

## 5. What OMA Must Build

### Step 1: Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk
```

### Step 2: Create MCP Client Component

Create a React component or service that manages the MCP client lifecycle:

```typescript
// src/services/mcp-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

class MCPClientService {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private mcpServerUrl: string;

  constructor(mcpServerUrl: string = 'http://localhost:3000/mcp') {
    this.mcpServerUrl = mcpServerUrl;
  }

  async connect(): Promise<void> {
    this.client = new Client({
      name: 'OMA-WebUI',
      version: '1.0.0'
    });

    this.transport = new StreamableHTTPClientTransport({
      url: new URL(this.mcpServerUrl),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    await this.client.connect(this.transport);
    console.log('MCP Client connected');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }

  async listTools() {
    if (!this.client) throw new Error('MCP Client not connected');
    return this.client.listTools();
  }

  async callTool(name: string, args: Record<string, any>) {
    if (!this.client) throw new Error('MCP Client not connected');
    return this.client.callTool({ name, arguments: args });
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

export const mcpClient = new MCPClientService();
```

### Step 3: Implement OAuth Redirect Handler

```typescript
// src/services/oauth-handler.ts
class OAuthHandler {
  private clientId: string = '';
  private clientSecret: string = '';
  private redirectUri: string;
  private mcpServerUrl: string;

  constructor(mcpServerUrl: string = 'http://localhost:3000') {
    this.mcpServerUrl = mcpServerUrl;
    this.redirectUri = `${window.location.origin}/oauth/callback`;
  }

  async registerClient(): Promise<void> {
    const response = await fetch(`${this.mcpServerUrl}/oauth2/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'OMA WebUI',
        redirect_uris: [this.redirectUri],
        response_types: ['code'],
        grant_types: ['authorization_code', 'refresh_token'],
        application_type: 'web'
      })
    });

    if (!response.ok) throw new Error('Client registration failed');

    const registration = await response.json();
    this.clientId = registration.client_id;
    this.clientSecret = registration.client_secret;

    // Store for future use
    localStorage.setItem('oauth_client_id', this.clientId);
  }

  async initiateAuthFlow(scopes: string[]): Promise<void> {
    // Fetch metadata
    const resourceMeta = await fetch(
      `${this.mcpServerUrl}/.well-known/oauth-protected-resource`
    ).then(r => r.json());

    const authServerUrl = resourceMeta.authorization_servers[0];
    const authServerMeta = await fetch(
      `${authServerUrl}.well-known/oauth-authorization-server`
    ).then(r => r.json());

    // Generate PKCE challenge
    const codeChallenge = await this.generateCodeChallenge();
    localStorage.setItem('code_challenge', codeChallenge);

    // Generate state for CSRF protection
    const state = crypto.getRandomValues(new Uint8Array(16))
      .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    localStorage.setItem('oauth_state', state);

    // Redirect to authorization endpoint
    const authUrl = new URL(authServerMeta.authorization_endpoint);
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    window.location.href = authUrl.toString();
  }

  async handleCallback(code: string, state: string): Promise<string> {
    // Verify state
    const savedState = localStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    // Exchange code for tokens
    const response = await fetch(`${this.mcpServerUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code_verifier: localStorage.getItem('code_challenge') || ''
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error}`);
    }

    const tokens = await response.json();

    // Store tokens securely
    // Use httpOnly cookies if possible, or secure localStorage
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at',
      (Date.now() + tokens.expires_in * 1000).toString()
    );

    // Clear temporary storage
    localStorage.removeItem('code_challenge');
    localStorage.removeItem('oauth_state');

    return tokens.access_token;
  }

  async refreshTokenIfNeeded(): Promise<string> {
    const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0');
    const now = Date.now();

    // Refresh if expires within 5 minutes
    if (expiresAt - now < 5 * 60 * 1000) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await fetch(`${this.mcpServerUrl}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('token_expires_at',
        (Date.now() + tokens.expires_in * 1000).toString()
      );

      return tokens.access_token;
    }

    return localStorage.getItem('access_token') || '';
  }

  getAccessToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  private async generateCodeChallenge(): Promise<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const array = Array.from(bytes);
    const binaryString = String.fromCharCode(...array);
    const hashBuffer = await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(binaryString)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

export const oauthHandler = new OAuthHandler();
```

### Step 4: Create Custom Fetch That Includes Tokens

```typescript
// src/services/mcp-fetch.ts
class MCPFetch {
  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    // Add authorization header
    const accessToken = await this.getAccessToken();

    const headers = new Headers(init?.headers);
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let response = await fetch(input, { ...init, headers });

    // Handle 401 - try refresh and retry
    if (response.status === 401) {
      const wwwAuth = response.headers.get('WWW-Authenticate');

      if (wwwAuth?.includes('resource=')) {
        // OAuth required, initiate flow
        try {
          await this.initiateOAuth();

          // Retry the request
          const newToken = await this.getAccessToken();
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(input, { ...init, headers });
        } catch (error) {
          console.error('OAuth flow failed:', error);
          throw error;
        }
      }
    }

    return response;
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is expired and refresh if needed
    return await oauthHandler.refreshTokenIfNeeded();
  }

  private async initiateOAuth(): Promise<void> {
    // Register client if not already done
    if (!localStorage.getItem('oauth_client_id')) {
      await oauthHandler.registerClient();
    }

    // Fetch metadata for scopes
    const resourceMeta = await fetch(
      'http://localhost:3000/.well-known/oauth-protected-resource'
    ).then(r => r.json());

    const scopes = resourceMeta.scopes_supported;
    await oauthHandler.initiateAuthFlow(scopes);
  }
}

export const mcpFetch = new MCPFetch();
```

### Step 5: Configure CORS on MCP Server

The MCP server must allow requests from OMA domain:

```typescript
// server.ts (MCP Server side)
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',      // Local development
    'http://localhost:3001',      // Local frontend dev
    'https://oma.example.com',    // Production OMA domain
    'https://staging-oma.example.com'
  ],
  credentials: true,
  exposedHeaders: [
    'WWW-Authenticate',
    'Mcp-Session-Id',
    'Content-Type'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'mcp-session-id'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  maxAge: 86400
}));
```

### Step 6: Integration in React Component

```typescript
// src/components/MCPToolCaller.tsx
import React, { useEffect, useState } from 'react';
import { mcpClient } from '@/services/mcp-client';
import { oauthHandler } from '@/services/oauth-handler';

export const MCPToolCaller: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState('');
  const [args, setArgs] = useState('{}');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializeMCP();
  }, []);

  const initializeMCP = async () => {
    try {
      // Check if we have an access token
      let token = localStorage.getItem('access_token');

      if (!token) {
        // No token, trigger OAuth flow
        if (!localStorage.getItem('oauth_client_id')) {
          await oauthHandler.registerClient();
        }

        const resourceMeta = await fetch(
          'http://localhost:3000/.well-known/oauth-protected-resource'
        ).then(r => r.json());

        await oauthHandler.initiateAuthFlow(resourceMeta.scopes_supported);
        return;
      }

      // Connect MCP client
      await mcpClient.connect();

      // List tools
      const toolList = await mcpClient.listTools();
      setTools(toolList.tools);
    } catch (err) {
      setError(`MCP initialization failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const callTool = async () => {
    if (!selectedTool || !args) {
      setError('Please select a tool and provide arguments');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedArgs = JSON.parse(args);
      const toolResult = await mcpClient.callTool(selectedTool, parsedArgs);
      setResult(toolResult);
    } catch (err) {
      setError(`Tool call failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-caller">
      <h2>MCP Tool Caller</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label>Tool:</label>
        <select
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
        >
          <option value="">Select a tool</option>
          {tools.map(tool => (
            <option key={tool.name} value={tool.name}>
              {tool.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Arguments (JSON):</label>
        <textarea
          value={args}
          onChange={(e) => setArgs(e.target.value)}
          rows={6}
        />
      </div>

      <button
        onClick={callTool}
        disabled={loading || !mcpClient.isConnected()}
      >
        {loading ? 'Calling...' : 'Call Tool'}
      </button>

      {result && (
        <div className="result">
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

### Step 7: Create OAuth Callback Page

```typescript
// src/pages/oauth-callback.tsx
import { useEffect, useRouter } from 'next/router';
import { oauthHandler } from '@/services/oauth-handler';

export default function OAuthCallback() {
  const router = useRouter();
  const { code, state, error } = router.query;

  useEffect(() => {
    if (error) {
      console.error('OAuth error:', error);
      router.push('/');
      return;
    }

    if (code && state && typeof code === 'string' && typeof state === 'string') {
      handleCallback(code, state);
    }
  }, [code, state, error, router]);

  const handleCallback = async (code: string, state: string) => {
    try {
      await oauthHandler.handleCallback(code, state);
      // Redirect to dashboard or main app
      router.push('/dashboard');
    } catch (err) {
      console.error('Callback handling failed:', err);
      router.push('/?error=oauth_failed');
    }
  };

  return (
    <div className="oauth-callback">
      <p>Completing authentication...</p>
    </div>
  );
}
```

---

## 6. Dynamic Scope Updates

### When We Add/Remove Scopes

Our OAuth infrastructure supports dynamic scope discovery:

1. **We update the metadata endpoint** to include new scopes:
   ```typescript
   app.get('/.well-known/oauth-protected-resource', (req, res) => {
     res.json({
       // ... other fields
       scopes_supported: [
         // ... existing scopes
         'https://www.googleapis.com/auth/youtube'  // NEW
       ]
     });
   });
   ```

2. **OMA discovers automatically** on the next authorization request:
   - Client fetches updated metadata
   - New scope is included in authorization request
   - No code changes needed on OMA side

3. **Practitioner sees new scopes** in Google consent screen:
   - Google shows: "OMA wants to access your YouTube channel"
   - Practitioner grants or denies
   - Process continues as normal

### Error-Driven Discovery

If a tool requires a scope not yet granted:

```json
{
  "error": {
    "code": 403,
    "message": "Insufficient scopes",
    "required_scopes": [
      "https://www.googleapis.com/auth/youtube"
    ]
  }
}
```

OMA can:
1. Detect this error
2. Trigger re-authorization with the new scopes
3. Update the user's tokens
4. Retry the tool call

```typescript
// In OMA error handler
if (error.code === 403 && error.required_scopes) {
  console.log('Need additional scopes:', error.required_scopes);

  // Combine with existing scopes
  const allScopes = [
    ...existingScopes,
    ...error.required_scopes
  ];

  // Trigger re-authorization
  await oauthHandler.initiateAuthFlow(allScopes);
}
```

### Scope Versioning

Our implementation supports scope versioning for backward compatibility:

```typescript
const scopesV1 = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/adwords'
];

const scopesV2 = [
  // ... V1 scopes
  'https://www.googleapis.com/auth/youtube',  // NEW
  'https://www.googleapis.com/auth/calendar'  // NEW
];

// Clients can request scopes by version
app.get('/.well-known/oauth-protected-resource', (req, res) => {
  const version = req.query.version || 'latest';
  const scopes = version === 'v1' ? scopesV1 : scopesV2;

  res.json({
    scopes_supported: scopes,
    version: version,
    migration_guide: 'https://docs.example.com/scope-migration'
  });
});
```

---

## 7. Comparison Table

| Aspect | CLI (STDIO) | Web UI (HTTP with OAuth) |
|--------|------------|--------------------------|
| **Transport** | STDIO Subprocess | Streamable HTTP |
| **Process Model** | Same process | Network communication |
| **Tool Discovery** | `listTools()` | `listTools()` |
| **Tool Calling** | `callTool()` | `callTool()` |
| **Authentication** | User's Google account | OAuth via tokens |
| **Scope Discovery** | Manual from docs | Automatic from metadata |
| **Scope Communication** | Hardcoded in CLI | Dynamic metadata endpoint |
| **Multi-tenant** | Single user per instance | Per-practitioner tokens |
| **Token Management** | Automatic (gcloud) | Application managed |
| **Token Refresh** | Automatic | Application triggered |
| **Error on Missing Scope** | Tool fails | 403 with required_scopes |
| **OAuth Registration** | N/A | Dynamic (RFC 7591) |
| **CORS Needed** | No | Yes |

---

## 8. Complete Code Example

This complete example shows a minimal but functional integration:

```typescript
// src/services/complete-mcp-integration.ts

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

class CompleteMCPIntegration {
  private client: Client | null = null;
  private accessToken: string = '';
  private refreshToken: string = '';
  private mcpServerUrl: string;

  constructor(mcpServerUrl: string = 'http://localhost:3000') {
    this.mcpServerUrl = mcpServerUrl;
  }

  /**
   * Initialize and connect to MCP server
   */
  async initialize(): Promise<void> {
    try {
      // Check for existing access token
      let hasToken = this.loadTokens();

      if (!hasToken) {
        // No token, trigger OAuth flow
        await this.initiateOAuth();
        hasToken = this.loadTokens();

        if (!hasToken) {
          throw new Error('OAuth flow did not complete');
        }
      }

      // Create and connect MCP client
      this.client = new Client({
        name: 'OMA-WebUI',
        version: '1.0.0'
      });

      // Create transport with custom fetch that includes tokens
      const transport = new StreamableHTTPClientTransport({
        url: new URL(`${this.mcpServerUrl}/mcp`),
        fetch: (input: RequestInfo, init?: RequestInit) =>
          this.fetchWithAuth(input, init)
      });

      await this.client.connect(transport);
      console.log('MCP Client connected successfully');

    } catch (error) {
      console.error('MCP initialization failed:', error);
      throw error;
    }
  }

  /**
   * Fetch with automatic token management
   */
  private async fetchWithAuth(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    // Ensure token is fresh
    await this.refreshTokenIfNeeded();

    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${this.accessToken}`);

    let response = await fetch(input, { ...init, headers });

    // Handle 401 - OAuth required
    if (response.status === 401) {
      const wwwAuth = response.headers.get('WWW-Authenticate');

      if (wwwAuth?.includes('resource=')) {
        console.log('OAuth required, initiating flow...');
        await this.initiateOAuth();

        // Refresh tokens
        await this.refreshTokenIfNeeded();

        // Retry with new token
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        response = await fetch(input, { ...init, headers });
      }
    }

    return response;
  }

  /**
   * Initiate OAuth flow
   */
  private async initiateOAuth(): Promise<void> {
    try {
      // Step 1: Register client if needed
      const clientId = localStorage.getItem('oauth_client_id');
      if (!clientId) {
        await this.registerClient();
      }

      // Step 2: Fetch resource metadata
      const resourceMeta = await fetch(
        `${this.mcpServerUrl}/.well-known/oauth-protected-resource`
      ).then(r => {
        if (!r.ok) throw new Error('Failed to fetch resource metadata');
        return r.json();
      });

      // Step 3: Fetch authorization server metadata
      const authServerUrl = resourceMeta.authorization_servers[0];
      const authServerMeta = await fetch(
        `${authServerUrl}.well-known/oauth-authorization-server`
      ).then(r => {
        if (!r.ok) throw new Error('Failed to fetch auth server metadata');
        return r.json();
      });

      // Step 4: Generate PKCE challenge
      const codeChallenge = await this.generatePKCEChallenge();
      localStorage.setItem('code_challenge', codeChallenge);

      // Step 5: Generate state
      const state = this.generateRandomState();
      localStorage.setItem('oauth_state', state);

      // Step 6: Redirect to authorization endpoint
      const authUrl = new URL(authServerMeta.authorization_endpoint);
      authUrl.searchParams.set('client_id', clientId!);
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', resourceMeta.scopes_supported.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      window.location.href = authUrl.toString();

    } catch (error) {
      console.error('OAuth initiation failed:', error);
      throw error;
    }
  }

  /**
   * Register client with MCP server
   */
  private async registerClient(): Promise<void> {
    const response = await fetch(`${this.mcpServerUrl}/oauth2/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'OMA WebUI',
        redirect_uris: [`${window.location.origin}/oauth/callback`],
        response_types: ['code'],
        grant_types: ['authorization_code', 'refresh_token'],
        application_type: 'web'
      })
    });

    if (!response.ok) {
      throw new Error('Client registration failed');
    }

    const registration = await response.json();
    localStorage.setItem('oauth_client_id', registration.client_id);

    if (registration.client_secret) {
      // For confidential clients (with backend)
      localStorage.setItem('oauth_client_secret', registration.client_secret);
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string): Promise<void> {
    // Verify state
    const savedState = localStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch(`${this.mcpServerUrl}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: localStorage.getItem('oauth_client_id') || '',
          redirect_uri: `${window.location.origin}/oauth/callback`,
          code_verifier: localStorage.getItem('code_challenge') || ''
        })
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(`Token exchange failed: ${error.error_description}`);
      }

      const tokens = await tokenResponse.json();

      // Store tokens
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.storeTokens();

      // Clean up temporary storage
      localStorage.removeItem('code_challenge');
      localStorage.removeItem('oauth_state');

      console.log('OAuth flow completed successfully');

    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      throw error;
    }
  }

  /**
   * Refresh token if expired or about to expire
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0');
    const now = Date.now();

    // Refresh if expires within 5 minutes
    if (expiresAt - now > 5 * 60 * 1000) {
      return; // Token still valid
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.mcpServerUrl}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: localStorage.getItem('oauth_client_id') || ''
        })
      });

      if (!response.ok) {
        // Refresh failed, need re-authentication
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;

      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token;
      }

      this.storeTokens();

    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and trigger re-auth on next request
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  }

  /**
   * Load tokens from storage
   */
  private loadTokens(): boolean {
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');

    if (!token) return false;

    this.accessToken = token;
    this.refreshToken = refresh || '';
    return true;
  }

  /**
   * Store tokens securely
   */
  private storeTokens(): void {
    localStorage.setItem('access_token', this.accessToken);
    localStorage.setItem('refresh_token', this.refreshToken);
    localStorage.setItem('token_expires_at',
      (Date.now() + 60 * 60 * 1000).toString()
    );
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any[]> {
    if (!this.client) throw new Error('MCP Client not initialized');
    const result = await this.client.listTools();
    return result.tools;
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: Record<string, any>): Promise<any> {
    if (!this.client) throw new Error('MCP Client not initialized');

    try {
      const result = await this.client.callTool({ name, arguments: args });
      return result;
    } catch (error: any) {

      // Handle insufficient scopes
      if (error.status === 403 && error.required_scopes) {
        console.error('Tool requires additional scopes:', error.required_scopes);
        throw new Error(`Insufficient scopes. Required: ${error.required_scopes.join(', ')}`);
      }

      throw error;
    }
  }

  /**
   * Generate PKCE code challenge
   */
  private async generatePKCEChallenge(): Promise<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const array = Array.from(bytes);
    const binaryString = String.fromCharCode(...array);

    const hashBuffer = await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(binaryString)
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateRandomState(): string {
    return crypto.getRandomValues(new Uint8Array(16))
      .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

export const mcpIntegration = new CompleteMCPIntegration();
```

---

## 9. Implementation Checklist

### For OMA Team

- [ ] Install `@modelcontextprotocol/sdk` package
- [ ] Create MCP client service with HTTP transport
- [ ] Implement OAuth metadata discovery
- [ ] Implement dynamic client registration
- [ ] Create OAuth redirect and callback handlers
- [ ] Implement token storage (secure, httpOnly if possible)
- [ ] Implement token refresh logic
- [ ] Add custom fetch that includes Authorization header
- [ ] Create React component for tool listing
- [ ] Create React component for tool calling
- [ ] Create OAuth callback page
- [ ] Handle 401 responses with OAuth flow
- [ ] Handle 403 responses with insufficient scopes
- [ ] Test with each tool type (GSC, Ads, Analytics, etc.)
- [ ] Implement error handling and user feedback
- [ ] Test token expiration and refresh
- [ ] Test multi-practitioner scenarios
- [ ] Implement logout/token revocation
- [ ] Add retry logic for transient failures
- [ ] Configure CORS on MCP server

### For MCP Server Team

- [ ] Add `GET /.well-known/oauth-protected-resource` endpoint
- [ ] Add `GET /oauth2/.well-known/oauth-authorization-server` endpoint
- [ ] Add `POST /oauth2/register` for dynamic client registration
- [ ] Add `GET /oauth2/authorize` redirect to Google
- [ ] Add `GET /oauth2/callback` to receive authorization code
- [ ] Add `POST /oauth2/token` to exchange code/refresh token
- [ ] Add `POST /oauth2/revoke` for token revocation (optional)
- [ ] Update all 401 responses with WWW-Authenticate header
- [ ] Configure CORS to allow OMA origin
- [ ] Add token verification middleware to `/mcp/*` routes
- [ ] Pass `req.googleAccessToken` to tool implementations
- [ ] Update tool implementations to use tokens from request
- [ ] Store OAuth clients securely (database)
- [ ] Store user tokens securely (database, encrypted)
- [ ] Test OAuth flow end-to-end
- [ ] Test token refresh
- [ ] Test insufficient scopes error
- [ ] Create documentation (this guide)
- [ ] Test with OMA staging environment
- [ ] Set up monitoring for OAuth failures

---

## 10. Testing Guide

### Manual Testing Flow

#### Step 1: Start MCP Server in HTTP Mode

```bash
# Terminal 1
export GOOGLE_CLIENT_ID="your-google-oauth-client-id"
export GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
npm run dev:mcp-server-http
# Output: MCP Server listening on http://localhost:3000
```

#### Step 2: Start OMA Frontend

```bash
# Terminal 2
npm run dev:frontend
# Output: Frontend running on http://localhost:3001
```

#### Step 3: Open Browser and Test

```bash
# Open in browser
http://localhost:3001/tools
```

#### Step 4: Verify Metadata Endpoints

```bash
# In another terminal or REST client
curl http://localhost:3000/.well-known/oauth-protected-resource

# Should return:
# {
#   "resource": "http://localhost:3000/mcp",
#   "authorization_servers": ["http://localhost:3000/oauth2/"],
#   "scopes_supported": [...],
#   "bearer_methods_supported": ["header"]
# }
```

#### Step 5: Verify Authorization Server Metadata

```bash
curl http://localhost:3000/oauth2/.well-known/oauth-authorization-server

# Should return OAuth endpoints
```

#### Step 6: Test Client Registration

```bash
curl -X POST http://localhost:3000/oauth2/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test Client",
    "redirect_uris": ["http://localhost:3001/callback"],
    "response_types": ["code"],
    "grant_types": ["authorization_code", "refresh_token"]
  }'

# Should return client_id and optionally client_secret
```

#### Step 7: Test OAuth Flow

1. Open http://localhost:3001/tools
2. Click "List Tools" button
3. Should receive 401 with WWW-Authenticate header
4. Page automatically redirects to OAuth authorization
5. Practitioner sees Google consent screen
6. After consent, redirected back to OMA
7. Tokens stored and tools listed

#### Step 8: Test Tool Calling

1. From tool list, select "list_accessible_accounts"
2. Click "Call Tool"
3. Should return user's Google Ads accounts
4. Try other tools (GSC, Analytics, etc.)

#### Step 9: Test Token Refresh

1. Call a tool successfully
2. Wait for token to expire (or manually set expiry)
3. Call another tool
4. Should automatically refresh token
5. Tool call succeeds

#### Step 10: Test Insufficient Scopes

1. Modify tool requirements to require new scope
2. Call tool without that scope
3. Should receive 403 with required_scopes
4. OMA should prompt re-authorization
5. After auth with new scope, tool succeeds

### Automated Testing

```typescript
// src/__tests__/mcp-integration.test.ts
import { mcpIntegration } from '@/services/complete-mcp-integration';

describe('MCP Integration', () => {
  it('should initialize and connect to MCP server', async () => {
    // Mock tokens
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('refresh_token', 'mock-refresh');

    await mcpIntegration.initialize();
    expect(mcpIntegration.isConnected()).toBe(true);
  });

  it('should list available tools', async () => {
    const tools = await mcpIntegration.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some(t => t.name === 'list_accessible_accounts')).toBe(true);
  });

  it('should call tools successfully', async () => {
    const result = await mcpIntegration.callTool('list_accessible_accounts', {});
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it('should handle 401 and trigger OAuth', async () => {
    localStorage.removeItem('access_token');

    // Should trigger OAuth flow (will redirect)
    // In test, we can mock the window.location.href
    const redirectSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '', ...window.location },
      writable: true
    });

    // This would normally redirect
    // In tests, verify the redirect URL is correct
  });

  it('should refresh expired tokens', async () => {
    // Set token to expire soon
    localStorage.setItem('token_expires_at',
      String(Date.now() - 1000)  // Expired
    );

    // This should trigger refresh on next tool call
    const result = await mcpIntegration.callTool('list_accessible_accounts', {});
    expect(result).toBeDefined();
  });
});
```

---

## 11. References

### MCP Protocol & SDKs
- **MCP Specification:** https://modelcontextprotocol.io
- **MCP TypeScript SDK:** https://github.com/modelcontextprotocol/typescript-sdk
- **MCP Authorization Spec:** https://modelcontextprotocol.io/specification/draft/basic/authorization

### OAuth Specifications
- **OAuth 2.1 (RFC 9628):** https://tools.ietf.org/html/rfc9628
- **OAuth 2.0 Protected Resource Metadata (RFC 9728):** https://tools.ietf.org/html/rfc9728
- **OAuth 2.0 Authorization Server Metadata (RFC 8414):** https://tools.ietf.org/html/rfc8414
- **OAuth 2.0 Dynamic Client Registration (RFC 7591):** https://tools.ietf.org/html/rfc7591
- **PKCE (RFC 7636):** https://tools.ietf.org/html/rfc7636

### Google APIs
- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2
- **Google Search Console API:** https://developers.google.com/webmasters/apis
- **Google Ads API:** https://developers.google.com/google-ads/api
- **Google Analytics Data API:** https://developers.google.com/analytics/devguides/reporting/data/v1

### Related Project Documentation
- **📋 OMA Integration Architecture:** `OMA-MCP-INTEGRATION.md`
  - Two-layer account authorization
  - Approval workflows and security
  - Deployment architecture

- **🔧 HTTP Server Guide:** `../../MCP-HTTP-SERVER-GUIDE.md`
  - Server setup and configuration
  - Testing and troubleshooting
  - Available tools and capabilities

- **🔐 OAuth Integration Spec:** `../oauth/OMA-INTEGRATION-SPEC.md`
  - Per-request OAuth architecture
  - Token management details
  - Tool-specific requirements

- **☁️ AWS Deployment Guide:** `AWS-DEPLOYMENT-GUIDE.md`
  - Production infrastructure setup
  - ECS deployment
  - Scaling and monitoring

---

## 12. FAQ

### Q: Does the practitioner need to manually configure scopes?
**A:** No. Scopes are discovered automatically from the OAuth metadata endpoints. When a tool requires a new scope, it's included automatically in the authorization request.

### Q: Can we use STDIO transport for web UI?
**A:** No. STDIO is designed for local processes only (like the CLI). For web UIs, you must use Streamable HTTP transport. STDIO creates a subprocess, which doesn't work in browser environments.

### Q: How do tools get access to OAuth tokens?
**A:** The MCP SDK passes tokens automatically in the `Authorization: Bearer <token>` header. The server middleware extracts this token and makes it available to tool implementations via `req.googleAccessToken`. Tools use this token when calling Google APIs.

### Q: What if OAuth scopes change between versions?
**A:** The metadata endpoints are versioned and discoverable. Clients fetch the current metadata each time they need to authorize. New scopes are immediately available. For backward compatibility, you can version the metadata endpoints (e.g., `/scopes?version=v1` vs `version=v2`).

### Q: How do we handle multi-practitioner scenarios?
**A:** Each practitioner goes through their own OAuth flow and receives their own tokens. Tokens are stored per-user in your application (session, database, etc.). The MCP server doesn't manage user state - it just verifies tokens are valid.

### Q: What if a token expires during a tool call?
**A:** The MCP SDK will detect the 401 response and trigger token refresh automatically. If the refresh token is also expired, the application should initiate a new OAuth flow to get fresh tokens.

### Q: Can tools have different OAuth requirements?
**A:** Yes. Your error handling can check for 403 responses with `required_scopes` and prompt re-authorization with just those scopes. This allows granular scope management per tool.

### Q: How secure is token storage in localStorage?
**A:** localStorage is vulnerable to XSS attacks. For production, store tokens in httpOnly, Secure cookies set by the backend. Alternatively, use a backend-for-frontend (BFF) pattern where the backend manages all OAuth and proxies requests.

### Q: How do we revoke access?
**A:** Implement `POST /oauth2/revoke` endpoint that revokes Google tokens and clears client tokens. Call this on logout.

```typescript
app.post('/oauth2/revoke', (req, res) => {
  const { token } = req.body;

  // Revoke on Google
  fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    body: new URLSearchParams({ token })
  });

  // Clear from database
  db.clearToken(token);

  res.json({ success: true });
});
```

### Q: Can we use service accounts instead of OAuth?
**A:** No, not for web UI. Service accounts are for server-to-server communication and require a single shared credential. OAuth is required for multi-tenant web UIs where each practitioner has their own account. Service accounts lack audit trail and user-specific controls.

### Q: What happens if OMA domain isn't in CORS allowlist?
**A:** Browser will block the requests with CORS error. The OMA domain must be explicitly added to the MCP server's CORS configuration.

### Q: Can we cache OAuth tokens across sessions?
**A:** Yes, store refresh tokens in secure storage (encrypted database, httpOnly cookies, etc.). On new sessions, use refresh token to get a new access token without requiring re-authorization. Only require full OAuth flow when refresh token is also expired.

### Q: How do we test OAuth locally?
**A:** Use ngrok or similar to expose localhost to the internet. Register your ngrok domain as a Google OAuth redirect URI. Point your MCP server and frontend to the ngrok URLs for testing.

```bash
ngrok http 3000  # For MCP server
ngrok http 3001  # For OMA frontend
# Update CORS and OAuth redirect URIs with ngrok URLs
```

### Q: What if Google OAuth is unavailable?
**A:** Implement fallback authentication. You could use API keys for read-only operations, or implement a custom authentication method. The metadata endpoints would list alternative authorization servers.

### Q: How do we handle concurrent tool calls?
**A:** The MCP SDK handles multiplexing over HTTP. All calls share the same access token. If token expires during a call, the SDK will queue requests, refresh the token, and retry. This is transparent to the application.

---

## Conclusion

With this integration guide, OMA developers can now build web UI chatbots that have **native access to all 60+ MCP tools** without manual HTTP requests or hardcoded OAuth configurations.

The key innovation is the **metadata-driven OAuth discovery** - clients automatically discover scopes and OAuth endpoints at runtime. When we add new tools or scopes, clients discover them automatically without code changes.

This architecture provides:
- **Developer experience** on par with the CLI
- **Security** through proper OAuth token management
- **Flexibility** through dynamic scope discovery
- **Scalability** for multi-practitioner deployments

For questions or issues, refer to the references section and contact the MCP Server team.

