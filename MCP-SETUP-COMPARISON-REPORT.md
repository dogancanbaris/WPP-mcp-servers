# MCP Server Setup Comparison Report
## WPP Digital Marketing vs Anthropic Best Practices

**Date:** November 5, 2025
**Reference:** https://www.anthropic.com/engineering/code-execution-with-mcp
**Status:** Architecture Review & Recommendations

---

## Executive Summary

### ✅ What We're Doing Well

1. **Progressive Disclosure (94% Token Reduction)** - Our router architecture achieves similar goals to Anthropic's filesystem-based approach
2. **Interactive Workflows** - We've implemented guided parameter discovery and multi-step workflows
3. **Approval System** - We have approval enforcement for write operations with dry-run previews
4. **Modular Architecture** - Clean separation between router and backends

### ⚠️ What We're Missing

1. **Secure Execution Environment** - No sandboxing, resource limits, or isolation
2. **Data Filtering & Transformation** - We don't pre-process large datasets before exposing to Claude
3. **Privacy-Preserving Operations** - No PII tokenization or intermediate result containment
4. **Filesystem-Based State Persistence** - Limited skill development capabilities
5. **Resource Limits** - No monitoring of memory, CPU, or API quota usage

### 🎯 Risk Assessment

**Current Risk Level:** Medium-High for production deployment

**Safe for:**
- ✅ Development and personal testing
- ✅ Read-only operations
- ✅ Single-user supervised usage

**NOT safe for:**
- ❌ Unattended client account access
- ❌ Bulk operations on large datasets
- ❌ Multi-tenant production without sandboxing

---

## Detailed Comparison

### 1. Progressive Disclosure & Tool Discovery

#### Anthropic Recommends:
- Filesystem-based tool organization (`./servers/` directory structure)
- Models read tool definitions on-demand (not all upfront)
- Optional search mechanisms for tool discovery
- Load detailed definitions only when needed

#### Our Implementation: ✅ EXCELLENT

**Router + Backend Architecture:**
```
Client (Claude Code CLI)
    ↓ stdio
MCP Router (~6K tokens)
    ↓ HTTP
Google Backend Server (~50K tokens, port 3100)
```

**Token Optimization:**
- Before: 104,000 tokens loaded at connection (monolithic)
- After: 6,000 tokens loaded at connection (router)
- **Savings: 94% reduction**

**How We Achieve It:**
```typescript
// src/router/backend-registry.ts:21-31
function extractMinimalDescription(description: string): string {
  // Extract first line only (strip verbose guidance)
  const firstLine = description.split('\n')[0].trim();
  const withoutEmoji = firstLine.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '');
  return withoutEmoji || firstLine;
}
```

**Example:**
- Router sees: `"Query Google Search Console for traffic data"`
- Backend has: Full 30-line description with agent guidance
- Guidance injected only when tool is called

**Assessment:** ✅ We match Anthropic's intent through different architecture

---

### 2. Data Filtering & Transformation

#### Anthropic Recommends:
- Process large datasets in execution environment BEFORE exposing to model
- Filter 10,000 spreadsheet rows down to relevant records locally
- Return only filtered, summarized results to Claude
- Keep raw data out of Claude's context

#### Our Implementation: ⚠️ GAPS IDENTIFIED

**Current Approach:**
```typescript
// Example: src/gsc/tools/analytics.ts
async function querySearchAnalytics(input) {
  const auth = createOAuthClient(tokens);
  const result = await webmasters.searchanalytics.query({
    auth,
    siteUrl: input.property,
    requestBody: {
      startDate: input.startDate,
      endDate: input.endDate,
      dimensions: ['query', 'page', 'device', 'country'],
      rowLimit: 25000 // ⚠️ Potential issue!
    }
  });

  return result.data; // ⚠️ Returns ALL data to Claude
}
```

**Problems:**
1. ❌ No pre-filtering before returning to Claude
2. ❌ Can return 25,000 rows directly to client
3. ❌ No aggregation or summarization in execution environment
4. ❌ Raw API responses passed through

**Example Impact:**
```
Query: "Show me GSC data for last 90 days"
Result: 25,000 rows × ~200 chars each = 5,000,000 chars
Token cost: ~1,250,000 tokens consumed!
```

