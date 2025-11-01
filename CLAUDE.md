# WPP Marketing Analytics Platform

**Fully Agent-Driven Analytics - Zero-Touch for Practitioners**

**Version:** 2.1 (Router Architecture + Interactive Workflows)
**Last Updated:** October 31, 2025
**Status:** Production-Ready Router + Backend Servers + Frontend (Phase 4.7 in progress)

---

## ⚠️ CRITICAL - PORT MANAGEMENT RULES (NEVER CHANGE THESE!)

**FIXED PORT ASSIGNMENTS:**
- **Port 3000** → Reporting Platform Frontend (Next.js)
  - Required for OAuth callbacks
  - Platform URL: http://localhost:3000

- **Port 3001** → MCP HTTP Server (Legacy - when not using router)
  - HTTP transport for MCP tools
  - Admin API endpoint

- **Port 3100** → Google Marketing Backend (Router Architecture)
  - HTTP backend for all Google tools (102 tools)
  - Called by MCP router
  - Start with: `npm run dev:google-backend`

**If a port shows "in use":**
1. Check what's running: `lsof -i :3000` or `lsof -i :3001`
2. Kill the conflicting process
3. Run: `bash restart-dev-servers.sh` (restarts both services on correct ports)
4. Verify: `bash check-services.sh`

**NEVER allow Next.js to auto-increment to port 3001** - it breaks the MCP server!

📖 **Complete port documentation:** [.claude/PORT_MANAGEMENT.md](./.claude/PORT_MANAGEMENT.md)

---

## 📖 IMPORTANT: Complete Project Blueprint Available

**🎯 For complete technical specifications, architecture details, and all platform integration decisions, see:**

**→ [PROJECT-BLUEPRINT.md](./PROJECT-BLUEPRINT.md) (2,427 lines - SINGLE SOURCE OF TRUTH)**

**What's in the blueprint:**
- Complete system architecture (all 5 components)
- Platform integration strategies (14 platforms)
- Data flow diagrams (bootstrap, refresh, query)
- BigQuery shared table design
- OAuth per-request architecture
- Bootstrap subsystem (background data loading)
- Daily refresh system (Cloud Function)
- Deployment guide (dev + production)
- Cost projections (100 users, 1000 users)
- **Platform Master Table** (transfer service vs API, limits, strategies)

**When to read it:**
- ✅ Starting new session → Read Part 1 + Part 2 (architecture overview)
- ✅ Making platform decisions → Read Part 9 (Platform Master Table)
- ✅ Implementing features → Read relevant component sections
- ✅ Unsure about design → Check "Key Design Decisions Summary"

**This file (claude.md) is the quick reference. PROJECT-BLUEPRINT.md is the complete manual.**

---

## 📋 Quick Reference Card

| Component | Status | Tech | Tools/Charts |
|-----------|--------|------|--------------|
| **MCP Server** | ✅ Production | Router + HTTP Backends | 102 tools (94% token reduction via router) |
| **OAuth System** | ✅ Production | Per-request OAuth 2.0 | 100% user credentials, auto-refresh |
| **BigQuery Lake** | 🚧 Phase 4.7 | Shared tables + workspace_id | On-demand pull + daily refresh |
| **Frontend Platform** | ✅ 95% Complete | Next.js 15 + React 19 | 32 chart types (ALL migrated with filters) |
| **Dashboard Tools** | ✅ Production | 9 MCP tools | Create, Read, Update, List, Delete, Analyze, Push Data |

**Current Priority:** #1 CRITICAL - Phase 4.7 (BigQuery Data Lake)

**📘 For complete details → See [PROJECT-BLUEPRINT.md](./PROJECT-BLUEPRINT.md)**

---

## 🎯 The Vision: 100% Agent-Driven Analytics

### What This Platform Does

**Practitioners** work with **AI agents** who handle ALL technical complexity:

**Practitioner Journey:**
1. Login to OMA Platform → Select AI agent (Claude/GPT)
2. Connect Google Account via OAuth (one-time, one click)
3. Ask in natural language: "Show GSC performance for client1.com, last 90 days"
4. Wait 30-60 seconds
5. Receive dashboard link
6. View fresh data anytime (today, 30 days later, 2 years later)

