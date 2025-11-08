# Deep Dive: Progressive Disclosure Without Breaking Workflows
## Can We Keep Our Interactive Workflows? YES! ✅

**Research Date:** November 5, 2025
**Concern:** Will implementing Anthropic's progressive disclosure break our interactive workflows?
**Answer:** NO - Workflows are completely preserved. Only discovery layer changes.

---

## 🎯 Executive Summary

### The Good News

**Your interactive workflows are 100% safe.**  They live in tool **handlers** (execution logic), not tool **metadata** (discovery information). Anthropic's pattern changes HOW tools are discovered, not HOW they execute.

### What Changes vs. What Stays

| Layer | What It Is | Changes? | Impact |
|-------|-----------|----------|---------|
| **Discovery** | How Claude finds tools | ✅ YES | Router layer only |
| **Metadata** | Tool names, descriptions, schemas | ✅ YES | Loaded on-demand |
| **Handlers** | Tool execution logic | ❌ NO | Zero changes |
| **Workflows** | Interactive parameter discovery | ❌ NO | Zero changes |
| **Guidance** | `injectGuidance()`, `formatDiscoveryResponse()` | ❌ NO | Zero changes |

**Bottom Line:** We change ~200 lines in the router, 0 lines in tool implementations.

---

## 📚 What Anthropic's Article Actually Says

### The Core Concept (Direct Quotes)

> "Models should read tool definitions on-demand, rather than reading them all up-front"

> "This changes **tool discovery** only. The mechanics of how tools execute remain constant."

> "The approach merely presents MCP servers as code APIs rather than direct tool calls."

### What They're Optimizing

**Before (Traditional MCP):**
```
Client connects
  ↓
Client calls: tools/list
  ↓
Server returns: ALL tool definitions (150K tokens)
  ↓ Claude's context now full
Client uses 1-2 tools
```

**After (Progressive Disclosure):**
```
Client connects
  ↓
Client explores: ./servers/ directory (0 tokens)
  ↓
Client reads: specific tool files as needed (~2K tokens)
  ↓
Client uses tools
```

**Result:** 98.7% token reduction (150K → 2K)

### What Does NOT Change

❌ Tool handler implementation
❌ Tool execution logic
❌ How tools process inputs
❌ How tools return outputs
❌ Interactive workflows
❌ Parameter validation
❌ Error handling
❌ OAuth flows

✅ **Only changes:** When tool metadata is loaded into Claude's context

---

## 🔬 Our Current Implementation Analysis

### 1. Our Tool Structure (ALREADY Perfect for This!)

**Current Organization:**
```
src/
├── gsc/tools/
│   ├── properties.ts         ← listPropertiesTool, getPropertyTool
│   ├── analytics.ts           ← querySearchAnalyticsTool
│   ├── sitemaps.ts            ← 4 sitemap tools
│   ├── url-inspection.ts      ← inspectUrlTool
│   └── index.ts               ← Exports allTools array
│
├── ads/tools/
│   ├── accounts.ts            ← Account management
│   ├── campaigns/
│   │   ├── create-campaign.tool.ts
│   │   └── update-status.tool.ts
│   ├── budgets.ts             ← Budget tools with workflows
│   └── index.ts
│
├── analytics/tools/
│   └── reporting/
│       ├── run-report.tool.ts
│       └── get-realtime-users.tool.ts
│
└── shared/
    └── interactive-workflow.ts  ← Workflow utilities
```

**This is EXACTLY what Anthropic recommends!** We already have:
- ✅ Tools organized in files
- ✅ Logical grouping by platform
- ✅ Clear separation of concerns
- ✅ Exportable tool collections

### 2. Our Interactive Workflows (100% in Handlers)

**Example: querySearchAnalyticsTool**

**Metadata (What Gets Loaded):**
```typescript
export const querySearchAnalyticsTool = {
  name: 'query_search_analytics',
  description: 'Query search traffic data from Google Search Console',  // ← Minimal!
  inputSchema: {
    type: 'object',
    properties: { ... },
    required: []  // ← All optional for discovery
  },
  async handler(input) { ... }  // ← Workflows are HERE
};
```