**What We Should Do (Anthropic Pattern):**
```typescript
async function querySearchAnalytics(input) {
  // Step 1: Fetch data in execution environment
  const rawData = await fetchGSCData(input); // 25,000 rows

  // Step 2: Filter/aggregate BEFORE exposing to Claude
  const filtered = filterTopPerformers(rawData, { limit: 100 });
  const summary = {
    totalClicks: sum(rawData, 'clicks'),
    totalImpressions: sum(rawData, 'impressions'),
    avgCTR: avg(rawData, 'ctr'),
    topQueries: filtered.slice(0, 20),
    insights: generateInsights(rawData)
  };

  // Step 3: Return only summarized/filtered data
  return {
    summary,
    topPerformers: filtered, // 100 rows instead of 25,000
    rawDataAvailable: true,
    rowsFiltered: rawData.length - filtered.length
  };
}
```

**Assessment:** ⚠️ NEEDS IMPROVEMENT - Critical for production scale

---

### 3. Secure Execution Environment

#### Anthropic Recommends:
- Secure execution environment with sandboxing
- Resource limits (memory, CPU, disk)
- Monitoring and observability
- Isolation between operations

#### Our Implementation: ❌ MISSING

**Current Setup:**
- ❌ No sandboxing (runs directly in Node.js)
- ❌ No memory limits
- ❌ No CPU limits
- ❌ No disk I/O limits
- ❌ No network isolation
- ❌ No timeout enforcement per operation

**Current Architecture:**
```
┌─────────────────────────────────────┐
│  Node.js Process (Unrestricted)    │
│  - Router Server (stdio/HTTP)      │
│  - Backend Servers (HTTP)          │
│  - All tools run in same process   │
│  - Full system access               │
│  - No resource limits               │
└─────────────────────────────────────┘
```

**Risks:**
1. Memory leak in one tool can crash entire server
2. Infinite loop can hang all operations
3. Malformed API response can consume all memory
4. No protection against resource exhaustion
5. No isolation between different users/workspaces

**What We Should Have (Anthropic Pattern):**
```
┌──────────────────────────────────────┐
│  MCP Router (Lightweight)           │
└─────────────┬────────────────────────┘
              │
    ┌─────────┴─────────┐
    │  Sandbox Manager   │
    └─────────┬──────────┘
              │
    ┌─────────┴─────────────────────────┐
    │  Isolated Execution Containers    │
    │                                   │
    │  ┌─────────────┐  ┌─────────────┐│
    │  │  Tool 1     │  │  Tool 2     ││
    │  │  Memory: 1GB│  │  Memory: 1GB││
    │  │  Timeout:30s│  │  Timeout:30s││
    │  │  Network: ✓ │  │  Network: ✓ ││
    │  └─────────────┘  └─────────────┘│
    └───────────────────────────────────┘
```

**Recommended Solutions:**

**Option 1: Docker Containers (Recommended for Production)**
```typescript
// Execute each tool in isolated container
import Docker from 'dockerode';

async function executeToolInContainer(toolName: string, args: any) {
  const docker = new Docker();
  const container = await docker.createContainer({
    Image: 'wpp-tool-executor:latest',
    Cmd: ['node', 'execute-tool.js', toolName, JSON.stringify(args)],
    HostConfig: {
      Memory: 1024 * 1024 * 1024, // 1GB limit
      NanoCpus: 1000000000, // 1 CPU limit
      NetworkMode: 'none', // Disable network (except API calls)
      ReadonlyRootfs: true
    }
  });

  await container.start();
  const result = await waitForCompletion(container, 30000); // 30s timeout
  await container.remove();

  return result;
}
```

**Option 2: Worker Threads (Lighter Alternative)**
```typescript
import { Worker } from 'worker_threads';

async function executeToolInWorker(toolName: string, args: any) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./tool-executor.js', {
      workerData: { toolName, args },
      resourceLimits: {
        maxOldGenerationSizeMb: 1024, // 1GB limit
        maxYoungGenerationSizeMb: 256
      }
    });

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Tool execution timeout'));
    }, 30000);

    worker.on('message', (result) => {
      clearTimeout(timeout);
      resolve(result);
    });

    worker.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
```

**Option 3: VM2 Sandbox (Lightweight)**
```typescript
import { VM } from 'vm2';

async function executeToolInVM(toolName: string, args: any) {
  const vm = new VM({
    timeout: 30000,
    sandbox: {
      fetch: limitedFetch, // Controlled API access
      console: logger
    }
  });

  return vm.run(`
    const tool = require('./tools/${toolName}');
    tool.handler(${JSON.stringify(args)});
  `);
}
```

**Assessment:** ❌ CRITICAL GAP - Must implement for production

---

