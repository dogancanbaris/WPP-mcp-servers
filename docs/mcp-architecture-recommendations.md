# MCP Server Architecture Recommendations
## Token Management & Multi-Platform Strategy

**Research Date:** October 31, 2025
**Purpose:** Architectural recommendations for scaling MCP server to support 6 new marketing platforms while managing token budget

---

## Executive Summary

**Current State:**
- Existing MCP server: ~60,000 tokens (Google ecosystem: GSC, Ads, Analytics, CrUX, Business Profile, BigQuery, SERP, WPP Analytics)
- Current tools: 66 operations
- Transport support: ✅ Both HTTP (Streamable) and Stdio

**Challenge:**
- Adding 6 new platforms: ~510 operations
- Estimated token impact: +450,000 tokens
- Total would be: ~510,000 tokens (unsustainable in single MCP server)

**Critical Requirement:**
- Solution MUST work for both:
  - CLI usage (Claude Desktop with stdio transport)
  - Web UI production (HTTP/SSE streaming)

---

## Research Findings: MCP Architecture Patterns

### Pattern 1: IBM MCP Context Forge (Gateway/Federation Pattern)

**What it is:** Enterprise-grade MCP Gateway that acts as a central management point for multiple MCP servers.

**Architecture:**
```
┌─────────────────────────────────────────┐
│      MCP Context Forge Gateway          │
│  (REST API + MCP Protocol Translation)  │
├─────────────────────────────────────────┤
│  • Tool Registry & Catalog              │
│  • Virtual Server Composition           │
│  • Multi-transport Support              │
│  • JWT Auth + OAuth Token Propagation   │
│  • OpenTelemetry Tracing                │
└──────────┬──────────────────────────────┘
           │
    ┌──────┼──────┬──────┬──────┬──────┐
    │      │      │      │      │      │
┌───▼──┐ ┌▼────┐ ┌▼────┐ ┌▼────┐ ┌▼────┐
│ Meta │ │Amzn │ │MS   │ │Bing │ │X    │
│ Ads  │ │Ads  │ │Ads  │ │WMT  │ │Ads  │
│ MCP  │ │MCP  │ │MCP  │ │MCP  │ │MCP  │
└──────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

**How It Works:**
1. **Register Backend MCP Servers:**
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -d '{"name":"meta-ads","url":"http://localhost:8001/mcp"}' \
     http://localhost:4444/gateways
   ```

2. **Create Virtual Servers** (Tool Bundles):
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -d '{"name":"facebook_essentials","associatedTools":["meta_create_campaign","meta_get_insights"]}' \
     http://localhost:4444/servers
   ```

3. **Client Connects to Gateway:**
   - CLI: Connects to virtual server via stdio or HTTP
   - Web UI: HTTP/SSE endpoint `/servers/{uuid}/sse` or `/servers/{uuid}/mcp`

**Key Features:**
- ✅ **Tool Federation:** Merge tools from multiple backends
- ✅ **Virtual Servers:** Bundle specific tools into logical servers
- ✅ **OAuth Propagation:** Pass user tokens to downstream services
- ✅ **Health Checks:** Auto-discover and validate tools
- ✅ **OpenTelemetry:** Distributed tracing across boundaries
- ✅ **Redis Backed:** Syncing and failover support
- ✅ **Admin UI:** Web dashboard for management (optional)
- ✅ **Bulk Import:** Up to 200 tools simultaneously

**Pros:**
- Enterprise-grade with IBM backing
- Handles both CLI and web UI scenarios
- OAuth token management built-in
- Sophisticated tool federation
- Production-ready with observability

**Cons:**
- Additional infrastructure (gateway service + Redis)
- More complexity to deploy and maintain
- Python-based (your current stack is TypeScript)

---

### Pattern 2: Lightweight MCP Router (sting8k/mcp-gateway)

**What it is:** Local MCP router that aggregates multiple MCP servers into a single interface.

**Architecture:**
```
┌─────────────────────────────┐
│   MCP Gateway Router        │
│   (Node.js/TypeScript)      │
├─────────────────────────────┤
│  Config: ~/.mcp-gateway     │
│  • stdio transport          │
│  • HTTP transport           │
│  • OAuth flow management    │
│  • Hot reload               │
└──────────┬──────────────────┘
           │
    ┌──────┼──────┬──────┐
    │      │      │      │
