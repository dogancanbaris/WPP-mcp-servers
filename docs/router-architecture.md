# WPP Marketing MCP Router Architecture

**Version:** 1.0.0
**Date:** October 31, 2025

---

## Overview

The WPP Marketing MCP Router implements a **router + backend pattern** to manage multiple marketing platforms while staying within token budgets. This architecture supports both CLI (Claude Desktop) and web UI (production HTTP) deployments.

### Architecture Diagram

```
┌──────────────────────────────────────┐
│   Client (Claude Desktop or Web UI) │
│                                      │
│   Connects via stdio or HTTP        │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│   WPP Marketing Router               │  ← ~5,000 tokens
│   src/router/server.ts               │     CLI: stdio transport
│                                      │     Web: HTTP transport
│   • Aggregates tools from backends   │
│   • Prefixes tool names             │
│   • Routes calls to backends        │
└──────────────┬───────────────────────┘
               │ HTTP to backends
      ┌────────┼────────┬────────┬──────────┐
      │        │        │        │          │
┌─────▼────┐ ┌▼──────┐ ┌▼──────┐ ┌▼────────┐ ┌▼──────┐
│ Google   │ │ Social │ │Amazon │ │Microsoft│ │ WPP   │
│Marketing │ │ Media  │ │       │ │         │ │Analytics│
│  Backend │ │Backend │ │Backend│ │ Backend │ │Backend│
├──────────┤ ├────────┤ ├───────┤ ├─────────┤ ├───────┤
│• GSC     │ │• Meta  │ │• Ads  │ │• MS Ads │ │• Dash │
│• Ads     │ │• X     │ │• SP   │ │• Bing   │ │• Data │
│• Analytics│ │• TikTok│ │ -API  │ │  WMT    │ │  Push │
│• CrUX    │ │        │ │       │ │         │ │       │
│66 tools  │ │140 tls │ │180 tls│ │190 tools│ │10 tls │
│HTTP:3100 │ │HTTP:   │ │HTTP:  │ │HTTP:    │ │HTTP:  │
│          │ │3101    │ │3102   │ │3103     │ │3104   │
└──────────┘ └────────┘ └───────┘ └─────────┘ └───────┘
```

---

## Key Concepts

### 1. Router (Frontend)

**Location:** `src/router/server.ts`

**Responsibilities:**
- Accept client connections (stdio for CLI, HTTP for web UI)
- Maintain registry of backend MCP servers
- Call `tools/list` on each backend and aggregate results
- Prefix tool names to avoid conflicts: `{platform}__{tool_name}`
- Route `tools/call` to appropriate backend
- Forward OAuth tokens to backends

**Token Budget:** ~5,000 tokens
- Router logic and metadata only
- Minimal descriptions for each platform
- No tool implementations loaded

### 2. Backend Servers

**Location:** `src/backends/{platform}/server.ts`

**Responsibilities:**
- Expose tools via HTTP (always HTTP, never stdio)
- Handle `tools/list` requests
- Handle `tools/call` requests
- Execute tool logic with OAuth
- Return results to router

**Token Budget:** 40K-190K tokens per backend
- Each backend stays within reasonable limits
- Full tool descriptions and implementations included

### 3. Tool Name Prefixing

**Format:** `{prefix}__{original_name}`

**Examples:**
- `google__query_search_analytics` (Google Search Console)
- `google__list_campaigns` (Google Ads)
- `meta__create_campaign` (Meta Ads)
- `amazon__create_campaign` (Amazon Ads)
- `microsoft__add_keywords` (Microsoft Advertising)

**Benefits:**
- Zero naming conflicts between platforms
- Clear platform attribution
- Easy to understand which platform a tool belongs to

---

## Directory Structure

```
src/
├── router/                          # Router package
│   ├── server.ts                    # Main router (stdio/HTTP)
│   ├── backend-registry.ts          # Manage backends
│   ├── http-client.ts               # HTTP client for backends
│   ├── config.ts                    # Load configs from env
│   └── types.ts                     # TypeScript interfaces
│
├── backends/                        # Backend servers
│   └── google-marketing/
│       └── server.ts                # Google backend (HTTP only)
│
├── gsc/                             # Existing Google tools
│   └── tools/
│       ├── properties.ts
│       ├── analytics.ts
│       └── ...
│
├── ads/                             # Existing Google Ads tools
├── analytics/                       # Existing Analytics tools
├── crux/                            # Existing CrUX tools
├── business-profile/                # Existing Business Profile tools
├── bigquery/                        # Existing BigQuery tools
├── serp/                            # Existing SERP tools
└── wpp-analytics/                   # Existing WPP tools
```

---

## Configuration

### Environment Variables

See `.env.router.example` for complete configuration options.