### 4. Privacy-Preserving Operations

#### Anthropic Recommends:
- Intermediate results stay in execution environment by default
- MCP client can automatically tokenize sensitive PII
- Prevent accidental exposure while data flows between systems
- Keep sensitive data out of Claude's context

#### Our Implementation: ⚠️ PARTIAL

**Current Approach:**
```typescript
// Example: Google Ads account listing
async function listAccessibleAccounts(tokens) {
  const client = createGoogleAdsClient(tokens);
  const accounts = await client.listAccessibleAccounts();

  return {
    accounts: accounts.map(a => ({
      id: a.customerId,          // ⚠️ Customer ID exposed
      name: a.descriptiveName,    // ⚠️ Account name exposed
      currency: a.currencyCode,
      timezone: a.timeZone,
      manager: a.isManagerAccount
    }))
  };
}
```

**Concerns:**
1. ⚠️ Customer IDs exposed to Claude's context
2. ⚠️ Account names may contain client identifiers
3. ⚠️ No PII detection or masking
4. ⚠️ No intermediate result containment

**What We Should Do (Anthropic Pattern):**
```typescript
async function listAccessibleAccounts(tokens) {
  // Step 1: Fetch in execution environment
  const accounts = await fetchAccounts(tokens);

  // Step 2: Tokenize PII (stays in execution environment)
  const tokenMap = new Map();
  const sanitized = accounts.map(a => {
    const token = generateToken(a.customerId);
    tokenMap.set(token, a); // Store mapping server-side

    return {
      token,                         // ✅ Safe token instead of real ID
      displayName: maskPII(a.name),  // ✅ "Client ***45"
      currency: a.currencyCode,
      timezone: a.timeZone
    };
  });

  // Step 3: Store token map server-side
  storeTokenMap(sessionId, tokenMap);

  // Step 4: Return sanitized data to Claude
  return { accounts: sanitized };
}

// When tool needs actual customer ID:
async function getCampaigns(input) {
  const tokenMap = getTokenMap(sessionId);
  const account = tokenMap.get(input.accountToken);
  const realCustomerId = account.customerId; // Resolved server-side

  // Use real ID for API call
  return await fetchCampaigns(realCustomerId);
}
```

**Benefits:**
- ✅ Real customer IDs never in Claude's context
- ✅ Client names masked
- ✅ Tokens can be revoked/rotated
- ✅ Audit trail of token usage

**Assessment:** ⚠️ IMPROVEMENT NEEDED - Important for client data protection

---

### 5. State Persistence & Skill Development

#### Anthropic Recommends:
- Leverage filesystem access to maintain progress across operations
- Develop reusable agent skills
- Store intermediate results for chaining operations
- Build up knowledge base over time

#### Our Implementation: ⚠️ PARTIAL

**What We Have:**
```typescript
// src/shared/snapshot-manager.ts
export class SnapshotManager {
  async captureSnapshot(operation: string, state: any) {
    // Captures state before operations
    // Enables rollback
  }
}

// src/shared/change-history.ts
export class ChangeHistory {
  // Audit logging of all operations
  // Tracks who did what, when
}
```

**What We're Missing:**
1. ❌ No filesystem-based skill persistence
2. ❌ No reusable workflow storage
3. ❌ No intermediate result caching between operations
4. ❌ No learned patterns or optimizations
5. ❌ No agent skill library

**What We Should Add (Anthropic Pattern):**
```typescript
// ~/.wpp-mcp/skills/
interface SkillDefinition {
  name: string;
  description: string;
  workflow: Step[];
  learnedFrom: string[];
  successRate: number;
  lastUsed: Date;
}

// Example skill: "Optimize Low-CTR Campaigns"
const optimizeLowCTRSkill: SkillDefinition = {
  name: 'optimize_low_ctr_campaigns',
  description: 'Identifies and optimizes campaigns with CTR below 2%',
  workflow: [
    { tool: 'google__list_campaigns', args: {} },
    { tool: 'google__get_campaign_performance', filter: 'ctr < 0.02' },
    { tool: 'google__get_search_terms', analyze: 'low_performers' },
    { tool: 'google__add_negative_keywords', target: 'low_ctr_terms' }
  ],
  learnedFrom: ['session-2025-10-15', 'session-2025-10-22'],
  successRate: 0.87,
  lastUsed: new Date('2025-10-30')
};

// Store in filesystem
fs.writeFileSync(
  '~/.wpp-mcp/skills/optimize_low_ctr_campaigns.json',
  JSON.stringify(optimizeLowCTRSkill)
);

// Agent can discover and reuse
async function discoverSkills(query: string) {
  const skills = loadSkillsFromFilesystem();
  return skills.filter(s => matchesIntent(s, query));
}
```

