# Context Optimization Plan
## Implementing Anthropic's Progressive Disclosure for Claude CLI

**Goal:** Reduce Claude CLI's initial context load from 6,000 tokens to near-zero
**Reference:** https://www.anthropic.com/engineering/code-execution-with-mcp
**Current State:** We load ALL 66 tools upfront (6K tokens)
**Target State:** Load tools on-demand as needed (250-500 tokens per task)

---

## Anthropic's Key Recommendation

> "Models should read tool definitions on-demand, rather than reading them all up-front"

**Their Result:** 98.7% token reduction (150K → 2K tokens)
**Our Current:** 94% token reduction (104K → 6K tokens)
**Our Target:** 99.7% reduction (104K → 250 tokens)

---

## Current vs. Recommended Flow

### Current Flow (Eager Loading)
```
1. Claude CLI connects to MCP server
   ↓
2. Claude calls: tools/list
   ↓
3. Server returns: ALL 66 tools with full schemas
   ↓ (6,000 tokens loaded into Claude's context)
4. Claude searches through ALL tools to find relevant ones
   ↓
5. Claude calls: google__list_campaigns
   ↓
6. Result

Total upfront cost: 6,000 tokens
```

### Recommended Flow (Lazy Loading)
```
1. Claude CLI connects to MCP server
   ↓ (0 tokens loaded)
2. Claude calls: search_tools("google ads campaigns", detail="name_only")
   ↓ (50 tokens for search results)
3. Claude calls: get_tool_schema("google__list_campaigns")
   ↓ (200 tokens for one tool schema)
4. Claude calls: google__list_campaigns
   ↓
5. Result

Total cost: 250 tokens (97.5% less!)
```

---

## The Problem in Our Code

### File: `src/router/server.ts`

**Line 67 - Eager Tool Loading:**
```typescript
async function initializeRouter() {
  const registry = new BackendRegistry();

  // ⚠️ PROBLEM: Fetches ALL 66 tools immediately
  await registry.refreshAllTools();

  logger.info('Initial tool refresh completed', {
    totalTools: registry.getAllTools().length,  // 66 tools
  });
}
```

**Line 94-111 - Returns Everything:**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
  // ⚠️ PROBLEM: Returns ALL 66 tools to Claude
  const tools = registry.getAllTools();

  return {
    tools: cleanTools  // All 66 tools sent upfront
  };
});
```

---

## Solution Options

### Option 1: MCP Resources Pattern (Recommended for Claude CLI)

Expose tools as **MCP Resources** that Claude can read on-demand:

**Implementation:**

```typescript
// src/router/server.ts

import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Add resources capability
const server = new Server(
  {
    name: 'wpp-marketing-router',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: { listChanged: true },
      resources: {}  // ✅ Add resources support
    },
  }
);

// List available tool resources (lightweight)
server.setRequestHandler(ListResourcesRequestSchema, async (_request) => {
  logger.debug('Handling resources/list request');

  // Return only resource URIs and names (minimal tokens)
  const resources = [
    {
      uri: 'tool://google/search-console',
      name: 'Google Search Console Tools',
      description: 'Tools for GSC data and management',
      mimeType: 'application/json'
    },
    {
      uri: 'tool://google/ads',
      name: 'Google Ads Tools',
      description: 'Tools for Google Ads management',
      mimeType: 'application/json'
    },
    {
      uri: 'tool://google/analytics',
      name: 'Google Analytics Tools',
      description: 'Tools for GA4 reporting',
      mimeType: 'application/json'
    }
  ];

  logger.info(`Returning ${resources.length} tool resource categories`);

  return { resources };
});

// Read specific tool definitions on-demand
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  logger.info(`Loading tools from resource: ${uri}`);

  // Parse URI: tool://google/search-console
  const [, , platform, category] = uri.split('/');

  // Only fetch tools for requested category
  const tools = await registry.getToolsByCategory(platform, category);

  logger.info(`Returning ${tools.length} tools for ${uri}`);

  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify({ tools }, null, 2)
    }]
  };
});

// ❌ Remove tools/list handler or make it return empty
server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
  logger.debug('tools/list called - returning empty (use resources instead)');

  return {
    tools: []  // Force Claude to use resources for discovery
  };
});
```

**Token Savings:**
- resources/list: ~200 tokens (3 categories vs 66 tools)
- resources/read: ~800 tokens per category (only when needed)
- **Total for typical task:** 200-1,000 tokens (vs 6,000 currently)

---

### Option 2: Custom Search Tool (Alternative)

Add a `search_tools` MCP tool with detail levels:

```typescript
// src/router/tools/search-tools.ts