┌───▼──┐ ┌▼────┐ ┌▼────┐
│ MCP  │ │MCP  │ │MCP  │
│Srv 1 │ │Srv 2│ │Srv 3│
└──────┘ └─────┘ └─────┘
```

**Configuration** (~/.mcp-gateway/config.json):
```json
{
  "servers": {
    "google-marketing": {
      "command": "node",
      "args": ["dist/google/server.js"],
      "env": {"MCP_TRANSPORT": "stdio"}
    },
    "meta-ads": {
      "command": "node",
      "args": ["dist/meta/server.js"],
      "env": {"MCP_TRANSPORT": "stdio"}
    },
    "amazon-ads": {
      "type": "sse",
      "url": "http://localhost:8080/sse"
    }
  }
}
```

**How Clients Connect:**
- CLI: `npx -y github:sting8k/mcp-gateway --transport stdio`
- Web UI: Router exposes HTTP endpoint

**Key Features:**
- ✅ **Simple file-based config**
- ✅ **OAuth flow management**
- ✅ **Config hot reload**
- ✅ **Both stdio and HTTP upstream support**
- ✅ **Lightweight (Node.js)**
- ✅ **MIT licensed**

**Pros:**
- Minimal infrastructure (just Node.js process)
- TypeScript/JavaScript (matches your stack)
- Easy to configure and deploy
- Works for both CLI and web UI
- Low operational overhead

**Cons:**
- Less enterprise features (no observability, no Redis, no admin UI)
- Simpler tool management (file-based only)
- No built-in virtual server composition

---

### Pattern 3: Separate Platform-Specific MCP Servers

**What it is:** Create individual MCP servers for each platform, client connects to multiple servers.

**Architecture:**
```
┌─────────────────────────────┐
│    Claude Desktop (CLI)     │
│         or Web UI           │
├─────────────────────────────┤
│   MCP Client                │
│   Connects to 6 servers:    │
└──┬───┬───┬───┬───┬───┬──────┘
   │   │   │   │   │   │
┌──▼┐ ┌▼─┐ ┌▼─┐ ┌▼─┐ ┌▼─┐ ┌▼─┐
│GSC│ │MA│ │AA│ │MS│ │BW│ │XA│
│MCP│ │MCP│ │MCP│ │MCP│ │MCP│ │MCP│
└───┘ └──┘ └──┘ └──┘ └──┘ └──┘
GSC   Meta Amazon MS   Bing  X
      Ads  Ads    Ads  WMT   Ads
```

**Claude Desktop Config** (~/.config/Claude/claude_desktop_config.json):
```json
{
  "mcpServers": {
    "google-marketing": {
      "command": "node",
      "args": ["/path/to/dist/google/server.js"],
      "env": {"MCP_TRANSPORT": "stdio"}
    },
    "meta-ads": {
      "command": "node",
      "args": ["/path/to/dist/meta/server.js"],
      "env": {"MCP_TRANSPORT": "stdio"}
    },
    "amazon-ads": {
      "command": "node",
      "args": ["/path/to/dist/amazon-ads/server.js"]
    },
    "microsoft-ads": {
      "command": "node",
      "args": ["/path/to/dist/microsoft-ads/server.js"]
    },
    "bing-webmaster": {
      "command": "node",
      "args": ["/path/to/dist/bing-webmaster/server.js"]
    },
    "x-ads": {
      "command": "node",
      "args": ["/path/to/dist/x-ads/server.js"]
    },
    "tiktok-ads": {
      "command": "node",
      "args": ["/path/to/dist/tiktok-ads/server.js"]
    }
  }
}
```

**Web UI HTTP Config:**
```typescript
// Web UI connects to multiple HTTP endpoints
const mcpConnections = [
  { name: 'google-marketing', url: 'http://localhost:3000/mcp' },
  { name: 'meta-ads', url: 'http://localhost:3001/mcp' },
  { name: 'amazon-ads', url: 'http://localhost:3002/mcp' },
  { name: 'microsoft-ads', url: 'http://localhost:3003/mcp' },
  { name: 'bing-webmaster', url: 'http://localhost:3004/mcp' },
  { name: 'x-ads', url: 'http://localhost:3005/mcp' },
  { name: 'tiktok-ads', url: 'http://localhost:3006/mcp' }
];
```

**Tool Namespacing:**
- Automatic via server name: `meta_ads__create_campaign`, `amazon_ads__create_campaign`
- No conflicts between servers

**Key Features:**
- ✅ **Clean separation:** Each platform is independent
- ✅ **Independent deployment:** Update one without affecting others
- ✅ **Natural namespacing:** Server name prefixes tools
- ✅ **Simple to reason about:** 1 server = 1 platform
- ✅ **Works in both CLI and web UI**

**Pros:**
- Simplest architecture
- No additional infrastructure
- Each server stays under token limits
- Easy to debug and maintain
- Client loads only what user needs

**Cons:**
- User must configure multiple servers in CLI
- Web UI must manage multiple HTTP connections
- No central tool catalog
- More configuration for end users

---

### Pattern 4: Dynamic Tool Loading with enable/disable

**What it is:** Single MCP server that dynamically enables/disables tools based on user context.

**How MCP Supports This:**
```typescript
// Tools can be dynamically controlled
const metaCreateCampaign = server.registerTool('meta_create_campaign', {...}, handler);
const amazonCreateCampaign = server.registerTool('amazon_create_campaign', {...}, handler);