**Key Variables:**

```bash
# Router Configuration
MCP_TRANSPORT=stdio              # Transport: stdio | http | both
ROUTER_PORT=3000                 # HTTP port (when using HTTP transport)

# Backend URLs
GOOGLE_BACKEND_URL=http://localhost:3100/mcp
ENABLE_GOOGLE=true               # Enable/disable backend

# Future backends
ENABLE_SOCIAL_MEDIA=false        # Meta, X, TikTok
ENABLE_AMAZON=false              # Amazon Ads + SP-API
ENABLE_MICROSOFT=false           # MS Ads + Bing Webmaster
```

---

## Usage

### Development

**Step 1: Start Google backend**
```bash
npm run dev:google-backend
# Starts HTTP server on port 3100
```

**Step 2: Start router (separate terminal)**
```bash
# For CLI (stdio):
npm run dev:router

# For web UI (HTTP):
npm run dev:router:http
```

**Step 3: Test**
```bash
# Test tools/list
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router

# Test via HTTP
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Production

**Step 1: Build**
```bash
npm run build
```

**Step 2: Start backends**
```bash
# Terminal 1: Google backend
npm run start:google-backend

# Terminal 2 (future): Social Media backend
# npm run start:social-backend

# etc.
```

**Step 3: Start router**
```bash
# For CLI:
npm run start:router

# For web UI:
npm run start:router:http
```

### Claude Desktop Integration

Update `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wpp-marketing": {
      "command": "node",
      "args": ["/absolute/path/to/dist/router/server.js"],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "GOOGLE_BACKEND_URL": "http://localhost:3100/mcp",
        "ENABLE_GOOGLE": "true"
      }
    }
  }
}
```

**Important:** Make sure Google backend is running before starting Claude Desktop!

---

## How It Works

### 1. Client Connection

**CLI (stdio):**
- User starts Claude Desktop
- Claude spawns router as subprocess
- Router communicates via stdin/stdout
- Router is the only MCP server in Claude's config

**Web UI (HTTP):**
- Web app connects to `http://your-domain.com/mcp`
- Router handles HTTP POST/GET requests
- Single HTTP endpoint, multiple backend connections

### 2. Tool Discovery

**When client calls `tools/list`:**

1. Router receives request
2. Router calls `tools/list` on each active backend (HTTP)
3. Google backend returns 66 tools
4. Router prefixes each tool: `google__query_search_analytics`, etc.
5. Router aggregates all tools from all backends
6. Router returns prefixed tools to client
7. Client sees: `google__tool1`, `google__tool2`, ..., `meta__tool1`, etc.

### 3. Tool Execution

**When client calls `tools/call` with `google__query_search_analytics`:**

1. Router receives request
2. Router finds tool in cache
3. Router identifies backend: "google-marketing"
4. Router strips prefix, gets original name: "query_search_analytics"
5. Router calls Google backend's `tools/call` with original name
6. Google backend executes tool handler
7. Google backend returns result
8. Router forwards result to client

### 4. OAuth Token Flow

**Current implementation:**
- Tools handle OAuth internally (existing pattern)
- Backends have access to OAuth client factory
- Router passes through any auth headers

**Future enhancement:**
- Router could intercept and attach OAuth tokens
- Centralized token management in router
- Backends receive tokens via headers

---

## API Endpoints

### Router Endpoints (when using HTTP transport)

**MCP Protocol:**
- `POST /mcp` - Main MCP endpoint (tools/list, tools/call, etc.)

**Health & Monitoring:**
- `GET /health` - Health check for router and all backends
- `GET /stats` - Router statistics (tools count, backends, uptime)

**Admin:**
- `POST /admin/refresh` - Manually refresh tools from all backends
- `GET /admin/backends` - List all backends with metadata

### Backend Endpoints

Each backend exposes:
- `POST /mcp` - MCP protocol endpoint
- `GET /health` - Health check

---

## Tool Namespace Examples

### Google Marketing Backend (Prefix: `google`)

Original tools → Prefixed tools:
- `query_search_analytics` → `google__query_search_analytics`
- `list_campaigns` → `google__list_campaigns`
- `get_campaign_performance` → `google__get_campaign_performance`
- `run_analytics_report` → `google__run_analytics_report`
- `list_bigquery_datasets` → `google__list_bigquery_datasets`

### Future: Meta Ads Backend (Prefix: `meta`)

- `create_campaign` → `meta__create_campaign`
- `create_ad_set` → `meta__create_ad_set`
- `get_insights` → `meta__get_insights`
- `create_audience` → `meta__create_audience`

### Future: Amazon Backend (Prefix: `amazon`)

- `create_campaign` → `amazon__create_campaign`
- `add_keywords` → `amazon__add_keywords`
- `list_orders` → `amazon__list_orders`
- `update_listing` → `amazon__update_listing`