**Benefits:**
- ✅ Agents learn from successful operations
- ✅ Reusable workflows across sessions
- ✅ Faster execution of common tasks
- ✅ Knowledge accumulation over time

**Assessment:** ⚠️ OPPORTUNITY FOR ENHANCEMENT - Not critical but valuable

---

### 6. Resource Limits & Monitoring

#### Anthropic Recommends:
- Resource limits (memory, CPU, network)
- Monitoring and observability
- Track usage patterns
- Prevent resource exhaustion

#### Our Implementation: ❌ MISSING

**Current State:**
```typescript
// No resource limits at all
// No monitoring dashboards
// No usage tracking
// No quota enforcement
```

**What We Should Have:**

**A. Resource Limits Per Tool:**
```typescript
interface ToolResourceLimits {
  maxMemoryMB: number;
  maxExecutionTime: number;
  maxAPICallsPerMinute: number;
  maxConcurrentExecutions: number;
}

const limits: Record<string, ToolResourceLimits> = {
  'google__query_search_analytics': {
    maxMemoryMB: 512,
    maxExecutionTime: 30000,
    maxAPICallsPerMinute: 10,
    maxConcurrentExecutions: 3
  },
  'google__list_campaigns': {
    maxMemoryMB: 256,
    maxExecutionTime: 15000,
    maxAPICallsPerMinute: 20,
    maxConcurrentExecutions: 5
  }
};
```

**B. Monitoring & Alerts:**
```typescript
interface ToolExecutionMetrics {
  toolName: string;
  executionTime: number;
  memoryUsed: number;
  apiCallsMade: number;
  errorRate: number;
  lastHourExecutions: number;
}

// Alert if:
// - Tool exceeds memory limit
// - Execution time > 30s
// - Error rate > 10%
// - API quota near exhaustion
```

**C. Usage Dashboard:**
```
Tool Performance Dashboard:
┌──────────────────────────────────────┐
│ query_search_analytics               │
│ Executions: 1,247                    │
│ Avg Time: 2.3s                       │
│ Memory: 128 MB avg, 512 MB max       │
│ Success Rate: 98.2%                  │
│ API Quota Used: 12,470 / 25,000     │
└──────────────────────────────────────┘
```

**Assessment:** ❌ CRITICAL FOR PRODUCTION - Must implement monitoring

---

## Priority Recommendations

### P0 - Critical (Must Have Before Production)

1. **Implement Data Filtering & Transformation** (1-2 weeks)
   - Pre-process large API responses before returning to Claude
   - Aggregate/summarize data in execution environment
   - Return top N results instead of full datasets
   - Add pagination support for large datasets

2. **Add Resource Limits** (1 week)
   - Memory limits per tool execution
   - Timeout enforcement (30s max per tool)
   - Rate limiting (API calls per minute)
   - Concurrent execution limits

3. **Basic Monitoring** (3-5 days)
   - Execution time tracking
   - Memory usage tracking
   - Error rate monitoring
   - Alert on anomalies

### P1 - High Priority (Recommended for Production)

4. **Sandboxing with Worker Threads** (2 weeks)
   - Isolate tool execution in worker threads
   - Resource limits per worker
   - Graceful timeout handling
   - Worker pool management

5. **PII Tokenization** (1 week)
   - Detect and mask customer IDs
   - Tokenize account identifiers
   - Server-side token mapping
   - Secure token storage

6. **Enhanced Audit Logging** (3-5 days)
   - Log data volumes processed
   - Track token usage per operation
   - Record API quota consumption
   - Compliance reporting

### P2 - Nice to Have (Future Enhancement)

7. **Filesystem-Based Skills** (2-3 weeks)
   - Skill definition format
   - Automatic skill discovery
   - Workflow persistence
   - Success rate tracking

8. **Docker Containerization** (3-4 weeks)
   - Full process isolation
   - Network-level security
   - Resource guarantees
   - Production-grade deployment

---

## Implementation Roadmap