// Initially load only minimal tools
metaCreateCampaign.disable();  // Hidden from tools/list
amazonCreateCampaign.disable();

// When user says "I want to use Meta Ads"
metaCreateCampaign.enable();  // Triggers notifications/tools/list_changed

// When user switches to Amazon
metaCreateCampaign.disable();
amazonCreateCampaign.enable();  // Triggers notification again
```

**How It Works:**
1. Server registers ALL 510 tools at startup
2. Most tools are disabled by default
3. Agent guidance in each tool description helps LLM select which platform to enable
4. Tools dynamically enabled based on user intent
5. `notifications/tools/list_changed` tells client to refresh tool list

**Key Features:**
- ✅ **Single server deployment**
- ✅ **Dynamic tool visibility**
- ✅ **Context-aware tool loading**
- ✅ **Automatic notifications**

**Pros:**
- Simplest deployment (single server)
- Intelligent tool surfacing
- Minimal user configuration

**Cons:**
- ❌ **All 510 tools still loaded in memory** (doesn't solve token problem)
- ❌ **All tool metadata sent in tools/list** (when enabled)
- ❌ **No actual token savings** - just hides tools from LLM, doesn't reduce MCP server size
- Not viable for your use case

---

### Pattern 5: Hybrid Multi-Server with Shared Router

**What it is:** Combination of patterns - main router + platform-specific servers.

**Architecture:**
```
                    ┌──────────────────────────┐
                    │  WPP Marketing Router    │
                    │   (Lightweight Gateway)  │
                    │                          │
Claude Desktop ────►│  • Tool name prefixing   │
or Web UI           │  • Request routing       │
                    │  • OAuth passthrough     │
                    └────┬─────────────────────┘
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
┌─────▼──────┐  ┌────────▼──────┐  ┌───────▼──────┐
│  Google    │  │ Social Media  │  │ E-commerce   │
│  Ecosystem │  │   Platforms   │  │  Platforms   │
├────────────┤  ├───────────────┤  ├──────────────┤
│• GSC       │  │• Meta Ads     │  │• Amazon Ads  │
│• Ads       │  │• X Ads        │  │• Amazon SP   │
│• Analytics │  │• TikTok       │  │              │
│• CrUX      │  │               │  │              │
│• BigQuery  │  │               │  │              │
│  ~66 tools │  │  ~140 tools   │  │  ~180 tools  │
└────────────┘  └───────────────┘  └──────────────┘