**Handler (Where Workflows Live):**
```typescript
async handler(input: any) {
  // ═══ STEP 1: PROPERTY DISCOVERY ═══
  if (!input.property) {
    const properties = await fetchProperties();
    return formatDiscoveryResponse({
      step: '1/2',
      title: 'SELECT PROPERTY',
      items: properties,
      itemFormatter: (p, i) => `${i + 1}. ${p.url}`,
      prompt: 'Which property?',
      nextParam: 'property'
    });
  }

  // ═══ STEP 2: DATE RANGE DISCOVERY ═══
  if (!input.startDate || !input.endDate) {
    return injectGuidance({ ... }, `
      📅 DATE RANGE SELECTION
      Quick options:
      1. Last 7 days: ...
      2. Last 30 days: ...
      ...
    `);
  }

  // ═══ STEP 3: EXECUTE WITH ANALYSIS ═══
  const data = await fetchData(input);
  const insights = analyzeData(data);

  return injectGuidance(data, `
    📊 SEARCH PERFORMANCE ANALYSIS
    Total Clicks: ${data.clicks}
    💡 KEY INSIGHTS:
    ${insights}
    🎯 NEXT STEPS:
    • Check indexing: use inspect_url
    • Monitor rankings: track top queries
  `);
}
```

**Key Insight:** ALL workflow logic is in `handler()`, which is NEVER loaded into Claude's context. Only metadata (name, description, schema) is loaded.

### 3. How Our Router Currently Works

**File: src/router/server.ts**

```typescript
// Line 67 - ⚠️ THIS IS WHAT CHANGES
await registry.refreshAllTools();  // Currently fetches ALL 66 tools

// Line 94-111 - ⚠️ THIS IS WHAT CHANGES
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = registry.getAllTools();  // Returns ALL 66
  return { tools };  // Claude gets ALL 66 upfront
});

// Line 116-134 - ✅ THIS STAYS THE SAME
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await registry.callTool(name, args);  // Calls handler
  return result;  // Returns workflow responses
});
```

**What This Means:**

| Request | Current Behavior | After Progressive Disclosure | Handler Changes? |
|---------|-----------------|------------------------------|------------------|
| `tools/list` | Returns ALL 66 tools (6K tokens) | Returns 0 tools OR categories | N/A |
| `resources/list` | Not implemented | Returns 3-5 categories (200 tokens) | N/A |
| `resources/read` | Not implemented | Returns tools for ONE category | N/A |
| `tools/call` | Executes handler | Executes handler (SAME!) | ❌ NO |

**Critical Finding:** `tools/call` (which executes handlers and workflows) DOES NOT CHANGE AT ALL.

---

## 🔍 What We Analyzed (Your Interactive Workflows)

### Tool Example 1: list_properties (Simple READ)

**File:** `src/gsc/tools/properties.ts:18-100`

**Metadata:**
```typescript
{
  name: 'list_properties',
  description: 'List all Search Console properties you have access to',
  inputSchema: { ... }
}
```

**Handler (Workflow):**
```typescript
async handler() {
  const properties = await fetchProperties();

  return injectGuidance(
    { properties },
    `📊 DISCOVERED ${properties.length} PROPERTIES

    ${properties.map((p, i) => `${i+1}. ${p.url}`).join('\n')}

    💡 WHAT YOU CAN DO:
    - Analyze traffic: use query_search_analytics
    - Check indexing: use inspect_url

    Which property would you like to analyze?`
  );
}
```

**Progressive Disclosure Impact:**
- Metadata loaded: Only when category is accessed
- Handler execution: UNCHANGED
- Workflow: UNCHANGED
- User experience: IDENTICAL

### Tool Example 2: query_search_analytics (Multi-Step Discovery)

**File:** `src/gsc/tools/analytics.ts:21-200`

**Metadata:**
```typescript
{
  name: 'query_search_analytics',
  description: 'Query search traffic data with filters',
  inputSchema: {
    properties: {
      property: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' }
    },
    required: []  // All optional for discovery
  }
}
```

**Handler (3-Step Workflow):**
```typescript
async handler(input) {
  // STEP 1: Property discovery
  if (!input.property) {
    return formatDiscoveryResponse({ ... });  // Interactive prompt
  }

  // STEP 2: Date range discovery
  if (!input.startDate || !input.endDate) {
    return injectGuidance({ ... }, 'Date selection guidance');
  }

  // STEP 3: Execute with insights
  const data = await fetchData(input);
  return injectGuidance(data, 'Analysis results + next steps');
}
```

**Progressive Disclosure Impact:**
- Metadata loaded: On-demand (when GSC category accessed)
- Handler execution: UNCHANGED
- 3-step workflow: UNCHANGED
- Parameter discovery: UNCHANGED
- Guidance injection: UNCHANGED

### Tool Example 3: create_budget (Approval Workflow)