**Agent Journey (100% Automated):**
1. Receives practitioner's OAuth token from OMA
2. Checks BigQuery: Does client1.com data exist?
3. If not: Pulls 12 months from GSC API (via practitioner's OAuth)
4. Stores in shared BigQuery table with workspace_id
5. Creates dashboard in reporting platform
6. Sets up daily auto-refresh
7. Returns: "Dashboard ready at [link]"

**Backend Journey (Automatic):**
1. Daily at 2 AM UTC: Pull yesterday's data for all active properties
2. MERGE into shared BigQuery tables
3. All dashboards auto-update with fresh data
4. Practitioners see current data every time they open

---

## 🏗️ The Hotel Concierge Analogy

**WPP MCP Server = 5-Star Hotel with Concierge Service**

**Practitioner = Guest:**
- Checks in (OAuth login)
- Receives keycard (OAuth tokens)
- Tells concierge what they need ("GSC report for client1.com")
- Waits in lobby
- Receives finished product
- **Never sees:** Kitchen, storage room, back office (BigQuery, infrastructure)

**AI Agent = Concierge:**
- Takes guest's keycard
- Uses it to access guest's authorized areas (Google APIs)
- Collects what's needed (data from GSC)
- Prepares product in back office (BigQuery tables, dashboards)
- Delivers finished product
- Guest never manages infrastructure

**Backend = Hotel Operations:**
- Cleaning service (daily data refresh at 2 AM)
- Kitchen restocking (pull fresh data)
- Maintenance (error handling, token rotation)
- **Guest doesn't manage any of this - it's automatic**

---

## 🔑 Core Architecture Principles

### Principle 1: Dashboards Store QUERIES, Not DATA

**Like Looker Studio:**
```
Dashboard Created Today:
  Stores: "SELECT * WHERE date >= CURRENT_DATE - 30"
  NOT: Static data from Oct 1-31, 2025

Opened in 30 Days:
  Executes: "SELECT * WHERE date >= CURRENT_DATE - 30"
  Returns: Oct 28 - Nov 27, 2025 (FRESH DATA)

Opened in 2 Years:
  Executes: Same query
  Returns: 2027 data (ALWAYS CURRENT)
```

**Key:** Dynamic preset evaluation, not static date storage.

### Principle 2: ONE Shared Table Per Platform

**Not This (Expensive):**
```
1,000 practitioners × 100 properties each = 100,000 BigQuery tables
Cost: $50,000/month
Management: Impossible
```

**This (Efficient):**
```
ONE gsc_performance_shared table for ALL practitioners
Rows filtered by workspace_id column
Cost: $50-500/month
Management: Simple
```

**Like Looker Studio:** Shared BigQuery tables with SQL filtering.

### Principle 3: On-Demand Pull + Daily Refresh

**First Dashboard:**
```
Practitioner: Creates dashboard for client1.com
Agent: Checks BigQuery for client1.com data
Result: Not found
Agent: Pulls 12 months via OAuth
Duration: 30-60 seconds (one-time)
Agent: Stores in shared table with workspace_id
Result: Dashboard ready
```

**Daily Refresh (Automatic):**
```
Cloud Scheduler: 2 AM UTC every day
For each active property (queried in last 30 days):
  → Pull yesterday's data only (incremental)
  → MERGE into shared table
  → All dashboards using that property auto-update
Duration: 5-15 min for 1,000 properties
Cost: FREE (within API quotas)
```

**Inactive Properties:**
```
Not queried in 30 days → Pause refresh (save cost)
Next open → Pull missing days, resume refresh
```

### Principle 4: Organic Growth

**BigQuery lake builds over time:**
```
Month 1: 10 practitioners → 15 properties → $18/month
Month 12: 1,000 practitioners → 1,200 properties → $380/month
Month 24: 10,000 practitioners → 8,000 properties → $2,100/month
```

**You only pay for what practitioners actually use!**

### Principle 5: Smart Deduplication

**Same workspace + property = Share data:**
```
Practitioner A creates dashboard for client1.com
  → Pulls data to BigQuery

Practitioner A creates ANOTHER dashboard for client1.com
  → Reuses existing data (instant, no duplicate)
```

**Different workspace + property = Check sharing:**
```
Practitioner A (Workspace Canada) has client1.com
Practitioner B (Workspace Canada) wants client1.com
  → Share data (same workspace)

Practitioner C (Workspace UK) wants client1.com
  → Pull separately (different OAuth access rights)
```

---

## 📊 Complete Platform Coverage

### Platforms Supported

| Platform | Type | Status | Tools | Metrics | Dimensions |
|----------|------|--------|-------|---------|------------|
| **Google Search Console** | Organic | ✅ Production | 8 | 4 | 5 |
| **Google Ads** | Paid | ✅ Production | 60 | 20 (core) | 12 (core) |
| **Google Analytics 4** | Analytics | ✅ Production | 11 | 25 (core) | 20 (core) |
| **Google Business Profile** | Local | ✅ Production | 3 | TBD | TBD |
| **BigQuery** | Data Warehouse | ✅ Production | 3 | N/A | N/A |
| **CrUX (Core Web Vitals)** | Performance | ✅ Production | 5 | N/A | N/A |
| **SERP API** | Rank Tracking | ✅ Production | 1 | N/A | N/A |
| **WPP Analytics Platform** | Dashboard Tools | ✅ Production | 9 | N/A | N/A |
| **Dashboard Tools** | Integration | ✅ Production | 2 | N/A | N/A |
| Bing Ads | Paid | ⏳ Future | TBD | ~18 | ~10 |
| Bing Webmaster | Organic | ⏳ Future | TBD | ~4 | ~5 |
| Amazon Ads | Paid | ⏳ Future | TBD | ~15 | ~8 |
| Meta Ads | Social | ⏳ Future | TBD | ~20 | ~12 |
| TikTok Ads | Social | ⏳ Future | TBD | ~18 | ~10 |

**Total Tools:** 102 tools (9 platforms live, 5 planned)

### Platform Data Specifications

**Google Search Console (Complete):**
- **Metrics:** clicks, impressions, ctr, position (ALL 4)
- **Dimensions:** date, query, page, device, country (ALL 5)
- **Why ALL:** Cost negligible ($0.72/month/1K properties), complete filter flexibility

**Google Ads (Comprehensive - 60 Tools):**
- **Campaigns:** Create, update status, list, pause, configure budget, performance analysis
- **Ad Groups:** Create, update, list, quality score tracking, bid modifiers
- **Keywords:** Add, remove, add negative, remove negative, list, update bid, update match type, set performance parameters, get search terms, remove search term blocklist, generate ideas, get forecasts
- **Ads:** Create, update, list, pause, set bid
- **Budgets:** Create, update, list, set spending controls, configure allocation
- **Bidding:** List strategies, create portfolio, update strategy, set ad group bid, device modifiers, location targeting, demographic targeting, audience targeting, schedule modifiers
- **Labels:** Create, list, remove, apply to campaigns, apply to ad groups, apply to keywords
- **Targeting:** Location, language, demographic, audience, ad schedule
- **Conversions:** List, get details, create, upload clicks, upload adjustments, upload customer match
- **Audiences:** List, create user list, upload customer match data, create lookalike audiences, manage audience segments
- **Accounts:** List accessible accounts, get account details, switch customer
- **Assets:** List assets, upload assets
- **Reporting:** Campaign performance, ad group performance, ad performance, keyword performance, quality score, auction insights, custom reports
- **Metrics (20 core):** clicks, impressions, ctr, cost, conversions, conversion_value, cost_per_conversion, conversion_rate, roas, average_cpc, average_cpm, search_impression_share, search_lost_is_budget, search_lost_is_rank, search_exact_match_is, search_top_impression_share, search_absolute_top_is, engagement_rate, interactions, average_cpv
- **Dimensions (12 core):** date, campaign_name, campaign_id, campaign_type, campaign_status, ad_group_name, ad_group_id, keyword_text, match_type, device, network, ad_group_status

**Google Analytics 4 (Smart Minimum):**
- **Metrics (25 core):** active_users, total_users, new_users, sessions, engaged_sessions, engagement_rate, sessions_per_user, screen_page_views, screen_page_views_per_session, average_session_duration, bounce_rate, event_count, ecommerce_purchases, total_revenue, purchase_revenue, transactions, average_purchase_revenue, items_viewed, items_added_to_cart, cart_to_view_rate, conversions, key_events, event_value, advertiser_ad_cost, advertiser_ad_clicks
- **Dimensions (20 core):** date, session_source, session_medium, session_campaign, session_default_channel_group, first_user_source, first_user_medium, first_user_campaign, page_path, page_title, landing_page, exit_page, device_category, browser, operating_system, platform, country, city, region, event_name
- **Omitted:** Event-level data (too large), user properties, item-level ecommerce (session aggregates sufficient)

**Extensibility:** Add any metric via ALTER TABLE anytime (zero downtime)

---

## 🔄 Complete Data Flow (Technical)

### OMA → MCP Server → BigQuery → Reporting Platform

```
┌──────────────────────────────────────────────────────────┐
│ 1. PRACTITIONER AT OMA                                   │
│ "Create GSC dashboard for client1.com, last 90 days"   │
└────────────────────┬─────────────────────────────────────┘
                     │ (Natural language request)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 2. OMA PLATFORM                                         │
│ - Loads practitioner's OAuth tokens (encrypted DB)      │
│ - Refreshes access_token if expired (1 hour lifetime)   │
│ - Passes request + tokens to AI agent                   │
└────────────────────┬─────────────────────────────────────┘
                     │ (Request + OAuth tokens)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 3. AI AGENT (Claude via MCP)                            │
│ Decision: "Need GSC data → BigQuery → Dashboard"        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 4. MCP HTTP SERVER (Port varies)                        │
│ POST /mcp/execute-tool                                  │
│ Headers:                                                 │
│   X-OMA-API-Key: <oma-key>                             │
│   Authorization: Bearer <user-access-token>             │
│   X-Google-Refresh-Token: <user-refresh-token>         │
│ Body:                                                    │
│   {"toolName": "push_platform_data_to_bigquery", ...}   │
│                                                          │
│ Server extracts tokens → Injects into tool input        │
└────────────────────┬─────────────────────────────────────┘
                     │ (Tool execution with OAuth)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 5. MCP TOOL: push_platform_data_to_bigquery             │
│ A. Use OAuth token → Query GSC API as user             │
│    Google returns: Only user's client1.com data         │
│    Result: 8,500 rows (90 days × all dimensions)       │
│                                                          │
│ B. Create BigQuery table (service account)              │
│    Project: mcp-servers-475317                          │
│    Dataset: wpp_marketing                               │
│    Table: gsc_performance_shared                        │
│                                                          │
│ C. Insert rows with workspace_id                        │
│    INSERT INTO gsc_performance_shared                   │
│    SELECT *, 'workspace_A' as workspace_id, ...         │
│                                                          │
│ D. Return table reference to agent                      │
└────────────────────┬─────────────────────────────────────┘
                     │ (Table reference)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 6. AGENT: Creates Dashboard                             │
│ MCP Tool: create_dashboard                              │
│ Input:                                                   │
│   - name: "GSC Dashboard - client1.com"                 │
│   - dataset_id: gsc_performance_shared                  │
│   - charts: [time_series, table, pie_chart]            │
│   - filters: [{ preset: "last90Days" }]                │
│                                                          │
│ Tool saves to Supabase:                                 │
│   - Dashboard layout (chart definitions)                │
│   - Dataset reference (BigQuery table)                  │
│   - Filters (preset, not static dates!)                │
│                                                          │
│ Returns: Dashboard URL                                  │
└────────────────────┬─────────────────────────────────────┘
                     │ (Dashboard URL)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 7. OMA → Practitioner                                   │
│ "Your dashboard is ready: [Link]"                       │
└────────────────────┬─────────────────────────────────────┘
                     │ (Practitioner clicks)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 8. REPORTING PLATFORM (Next.js Frontend)                │
│ - Load dashboard layout from Supabase                   │
│ - For each chart:                                       │
│   → Evaluate "last90Days" preset dynamically            │
│   → Query: WHERE date >= CURRENT_DATE - 90             │
│   → Execute against BigQuery                            │
│   → Returns FRESH data (2-5 sec query)                 │
│ - Render charts with current data                       │
│ - User sees: Always up-to-date dashboard                │
└──────────────────────────────────────────────────────────┘
```

**Key:** Agent does ALL backend work. Practitioner only: grants OAuth + asks questions + views results.

---

## 🔐 OAuth Architecture (Per-Request, Multi-Tenant)

### How OAuth Works in OMA Context

**One-Time Setup (Per Practitioner):**
```
Practitioner at OMA:
  ↓
"Connect Google Account"
  ↓
OMA redirects to Google OAuth consent screen:
  https://accounts.google.com/o/oauth2/v2/auth?
    client_id=<oma-client-id>&
    redirect_uri=<oma-callback>&
    scope=webmasters adwords analytics business.manage&
    access_type=offline&   ← CRITICAL: Get refresh token
    prompt=consent         ← CRITICAL: Force consent
  ↓
Practitioner clicks "Allow"
  ↓
Google redirects back with authorization code
  ↓
OMA exchanges code for tokens:
  {
    "access_token": "ya29.a0AfH6SMB...",  ← 1 hour lifetime
    "refresh_token": "1//0gUK9q8w...",   ← Never expires
    "expires_in": 3600,
    "scope": "...",
    "token_type": "Bearer"
  }
  ↓
OMA stores BOTH tokens encrypted per practitioner
```

**Every MCP Request:**
```
Before calling MCP:
  ↓
OMA checks: Is access_token expired?
  ↓
If yes (> 50 minutes old):
  POST https://oauth2.googleapis.com/token
  {
    "refresh_token": <stored-refresh-token>,
    "client_id": <oma-client-id>,
    "client_secret": <oma-client-secret>,
    "grant_type": "refresh_token"
  }
  ↓
Get new access_token (refresh_token stays same)
  ↓
Include BOTH in MCP request:
  Headers:
    Authorization: Bearer <fresh-access-token>
    X-Google-Refresh-Token: <refresh-token>
    X-OMA-API-Key: <oma-api-key>
  ↓
MCP Server extracts tokens from headers
  ↓
MCP Tool uses tokens to call Google APIs as practitioner
  ↓
Google returns: Only practitioner's data (automatic isolation)
```

**Multi-Tenant Isolation:**
- Practitioner A's token → Google returns only A's accounts
- Practitioner B's token → Google returns only B's accounts
- **No manual provisioning needed - Google IAM is source of truth**

**File Reference:** `/docs/oauth/OMA-INTEGRATION-SPEC.md` (lines 1-556)

---

## 🗄️ BigQuery Data Lake Architecture (CRITICAL)

### The Problem We're Solving

**OLD (Before Phase 4.7):**
```
Dashboard created Oct 1:
  Stores: Static data from Sep 1-30
  ↓
Opened Oct 31:
  Shows: SAME Sep 1-30 data (stale!)
  ↓
Opened in 2 years:
  Shows: SAME Sep 1-30 data from 2025 (ancient!)
```

**NEW (Phase 4.7 - In Progress):**
```
Dashboard created Oct 1:
  Stores: QUERY "last30Days"
  ↓
Opened Oct 31:
  Executes: "WHERE date >= Oct 2 AND date <= Oct 31"
  Shows: FRESH Oct data
  ↓
Opened in 2 years:
  Executes: "WHERE date >= [30 days ago] AND date <= [yesterday]"
  Shows: FRESH 2027 data
```

### Shared Table Design

**ONE table per platform:**
```sql
CREATE TABLE `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
(
  date DATE NOT NULL,                    -- Partition key
  query STRING,
  page STRING,
  device STRING,  -- MOBILE, DESKTOP, TABLET
  country STRING,
  clicks INT64,
  impressions INT64,
  ctr FLOAT64,
  position FLOAT64,
  workspace_id STRING NOT NULL,          -- Tenant isolation
  property STRING NOT NULL,               -- sc-domain:example.com
  oauth_user_id STRING,
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  data_source STRING DEFAULT 'api'
)
PARTITION BY date
CLUSTER BY workspace_id, property, device, country
OPTIONS(partition_expiration_days = 365);
```

**All practitioners share this ONE table. Queries filter by workspace_id.**

### Data Collection Strategy

**Method 1: On-Demand (Dashboard Creation)**
```
Agent creates first dashboard for property
  ↓
Check: Does gsc_performance_shared have this property + workspace?
  ↓
No: Pull 12 months from GSC API
  → Insert into shared table with workspace_id
  → Store OAuth token for refresh
  → Duration: 30-60 seconds
  ↓
Yes: Reuse existing data
  → Dashboard ready instantly
  → Duration: <1 second
```

**Method 2: Daily Refresh (Automatic)**
```
Cloud Scheduler: 2 AM UTC daily
  ↓
Query: Which properties were queried in last 30 days?
  ↓
For each active property:
  → Pull yesterday's data only (API call)
  → MERGE into shared table (upsert)
  → Update last_refreshed_at timestamp
  ↓
All dashboards auto-update with fresh data
```

**Storage Model:**
```
Hot: Last 12 months (BigQuery standard storage)
Warm: 13-24 months (BigQuery long-term, 50% cheaper, automatic)
Cold: 25+ months (GCS Archive, 95% cheaper, export monthly)
```

**File Reference:** `BIGQUERY-DATA-LAKE-ARCHITECTURE.md` (complete design)

---

## 💰 Cost Model (FREE → Enterprise Scale)

### BigQuery Costs

**Free Tier:**
- Storage: 10 GB/month FREE
- Queries: 1 TB/month FREE

**Your Actual Usage:**

| Scale | Properties | Storage | Queries/Month | Cost/Month |
|-------|-----------|---------|---------------|------------|
| Pilot | 10 | 50 MB | 5 GB | **$0** (under free tier) |
| Early | 100 | 500 MB | 50 GB | **$0** (under free tier) |
| Growth | 1,000 | 5 GB | 500 GB | **$0** (still under free!) |
| Enterprise | 10,000 | 50 GB | 7.5 TB | **$48/month** ($0.80 storage + $47 queries) |

**API Call Costs:**
- Google Search Console API: FREE
- Google Ads API: FREE
- Google Analytics API: FREE
- Data Transfer Services: FREE

**Total Operating Cost:**
- 1,000 practitioners: **$0/month** (under free tier!)
- 10,000 practitioners: **$50-200/month** (with optimization)

**NOT $50,000/month** (avoided by shared tables!)

---

## 🔧 Technical Stack (Complete)

### MCP Server (Router + Backend Architecture)

**🚀 NEW: Router Architecture (v2.1) - 94% Token Reduction!**

**Architecture:**
```
Client (Claude Code CLI)
    ↓ stdio
MCP Router (~6K tokens)
    ↓ HTTP
Google Backend Server (~50K tokens, port 3100)
```

**Why Router Architecture:**
- **Before:** Monolithic server loaded 104,000 tokens at connection (all tool metadata)
- **After:** Router loads 6,000 tokens (minimal descriptions only)
- **Savings:** 98,000 tokens (94% reduction!)
- **Method:** Extract first line from descriptions, inject verbose guidance into tool responses

**Location:** `/src/`
**Runtime:** Node.js 18+ with TypeScript 5.3

**Entry Points:**
- **Router (stdio):** `/src/router/server.ts` - Main MCP router, minimal token usage
- **Google Backend (HTTP):** `/src/backends/google-marketing/server.ts` - Port 3100, all 66 tools
- **Legacy (HTTP):** `/src/http-server/index.ts` - OMA integration (non-router mode)

**Router Components:**
- `src/router/server.ts` - MCP router (stdio transport)
- `src/router/backend-registry.ts` - Backend management, tool caching, description extraction
- `src/router/http-client.ts` - HTTP client for backend communication
- `src/router/config.ts` - Environment-based configuration
- `src/router/types.ts` - TypeScript interfaces

**Backend Components:**
- `src/backends/google-marketing/server.ts` - HTTP server serving all 102 Google tools

**Tool Modules:**
- `src/gsc/` - Google Search Console (8 tools)
- `src/ads/` - Google Ads (60 tools, modular structure)
- `src/analytics/` - Google Analytics (11 tools)
- `src/business-profile/` - Business Profile (3 tools)
- `src/bigquery/` - BigQuery operations (3 tools)
- `src/crux/` - Core Web Vitals (5 tools)
- `src/serp/` - SERP API (1 tool)
- `src/wpp-analytics/` - Dashboard tools (9 tools)
- `src/shared/` - OAuth factory, logger, safety system, **interactive-workflow utilities**

**Total:** 102 MCP tools

**Google Ads Tools Breakdown (60 tools):**
- Campaigns (5): create, update_status, list, pause, get_performance
- Ad Groups (5): create, update, list, get_quality_score, set_bid_modifier
- Keywords (12): add, remove, add_negative, remove_negative, list, update_bid, update_match_type, get_search_terms, remove_search_term, generate_ideas, get_forecasts, get_performance
- Ads (4): create, update, list, pause
- Budgets (3): create, update, list
- Bidding (4): list_strategies, create_portfolio, update_strategy, set_ad_group_bid
- Bid Modifiers (4): device, location, demographic, schedule
- Labels (6): create, list, remove, apply_to_campaign, apply_to_ad_group, apply_to_keyword
- Targeting (5): location, language, demographic, audience, ad_schedule
- Conversions (5): list, get, create, upload_clicks, upload_adjustments
- Audiences (4): list, create_user_list, upload_customer_match, create_lookalike
- Accounts (1): list_accessible
- Assets (1): list
- Reporting (8): campaigns, performance, budgets, keyword_perf, custom_report, ad_group_perf, ad_perf, quality_score

**Interactive Workflow System:**
- `src/shared/interactive-workflow.ts` - Utilities for guided tool experiences
  * `injectGuidance()` - Move verbose guidance from metadata to responses
  * `formatDiscoveryResponse()` - Interactive parameter collection
  * `formatNextSteps()` - Suggest related tools
  * `formatSuccessSummary()` - Enhanced success messages
  * `WorkflowBuilder` - Chainable multi-step workflows

**NPM Scripts:**
```bash
# Start Google backend (required for router)
npm run dev:google-backend  # Port 3100

# Start MCP router (stdio mode for Claude Code)
npm run dev:router

# Legacy monolithic mode (HTTP, for OMA)
npm run dev:http  # Port 3001

# Build all
npm run build
```

**Dependencies:**
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "@google-cloud/bigquery": "^8.1.1",
  "@google-analytics/data": "^5.2.1",
  "@google-analytics/admin": "^9.0.1",
  "google-ads-api": "^21.0.1",
  "googleapis": "^118.0.0",
  "google-auth-library": "^9.0.0",
  "@supabase/supabase-js": "^2.76.1",
  "express": "^5.1.0",
  "zod": "^3.22.0"
}
```

**Token Optimization Details:**
- Router extracts first line from tool descriptions (removes emojis, multi-line guidance)
- Full descriptions stored in backend `annotations` (not sent to client)
- Guidance injected into tool responses when tools are actually called
- Result: Load 1,016 tokens upfront instead of 99,000 tokens

**Interactive Workflow Benefits:**
- Tools guide users through missing parameters step-by-step
- Rich analysis and insights in responses
- Suggested next steps after each operation
- Enhanced dry-run previews for WRITE operations
- Multi-step approval workflows with impact analysis

**Reference Documentation:**
- `docs/router-architecture.md` - Complete router implementation guide
- `docs/mcp-architecture-recommendations.md` - Architecture decision rationale
- `docs/SESSION-HANDOVER-interactive-tool-transformation.md` - Transformation implementation

### Reporting Platform (Frontend)

**Location:** `/wpp-analytics-platform/frontend/`
**Framework:** Next.js 15.5.6 (App Router)
**Runtime:** React 19

**Dependencies:**
```json
{
  "next": "15.5.6",
  "react": "19.x",
  "echarts": "^5.6.0",
  "echarts-for-react": "^3.0.2",
  "recharts": "^2.15.0",
  "@google-cloud/bigquery": "^7.9.0",
  "@supabase/supabase-js": "^2.76.1",
  "@supabase/ssr": "^0.7.0",
  "@tanstack/react-query": "^5.90.5",
  "@dnd-kit/core": "^6.3.1",
  "@radix-ui/*": "^1.x-2.x",
  "tailwindcss": "^3.x",
  "zustand": "^4.x"
}
```

**Chart Libraries:**
- **ECharts 5.6** (primary): Line, bar, pie, funnel, gauge, heatmap, radar, sankey, scatter, treemap, waterfall, bubble, combo, boxplot, bullet, calendar, candlestick, graph, parallel, pictorial, sunburst, theme_river, timeline, tree, stacked (24 types)
- **Recharts 3.3** (secondary): Area, composed, pivot_table (9 types)

**Total:** 32 chart types (ALL migrated with global filter support)

**State Management:**
- Zustand: Dashboard state, filter state
- React Query: Data fetching, caching
- Supabase: Authentication, RLS

**File Structure:**
- `/src/app/` - Next.js pages (dashboard viewer, builder, auth)
- `/src/components/dashboard-builder/` - Builder UI
  - `/charts/` - 32 chart components (ALL migrated Oct 27)
  - `/controls/` - 12 control components (filters, dimension controls)
  - `/content/` - 6 content components (title, text, etc.)
  - `/dialogs/` - Settings, export, share modals
- `/src/lib/` - Data fetching, BigQuery client, Supabase client
- `/src/store/` - Zustand stores (dashboardStore, filterStore)
- `/src/hooks/` - useGlobalFilters, useDataRefresh

---

## 🎯 Current Priorities (Phase 4.7 = #1)

### Priority 1: BigQuery Data Lake (CRITICAL) 🔥

**Goal:** Make dashboards truly live (show fresh data even after 2 years)

**Status:** 🚧 In Progress
**Timeline:** Weeks 1-3
**Blocking:** Everything else depends on this

**Tasks:**
1. [ ] Create shared tables (gsc_performance_shared, ads_performance_shared, ga4_sessions_shared)
2. [ ] Implement on-demand pull in dashboard creation flow
3. [ ] Deploy Cloud Function for daily refresh
4. [ ] Configure Cloud Scheduler (2 AM UTC)
5. [ ] Test with themindfulsteward.com (GSC trial)
6. [ ] Verify daily refresh works
7. [ ] Scale to all GSC properties
8. [ ] Replicate for GA4

**Success Criteria:**
- ✅ Dashboard created today shows fresh data in 30 days
- ✅ Deduplication works (no duplicate tables)
- ✅ Cost < $500/month for 1,000 properties

**Reference:** `ROADMAP.md` Phase 4.7, `BIGQUERY-DATA-LAKE-ARCHITECTURE.md`

### Priority 2: Chart Migration (COMPLETE) ✅

**Goal:** All charts support global filters + dataset architecture

**Status:** ✅ COMPLETE (Oct 27, 2025)
**Charts:** 33/33 migrated

**What Was Done:**
- ✅ All charts use useGlobalFilters hook
- ✅ All charts connect to page-level controls (date, dimension, measure)
- ✅ All charts query dataset API (/api/datasets/[id]/query)
- ✅ Date presets exclude today (except "Today")
- ✅ Daily auto-refresh hook added

**Agents:** database-optimizer, frontend-builder, chart-migrator (3 parallel)

### Priority 3: Daily Refresh Automation

**Goal:** Deploy Cloud Scheduler + Cloud Function

**Status:** ⏳ Waiting for Phase 4.7.1 (shared tables)
**Timeline:** Week 2

**Deployment:**
- Cloud Function: `/functions/refresh-platform-data/`
- Cloud Scheduler: CRON `0 2 * * *`
- Monitoring: Cloud Logging, error alerts

### Priority 4: Production Deployment

**Goal:** Deploy to production with monitoring

**Status:** ⏳ After Phase 4.7 complete
**Timeline:** Week 4

---

## ⚠️ What Practitioners CAN and CANNOT Do

### ✅ Practitioners CAN (Must Be Easy):

1. **Grant OAuth Access (One-Time)**
   - Click "Connect Google Account" in OMA
   - Authorize access to GSC, Ads, Analytics
   - Done in 30 seconds
   - **CRITICAL:** This must be ONE click, not complex setup

2. **Ask Questions in Natural Language**
   - "Show GSC performance for client1.com"
   - "Create dashboard comparing paid vs organic"
   - "What's my best performing campaign?"

3. **View Dashboards**
   - Open link agent provides
   - See fresh data
   - Apply filters (device, country, date range)

4. **Request Changes**
   - "Add device breakdown to this chart"
   - "Show last 90 days instead of 30"
   - Agent handles via MCP tools

### ❌ Practitioners CANNOT (Must Be Automated):

1. **Configure Google Cloud**
   - ❌ Can't create BigQuery datasets
   - ❌ Can't set up Cloud Scheduler
   - ❌ Can't manage service accounts
   - **Why:** Too technical, security risk, not scalable

2. **Manage BigQuery Tables**
   - ❌ Can't create tables manually
   - ❌ Can't run SQL in BigQuery Console
   - ❌ Can't export data manually
   - **Agent handles:** All via MCP tools

3. **Set Up Data Pipelines**
   - ❌ Can't configure data transfers
   - ❌ Can't schedule refresh jobs
   - ❌ Can't manage OAuth token rotation
   - **Backend handles:** Automatic via Cloud Scheduler

4. **Configure OAuth Scopes**
   - ❌ Can't add new API scopes manually
   - ❌ Can't request additional permissions
   - **OMA handles:** Pre-configured scope list

5. **Debug Infrastructure**
   - ❌ Can't access logs
   - ❌ Can't restart services
   - ❌ Can't modify RLS policies
   - **DevOps handles:** Monitoring and maintenance

**Principle:** If it requires GCP Console access or technical knowledge, it MUST be automated or handled by backend.

---

## 🔧 Service Account vs OAuth (When to Use Each)

### OAuth Token (User Identity)

**Used For:**
- ✅ Pulling data from Google APIs (GSC, Ads, Analytics)
- ✅ Querying BigQuery tables user has access to
- ✅ Accessing user's Google Ads accounts
- ✅ Reading user's Analytics properties

**Why:**
- Automatic multi-tenant isolation (Google enforces)
- User A's token = only User A's data
- No manual account provisioning

**Lifetime:**
- Access token: 1 hour (refresh via refresh_token)
- Refresh token: Never expires (until revoked or 7 days in Testing mode)

**Files:**
- `/src/shared/oauth-client-factory.ts` - Client creation
- `/src/http-server/server.ts` - Token extraction
- `/config/gsc-tokens.json` - Test tokens (temporary)

### Service Account (Infrastructure Identity)

**Used For:**
- ✅ Creating BigQuery tables (infrastructure)
- ✅ Inserting data into BigQuery (after pulling via OAuth)
- ✅ Creating datasets in BigQuery
- ✅ System-level operations

**Why:**
- Reliable infrastructure access
- Doesn't depend on user permissions
- Can create shared resources

**Identity:**
- Email: `mcp-cli-access@mcp-servers-475317.iam.gserviceaccount.com`
- Credentials: `/mcp-servers-475317-adc00dc800cc.json`
- Permissions: BigQuery Admin, Storage Admin

**Pattern:**
```typescript
// Pull data (OAuth - as user)
const gscData = await pullGSCData(userOAuthToken);

// Create table (Service Account - infrastructure)
const table = await createBigQueryTable(serviceAccountKey);

// Insert data (Service Account)
await insertIntoBigQuery(table, gscData, serviceAccountKey);

// Query data (OAuth - as user)
const results = await queryBigQuery(userOAuthToken);
```

**Files:**
- `/src/wpp-analytics/tools/push-data-to-bigquery.ts` - Uses both
- `/mcp-servers-475317-adc00dc800cc.json` - Service account key

---

## 📚 Complete File Reference Map

### Documentation (Must Read)

| File | Lines | Purpose | When to Read |
|------|-------|---------|--------------|
| `CLAUDE.md` | 1200+ | **THIS FILE** - Complete system overview + AI agent guide | Every new session, memory refresh |
| `ROADMAP.md` | 601 | Phases 4.1-4.8, all tasks, priorities | Check current phase, see what's next |
| `WORKFLOW.md` | 412 | Sub-agent usage guide | When invoking agents |
| `BIGQUERY-DATA-LAKE-ARCHITECTURE.md` | NEW | BigQuery shared table design | Implementing Phase 4.7 |
| `DATA-LAYER-ARCHITECTURE.md` | 320 | Frontend → API → BigQuery flow | Understanding data flow |

### OAuth Documentation

| File | Lines | Purpose |
|------|-------|---------|
| `docs/oauth/OMA-INTEGRATION-SPEC.md` | 556 | Complete OMA OAuth integration spec |
| `docs/oauth/README.md` | 69 | OAuth overview |
| `docs/oauth/TOKEN-SOLUTION.md` | 150+ | Token refresh mechanism |

### MCP Tools Documentation

| File | Purpose |
|------|---------|
| `src/gsc/tools/index.ts` | GSC tool registry (8 tools) |
| `src/ads/tools/index.ts` | Google Ads tools (25 tools) |
| `src/analytics/tools/index.ts` | GA4 tools (11 tools) |
| `src/wpp-analytics/tools/index.ts` | Dashboard tools (5 tools) |
| `.claude/agents/mcp-tools-reference.md` | Complete tool catalog |

### Frontend Documentation

| File | Purpose |
|------|---------|
| `wpp-analytics-platform/README.md` | Platform overview, 32 chart types + 12 controls |
| `wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/` | All 32 chart components |
| `wpp-analytics-platform/frontend/src/store/filterStore.ts` | Global filter logic |
| `wpp-analytics-platform/frontend/src/hooks/useGlobalFilters.ts` | Filter application |

### Code Locations (Quick Navigation)

**OAuth & Authentication:**
- `/src/shared/oauth-client-factory.ts` - OAuth clients for all Google APIs
- `/src/http-server/server.ts` - HTTP API, token extraction
- `/src/gsc/auth.ts` - OAuth token management

**BigQuery Integration:**
- `/src/wpp-analytics/tools/push-data-to-bigquery.ts` - Pull platform data to BigQuery
- `/src/bigquery/tools.ts` - BigQuery query tools
- `/src/shared/oauth-client-factory.ts` (lines 113-123) - BigQuery OAuth client

**Dashboard Management:**
- `/src/wpp-analytics/tools/dashboards/` - Modular dashboard tools (9 files)
  - `create-dashboard.tool.ts` - Create dashboards
  - `get-dashboard.tool.ts` - Retrieve dashboard structure
  - `list-dashboards.tool.ts` - Search/discover dashboards
  - `update-dashboard.tool.ts` - Modify dashboards
  - `list-templates.tool.ts` - Pre-built templates

**Frontend Charts:**
- `/wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/` - 32 chart types
- All use: `useCascadedFilters()` hook for multi-level filter support
- All query: `/api/datasets/[id]/query` endpoint

---

## 🚀 Quick Start for New Agents

**Reading claude.md for first time?** Here's the 3-minute summary:

1. **What This Is:**
   - AI-driven analytics platform for WPP practitioners
   - Agents handle ALL technical work via 65+ MCP tools
   - Practitioners only: grant OAuth + ask questions + view results

2. **How It Works:**
   - Practitioner grants OAuth access (one-time)
   - Agent uses OAuth to pull data from Google APIs
   - Agent stores in BigQuery shared tables
   - Agent creates dashboards in reporting platform
   - Backend refreshes data daily (automatic)
   - Dashboards always show fresh data

3. **Current Priority:**
   - Phase 4.7: BigQuery Data Lake (CRITICAL)
   - Enables truly live dashboards
   - See `ROADMAP.md` for tasks

**Next Steps:**
- Read: `ROADMAP.md` for current phase
- Read: `WORKFLOW.md` for sub-agent usage
- Read: `BIGQUERY-DATA-LAKE-ARCHITECTURE.md` for data lake design

---

## 🤖 AI Agent Guide: Using Interactive MCP Tools

### Overview of Interactive Workflows

**All 102 tools now use interactive workflows** that guide users step-by-step instead of throwing errors for missing parameters.

**Key Concept:**
- Tool descriptions in metadata are **minimal** (single line, ~15 tokens each)
- Verbose guidance is **injected into tool responses** (only when tool is called)
- Missing parameters trigger **discovery mode** (interactive parameter collection)
- WRITE operations require **multi-step approval** with impact previews

### How Interactive Tools Work

**Traditional Tool (Old Pattern):**
```
Agent calls tool without required param → ERROR: "property is required"
Agent must know all params upfront
No guidance on what to provide
```

**Interactive Tool (New Pattern):**
```
Agent calls tool without params → Tool returns discovery guidance
Tool lists available options (e.g., available properties)
Agent presents options to user
User selects option
Agent calls tool again with selected parameter
Tool returns rich analysis + next step suggestions
```

### Tool Calling Patterns

**Pattern 1: Simple READ Tools (No Required Params)**

Examples: `google__list_properties`, `google__list_accessible_accounts`, `google__list_analytics_accounts`

**How to Call:**
```json
{
  "tool": "google__list_properties"
  // No parameters needed
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "📊 DISCOVERED 5 PROPERTIES\n\n1. sc-domain:example.com...\n\n💡 WHAT YOU CAN DO:\n- Analyze traffic: use query_search_analytics\n..."
  }],
  "data": {
    "properties": [...],
    "total": 5
  }
}
```

**Agent Should:**
1. Read `content[0].text` for formatted results and guidance
2. Present the formatted list to user
3. Follow suggested next steps in the response

**Pattern 2: Complex READ Tools (Parameter Discovery)**

Examples: `google__query_search_analytics`, `google__list_campaigns`, `google__get_campaign_performance`

**Step 1 - Call Without Params:**
```json
{
  "tool": "google__query_search_analytics"
}
```

**Response:** Discovery guidance
```json
{
  "content": [{
    "type": "text",
    "text": "🔍 SELECT PROPERTY (Step 1/2)\n\n1. sc-domain:example.com\n2. sc-domain:site2.com\n\n💡 Which property? Provide: property"
  }],
  "data": {
    "items": [...],
    "nextParam": "property"
  }
}
```

**Step 2 - Call With Property:**
```json
{
  "tool": "google__query_search_analytics",
  "property": "sc-domain:example.com"
}
```

**Response:** Date range guidance
```json
{
  "content": [{
    "type": "text",
    "text": "📅 DATE RANGE SELECTION (Step 2/2)\n\nLast 7 days: 2025-10-24 to 2025-10-31\n..."
  }]
}
```

**Step 3 - Call With All Params:**
```json
{
  "tool": "google__query_search_analytics",
  "property": "sc-domain:example.com",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31"
}
```

**Response:** Full analysis with insights
```json
{
  "content": [{
    "type": "text",
    "text": "📊 SEARCH PERFORMANCE ANALYSIS\n\nTotal Clicks: 12,345\n...\n💡 KEY INSIGHTS:\n✅ Good CTR\n...\n🎯 NEXT STEPS:\n• Check indexing: use inspect_url\n..."
  }],
  "data": {
    "rows": [...],
    "summary": {...}
  }
}
```

**Pattern 3: WRITE Tools (Multi-Step Approval)**

Examples: `google__update_budget`, `google__create_campaign`, `google__add_keywords`

**Step 1-3: Parameter Discovery (Same as Pattern 2)**
- Call without params → discover account
- Call with account → discover budget/resource
- Call with resource → request new values

**Step 4: Dry-Run Preview**
```json
{
  "tool": "google__update_budget",
  "customerId": "2191558405",
  "budgetId": "12345",
  "newDailyAmountDollars": 75
  // No confirmationToken
}
```

**Response:** Impact preview
```json
{
  "content": [{
    "type": "text",
    "text": "📋 BUDGET UPDATE - REVIEW & CONFIRM (Step 4/4)\n\nCurrent: $50/day\nNew: $75/day\nChange: +$25/day (+50%)\n\nMonthly Impact: +$760\n\n⚠️ WARNINGS:\n• Large increase\n\n✅ Proceed? Call with confirmationToken: 'abc123'"
  }],
  "requiresApproval": true,
  "confirmationToken": "abc123xyz"
}
```

**Agent Must:**
1. Present the dry-run preview to user
2. Show financial impact and warnings
3. Get explicit user confirmation
4. Only then proceed to Step 5

**Step 5: Execute with Confirmation**
```json
{
  "tool": "google__update_budget",
  "customerId": "2191558405",
  "budgetId": "12345",
  "newDailyAmountDollars": 75,
  "confirmationToken": "abc123xyz"  // From previous response
}
```

**Response:** Success with audit trail
```json
{
  "content": [{
    "type": "text",
    "text": "✅ BUDGET UPDATED\n\nBudget: $75/day\nAudit ID: aud_123\n\n💡 NEXT STEPS:\n• Monitor performance\n..."
  }],
  "data": {
    "budgetId": "12345",
    "change": 25,
    "auditId": "aud_123"
  }
}
```

### Critical Rules for AI Agents

**1. Never Skip Discovery Steps**
- If tool response suggests next parameter, collect it from user
- Don't invent/guess parameter values
- Present discovery options to user, let them choose

**2. Always Read content[0].text**
- Contains formatted results, insights, and guidance
- Present this to user - don't just show raw data
- Follow suggested next steps in responses

**3. Respect Approval Workflows**
- NEVER call WRITE tools with confirmationToken without showing preview first
- Always present dry-run impact to user
- Get explicit confirmation before executing
- Destructive operations (delete, large budget changes) need clear user consent

**4. Chain Related Tools**
- Responses suggest next tools to call
- Follow these suggestions for optimal workflows
- Example: list_campaigns → get_campaign_performance → get_search_terms → add_negative_keywords

**5. Handle Discovery Responses**
- When response has `nextParam` in data, collect that parameter from user
- When response shows "Step X/Y", you're in a multi-step workflow
- Continue calling tool with progressively more parameters

### Example: Complete Workflow

**User Request:** "Increase budget for my top campaign"

**Agent Workflow:**
```
1. Call google__list_accessible_accounts
   → Response: Lists accounts, asks which one
   → Agent: Presents to user

2. User selects account "2191558405"

3. Call google__list_campaigns(customerId="2191558405")
   → Response: Lists campaigns with performance
   → Agent: Presents list, asks which campaign

4. User selects "Campaign X"

5. Call google__list_budgets(customerId="2191558405")
   → Response: Shows current budgets
   → Agent: Shows "Campaign X uses Budget Y: $50/day"

6. Call google__update_budget(customerId, budgetId)
   → Response: Asks for new amount
   → Agent: "Current is $50/day, what should new amount be?"

7. User says "increase to $75"

8. Call google__update_budget(customerId, budgetId, newAmount=75)
   → Response: Dry-run preview showing +$25/day, +$760/month impact
   → Agent: Shows preview, asks for confirmation

9. User confirms

10. Call google__update_budget(..., confirmationToken="abc123")
    → Response: Success + audit trail + next steps
    → Agent: "✅ Budget updated! Monitor performance over next 48 hours."
```

**Total: 10 steps, all guided by tool responses. User never sees technical complexity.**

---

## 🔍 System Constraints (Know These!)

### What Agents MUST Handle (Can't Ask Practitioners)

❌ **DON'T ask practitioner to:**
- Configure Google Cloud Platform
- Create BigQuery datasets/tables manually
- Set up Cloud Scheduler
- Manage service accounts
- Add OAuth scopes
- Run SQL in BigQuery Console
- Configure data transfers
- Set up monitoring/alerts

✅ **DO handle via:**
- MCP tools (102 available)
- Service account (for infrastructure)
- Automatic background jobs
- Pre-configured OAuth scopes

### OAuth Token Handling

**CRITICAL:**
- Access token: Valid for 1 hour only
- Refresh token: Valid until revoked
- OMA must refresh access token before each MCP call
- MCP server uses provided tokens (doesn't manage refresh)

**Test User Setup:**
- Practitioner must be added as "Test User" in Google OAuth app
- Prevents 7-day token expiration
- Allows unlimited refresh token lifetime

**File:** `/docs/oauth/OMA-INTEGRATION-SPEC.md`

### BigQuery Access Patterns

**For Data Pulls:**
- User's OAuth token → Query Google API
- Service account → Create BigQuery table
- Service account → Insert rows
- Pattern: OAuth for reads, service account for writes

**For Dashboard Queries:**
- Frontend → BigQuery client
- Uses service account OR user OAuth
- Returns data filtered by workspace_id (RLS)

### Google Ads API Developer Token Access Levels

**CRITICAL:** Google Ads requires BOTH OAuth + Developer Token

**Current Status:** TEST access (test accounts only)

**Access Levels:**

| Level | Test Accounts | Production Accounts | Daily Limit | Application Required | Status |
|-------|--------------|---------------------|-------------|---------------------|---------|
| **TEST** | ✅ All tools work | ❌ Cannot access | 15,000 ops/day | No (default) | ✅ Current |
| **Basic** | ✅ All tools work | ✅ All tools work | 15,000 ops/day | Yes (form) | ⏳ Need to apply |
| **Standard** | ✅ All tools work | ✅ All tools work | **Unlimited** | Yes (from Basic) | 🎯 Recommended for production |

**What This Means for Development:**
- ✅ **All 60 Google Ads tools work** with test accounts
- ❌ **Production accounts blocked** (e.g., account 2191558405)
- Error: "developer token is only approved for use with test accounts"

**How to Upgrade (When Ready for Production):**

**Step 1: Apply for Basic Access**
1. Go to: https://ads.google.com/aw/apicenter
2. Click "Apply for Basic Access"
3. Fill out application form (describe use case: "WPP Marketing Analytics Platform")
4. Wait for Google approval (typically 1-3 business days)
5. Get new developer token or existing token upgraded

**Step 2: Apply for Standard Access (Recommended)**
1. After Basic approval, apply for Standard Access
2. Describe usage: "Multi-tenant marketing analytics for 1,000+ practitioners"
3. Expected operations: 100K-1M+/day at scale
4. Get unlimited operations

**Step 3: Update Configuration**
```bash
# Update .env
GOOGLE_ADS_DEVELOPER_TOKEN=your-upgraded-token

# Restart backend
npm run dev:google-backend
```

**For WPP Platform Scale:**
- **Pilot (10-100 users):** Basic sufficient (15K ops/day)
- **Production (1,000+ users):** Standard required (unlimited ops)

**File:** `.env` line 7 - `GOOGLE_ADS_DEVELOPER_TOKEN=_rj-sEShX-fFZuMAIx3ouA` (current TEST token)

---

## 📊 Platform Metrics Summary

**MCP Server (Router Architecture):**
- **102 tools** across 7 Google APIs
- **Router + Backend pattern** (stdio → HTTP)
- **94% token reduction** (6K vs 104K tokens loaded)
- **Interactive workflows** (All 102 tools transformed with guided parameter discovery)
- 100% OAuth (no service accounts for data access)
- HTTP API for OMA integration
- Modular architecture (refactored Oct 27-31, Google Ads expansion completed Oct 31)

**Frontend Platform:**
- 32 chart types + 12 controls (100% migrated with filters)
- 9 dashboard MCP tools
- 3 global filter types (date, dimension, measure)
- Live data (queries execute at open time)

**BigQuery Data Lake:**
- 3 shared tables (gsc, ads, ga4)
- On-demand pulls + daily refresh
- 12-month hot storage
- Cost: $0-$5K/month (scales with usage)

**Total Users Supported:** 10,000+ practitioners (multi-tenant via workspace_id + RLS)

---

**Last Updated:** October 31, 2025
**Maintained By:** Claude agents via doc-syncer
**Source of Truth:** Yes - Read this first, then dive into specific docs

---

## 🔗 Navigation

**Need More Details?**
- Architecture: `BIGQUERY-DATA-LAKE-ARCHITECTURE.md`, `DATA-LAYER-ARCHITECTURE.md`
- Tasks: `ROADMAP.md` (601 lines, phases 4.1-4.8)
- Tools: `.claude/agents/mcp-tools-reference.md` (102 tool catalog)
- OAuth: `docs/oauth/OMA-INTEGRATION-SPEC.md` (556 lines)
- Workflow: `WORKFLOW.md` (412 lines)

**Working on Code?**
- MCP Tools: `/src/[platform]/tools/`
- Charts: `/wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/`
- Filters: `/wpp-analytics-platform/frontend/src/store/filterStore.ts`
- BigQuery: `/src/wpp-analytics/tools/push-data-to-bigquery.ts`

**Need Help?**
- Invoke sub-agent: See "Sub-Agents" section
- Ask question: knowledge-base, mcp-tools-reference, linear-status-checker
- Execute work: chart-migrator, frontend-builder, mcp-tool-builder, database-optimizer
**That's it. No technical knowledge needed.**

**For:** WPP marketing agencies and clients
**How:** 100% agent-driven via OAuth 2.0 (zero manual data work)

---

## 🎯 Major Milestones (October 31, 2025)

**Interactive Tool Transformation Complete - All 102 Tools**
- Date: October 31, 2025
- Tools transformed: 102 (66 existing + 36 new Google Ads tools)
- Status: Production-ready with guided parameter discovery
- Token optimization: 94% reduction (6K vs 104K upfront)

**Google Ads Expansion - 35 New Tools**
- Campaigns: 5 tools (create, update, list, pause, performance)
- Ad Groups: 5 tools (create, update, list, quality score, bid modifiers)
- Keywords: 12 tools (add, remove, negative, bid management, search terms, ideas, forecasts)
- Ads: 4 tools (create, update, list, pause)
- Budgets: 3 tools (create, update, list)
- Bidding strategies: 4 tools (create, update, portfolio management)
- Bid modifiers: 4 tools (device, location, demographic, schedule)
- Labels: 6 tools (create, apply to campaigns/ad groups/keywords)
- Targeting: 5 tools (location, language, demographic, audience, schedule)
- Conversions: 5 tools (list, create, upload clicks, adjustments, customer match)
- Audiences: 4 tools (list, create, upload customer match, lookalike)
- Accounts: 1 tool (list accessible)
- Assets: 1 tool (list)
- Reporting: 8 tools (campaigns, performance, budgets, keyword, quality, audit)

**All 102 tools now feature:**
- Interactive parameter discovery (no required params upfront)
- Guided workflows with step-by-step prompts
- Rich guidance injected into responses (not loaded in metadata)
- Multi-step approval for WRITE operations
- Impact previews and audit trails
- Related tool suggestions and next steps

---

## 🏗️ Tech Stack

**MCP Server** (src/):
- TypeScript + Node.js
- 102 tools across 7 Google APIs
- OAuth 2.0 authentication (oauth-client-factory.ts)
- Express HTTP wrapper for OMA integration

**Reporting Platform** (wpp-analytics-platform/):
- Next.js 15 + React 19 + TypeScript
- ECharts 5.5 (primary) + Recharts 3.3 (secondary)
- Supabase (PostgreSQL + RLS multi-tenant)
- BigQuery (central data hub)
- 32 chart types + 12 controls (ALL migrated with filter support)
- Drag-and-drop dashboard builder

---

## 📚 Full Documentation

**Planning & Progress:**
- **ROADMAP.md** - Phases 4.1-4.8, all tasks, 6-9 week timeline
- **LINEAR_TICKETS_MCP47_TO_MCP75.md** - All 29 tickets detailed
- **WORKFLOW.md** - How Claude + Sub-Agents + Skills + Linear work together

**Technical:**
- **wpp-analytics-platform/README.md** - Platform features, 32 chart types + 12 controls
- **DATA-LAYER-ARCHITECTURE.md** - BigQuery → Dataset → API → Frontend flow

---

## 🤖 Sub-Agents (When to Use)

**Fast Answers** (Haiku, <2s):
- **knowledge-base** - "What is", "how does", "explain", "show me"
- **mcp-tools-reference** - "What tools", "which API", "how to query"
- **linear-status-checker** - "Status", "progress", "what's left"

**Work Execution** (Sonnet, 5-60min):
- **chart-migrator** - "Migrate chart", "fix BarChart", "chart not yet migrated"
- **frontend-builder** - "Sidebar", "UI component", "settings tab"
- **mcp-tool-builder** - "Create MCP tool", "new Google API"
- **database-optimizer** - "BigQuery", "SQL query", "optimize"

**Maintenance** (Haiku, <2min):
- **doc-syncer** - "Update docs" (user-triggered only)
- **code-reviewer** - "Review code" (before commits)

---

## 💡 Skills (Quick Reference)

Stored in `.claude/skills/` (reference knowledge, not agents):
- **mcp-server.md** - 31 tool catalog
- **oauth.md** - OAuth 2.0 patterns
- **linear.md** - Ticket format
- **chrome-devtools-mcp.md** - WSL2 debugging
- **reporting-platform.md** - Dashboard MCP tools

**Skills provide knowledge, Agents do work.**

---

## ⚠️ Supabase Project - CRITICAL

**Project Name:** "MCP Servers"
**Project Reference:** `nbjlehblqctblhpbwgry`
**Dashboard:** https://supabase.com/dashboard/project/nbjlehblqctblhpbwgry

**IMPORTANT:** This project is under a DIFFERENT Supabase account than the main account.
- Main account shows: "barisdogancan@gmail.com's project" and "SEO Tool"
- MCP Servers project is on a separate account
- All credentials are now in `.env` and `.env.local` files (updated Oct 26, 2025)

**Database Tables:**
- workspaces (1 row)
- dashboards (1 row)
- datasets (1 row)
- dashboard_templates (1 row)
- dashboard_shares (0 rows)
- dataset_cache (9 rows)

---

## ⚠️ Development Server - CRITICAL

**ALWAYS use port 3000 for the frontend dev server:**
- Platform URL: http://localhost:3000
- If port 3000 shows "in use", it means our server is already running
- **DO NOT start on alternate ports** (like 3001, 3002, etc.)
- **Action required:** Kill the existing process and restart on 3000

**Kill existing process:**
```bash
# Kill all Next.js dev servers
pkill -9 -f "next dev"

# Or kill by port
lsof -ti:3000 | xargs kill -9

# Then start fresh
cd wpp-analytics-platform/frontend && npm run dev
```

**Why port 3000 matters:**
- OAuth callbacks configured for localhost:3000
- API endpoints expect localhost:3000
- Frontend ENV vars reference localhost:3000
- Changing ports breaks authentication flow

---

**See WORKFLOW.md for complete usage guide** 🚀

---

# 📖 COMPLETE PROJECT DOCUMENTATION

## For Comprehensive Details, See PROJECT-BLUEPRINT.md

**This file (CLAUDE.md) provides quick reference, core concepts, and AI agent guidance.**

**For complete specifications, read PROJECT-BLUEPRINT.md which includes:**

### **What You'll Find in PROJECT-BLUEPRINT.md:**

**Part 1: Executive Overview (559 lines)**
- Complete vision and problem statements
- User personas and journey maps
- End-to-end flow diagrams
- Competitive analysis (vs Looker Studio, Tableau)

**Part 2: System Architecture (300 lines)**
- Complete architecture diagrams
- All 5 components explained
- Multi-tenant isolation (3-layer security)
- Technology decisions and rationale

**Part 3: Component Deep Dive (800 lines)**
- OMA platform integration
- MCP server (65+ tools, directory structure)
- All 14 marketing platforms (detailed integration)
- BigQuery shared table architecture
- Reporting platform (32 chart types + 12 controls, tech stack)
- Supabase database schemas

**Part 4: Connection Bridges (400 lines)**
- OMA ↔ MCP HTTP API specifications
- MCP ↔ Platform OAuth flows
- Platform → BigQuery (Transfer Service + API)
- BigQuery ↔ Frontend (query builder, caching)

**Part 5-8: Bootstrap, Refresh, Deploy (700 lines)**
- Bootstrap subsystem (background data loading)
- Daily refresh system (Cloud Function)
- Platform-specific pull strategies
- Deployment architecture (dev + production)
- Cost breakdowns and projections

**Part 9: Platform Master Table (100 lines)**
- **CRITICAL REFERENCE:** All 14 platforms
- Transfer Service availability
- Historical data limits
- First-time pull strategies
- Daily refresh approaches
- Current implementation status

**Part 10: Implementation Roadmap (150 lines)**
- What's completed
- What's in progress
- What's planned
- Success metrics
- Timeline estimates

**Part 11: Appendix (100 lines)**
- Glossary, file structure
- Key decisions summary
- Contact information

---

## 🎯 Quick Decision Guide

**Question:** How do I integrate a new platform?
**Answer:** See PROJECT-BLUEPRINT.md Part 9 (Platform Master Table) for decision tree

**Question:** How does OAuth work end-to-end?
**Answer:** See PROJECT-BLUEPRINT.md Part 4.1-4.2 (OAuth flows)

**Question:** How much will this cost at scale?
**Answer:** See PROJECT-BLUEPRINT.md Part 8.4 (Cost projections)

**Question:** What's the complete architecture?
**Answer:** See PROJECT-BLUEPRINT.md Part 2.1 (Architecture diagram)

**Question:** How do I deploy to production?
**Answer:** See PROJECT-BLUEPRINT.md Part 8.2 (Deployment steps)

---

**📘 PROJECT-BLUEPRINT.md = Complete Project Manual (2,427 lines)**
**📄 CLAUDE.md = Quick Reference + AI Agent Guide (This File)**

**Always refer to PROJECT-BLUEPRINT.md for complete, authoritative information.**