┌────────────┐  ┌───────────────┐
│ Microsoft  │  │ WPP Analytics │
│ Ecosystem  │  │   Platform    │
├────────────┤  ├───────────────┤
│• MS Ads    │  │• Dashboards   │
│• Bing WMT  │  │• Data Push    │
│            │  │• Insights     │
│  ~190 tools│  │  ~10 tools    │
└────────────┘  └───────────────┘
```

**Implementation:**
1. **Main Router Server:** Minimal TypeScript server that:
   - Registers 5-6 backend MCP servers
   - Prefixes tool names by platform: `meta__create_campaign`, `amazon_ads__create_campaign`
   - Routes `tools/call` to appropriate backend
   - Supports both stdio (CLI) and HTTP (web UI) as FRONTEND
   - Connects to backends via HTTP (always)

2. **Backend Platform Servers:** Independent servers per platform/cluster:
   - `wpp-google-marketing-mcp` (existing, ~66 tools)
   - `wpp-social-media-mcp` (Meta + X + TikTok, ~140 tools)
   - `wpp-amazon-mcp` (Ads + SP-API, ~180 tools)
   - `wpp-microsoft-mcp` (MS Ads + Bing WMT, ~190 tools)
   - `wpp-analytics-platform-mcp` (existing, ~10 tools)

3. **Web UI Integration:**
   ```typescript
   // Single HTTP endpoint for web UI
   const client = new McpClient('http://your-domain.com/mcp');
   // Router handles everything
   ```

4. **CLI Integration:**
   ```json
   // ~/.config/Claude/claude_desktop_config.json
   {
     "mcpServers": {
       "wpp-marketing-router": {
         "command": "node",
         "args": ["/path/to/wpp-marketing-router/dist/server.js"]
       }
     }
   }
   ```

**Pros:**
- ✅ Works for BOTH CLI and web UI
- ✅ Single connection point for users
- ✅ Platforms can be enabled/disabled dynamically
- ✅ Each backend server stays under token limits
- ✅ Clean separation of concerns
- ✅ Can scale backends independently
- ✅ TypeScript/JavaScript (your stack)

**Cons:**
- Need to build lightweight router (< 1,000 lines of code)
- Multiple server processes in development
- Slightly more complex deployment

---

## Recommended Solution: Hybrid Multi-Server Router

**Why This Is Best for Your Use Case:**

### ✅ Solves Token Budget Problem
- Router server: ~5,000 tokens (just routing logic + platform descriptions)
- Backend servers: 60K-190K tokens each (manageable)
- **Total loaded into Claude at once:** Only router (~5K tokens) + tools from backends are dynamically listed

### ✅ Works for Both CLI and Web UI
- **CLI (Claude Desktop):**
  - User installs router via `claude_desktop_config.json`
  - Router launches and connects to 5 backend servers (HTTP)
  - Claude sees all tools via router's aggregated `tools/list`
  - Tool calls routed to appropriate backend

- **Web UI (Production HTTP):**
  - Web app connects to: `https://your-api.com/mcp`
  - Router running as HTTP service
  - Backend servers running as HTTP services
  - Same routing logic, different transport frontend

### ✅ Tool Namespacing Built-In
- Router prefixes tools: `google__query_search_analytics`, `meta__create_campaign`
- No conflicts between platforms
- Clear which platform each tool belongs to

### ✅ Minimal Description Pattern
Each tool can have tiered descriptions:
```typescript
{
  name: "meta__create_campaign",
  title: "Create Meta Ad Campaign",  // SHORT - always loaded
  description: "Create Facebook/Instagram campaign",  // BRIEF - always loaded
  inputSchema: {...},  // JSON schema only
  annotations: {
    detailedGuidance: "LAZY_LOAD"  // Full agent guidance loaded on first call
  }
}
```

### ✅ Dynamic Backend Management
```typescript
// Router API (for web UI admin)
POST /router/backends - Register new backend server
POST /router/backends/{id}/toggle - Enable/disable platform
GET /router/backends - List available platforms
```

### ✅ Incremental Rollout
- Phase 1: Launch router with Google + WPP Analytics (existing)
- Phase 2: Add Meta + X + TikTok backend
- Phase 3: Add Amazon backend
- Phase 4: Add Microsoft backend
- No breaking changes for users

---

## Implementation Specification

### Router Server Structure

**File:** `src/router/server.ts`
```
src/router/
├── server.ts              # Main router (stdio + HTTP support)
├── backend-registry.ts    # Backend MCP server registry
├── tool-router.ts         # Route tools/call to backends
├── name-prefixer.ts       # Add platform prefixes
├── config.ts              # Load backend configs
└── types.ts               # TypeScript interfaces
```

**Token Budget:**
- Router metadata: ~2,000 tokens
- Platform descriptions (6): ~1,500 tokens
- Routing logic documentation: ~1,500 tokens
- **Total Router:** ~5,000 tokens

**Tools Returned:**
- Router calls `tools/list` on each backend
- Prefixes each tool name with platform
- Returns aggregated list to client
- **Dynamic:** Only active backends' tools are included

### Backend Server Structure

**Current Backends:**
1. **Google Marketing MCP** (existing at `src/gsc/server.ts`)
   - Already supports both stdio and HTTP ✅
   - Keep as-is, just add HTTP mode config

2. **WPP Analytics Platform MCP** (existing at `src/wpp-analytics/`)
   - Already integrated ✅
   - Keep as-is

**New Backends to Create:**