**File:** `src/ads/tools/budgets.ts:20-300`

**Metadata:**
```typescript
{
  name: 'create_budget',
  description: 'Create a new campaign budget',
  inputSchema: {
    properties: {
      customerId: { type: 'string' },
      name: { type: 'string' },
      dailyAmountDollars: { type: 'number' },
      confirmationToken: { type: 'string' }
    },
    required: []
  }
}
```

**Handler (4-Step Approval Workflow):**
```typescript
async handler(input) {
  // STEP 1: Account discovery
  if (!input.customerId) {
    const accounts = await listAccounts();
    return formatDiscoveryResponse({
      step: '1/4',
      title: 'SELECT ACCOUNT',
      items: accounts,
      ...
    });
  }

  // STEP 2: Budget name guidance
  if (!input.name) {
    return injectGuidance({}, 'Name selection guidance');
  }

  // STEP 3: Amount specification
  if (!input.dailyAmountDollars) {
    return injectGuidance({}, 'Amount planning tips');
  }

  // STEP 4: Dry-run preview + approval
  if (!input.confirmationToken) {
    const preview = buildDryRunPreview(input);
    return {
      requiresApproval: true,
      confirmationToken: generateToken(),
      preview
    };
  }

  // STEP 5: Execute
  const result = await executeCreate(input);
  return formatSuccessSummary({ ... });
}
```

**Progressive Disclosure Impact:**
- Metadata loaded: On-demand (when Google Ads category accessed)
- Handler execution: UNCHANGED
- 4-step workflow: UNCHANGED
- Approval enforcement: UNCHANGED
- Dry-run previews: UNCHANGED

---

## 🎯 What Actually Changes

### Change 1: Router Tool Loading (src/router/server.ts)

**Before:**
```typescript
async function initializeRouter() {
  const registry = new BackendRegistry();

  // Register backends
  for (const config of backendConfigs) {
    registry.registerBackend(config);
  }

  // ❌ REMOVE THIS: Loads ALL tools at startup
  await registry.refreshAllTools();

  return { server, registry };
}
```

**After:**
```typescript
async function initializeRouter() {
  const registry = new BackendRegistry();

  // Register backends
  for (const config of backendConfigs) {
    registry.registerBackend(config);
  }

  // ✅ DON'T load tools here - lazy load on-demand
  logger.info('Router initialized (lazy loading enabled)');

  return { server, registry };
}
```

**Impact:** Tools not loaded until accessed. **No workflow code changes.**

### Change 2: Tools/List Handler (src/router/server.ts)

**Before:**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = registry.getAllTools();  // ALL 66 tools
  return { tools };
});
```

**After (Option A - Empty):**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [] };  // Force use of resources
});
```

**After (Option B - Search Tool):**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [searchToolsDefinition]  // Just the search tool
  };
});
```

**Impact:** Claude doesn't get all tools upfront. **No workflow code changes.**

### Change 3: Add Resources Support (src/router/server.ts)

**New Code to Add:**
```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Add resources capability
const server = new Server({
  name: 'wpp-marketing-router',
  version: '1.0.0',
}, {
  capabilities: {
    tools: { listChanged: true },
    resources: {}  // ← Add this
  },
});

// List resource categories (lightweight)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'tool://google/search-console',
        name: 'Google Search Console Tools',
        description: 'GSC data and management (8 tools)',
        mimeType: 'application/json'
      },
      {
        uri: 'tool://google/ads',
        name: 'Google Ads Tools',
        description: 'Ads management and reporting (25 tools)',
        mimeType: 'application/json'
      },
      {
        uri: 'tool://google/analytics',
        name: 'Google Analytics Tools',
        description: 'GA4 reporting and analysis (11 tools)',
        mimeType: 'application/json'
      }
    ]
  };
});

// Read tools for specific category
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Parse: tool://google/search-console
  const [, , platform, category] = uri.split('/');

  // Lazy load tools for this category only
  const tools = await registry.getToolsByCategory(platform, category);

  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify({ tools }, null, 2)
    }]
  };
});
```

**Impact:** Claude can now discover tools on-demand. **No workflow code changes.**

### Change 4: Lazy Loading Registry (src/router/backend-registry.ts)

**Add New Method:**
```typescript
export class BackendRegistry {
  private categoryCache: Map<string, boolean> = new Map();