---

## Token Budget Breakdown

### ⚡ MASSIVE OPTIMIZATION ACHIEVED (94% Reduction)

**Monolithic Approach (Old):**
```
66 tools × ~1,500 tokens each (verbose descriptions) = 99,000 tokens
Router overhead: ~5,000 tokens
────────────────────────────────────────
Total loaded at connection: ~104,000 tokens
```

**Router + Minimal Descriptions (Current):**
```
Router Server: ~5,000 tokens
66 tools × ~15 tokens each (first line only) = ~1,000 tokens
────────────────────────────────────────
Total loaded at connection: ~6,000 tokens

Savings: 98,000 tokens (94.2% reduction!)
```

### How Minimal Description Extraction Works

**Implementation:** `src/router/backend-registry.ts` (lines 21-31)

```typescript
function extractMinimalDescription(description: string): string {
  // Take first line only
  const firstLine = description.split('\n')[0].trim();

  // Remove emoji prefix
  const withoutEmoji = firstLine.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '');

  return withoutEmoji || firstLine;
}
```

**Example Transformation:**
```
Before (loaded at connection):
"List all campaigns in Google Ads account.

💡 AGENT GUIDANCE:
- Use this to discover campaigns
- Check campaign status
[... 30 more lines ...]"
→ 1,500 tokens

After (loaded at connection):
"List all campaigns in Google Ads account."
→ 15 tokens

Verbose guidance moved to tool response (loaded only when called)
```

### Backends (HTTP services, not loaded into Claude)

```
Google Marketing Backend:
- 66 tools with full implementations
- OAuth & infrastructure
- Interactive workflow logic
- Approval enforcement
────────────────────────────────────────
Backend size: ~50,000 tokens

(Backend runs as separate HTTP service - NEVER loaded into Claude's context!)
```

### What Gets Loaded On-Demand

**When a tool is called:**
- Client calls `google__query_search_analytics`
- Router forwards to backend
- Backend executes tool
- Tool injects verbose guidance into response (`injectGuidance()`)
- Response returns: ~300-1,200 tokens of formatted guidance
- Client shows rich formatted results

**Result:** Pay token cost only for tools actually used!

---

## Benefits of Router Architecture

### ✅ Token Efficiency
- Claude only loads router (~5K tokens)
- Backend implementations not in Claude's context
- Tool metadata fetched dynamically
- Can support 100+ platforms without context explosion

### ✅ Works for CLI and Web UI
- Same backend servers for both
- Router changes frontend transport (stdio vs HTTP)
- Backends always use HTTP
- Single codebase, dual deployment

### ✅ Scalability
- Add new platforms without changing router
- Backends independently deployable
- Can disable platforms via config
- No interdependencies between platforms

### ✅ Maintainability
- Clear separation of concerns
- Each platform is isolated
- Easy to debug (logs per backend)
- Can update one platform without affecting others

### ✅ Performance
- Backends can be load balanced
- Can run backends on different servers
- Parallel tool execution across backends
- Health monitoring per backend

---

## Interactive Workflow System

### Overview

Along with the router architecture, we implemented an **interactive workflow system** that guides users through tool operations step-by-step.

**Key Components:**
- `src/shared/interactive-workflow.ts` - Reusable workflow utilities
- Parameter discovery patterns
- Rich guidance injection
- Multi-step approval workflows

### How It Works

**Traditional vs Interactive:**

```
Traditional:
  Tool requires: property, startDate, endDate
  User calls without startDate → ERROR: "startDate is required"
  Poor UX, requires upfront knowledge

Interactive:
  Tool requires: property, startDate, endDate
  User calls without property → Tool lists available properties, asks which one
  User selects → Tool asks for dates with suggestions
  User provides → Tool returns rich analysis with insights
  Great UX, guided experience
```

### Implementation Pattern

**Tools implement discovery logic:**

```typescript
async handler(input: any) {
  // Step 1: Discover property if missing
  if (!input.property) {
    const properties = await listProperties();
    return formatDiscoveryResponse({
      step: '1/2',
      title: 'SELECT PROPERTY',
      items: properties,
      itemFormatter: (p, i) => `${i + 1}. ${p.url}`,
      prompt: 'Which property?',
      nextParam: 'property'
    });
  }

  // Step 2: Suggest dates if missing
  if (!input.startDate || !input.endDate) {
    return injectGuidance(
      { property: input.property },
      `📅 DATE RANGE\n\nLast 7 days: ...\nLast 30 days: ...\n...`
    );
  }

  // Step 3: Execute with rich analysis
  const data = await fetchData(input);
  const insights = analyzeData(data);

  return injectGuidance(data, `
    📊 ANALYSIS RESULTS
    ${formatResults(data)}

    💡 INSIGHTS:
    ${insights}

    🎯 NEXT STEPS:
    ${formatNextSteps([...])}
  `);
}
```