3. **Social Media MCP** (`src/social-media/server.ts`)
   - Meta Ads tools (~50)
   - X Ads tools (~40)
   - TikTok Ads tools (~50)
   - Total: ~140 tools, ~100K tokens

4. **Amazon MCP** (`src/amazon/server.ts`)
   - Amazon Ads tools (~80)
   - Amazon SP-API tools (~100)
   - Total: ~180 tools, ~130K tokens

5. **Microsoft MCP** (`src/microsoft/server.ts`)
   - Microsoft Ads tools (~140)
   - Bing Webmaster Tools (~50)
   - Total: ~190 tools, ~140K tokens

---

## Detailed Technical Implementation

### 1. Router Server Implementation

**Core Functionality:**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

interface BackendConfig {
  name: string;
  url: string;  // HTTP endpoint of backend MCP server
  prefix: string;  // Tool name prefix (e.g., "meta", "amazon_ads")
  active: boolean;
}

class McpRouter {
  private backends: Map<string, BackendConfig> = new Map();
  private toolCache: Map<string, any> = new Map();  // Cached tool definitions

  async registerBackend(config: BackendConfig) {
    this.backends.set(config.name, config);
    await this.refreshTools(config.name);
  }

  async refreshTools(backendName: string) {
    const backend = this.backends.get(backendName);
    if (!backend || !backend.active) return;

    // Call backend's tools/list
    const tools = await this.callBackend(backend.url, 'tools/list');

    // Prefix tool names
    const prefixedTools = tools.map(tool => ({
      ...tool,
      name: `${backend.prefix}__${tool.name}`,
      _backend: backendName,
      _originalName: tool.name
    }));

    // Cache prefixed tools
    prefixedTools.forEach(tool => {
      this.toolCache.set(tool.name, tool);
    });
  }

  async handleToolsList() {
    // Return aggregated tools from all active backends
    return Array.from(this.toolCache.values());
  }

  async handleToolCall(toolName: string, args: any) {
    const tool = this.toolCache.get(toolName);
    if (!tool) throw new Error(`Tool not found: ${toolName}`);

    const backend = this.backends.get(tool._backend);
    if (!backend) throw new Error(`Backend not found: ${tool._backend}`);

    // Route to backend with original tool name
    return await this.callBackend(backend.url, 'tools/call', {
      name: tool._originalName,
      arguments: args
    });
  }

  private async callBackend(url: string, method: string, params?: any) {
    // HTTP call to backend MCP server
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Math.random(),
        method,
        params
      })
    });

    const result = await response.json();
    return result.result;
  }
}

// Initialize router
const router = new McpRouter();

// Register backends (from config or env)
await router.registerBackend({
  name: 'google-marketing',
  url: process.env.GOOGLE_MARKETING_URL || 'http://localhost:3000/mcp',
  prefix: 'google',
  active: true
});

await router.registerBackend({
  name: 'meta-ads',
  url: process.env.META_ADS_URL || 'http://localhost:3001/mcp',
  prefix: 'meta',
  active: process.env.ENABLE_META === 'true'  // Can be toggled
});

// ... more backends