  /**
   * Lazy load tools for a specific category
   */
  async getToolsByCategory(backendName: string, category: string): Promise<PrefixedTool[]> {
    const cacheKey = `${backendName}:${category}`;

    // Already loaded?
    if (this.categoryCache.get(cacheKey)) {
      return this.filterToolsByCategory(backendName, category);
    }

    // Fetch on-demand
    await this.refreshBackendCategory(backendName, category);
    this.categoryCache.set(cacheKey, true);

    return this.filterToolsByCategory(backendName, category);
  }

  /**
   * Filter cached tools by category
   */
  private filterToolsByCategory(backendName: string, category: string): PrefixedTool[] {
    const categoryMap = {
      'search-console': ['list_properties', 'query_search_analytics', 'inspect_url', ...],
      'ads': ['list_campaigns', 'create_budget', 'update_budget', ...],
      'analytics': ['run_report', 'get_realtime_users', ...]
    };

    const toolNames = categoryMap[category] || [];

    return this.getAllTools().filter(t =>
      t._backend === backendName &&
      toolNames.includes(t._originalName)
    );
  }
}
```

**Impact:** Tools loaded by category instead of all at once. **No workflow code changes.**

---

## 📊 Impact Analysis

### Code Changes Required

| File | Lines Changed | Type | Breaks Workflows? |
|------|--------------|------|-------------------|
| `src/router/server.ts` | ~100 | Add resources handlers | ❌ NO |
| `src/router/backend-registry.ts` | ~50 | Add lazy loading | ❌ NO |
| `src/router/types.ts` | ~20 | Add category types | ❌ NO |
| **All tool files** | **0** | **No changes** | ❌ **NO** |
| **interactive-workflow.ts** | **0** | **No changes** | ❌ **NO** |

**Total:** ~170 lines of NEW code, 0 lines of CHANGED code in tools.

### Workflow Preservation Matrix

| Workflow Feature | Location | Changes? | Risk |
|-----------------|----------|----------|------|
| `injectGuidance()` | Tool handlers | ❌ NO | None |
| `formatDiscoveryResponse()` | Tool handlers | ❌ NO | None |
| `formatNextSteps()` | Tool handlers | ❌ NO | None |
| Multi-step workflows | Tool handlers | ❌ NO | None |
| Approval enforcement | Tool handlers | ❌ NO | None |
| Dry-run previews | Tool handlers | ❌ NO | None |
| Parameter discovery | Tool handlers | ❌ NO | None |
| OAuth token passing | Request headers | ❌ NO | None |
| Audit logging | Tool handlers | ❌ NO | None |

**Risk Level:** ZERO - Workflows completely untouched

---

## 🚀 Implementation Strategy

### Minimal Changes Approach (Recommended)

**Goal:** Achieve progressive disclosure with absolute minimum code changes.

**Phase 1: Stop Loading All Tools (1 hour)**
```typescript
// src/router/server.ts

async function initializeRouter() {
  // ... existing code ...

  // ❌ Comment out this line:
  // await registry.refreshAllTools();

  // ✅ Add this instead:
  logger.info('Router initialized (tools loaded on-demand)');
}
```

**Result:** Tools not loaded at startup. Router starts instantly.

**Phase 2: Add Resources Support (2 hours)**
```typescript
// src/router/server.ts

// Add to capabilities
capabilities: {
  tools: { listChanged: true },
  resources: {}  // ← Add
}

// Add resources/list handler (20 lines)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: generateResourceCategories() };
});

// Add resources/read handler (30 lines)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return await loadToolsForResource(request.params.uri);
});
```

**Result:** Claude can discover tools via resources.

**Phase 3: Lazy Load by Category (2 hours)**
```typescript
// src/router/backend-registry.ts

// Add category mapping (10 lines)
private categoryMap = {
  'search-console': ['list_properties', 'query_search_analytics', ...],
  'ads': ['list_campaigns', 'create_budget', ...],
  'analytics': ['run_report', ...]
};

// Add lazy loading method (40 lines)
async getToolsByCategory(backend: string, category: string) {
  // Fetch only if not cached
  // Return filtered tools
}
```

**Result:** Tools loaded per category instead of all at once.

**Phase 4: Update tools/list (10 minutes)**
```typescript
// src/router/server.ts

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [] };  // Empty - use resources instead
});
```

**Result:** Force Claude to use resources for discovery.

**Total Time:** ~5-6 hours
**Total Lines Changed:** ~170 new lines, 0 changed tool lines
**Workflow Preservation:** 100%

---

## 🔬 Testing Strategy

### Test 1: Verify Workflows Still Work

**Before Changes:**
```bash
# Call query_search_analytics without property
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"query_search_analytics",
      "arguments":{}
    }
  }'