export const searchToolsTool = {
  name: 'search_tools',
  description: 'Search available MCP tools by keyword or category',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (e.g., "google ads campaigns")'
      },
      category: {
        type: 'string',
        enum: ['google-search-console', 'google-ads', 'google-analytics', 'all'],
        description: 'Filter by platform category'
      },
      detail: {
        type: 'string',
        enum: ['name_only', 'with_description', 'full_schema'],
        default: 'name_only',
        description: 'Level of detail to return'
      }
    },
    required: ['query']
  },
  async handler(input: any) {
    const { query, category, detail = 'name_only' } = input;

    // Search through tool metadata
    const results = await registry.searchTools(query, category);

    // Return based on detail level
    switch (detail) {
      case 'name_only':
        return {
          tools: results.map(t => t.name)  // ~10 tokens per tool
        };

      case 'with_description':
        return {
          tools: results.map(t => ({
            name: t.name,
            description: t.description
          }))  // ~50 tokens per tool
        };

      case 'full_schema':
        return {
          tools: results  // ~500 tokens per tool
        };
    }
  }
};

// Register as regular MCP tool
server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
  return {
    tools: [searchToolsTool]  // Only expose search tool
  };
});
```

**Usage Example:**
```typescript
// Step 1: Search by name only
→ search_tools({ query: "google ads campaigns", detail: "name_only" })
← ["google__list_campaigns", "google__get_campaign_performance"]
  Cost: ~50 tokens

// Step 2: Get full schema for specific tool
→ search_tools({
    query: "google__list_campaigns",
    detail: "full_schema"
  })
← Full tool definition with inputSchema
  Cost: ~200 tokens

// Step 3: Use the tool
→ google__list_campaigns({ customerId: "123" })
```

**Token Savings:**
- Initial load: 1 tool (search_tools) = ~100 tokens
- Typical search: 50-200 tokens
- **Total per task:** 150-300 tokens (vs 6,000 currently)

---

### Option 3: Lazy Loading Registry (Hybrid)

Modify the registry to NOT fetch tools at startup:

```typescript
// src/router/backend-registry.ts

export class BackendRegistry {
  private backends: Map<string, BackendConfig> = new Map();
  private toolCache: Map<string, PrefixedTool> = new Map();
  private categoryCache: Map<string, boolean> = new Map();  // Track loaded categories

  /**
   * Register backend but DON'T fetch tools yet
   */
  registerBackend(config: BackendConfig): void {
    logger.info(`Registering backend: ${config.name} (lazy mode)`);
    this.backends.set(config.name, config);
    // ❌ Don't call refreshBackendTools here
  }

  /**
   * Lazy load tools from a specific backend category
   */
  async getToolsByCategory(backendName: string, category: string): Promise<PrefixedTool[]> {
    const cacheKey = `${backendName}:${category}`;

    // Check if already loaded
    if (this.categoryCache.get(cacheKey)) {
      return this.getAllTools().filter(t =>
        t._backend === backendName &&
        t._category === category
      );
    }

    // Fetch on-demand
    logger.info(`Lazy loading tools for ${cacheKey}`);
    await this.refreshBackendCategory(backendName, category);
    this.categoryCache.set(cacheKey, true);

    return this.getAllTools().filter(t =>
      t._backend === backendName &&
      t._category === category
    );
  }
}

// src/router/server.ts

async function initializeRouter() {
  const registry = new BackendRegistry();

  // Register backends
  for (const config of backendConfigs) {
    registry.registerBackend(config);
  }

  // ✅ DON'T call refreshAllTools() here!
  // Tools will be loaded on-demand via resources/read

  logger.info('Router initialized (lazy loading enabled)');

  return { server, registry };
}
```

---

## Recommended Implementation Plan

### Phase 1: Quick Win (1-2 days)
**Goal:** Stop loading all tools at startup

1. ✅ Modify `initializeRouter()` to skip `refreshAllTools()`
2. ✅ Make `tools/list` return empty array or search tool only
3. ✅ Add basic resources support (list 3-5 categories)
4. ✅ Add `resources/read` to fetch tools on-demand

**Result:** Immediate 95%+ reduction in initial context load

### Phase 2: Full Progressive Disclosure (3-5 days)
**Goal:** Implement Anthropic's recommended pattern

1. ✅ Add detail levels (name_only, with_description, full_schema)
2. ✅ Implement search capability
3. ✅ Add category-based resource URIs
4. ✅ Lazy load tools only when accessed

**Result:** Near-zero initial context, tools loaded as needed

### Phase 3: Optimization (1-2 days)
**Goal:** Fine-tune performance

1. ✅ Cache loaded tool definitions
2. ✅ Implement LRU eviction
3. ✅ Add telemetry (track which tools loaded)
4. ✅ Optimize search algorithms

**Result:** Fast responses with minimal memory

---

## Comparison Matrix

| Metric | Current | After Phase 1 | After Phase 2 | Anthropic Target |
|--------|---------|---------------|---------------|------------------|
| Initial load | ALL 66 tools | 0 tools | 0 tools | 0 tools |
| Initial tokens | 6,000 | ~200 (categories) | ~100 (search tool) | ~2,000 |
| Per-task tokens | 0 (pre-loaded) | ~800 (one category) | ~250 (specific tools) | ~500 |
| Total for task | 6,000 | ~1,000 | ~350 | ~2,000 |
| **Improvement** | Baseline | **83% better** | **94% better** | **97% better** |

---

## Code Changes Required

### 1. src/router/server.ts
```diff
async function initializeRouter() {
  const registry = new BackendRegistry();

  for (const config of backendConfigs) {
    registry.registerBackend(config);
  }

- // Refresh tools from all active backends
- await registry.refreshAllTools();
+ // Don't load tools at startup - use lazy loading instead
+ logger.info('Router initialized (lazy loading enabled)');

  const server = new Server({
    name: 'wpp-marketing-router',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: { listChanged: true },
+     resources: {}  // Add resources capability
    },
  });