// Create MCP server with router handlers
const server = new Server({
  name: 'wpp-marketing-router',
  version: '1.0.0'
}, {
  capabilities: {
    tools: { listChanged: true }
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: await router.handleToolsList()
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await router.handleToolCall(name, args);
});

// Support both transports
const transport = process.env.MCP_TRANSPORT === 'stdio'
  ? new StdioServerTransport()
  : new StreamableHTTPServerTransport({ port: 3000 });

await server.connect(transport);
```

### 2. Backend Server Configuration

Each backend exposes HTTP endpoint at different port:

**Environment Variables:**
```bash
# Google Marketing Backend
GOOGLE_MARKETING_URL=http://localhost:3100/mcp
GOOGLE_MARKETING_PORT=3100

# Meta Ads Backend
META_ADS_URL=http://localhost:3101/mcp
META_ADS_PORT=3101

# Amazon Backend
AMAZON_URL=http://localhost:3102/mcp
AMAZON_PORT=3102

# Microsoft Backend
MICROSOFT_URL=http://localhost:3103/mcp
MICROSOFT_PORT=3103

# WPP Analytics Backend
WPP_ANALYTICS_URL=http://localhost:3104/mcp
WPP_ANALYTICS_PORT=3104
```

**Docker Compose (Production):**
```yaml
version: '3.8'
services:
  router:
    image: wpp-marketing-router
    ports:
      - "3000:3000"
    environment:
      - MCP_TRANSPORT=http
      - GOOGLE_MARKETING_URL=http://google-marketing:3100/mcp
      - META_ADS_URL=http://meta-ads:3101/mcp
      - AMAZON_URL=http://amazon:3102/mcp
      - MICROSOFT_URL=http://microsoft:3103/mcp
      - WPP_ANALYTICS_URL=http://wpp-analytics:3104/mcp
    depends_on:
      - google-marketing
      - meta-ads
      - amazon
      - microsoft
      - wpp-analytics

  google-marketing:
    image: wpp-google-marketing-mcp
    environment:
      - MCP_TRANSPORT=http
      - PORT=3100

  meta-ads:
    image: wpp-meta-ads-mcp
    environment:
      - MCP_TRANSPORT=http
      - PORT=3101

  # ... other backends
```

### 3. Minimal Tool Metadata Strategy

**Reduce Token Usage in Tool Descriptions:**

Current approach (heavy):
```typescript
{
  name: "google__query_search_analytics",
  description: `Query search traffic data from Google Search Console with filters...

  💡 AGENT GUIDANCE - START HERE:
  - This should be the FIRST tool you call when...
  - Returns all data with clicks, impressions...

  📊 WHAT YOU'LL GET:
  - Performance metrics...

  🎯 USE CASES:
  ... (20 more lines)
  `
}
```
**Estimated:** ~1,500 tokens per tool × 510 = **765,000 tokens**

**Optimized approach (light):**
```typescript
{
  name: "google__query_search_analytics",
  title: "GSC Traffic Data",  // For UI/selection
  description: "Query GSC performance: clicks, impressions, CTR, position by query/page/device/country",
  inputSchema: {...}  // JSON schema only, ~200 tokens
}
// Agent guidance moved to separate documentation or loaded on first call
```
**Estimated:** ~400 tokens per tool × 510 = **204,000 tokens**

**Further optimization with lazy loading:**
```typescript
{
  name: "google__query_search_analytics",
  title: "GSC Traffic Data",
  description: "Query GSC performance data",
  inputSchema: {
    $ref: "/schemas/google/query_search_analytics"  // Reference to detailed schema
  }
}
```
**Estimated:** ~150 tokens per tool × 510 = **76,500 tokens**

**Recommendation:** Use "optimized approach" - provides enough context for LLM to select tools intelligently while keeping token count reasonable.

---

## Token Budget Analysis

### Current Monolithic Approach (Not Viable)
```
Router/main server with all tools directly:
- Tool metadata (510 tools × 400 tokens): 204,000 tokens
- OAuth/infrastructure code: 20,000 tokens
- Handler implementations: 250,000 tokens
─────────────────────────────────────────────
TOTAL: ~474,000 tokens
```
❌ **Too large for single MCP server**

### Separate Servers (No Router)
```
User configures 7 separate servers:
- Google Marketing: 66 tools × 400 = 26,400 tokens
- Social Media: 140 tools × 400 = 56,000 tokens
- Amazon: 180 tools × 400 = 72,000 tokens
- Microsoft: 190 tools × 400 = 76,000 tokens
- WPP Analytics: 10 tools × 400 = 4,000 tokens
─────────────────────────────────────────────
Per-server totals: 26K-76K tokens each
```
✅ **Each server is viable**
⚠️ **User burden:** Must configure 5-7 servers

### Hybrid Router + Backend Servers (RECOMMENDED)
```
Router Server (what user connects to):
- Platform metadata (7 platforms): 1,500 tokens
- Routing logic: 2,000 tokens
- Tool list aggregation (names only): 1,500 tokens
─────────────────────────────────────────────
Router Total: ~5,000 tokens ✅

Backend Servers (HTTP, internal):
- Google Marketing: ~40,000 tokens (existing)
- Social Media: ~90,000 tokens (new)
- Amazon: ~110,000 tokens (new)
- Microsoft: ~120,000 tokens (new)
- WPP Analytics: ~8,000 tokens (existing)

User Experience:
- Connects to 1 server (router)
- Router dynamically lists tools from active backends
- Tools prefixed by platform for clarity
```
✅ **Best of both worlds**

---

## Implementation Roadmap

### Phase 1: Router Infrastructure (Week 1-2)
1. Create `wpp-marketing-router` package
2. Implement backend registry
3. Implement tool name prefixing
4. Implement request routing
5. Support both stdio (CLI) and HTTP (web UI) frontends
6. Backend connections always HTTP

**Deliverable:** Working router that aggregates existing Google + WPP Analytics servers

### Phase 2: Restructure Existing Server (Week 2)
1. Extract Google tools into `wpp-google-marketing-mcp` backend
2. Configure HTTP mode for backend
3. Test router → Google backend communication
4. Verify CLI (stdio) and web UI (HTTP) both work

**Deliverable:** Router + 1 backend (Google) working in production

### Phase 3: Implement Platform Backends (Week 3-6)

**Week 3: Social Media Backend**
- Create `wpp-social-media-mcp` package
- Implement Meta Ads tools (essential only, ~15 tools)
- Implement X Ads tools (essential only, ~10 tools)
- Implement TikTok Ads tools (essential only, ~10 tools)
- Register with router

**Week 4: Amazon Backend**
- Create `wpp-amazon-mcp` package
- Implement Amazon Ads tools (~15 tools)
- Implement Amazon SP-API tools (~18 tools)
- Register with router

**Week 5: Microsoft Backend**
- Create `wpp-microsoft-mcp` package
- Implement Microsoft Ads tools (~20 tools)
- Implement Bing Webmaster tools (~8 tools)
- Register with router

**Week 6: Testing & Optimization**
- End-to-end testing (CLI + web UI)
- Performance optimization
- Documentation
- Deployment guides

---

## Alternative: Use Existing IBM Context Forge

If you don't want to build your own router, you can use IBM MCP Context Forge as-is:

### Setup Steps:

1. **Install Context Forge:**
   ```bash
   pip install mcp-context-forge
   ```

2. **Run Gateway:**
   ```bash
   mcpgateway start --port 4444
   ```

3. **Register Your Backend Servers:**
   ```bash
   # Google Marketing
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -d '{"name":"google-marketing","url":"http://localhost:3100/mcp"}' \
     http://localhost:4444/gateways

   # Meta Ads
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -d '{"name":"meta-ads","url":"http://localhost:3101/mcp"}' \
     http://localhost:4444/gateways
   ```

4. **Create Virtual Servers** (optional grouping):
   ```bash
   # Essential tools only
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -d '{"name":"essential_marketing","associatedTools":["tool_id_1","tool_id_2"]}' \
     http://localhost:4444/servers
   ```

5. **Connect Clients:**
   - CLI: Connect to `http://localhost:4444/servers/{uuid}/sse`
   - Web UI: Connect to `http://localhost:4444/servers/{uuid}/mcp`

### Pros:
- ✅ No router code to write
- ✅ Enterprise features (Redis, observability, admin UI)
- ✅ Battle-tested

### Cons:
- ❌ Python dependency (your stack is TypeScript)
- ❌ Additional infrastructure (Redis for production)
- ❌ Learning curve for Context Forge
- ❌ More moving parts

---

## FINAL RECOMMENDATION

### **Build Custom TypeScript Router + Backend Servers**

**Why:**
1. **Matches your tech stack** (TypeScript/Node.js)
2. **Full control** over routing logic and optimizations
3. **Minimal infrastructure** (just Node.js processes)
4. **Works perfectly for CLI and web UI**
5. **Incremental rollout** - add platforms gradually
6. **Token efficient** - router is tiny, backends are manageable
7. **Aligns with your existing patterns** (you already have transport selection in `server.ts`)

**Architecture Decision:**
```
┌────────────────────────────────────────┐
│  wpp-marketing-router                  │  ← User connects here (5K tokens)
│  • Aggregates tools from backends      │     CLI: stdio transport
│  • Prefixes tool names                 │     Web: HTTP transport
│  • Routes calls to backends            │
│  • Supports stdio + HTTP frontends     │
└────────────┬───────────────────────────┘
             │ HTTP to all backends
    ┌────────┼──────┬──────┬──────┐
┌───▼────┐ ┌─▼───┐ ┌▼────┐ ┌▼────┐ ┌▼────┐
│ Google │ │Meta │ │Amzn │ │MS   │ │WPP  │
│  MCP   │ │ MCP │ │ MCP │ │ MCP │ │ MCP │
│ 66 tls │ │140tl│ │180tl│ │190tl│ │10tl │
│ HTTP   │ │HTTP │ │HTTP │ │HTTP │ │HTTP │
└────────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

**Implementation Effort:**
- Router: ~800 lines of TypeScript
- Backend refactoring: ~400 lines (extract existing + HTTP config)
- New backend scaffolds: ~200 lines each × 3 = 600 lines
- Total: ~1,800 lines of infrastructure code

**Timeline:** 2-3 weeks for complete implementation

**Benefits:**
- ✅ Solves token budget problem permanently
- ✅ Works for both CLI and web UI
- ✅ Scalable to 100+ platforms if needed
- ✅ Clean separation of concerns
- ✅ Incremental rollout without breaking changes
- ✅ Each backend independently deployable
- ✅ No external dependencies (Context Forge, Redis, etc.)

---

## Next Steps

1. ✅ **API Research** - Complete
2. ✅ **Documentation** - Complete
3. ⏳ **Architecture Decision** - This document
4. ⏳ **Approve approach** - Awaiting your decision
5. ⏳ **Implement router** - 3-5 days
6. ⏳ **Restructure existing backend** - 2-3 days
7. ⏳ **Create first new backend** (Social Media) - 5-7 days
8. ⏳ **Production deployment** - 2-3 days

**Total Timeline:** 2-3 weeks to production-ready multi-platform MCP router

---

## Decision Matrix

| Criteria | IBM Context Forge | sting8k Router | Separate Servers | Custom Router (RECOMMENDED) |
|----------|------------------|----------------|------------------|----------------------------|
| **Works in CLI** | ✅ | ✅ | ✅ | ✅ |
| **Works in Web UI** | ✅ | ✅ | ✅ | ✅ |
| **Token Efficient** | ✅ | ✅ | ✅ | ✅ |
| **Your Tech Stack** | ❌ Python | ✅ TypeScript | ✅ TypeScript | ✅ TypeScript |
| **Infrastructure Needed** | ⚠️ Redis | ✅ None | ✅ None | ✅ None |
| **Implementation Effort** | Low (use as-is) | Low (configure) | Medium (many configs) | Medium (build router) |
| **Control & Customization** | ⚠️ Limited | ⚠️ Limited | ✅ Full | ✅ Full |
| **Scalability** | ✅ High | ✅ Medium | ✅ High | ✅ High |
| **Tool Namespacing** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Custom |
| **Virtual Server Grouping** | ✅ Yes | ❌ No | ❌ No | ✅ Can add |
| **Production Ready** | ✅ Yes | ⚠️ Beta | ✅ Yes | ⏳ Need to build |
| **User Experience** | ⚠️ Complex | ✅ Simple | ⚠️ Many configs | ✅ Simple |

**Winner: Custom TypeScript Router** ✅

---

## Appendix: MCP Protocol Capabilities

### Tools Listing Supports Pagination
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {
    "cursor": "optional-cursor-for-next-page"
  }
}
```
- **Use case:** If backend has 100+ tools, can paginate
- **Benefit:** Spread tool loading across multiple requests
- **Reality:** Most backends have <200 tools, pagination not critical

### Notifications for Dynamic Changes
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/tools/list_changed"
}
```
- Server can notify clients when tools are added/removed/updated
- Client re-fetches `tools/list` when notified
- Router can proxy these notifications to end client

### HTTP Transport Modes

**Streamable HTTP** (Recommended, current spec):
- Single endpoint `/mcp` handles POST (requests) and GET (SSE responses)
- Session management via `Mcp-Session-Id` header
- Stateless or stateful modes supported

**Legacy SSE:**
- Separate `/sse` and `/messages` endpoints
- Still supported for backwards compatibility
- Use Streamable HTTP for new implementations

---

## Questions for Decision

1. **Do you want to build custom router or use existing solution?**
   - Custom TypeScript router (recommended)
   - IBM Context Forge (Python, more features)
   - sting8k router (simple, less control)

2. **How should platforms be grouped into backends?**
   - Option A: 1 backend per platform (7 backends)
   - Option B: Logical grouping (4-5 backends) - RECOMMENDED
     - Google ecosystem
     - Social media (Meta + X + TikTok)
     - Amazon (Ads + SP-API)
     - Microsoft (Ads + Webmaster)
     - WPP Analytics

3. **Should router support virtual server composition?**
   - Yes: More flexible, users can create custom tool bundles
   - No: Simpler, just prefix and route

4. **Deployment priority for new platforms?**
   - Which platform should we implement first?
   - Suggested order: Meta Ads → Bing Webmaster → Microsoft Ads → Amazon Ads → X Ads → TikTok Ads

---

**Document Version:** 1.0
**Research Completed:** October 31, 2025
**Ready for Implementation:** ✅ Yes, pending architecture approval