# Expected: Property discovery response
# "🔍 SELECT PROPERTY (Step 1/2)"
```

**After Changes:**
```bash
# Same call - should return IDENTICAL response
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"query_search_analytics",
      "arguments":{}
    }
  }'

# Expected: IDENTICAL property discovery response
```

**If this test passes:** Workflows are preserved ✅

### Test 2: Verify Progressive Disclosure

**Check initial load:**
```bash
# Before changes
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router
# Returns: 66 tools (6,000 tokens)

# After changes
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router
# Returns: 0 tools (0 tokens)

echo '{"jsonrpc":"2.0","id":2,"method":"resources/list"}' | npm run dev:router
# Returns: 3 categories (200 tokens)
```

**If this test passes:** Progressive disclosure working ✅

### Test 3: Verify Lazy Loading

**Load specific category:**
```bash
# Load Google Ads tools
echo '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"tool://google/ads"}}' | npm run dev:router
# Returns: 25 Google Ads tools (800 tokens)

# Call a tool from that category
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"google__list_campaigns","arguments":{}}}' | npm run dev:router
# Returns: Account discovery workflow (UNCHANGED)
```

**If this test passes:** Lazy loading + workflows working ✅

---

## 📈 Expected Results

### Before Implementation

```
Claude CLI connects:
- Calls tools/list → receives 66 tools
- Loaded into context: 6,000 tokens
- Ready to use: ALL 66 tools immediately
- First tool call: Workflows execute normally
```

### After Implementation

```
Claude CLI connects:
- Calls tools/list → receives 0 tools
- Calls resources/list → receives 3 categories
- Loaded into context: 200 tokens

User: "Show me GSC data"
- Claude calls: resources/read(uri="tool://google/search-console")
- Receives: 8 GSC tools
- Loaded into context: +800 tokens (total: 1,000)
- Claude calls: query_search_analytics (no params)
- Workflow executes: Property discovery step
- User experience: IDENTICAL to before

Total context used: 1,000 tokens vs 6,000 before (83% reduction)
```

### Workflow Comparison

| Workflow Aspect | Before | After | Same? |
|----------------|--------|-------|-------|
| Property discovery | Step 1/2 prompt | Step 1/2 prompt | ✅ YES |
| Date range guidance | Interactive selection | Interactive selection | ✅ YES |
| Result analysis | Insights + next steps | Insights + next steps | ✅ YES |
| Approval workflow | 4-step process | 4-step process | ✅ YES |
| Dry-run previews | Impact analysis | Impact analysis | ✅ YES |
| Next step suggestions | Tool recommendations | Tool recommendations | ✅ YES |

**User Experience:** IDENTICAL

---

## ✅ Conclusion

### Can We Keep Our Interactive Workflows?

**YES - 100% PRESERVED**

### What Must Change?

**ONLY the discovery layer:**
1. Router stops loading all tools at startup
2. Router adds resources/list and resources/read handlers
3. Registry adds lazy loading by category
4. tools/list returns empty or search tool only

**Total:** ~170 lines of new code in router layer
**Tool changes:** ZERO lines

### What Stays Exactly The Same?

**EVERYTHING in the tools:**
- ✅ All 66 tool handlers
- ✅ All interactive workflows
- ✅ `injectGuidance()` calls
- ✅ `formatDiscoveryResponse()` calls
- ✅ Multi-step parameter discovery
- ✅ Approval workflows
- ✅ Dry-run previews
- ✅ Audit logging
- ✅ OAuth token handling
- ✅ Error handling

### Risk Assessment

**Risk to Workflows:** ZERO
**Risk to User Experience:** ZERO
**Risk of Breaking Changes:** MINIMAL (only router layer)
**Testing Required:** Verify workflows still execute (should pass immediately)

### Recommendation

**PROCEED with confidence.** This is a low-risk, high-reward change that:
- ✅ Reduces initial context by 83-95%
- ✅ Preserves all workflows completely
- ✅ Requires minimal code changes (~170 lines in router)
- ✅ Doesn't touch any tool implementations
- ✅ Scales to unlimited platforms

**Estimated Implementation:** 5-6 hours
**Estimated Testing:** 1-2 hours
**Total:** 1 day of work

---

**Document Version:** 1.0
**Date:** November 5, 2025
**Status:** Analysis Complete - Ready for Implementation
**Recommendation:** GREEN LIGHT ✅