+ // Add resources/list handler
+ server.setRequestHandler(ListResourcesRequestSchema, async () => {
+   return { resources: generateResourceList() };
+ });
+
+ // Add resources/read handler
+ server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
+   return await loadToolsForResource(request.params.uri, registry);
+ });

  // Modify tools/list to return empty or search tool only
  server.setRequestHandler(ListToolsRequestSchema, async () => {
-   const tools = registry.getAllTools();
-   return { tools: cleanTools };
+   return { tools: [] };  // Force use of resources
  });
}
```

### 2. src/router/backend-registry.ts
```diff
export class BackendRegistry {
+ private categoryCache: Map<string, boolean> = new Map();

  registerBackend(config: BackendConfig): void {
    this.backends.set(config.name, config);
-   if (config.active) {
-     this.refreshBackendTools(config.name);
-   }
+   // Don't fetch tools here - lazy load on demand
  }

+ async getToolsByCategory(backend: string, category: string) {
+   const key = `${backend}:${category}`;
+   if (!this.categoryCache.get(key)) {
+     await this.refreshBackendCategory(backend, category);
+     this.categoryCache.set(key, true);
+   }
+   return this.filterToolsByCategory(backend, category);
+ }
}
```

---

## Testing Plan

### Test 1: Verify Zero Initial Load
```bash
# Before changes
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router
# Should return: 66 tools (6,000 tokens)

# After changes
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev:router
# Should return: 0 tools or 1 search tool (~100 tokens)
```

### Test 2: Verify On-Demand Loading
```bash
# Request resources list
echo '{"jsonrpc":"2.0","id":1,"method":"resources/list"}' | npm run dev:router
# Should return: 3-5 resource categories (~200 tokens)

# Read specific resource
echo '{"jsonrpc":"2.0","id":2,"method":"resources/read","params":{"uri":"tool://google/ads"}}' | npm run dev:router
# Should return: Only Google Ads tools (~800 tokens)
```

### Test 3: Verify Tools Work
```bash
# After loading Google Ads resource, call a tool
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"google__list_campaigns","arguments":{}}}' | npm run dev:router
# Should work normally
```

---

## Expected Results

### Before Changes
```
Claude CLI startup:
- Connect to MCP → 0ms
- Call tools/list → 100ms
- Receive 66 tools → 6,000 tokens loaded
- Ready to work → 6,000 tokens consumed
```

### After Phase 1
```
Claude CLI startup:
- Connect to MCP → 0ms
- Call tools/list → 50ms
- Receive 0 tools → 0 tokens loaded
- Call resources/list → 50ms
- Receive 3 categories → 200 tokens loaded
- Ready to work → 200 tokens consumed

First tool use:
- Call resources/read(uri="tool://google/ads") → 100ms
- Receive 25 Google Ads tools → 800 tokens loaded
- Call google__list_campaigns → works
- Total: 1,000 tokens for complete task
```

### After Phase 2
```
Claude CLI startup:
- Connect to MCP → 0ms
- Call tools/list → 50ms
- Receive 1 tool (search_tools) → 100 tokens loaded
- Ready to work → 100 tokens consumed

First tool use:
- Call search_tools("google ads campaigns", "name_only") → 50ms
- Receive 2 tool names → 50 tokens
- Call search_tools("google__list_campaigns", "full_schema") → 50ms
- Receive 1 full tool def → 200 tokens
- Call google__list_campaigns → works
- Total: 350 tokens for complete task (94% reduction!)
```

---

## Impact on Future Expansion

### Current Approach (Load Everything)
```
Platforms: 5 (Google, Meta, Amazon, Microsoft, TikTok)
Tools: 300+ total
Initial load: 300 × 100 tokens = 30,000 tokens
Problem: Exceeds reasonable context limits
```

### With Progressive Disclosure
```
Platforms: 5
Tools: 300+ total
Initial load: 5 categories × 40 tokens = 200 tokens
Per-task load: ~300-500 tokens
Result: Scales to unlimited platforms! ✅
```

---

## Next Steps

**Priority:** HIGH - This directly addresses your goal

**Recommended Order:**
1. Start with Phase 1 (resources pattern) - 1-2 days
2. Test with Claude CLI
3. Measure token usage improvement
4. Move to Phase 2 if needed

**Shall I implement Phase 1 now?** This will:
- ✅ Stop loading all tools at startup
- ✅ Add resources/list and resources/read handlers
- ✅ Make tools/list return empty
- ✅ Enable lazy loading on-demand

**Estimated effort:** 2-3 hours
**Expected improvement:** 95%+ reduction in initial context load

---

**Document Version:** 1.0
**Date:** November 5, 2025
**Status:** Ready for implementation