### Week 1-2: Data Filtering & Resource Limits
```typescript
// src/shared/data-filter.ts
export class DataFilter {
  static summarizeGSCData(raw: any[], limit: number = 100) {
    return {
      summary: calculateSummary(raw),
      topPerformers: raw.slice(0, limit),
      totalRows: raw.length,
      filtered: true
    };
  }
}

// src/shared/resource-limiter.ts
export class ResourceLimiter {
  static async executeWithLimits(fn: Function, limits: ResourceLimits) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), limits.maxExecutionTime);

    try {
      return await fn();
    } finally {
      clearTimeout(timeout);
    }
  }
}
```

### Week 3: Monitoring & Alerts
```typescript
// src/shared/metrics-collector.ts
export class MetricsCollector {
  static recordExecution(toolName: string, metrics: ExecutionMetrics) {
    // Store in time-series database
    // Generate alerts if thresholds exceeded
  }

  static async getToolMetrics(toolName: string, timeRange: string) {
    // Return aggregated metrics
  }
}
```

### Week 4-5: Worker Thread Sandboxing
```typescript
// src/shared/tool-executor.ts
export class ToolExecutor {
  private workerPool: WorkerPool;

  async execute(toolName: string, args: any): Promise<any> {
    const worker = await this.workerPool.acquire();
    try {
      return await worker.execute(toolName, args, {
        timeout: 30000,
        maxMemory: 512 * 1024 * 1024
      });
    } finally {
      this.workerPool.release(worker);
    }
  }
}
```

---

## Comparison Matrix

| Feature | Anthropic Recommends | Our Implementation | Priority | Effort |
|---------|---------------------|-------------------|----------|--------|
| Progressive Disclosure | ✅ On-demand loading | ✅ Router + Backends (94% reduction) | - | Complete |
| Data Filtering | ✅ Pre-process in execution env | ❌ Return raw API data | P0 | 2 weeks |
| Secure Execution | ✅ Sandboxing + resource limits | ❌ No isolation | P0 | 2 weeks |
| Privacy (PII) | ✅ Tokenization | ⚠️ Partial | P1 | 1 week |
| State Persistence | ✅ Filesystem skills | ⚠️ Audit logs only | P2 | 3 weeks |
| Resource Monitoring | ✅ Limits + alerts | ❌ None | P0 | 1 week |
| Approval Workflows | Not mentioned | ✅ Dry-run + confirm | - | Complete |
| Interactive Guidance | Not mentioned | ✅ Step-by-step workflows | - | Complete |

---

## Risk Assessment

### Current Risk Level: MEDIUM-HIGH

**Safe For:**
- ✅ Personal testing (your accounts)
- ✅ Development environment
- ✅ Read-only operations
- ✅ Single supervised user

**NOT Safe For:**
- ❌ Unattended production usage
- ❌ Client accounts without supervision
- ❌ Large-scale data operations
- ❌ Multi-tenant deployment

**Critical Gaps:**
1. No data volume protection (can consume 1M+ tokens)
2. No resource limits (can crash server)
3. No execution isolation (one bad tool affects all)
4. Minimal PII protection

---

## Conclusion

### What We're Doing Right ✅

1. **Progressive Disclosure** - Router architecture achieves 94% token reduction
2. **Interactive Workflows** - Better UX than Anthropic's article suggests
3. **Approval System** - Safety features for write operations
4. **Modular Design** - Clean, maintainable architecture

### What We Must Add ⚠️

1. **Data Filtering** (P0) - Pre-process large datasets before exposing to Claude
2. **Resource Limits** (P0) - Memory, timeout, rate limiting
3. **Monitoring** (P0) - Track usage, performance, errors
4. **Sandboxing** (P1) - Isolate tool execution for safety

### Timeline to Production

- **With P0 fixes:** 3-4 weeks → Internal pilot ready
- **With P0 + P1:** 6-8 weeks → Production ready (supervised)
- **With full implementation:** 10-12 weeks → Unsupervised production

### Next Steps

1. Prioritize P0 items (data filtering, resource limits, monitoring)
2. Start with data filtering (biggest immediate risk)
3. Add resource limits concurrently
4. Test with your personal accounts during development
5. Move to internal pilot after P0 complete

---

## References

- **Anthropic Article:** https://www.anthropic.com/engineering/code-execution-with-mcp
- **Our Router Architecture:** `/docs/router-architecture.md`
- **Our Safety Features:** `/docs/safety/PRODUCTION-READINESS.md`
- **Interactive Workflows:** `/docs/SESSION-HANDOVER-interactive-tool-transformation.md`

---

**Document Version:** 1.0
**Last Updated:** November 5, 2025
**Status:** Architecture Review Complete
**Next Action:** Prioritize P0 implementations