### Tools Transformed

**Category A: Simple READ (5 tools)** ✅
- list_properties, get_property
- list_accessible_accounts
- list_analytics_accounts
- list_bigquery_datasets

**Category B: Complex READ (6 tools)** ✅
- query_search_analytics (full multi-step)
- list_campaigns, list_budgets
- get_campaign_performance
- get_search_terms_report

**Category C: WRITE with Approval (1 tool)** ✅
- update_budget (discovery + approval)

**Remaining:** 54 tools can follow these exact patterns

### Benefits

✅ **Better UX** - Guided workflows vs cryptic errors
✅ **Self-documenting** - Tools explain themselves in responses
✅ **Token efficient** - Guidance loaded only when needed
✅ **Safer** - Multi-step approval with impact previews
✅ **Chainable** - Tools suggest next steps

---

## Testing

### Test Backend Directly

```bash
# Start Google backend
npm run dev:google-backend

# In another terminal, test tools/list
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq

# Expected: List of 66 Google tools
```

### Test Router

```bash
# Make sure Google backend is running first!
# npm run dev:google-backend

# Start router (stdio mode)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router

# Expected: List of 66 tools with "google__" prefix
```

### Test in Claude Desktop

1. Update `claude_desktop_config.json` with router config
2. Restart Claude Desktop
3. Check logs: `~/.config/Claude/logs/mcp-server-wpp-marketing.log`
4. Ask Claude: "List all available Google marketing tools"
5. Expected: Claude sees all tools with `google__` prefix

---

## Migration from Old Architecture

### Old (Monolithic)

```json
{
  "mcpServers": {
    "wpp-marketing": {
      "command": "node",
      "args": ["dist/gsc/server.js"]
    }
  }
}
```

### New (Router + Backends)

```json
{
  "mcpServers": {
    "wpp-marketing": {
      "command": "node",
      "args": ["dist/router/server.js"],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "GOOGLE_BACKEND_URL": "http://localhost:3100/mcp"
      }
    }
  }
}
```

**Additional step:** Start Google backend server separately

---

## Future: Adding New Platforms

### Step 1: Create Backend

```bash
mkdir -p src/backends/meta-ads
# Create server.ts with Meta tools
```

### Step 2: Add Configuration

```bash
# .env
ENABLE_META=true
META_URL=http://localhost:3101/mcp
```

### Step 3: Update Router Config

Router automatically picks up backends from environment variables (see `src/router/config.ts`).

### Step 4: Start Backend

```bash
npm run dev:meta-backend
```

### Step 5: Restart Router

Router will automatically discover and register Meta tools.

---

## Troubleshooting

### Router can't connect to backend

**Symptom:** "Failed to refresh tools from backend"

**Solutions:**
1. Check backend is running: `curl http://localhost:3100/health`
2. Check backend URL in env: `echo $GOOGLE_BACKEND_URL`
3. Check backend logs for errors
4. Verify network connectivity (if backends on different hosts)

### Tools not showing in Claude

**Symptom:** Claude says "no tools available"

**Solutions:**
1. Check router started successfully: `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router`
2. Check backends are registered: `curl http://localhost:3000/admin/backends`
3. Check Claude Desktop config points to correct router path
4. Restart Claude Desktop after config changes

### Tool call fails

**Symptom:** "Tool not found" or "Backend error"

**Solutions:**
1. Check tool name includes prefix: `google__query_search_analytics`
2. Check backend is healthy: `curl http://localhost:3100/health`
3. Check backend logs for actual error
4. Verify OAuth tokens are being passed correctly

---

## Next Steps

1. ✅ Router infrastructure created
2. ✅ Google backend extracted
3. ⏳ **Test router + Google backend**
4. ⏳ Validate CLI (stdio) works
5. ⏳ Validate HTTP works for web UI
6. ⏳ Add new platform backends (Amazon, Microsoft, Meta, X, TikTok)

---

## Performance Metrics

### Expected Latency

**tools/list:**
- Router → Backend call: ~10-50ms per backend
- Total for 5 backends: ~50-250ms
- Acceptable for both CLI and web UI

**tools/call:**
- Router → Backend → Tool execution: ~100ms-5s (depends on tool)
- Overhead from routing: ~10-20ms (negligible)

### Memory Usage

**Router process:** ~50-100MB
**Each backend process:** ~100-200MB
**Total for 5 backends:** ~600-1,100MB

Acceptable for development and production.

---

**Document Version:** 1.0
**Last Updated:** October 31, 2025
**Status:** Implementation in progress
