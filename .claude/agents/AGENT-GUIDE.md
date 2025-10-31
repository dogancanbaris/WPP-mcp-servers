# WPP MCP Project - Comprehensive Agent Guide

> ⚠️ **OUTDATED DOCUMENT** - Last updated **2025-10-22** (before Cube.js removal on Oct 2025)
>
> **This guide contains many deprecated references:**
> - ❌ Cube.js semantic layer (removed - see backend-api-specialist.md for current architecture)
> - ❌ Metabase/Superset (never implemented)
> - ❌ Old agent descriptions (see individual agent files in `.claude/agents/` for current specs)
>
> **For Current Agent Usage:**
> - See individual agent markdown files: `backend-api-specialist.md`, `frontend-developer.md`, etc.
> - See `claude.md` in root for current tech stack
> - See `wpp-analytics-platform/DATA-LAYER-ARCHITECTURE.md` for dataset-based architecture

**Last Updated:** 2025-10-22 (BEFORE major architecture changes)
**Agent System Version:** 1.0
**Total Agents:** 6 (5 specialists + 1 coordinator)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Agent Overview](#agent-overview)
3. [When to Use Which Agent](#when-to-use-which-agent)
4. [Parallel Execution Patterns](#parallel-execution-patterns)
5. [Complete Workflow Examples](#complete-workflow-examples)
6. [Safety System Integration](#safety-system-integration)
7. [Best Practices](#best-practices)
8. [Common Scenarios](#common-scenarios)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Available Agents

**Specialist Agents (Use directly for focused tasks):**
1. **frontend-developer** - React, dashboards, Cube.js, visualization
2. **backend-api-specialist** - MCP tools, Google APIs, business logic
3. **auth-security-specialist** - OAuth, RLS policies, JWT, security
4. **database-analytics-architect** - BigQuery, Cube.js models, SQL, ETL
5. **devops-infrastructure-specialist** - AWS, Docker, CI/CD, monitoring


### How to Use Agents

**Option 1: Direct Agent Use**
```
User: "Create a line chart showing daily Google Ads spend"

Main Claude: "I'll use the frontend-developer agent for this..."
[Launches frontend-developer agent]

frontend-developer: Creates chart component with Cube.js integration
```

## Agent Overview

### 1. Frontend Developer

**Expertise:** React, data visualization, Cube.js semantic layer, BI tools

**Primary Responsibilities:**
- Build React components and dashboards
- Create charts and data visualizations
- Integrate with Cube.js for OLAP queries
- Configure Metabase/Superset dashboards
- Query BigQuery via Cube.js APIs

**When to Use:**
✅ "Create dashboard with performance metrics"
✅ "Build chart showing conversion trends"
✅ "Design Cube.js data model for analytics"
✅ "Configure Metabase dashboard"

**Tools Access:** All 65 MCP tools (trusts 9-layer safety system)

**Context7 Docs:** `/cube-js/cube` for semantic layer patterns

---

### 2. Backend API Specialist

**Expertise:** MCP tool development, Google API integration, business logic

**Primary Responsibilities:**
- Create new MCP tools for 7 Google APIs
- Build API client wrappers
- Implement data transformation logic
- Register tools in MCP server
- Integrate safety features

**When to Use:**
✅ "Add Google Ads conversion tracking tool"
✅ "Create BigQuery data blending tool"
✅ "Fix bug in Analytics reporting"
✅ "Integrate new API (Facebook Ads)"

**Tools Access:** All 65 MCP tools

**Key Files:**
- `src/{api}/tools/` - Tool implementations
- `src/{api}/client.ts` - API wrappers
- `src/gsc/tools/index.ts` - Tool registry

---

### 3. Auth & Security Specialist

**Expertise:** OAuth 2.0, Supabase RLS policies, JWT, multi-tenant security

**Primary Responsibilities:**
- Implement OAuth flows for Google APIs
- Design Row-Level Security policies
- Structure JWT claims for authorization
- Implement two-layer authorization (Google + WPP)
- Handle MFA enforcement (AAL2)

**When to Use:**
✅ "Set up OAuth for new API"
✅ "Create RLS policies for multi-tenant tables"
✅ "Implement MFA for sensitive operations"
✅ "Design department-specific access control"

**Tools Access:** All 65 MCP tools

**Context7 Docs:** `/supabase/supabase` for RLS patterns

**Key Patterns:**
- Multi-tenant isolation via `tenant_id`
- MFA enforcement: `(auth.jwt() ->> 'aal') = 'aal2'`
- Role-based access from JWT `app_metadata`

---

### 4. Database & Analytics Architect

**Expertise:** BigQuery schemas, Cube.js data models, SQL optimization, ETL

**Primary Responsibilities:**
- Design BigQuery schemas for multi-platform data
- Create Cube.js semantic layer (cubes, dimensions, measures)
- Write token-efficient SQL queries (100-400 rows)
- Build ETL pipelines from Google APIs
- Optimize query performance

**When to Use:**
✅ "Design schema for holistic search analysis"
✅ "Create Cube.js model for campaign performance"
✅ "Optimize query returning 50K rows to 400"
✅ "Build data pipeline from Ads to BigQuery"

**Tools Access:** All 65 MCP tools

**Context7 Docs:** `/cube-js/cube` for data modeling

**Key Principles:**
- Aggregate at database level (not frontend)
- Return ≤400 rows for LLM context
- Partition by date, cluster by tenant_id
- Pre-aggregations for speed

---

### 5. DevOps & Infrastructure Specialist

**Expertise:** AWS deployment, Docker, CI/CD, CloudWatch monitoring

**Primary Responsibilities:**
- Deploy MCP servers to AWS ECS Fargate
- Create optimized Docker containers
- Set up CI/CD pipelines
- Configure CloudWatch monitoring
- Manage secrets in AWS Secrets Manager

**When to Use:**
✅ "Deploy MCP server to AWS production"
✅ "Create Docker container for app"
✅ "Set up CloudWatch monitoring"
✅ "Configure CI/CD with GitHub Actions"

**Tools Access:** All 65 MCP tools

**Key Infrastructure:**
- ECS Fargate: 2-10 auto-scaling tasks
- Cost: ~$900/month for 1,000 users
- Monitoring: CloudWatch logs + metrics + alarms

---

### 6. Project Coordinator

**Expertise:** Task orchestration, agent delegation, quality assurance

**Primary Responsibilities:**
- Analyze complex requirements
- Delegate to appropriate specialists
- Coordinate parallel execution (10-100x speedup)
- Integrate work from multiple agents
- Enforce platform standards
- Verify safety system compliance

**When to Use:**
✅ Complex features requiring 3+ specialists
✅ Creating 10+ charts/tools in parallel
✅ End-to-end feature implementation
✅ Production deployment coordination

**Tools Access:** Can launch any specialist agent

**Key Capability:** Parallel execution management

---

## When to Use Which Agent

### Decision Matrix

| Task Type | Agent | Why |
|-----------|-------|-----|
| Create UI component | frontend-developer | React expertise |
| Add MCP tool | backend-api-specialist | Tool creation patterns |
| Set up OAuth | auth-security-specialist | Security expertise |
| Design database schema | database-analytics-architect | Data modeling |
| Deploy to AWS | devops-infrastructure-specialist | Infrastructure |

---

## Parallel Execution Patterns

### Pattern 1: Homogeneous Parallelism

**Same specialist, multiple independent tasks**

**Example: Create 13 Dashboard Charts**
```
project-coordinator launches 13 frontend-developer agents:

Agent 1: Daily spend trend (line chart)
Agent 2: Campaign ROI (bar chart)
Agent 3: Conversion funnel (funnel)
Agent 4: Device breakdown (pie chart)
Agent 5: Geographic heatmap
Agent 6: Hour-of-day performance
Agent 7: Search term word cloud
Agent 8: Quality Score distribution
Agent 9: Landing page performance
Agent 10: Ad copy A/B results
Agent 11: Keyword match analysis
Agent 12: Competitor tracking
Agent 13: Budget utilization gauge

All execute simultaneously. This means you create each task and assign their agent one at a time and do not start them until all tasks have been created and agents assigned. Only then, launch all of them at once.

Sequential time: 13 charts × 2 min = 26 minutes
Parallel time: 2 minutes (all at once)
Speedup: 13x faster
```

### Pattern 2: Heterogeneous Parallelism

**Different specialists, same feature**

**Example: Add Customer Match Upload**
```

backend-api-specialist:
  Create upload_customer_match tool

database-analytics-architect:
  Design customer_data storage table

auth-security-specialist:
  Add PII handling compliance policies

frontend-developer:
  Build upload UI component

All work independently using their domain expertise.

Sequential time: 4 specialists × 10 min = 40 minutes
Parallel time: 12 minutes (with integration)
Speedup: 3.3x faster
```

### Pattern 3: Pipeline Parallelism

**Stages execute with dependencies**

**Example: Process 90 Days of Data**
```
Stage 1 (parallel - no dependencies):
  database-analytics-architect #1: Days 1-30 data
  database-analytics-architect #2: Days 31-60 data
  database-analytics-architect #3: Days 61-90 data

Stage 2 (parallel - depends on Stage 1):
  frontend-developer #1: Chart Days 1-30
  frontend-developer #2: Chart Days 31-60
  frontend-developer #3: Chart Days 61-90

Respects dependencies while maximizing parallelism.
```

### When NOT to Use Parallel Execution

❌ **Tasks with strong dependencies:**
- OAuth setup BEFORE tool creation
- Schema design BEFORE query optimization
- Container build BEFORE AWS deployment

✅ **Use sequential for dependent workflows**

---

## Complete Workflow Examples

### Example 1: Simple Task (Single Agent)

**Request:** "Create a line chart showing daily Google Ads spend"

**Execution:**
```
Main Claude → frontend-developer

frontend-developer:
1. Designs Cube.js query for Google Ads cost by date
2. Creates React component with Recharts line chart
3. Implements date range selector
4. Adds export to CSV functionality
5. Returns complete chart component

Delivery time: ~2 minutes
```

---

### Example 2: Medium Complexity (Coordinator + 3 Specialists)

**Request:** "Add offline conversion tracking from CRM to Google Ads"

**Execution:**
```
Main Claude analyzes:
- Need: Backend tool for conversion upload
- Need: Database for conversion history
- Need: Security compliance for PII

Launches 3 agents in parallel:

backend-api-specialist:
  "Create import_offline_conversions MCP tool
  Input: {customerId, conversions: [{gclid, date, value}]}
  Integrate with Google Ads API
  Add privacy warnings and approval workflow"

database-analytics-architect:
  "Design conversion_history table in BigQuery
  Schema: date, gclid, value, currency, tenant_id
  Partition by date, cluster by tenant_id"

auth-security-specialist:
  "Document PII handling requirements for GCLID storage
  Add compliance policies for data retention"

All complete in parallel (~10 minutes)

Main claude integrates:
- Verifies tool compiles
- Checks safety integration
- Updates documentation
- Creates Linear ticket

Delivery time: ~12 minutes (vs 30 minutes sequential)
```

---

### Example 3: High Complexity (Coordinator + 5 Specialists + 13 Parallel)

**Request:** "Create complete multi-platform analytics dashboard with 13 charts, real-time data updates, and export functionality"

**Execution:**
```
Main Claude breaks down:

Phase 1 (Sequential - Foundation):
  database-analytics-architect:
    "Design Cube.js semantic layer for multi-platform data
    Join: google_ads_data + gsc_data + analytics_data
    Aggregation: By search_term, date, campaign
    Pre-aggregations: Daily rollups for speed"

  Wait for completion... ✅

Phase 2 (Parallel - 13 Charts):
  Launch 13 frontend-developer agents simultaneously:

  Agent 1: Paid vs Organic clicks (line chart)
  Agent 2: Top search terms (bar chart)
  Agent 3: Cost vs Conversions (scatter plot)
  Agent 4: Channel distribution (pie chart)
  Agent 5: Performance by device (stacked bar)
  Agent 6: Geographic heatmap
  Agent 7: Hour-of-day trends
  Agent 8: Funnel analysis
  Agent 9: Quality Score distribution
  Agent 10: Landing page performance
  Agent 11: Keyword match types
  Agent 12: Competitor positions
  Agent 13: Budget utilization

  All 13 complete in parallel (~2 minutes)

Phase 3 (Parallel - Integration Features):
  frontend-developer (additional):
    "Integrate 13 charts into dashboard layout
    Add date range selector
    Add real-time WebSocket updates
    Add export to CSV/PDF functionality"

  auth-security-specialist:
    "Add RLS policies for multi-tenant dashboard access
    Filter by tenant_id from JWT"

Phase 4 (Quality & Deployment):
  devops-infrastructure-specialist:
    "Deploy dashboard to AWS
    Configure CloudWatch monitoring
    Set up auto-scaling"

Total time: ~20 minutes (vs 120+ minutes sequential)
Speedup: 6x faster
```

---

## Safety System Integration

### The 9-Layer Safety System

All agents inherit access to 65 MCP tools. Write operations are automatically protected by:

**1. Account Authorization Manager**
- Two-layer auth: Google OAuth + WPP manager approval
- HMAC signature verification
- Automatic expiration

**2. Approval Workflow Enforcer**
- Preview → Confirm → Execute pattern
- 60-second confirmation tokens
- Financial impact display

**3. Snapshot Manager**
- Rollback capability
- Before/after state capture
- 90-day retention

**4. Financial Impact Calculator**
- Real Google Ads cost tracking
- Daily breakdown during errors
- Baseline comparison

**5. Vagueness Detector**
- Blocks vague requests (score ≥30)
- Forces specificity
- Pattern matching for indefinite references

**6. Pattern Matcher**
- Bulk operation limits (max 20 items)
- Full list display before execution
- Prevents accidental mass operations

**7. Notification System**
- Dual-level notifications (admin + managers)
- Priority-based routing (CRITICAL/HIGH/MEDIUM/LOW)
- Email templates

**8. Change History Integration**
- Google Ads change_event API
- Verifies operations occurred
- Cross-reference with snapshots

**9. Budget Caps & Prohibited Operations**
- >500% budget changes blocked
- Dangerous ops permanently removed
- Configuration-driven rules

### Agent Responsibilities

**Agents DON'T Need to Implement Safety:**
- Safety features are automatic for write operations
- Agents just call tools correctly
- System handles approval, rollback, impact calculation

**Agents DO Need to:**
- Provide comprehensive tool descriptions
- Use Zod validation for inputs
- Log operations appropriately
- Return user-friendly errors

**Example:**
```typescript
// Agent creates tool (backend-api-specialist)
export const updateBudgetTool = {
  name: 'update_budget',
  description: `Update campaign budget.

  **Safety:** Approval required, shows spend impact, creates rollback snapshot.
  `,
  handler: async (input) => {
    // Agent just implements business logic
    const result = await googleAds.updateBudget(...);
    return result;

    // Safety system automatically:
    // - Requested approval before execution
    // - Created snapshot
    // - Calculated financial impact
    // - Logged to audit trail
  }
};
```

---

## Best Practices

### For Main Claude (Delegating to Agents)

✅ **DO:**
- Launch parallel agents for independent tasks
- Provide clear, detailed instructions to agents
- Include context (docs, examples, patterns to follow)
- Specify deliverables and success criteria

❌ **DON'T:**
- Micromanage agent implementation details
- Launch sequential agents when parallel is possible
- Provide vague requirements
- Skip quality verification
- Forget to integrate multi-agent results

### For Agents (Self-Guidance)

✅ **DO:**
- Follow existing patterns in codebase (src/ads/, src/gsc/)
- Use Context7 for latest library documentation
- Integrate with existing skills when appropriate
- Log operations at appropriate levels
- Create comprehensive tool descriptions
- Test code before returning

❌ **DON'T:**
- Reinvent patterns (copy existing tools)
- Hardcode secrets or credentials
- Skip error handling
- Return code without testing
- Ignore platform standards
- Forget multi-tenant isolation

### For project-coordinator

✅ **DO:**
- Analyze requirements thoroughly before delegating
- Launch parallel agents whenever possible
- Provide specialists with complete context
- Integrate and test all agent work
- Enforce platform standards
- Verify safety integration for write ops

❌ **DON'T:**
- Implement code yourself (delegate to specialists)
- Launch sequential when parallel is possible
- Skip quality verification
- Deliver without integration testing
- Ignore compilation errors
- Forget documentation updates

---

## Common Scenarios

### Scenario 1: Add New MCP Tool

**User:** "Add tool for uploading customer data to Google Ads remarketing lists"

**Optimal Flow:**
```
Main Claude → backend-api-specialist (direct, no coordinator needed)

backend-api-specialist:
1. Reviews src/ads/tools/audiences.ts for patterns
2. Uses Context7 for Google Ads Customer Match API docs
3. Creates upload_customer_match_list tool
4. Integrates safety features (privacy warning, approval)
5. Creates Zod validation schema
6. Adds to src/ads/tools/audiences.ts
7. Exports in src/ads/tools/index.ts
8. Creates test file
9. Updates documentation

Result: Complete tool ready for use
```

### Scenario 2: Create Dashboard

**User:** "Create dashboard showing campaign performance across Google Ads, Search Console, and Analytics"

**Optimal Flow:**
```
Main Claude ->

Phase 1: Database Foundation
  database-analytics-architect:
    "Create Cube.js semantic layer joining 3 data sources"

Phase 2: Build Visualizations (Parallel)
  Launch 5 frontend-developer agents:
  - Agent 1: Multi-channel performance table
  - Agent 2: Paid vs organic trend line
  - Agent 3: Conversion funnel chart
  - Agent 4: Geographic breakdown
  - Agent 5: Device performance comparison

Phase 3: Integration
  frontend-developer:
    "Combine 5 charts into dashboard with filters"

Result: Complete multi-platform dashboard
```

### Scenario 3: Deploy to Production

**User:** "Deploy complete system to AWS"

**Optimal Flow:**
```
Main Claude:

Pre-deployment:
  Use deployment-readiness-checker skill
  Verify: 0 errors, tests pass, safety complete, docs current

Sequential Deployment:
  1. devops-infrastructure-specialist: Create Docker image
  2. devops-infrastructure-specialist: Set up AWS infrastructure
  3. auth-security-specialist + devops: Configure Secrets Manager
  4. devops-infrastructure-specialist: Deploy to ECS
  5. devops-infrastructure-specialist: Set up monitoring
  6. devops-infrastructure-specialist: Verify and test

Result: Production deployment complete with monitoring
```

### Scenario 4: Optimize Performance

**User:** "This BigQuery query returns 50,000 rows and crashes the frontend. Fix it."

**Optimal Flow:**
```
Main Claude → database-analytics-architect (direct, single specialist)

database-analytics-architect:
1. Analyzes current query
2. Identifies: Returning raw data without aggregation
3. Redesigns query:
   - Aggregates at SQL level
   - Groups by key dimensions
   - Orders by importance
   - Limits to top 100 results
4. Creates pre-aggregation in Cube.js for future speed
5. Tests: Query now returns 100 rows in <1 second

Result: Frontend works, queries are fast
```

### Scenario 5: Security Audit

**User:** "Add multi-tenant RLS policies to new tables"

**Optimal Flow:**
```
Main Claude → auth-security-specialist (direct, security focus)

auth-security-specialist:
1. Reviews new tables needing RLS
2. Creates restrictive policies for tenant_id isolation
3. Adds permissive policies for role-based access
4. Implements MFA enforcement for sensitive tables
5. Creates indexes on RLS filter columns
6. Tests policies with various user scenarios
7. Documents in security audit docs

Result: Multi-tenant isolation enforced at database level
```

---

## Troubleshooting

### Agent Returns Error

**Problem:** Specialist agent fails with error message

**Solution:**
1. Read error message carefully
2. Determine if error is recoverable
3. Provide more specific instructions
4. Include missing context or examples
5. Re-launch agent with clarifications

**Example:**
```
frontend-developer error: "Cannot find Cube.js model 'Campaigns'"

Fix: Launch database-analytics-architect first to create model
Then re-launch frontend-developer
```

### Compilation Errors

**Problem:** Agent returns code that doesn't compile

**Solution:**
1. Run `npm run build` to see errors
2. Identify missing imports, type errors
3. Launch backend-api-specialist to fix
4. Verify: `npm run build` succeeds

### Missing Safety Integration

**Problem:** Write operation tool missing safety features

**Solution:**
1. Use safety-audit-reviewer skill
2. Identify missing layers (1-9)
3. Launch backend-api-specialist to add
4. Reference: docs/guides/INTEGRATION-GUIDE.md

### Parallel Agents Conflict

**Problem:** Multiple agents modify same file simultaneously

**Solution:**
- DON'T run parallel agents on same file
- Coordinate via project-coordinator
- Sequential edits to same file
- Parallel edits to different files

---

## Key Metrics

### Performance Improvements

**Parallel Execution Speedups:**
- 13 charts: 13x faster (2 min vs 26 min)
- 10 tools: 10x faster (5 min vs 50 min)
- 5-specialist feature: 3-4x faster (12 min vs 40 min)

**Cost Savings:**
- Sonnet 4.5 for all agents = consistent quality, lower cost than Opus
- Context-efficient (agents focus on domain)
- Reuse patterns (no reinvention)

### Quality Metrics

✅ 0 compilation errors (strict TypeScript)
✅ 100% safety integration for write operations
✅ All tests passing
✅ Documentation complete
✅ Platform standards compliance
✅ Multi-tenant isolation verified

---

## Additional Resources

### Agent Files
- `.claude/agents/frontend-developer.md`
- `.claude/agents/backend-api-specialist.md`
- `.claude/agents/auth-security-specialist.md`
- `.claude/agents/database-analytics-architect.md`
- `.claude/agents/devops-infrastructure-specialist.md`
- `.claude/agents/project-coordinator.md`

### Project Documentation
- `docs/architecture/CLAUDE.md` - System architecture
- `docs/architecture/PROJECT-BACKBONE.md` - Complete workflows
- `docs/safety/SAFETY-AUDIT.md` - Safety requirements
- `docs/guides/INTEGRATION-GUIDE.md` - Safety integration
- `.claude/skills/project-organization/` - File structure

### External Resources (via Context7)
- Cube.js: `/cube-js/cube` - Semantic layer
- Supabase: `/supabase/supabase` - RLS patterns

---

## Summary

### Agent Capabilities

**6 Total Agents:**
- 5 domain specialists (frontend, backend, auth, database, devops)
- 1 project coordinator (orchestration & quality)

**All agents:**
- Use Sonnet 4.5 (consistent quality)
- Have access to all 65 MCP tools
- Trust 9-layer safety system
- Reference Context7 for latest docs
- Follow platform standards
- Can work in parallel

**Key Innovation:**
- 10-100x speedup via parallel execution
- Specialist expertise per domain
- Coordinator handles complexity
- Safety automatic for write operations

### When to Use This System

✅ **Perfect For:**
- Complex multi-step features
- Bulk operations (10+ charts/tools)
- Full-stack development
- Production deployments
- Platform-wide changes

✅ **Also Works For:**
- Simple single-agent tasks
- Quick prototyping
- Bug fixes
- Documentation updates

**Result:** Efficient, high-quality development with built-in safety for 1,000+ user platform.

---

**Last Updated:** 2025-10-22
**Maintained By:** WPP MCP Project Team
**Questions?** See individual agent files for detailed instructions
