# WPP Marketing Analytics Platform

**Fully Agent-Driven Analytics - Zero-Touch for Practitioners**

**Version:** 2.0 (BigQuery Data Lake Architecture)
**Last Updated:** October 27, 2025
**Status:** Production-Ready MCP Server + Frontend (Phase 4.7 in progress)

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
| **MCP Server** | ✅ Production | TypeScript + Node.js | 65+ tools across 7 Google APIs |
| **OAuth System** | ✅ Production | Per-request OAuth 2.0 | 100% user credentials, auto-refresh |
| **BigQuery Lake** | 🚧 Phase 4.7 | Shared tables + workspace_id | On-demand pull + daily refresh |
| **Frontend Platform** | ✅ 95% Complete | Next.js 15 + React 19 | 33 charts (ALL migrated with filters) |
| **Dashboard Tools** | ✅ Production | 5 MCP tools | Create, Read, Update, List, Search |

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
| **Google Ads** | Paid | ✅ Production | 25 | 20 (core) | 12 (core) |
| **Google Analytics 4** | Analytics | ✅ Production | 11 | 25 (core) | 20 (core) |
| **Google Business Profile** | Local | ✅ Production | 3 | TBD | TBD |
| **BigQuery** | Data Warehouse | ✅ Production | 3 | N/A | N/A |
| **CrUX (Core Web Vitals)** | Performance | ✅ Production | 2 | N/A | N/A |
| **SERP API** | Rank Tracking | ✅ Production | 1 | N/A | N/A |
| Bing Ads | Paid | ⏳ Future | TBD | ~18 | ~10 |
| Bing Webmaster | Organic | ⏳ Future | TBD | ~4 | ~5 |
| Amazon Ads | Paid | ⏳ Future | TBD | ~15 | ~8 |
| Meta Ads | Social | ⏳ Future | TBD | ~20 | ~12 |
| TikTok Ads | Social | ⏳ Future | TBD | ~18 | ~10 |

**Total Tools:** 65+ tools (7 platforms live, 5 planned)

### Platform Data Specifications

**Google Search Console (Complete):**
- **Metrics:** clicks, impressions, ctr, position (ALL 4)
- **Dimensions:** date, query, page, device, country (ALL 5)
- **Why ALL:** Cost negligible ($0.72/month/1K properties), complete filter flexibility

**Google Ads (Smart Minimum):**
- **Metrics (20 core):** clicks, impressions, ctr, cost, conversions, conversion_value, cost_per_conversion, conversion_rate, roas, average_cpc, average_cpm, search_impression_share, search_lost_is_budget, search_lost_is_rank, search_exact_match_is, search_top_impression_share, search_absolute_top_is, engagement_rate, interactions, average_cpv
- **Dimensions (12 core):** date, campaign_name, campaign_id, campaign_type, campaign_status, ad_group_name, ad_group_id, keyword_text, match_type, device, network, ad_group_status
- **Omitted:** Quality score components, ad creative details, auction insights (available via ad-hoc pull)

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

### MCP Server (Backend)

**Location:** `/src/`
**Runtime:** Node.js 18+ with TypeScript 5.3
**Entry Point:** `/src/gsc/server.ts` (stdio) or `/src/http-server/index.ts` (HTTP)

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

**Modules:**
- `src/gsc/` - Google Search Console (8 tools)
- `src/ads/` - Google Ads (25 tools, modular structure)
- `src/analytics/` - Google Analytics (11 tools)
- `src/business-profile/` - Business Profile (3 tools)
- `src/bigquery/` - BigQuery operations (3 tools)
- `src/crux/` - Core Web Vitals (2 tools)
- `src/serp/` - SERP API (1 tool)
- `src/wpp-analytics/` - Dashboard tools (5 tools)
- `src/shared/` - OAuth factory, logger, safety system
- `src/http-server/` - Express HTTP API for OMA

**Total:** 65+ MCP tools

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

**Total:** 33 chart types (ALL migrated with global filter support)

**State Management:**
- Zustand: Dashboard state, filter state
- React Query: Data fetching, caching
- Supabase: Authentication, RLS

**File Structure:**
- `/src/app/` - Next.js pages (dashboard viewer, builder, auth)
- `/src/components/dashboard-builder/` - Builder UI
  - `/charts/` - 33 chart components (ALL migrated Oct 27)
  - `/controls/` - Date filters, dimension filters, measure filters
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
| `claude.md` | 500+ | **THIS FILE** - Complete system overview | Every new session, memory refresh |
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
| `wpp-analytics-platform/README.md` | Platform overview, 33 chart types |
| `wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/` | All 33 chart components |
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
- `/wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/` - 33 chart types
- All use: `useGlobalFilters()` hook for filter subscription
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
- MCP tools (65+ available)
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

---

## 📊 Platform Metrics Summary

**MCP Server:**
- 65+ tools across 7 APIs
- 100% OAuth (no service accounts for data access)
- HTTP API for OMA integration
- Modular architecture (21 files refactored Oct 27)

**Frontend Platform:**
- 33 chart types (100% migrated with filters)
- 5 dashboard MCP tools
- 3 global filter types (date, dimension, measure)
- Live data (queries execute at open time)

**BigQuery Data Lake:**
- 3 shared tables (gsc, ads, ga4)
- On-demand pulls + daily refresh
- 12-month hot storage
- Cost: $0-$5K/month (scales with usage)

**Total Users Supported:** 10,000+ practitioners (multi-tenant via workspace_id + RLS)

---

**Last Updated:** October 27, 2025
**Maintained By:** Claude agents via doc-syncer
**Source of Truth:** Yes - Read this first, then dive into specific docs

---

## 🔗 Navigation

**Need More Details?**
- Architecture: `BIGQUERY-DATA-LAKE-ARCHITECTURE.md`, `DATA-LAYER-ARCHITECTURE.md`
- Tasks: `ROADMAP.md` (601 lines, phases 4.1-4.8)
- Tools: `.claude/agents/mcp-tools-reference.md` (65+ tool catalog)
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

## 🏗️ Tech Stack

**MCP Server** (src/):
- TypeScript + Node.js
- 31 MCP tools across 7 Google APIs
- OAuth 2.0 authentication (oauth-client-factory.ts)
- Express HTTP wrapper for OMA integration

**Reporting Platform** (wpp-analytics-platform/):
- Next.js 15 + React 19 + TypeScript
- ECharts 5.5 (primary) + Recharts 3.3 (secondary)
- Supabase (PostgreSQL + RLS multi-tenant)
- BigQuery (central data hub)
- 34 chart types (24 need migration)
- Drag-and-drop dashboard builder

---

## 📚 Full Documentation

**Planning & Progress:**
- **ROADMAP.md** - Phases 4.1-4.8, all tasks, 6-9 week timeline
- **LINEAR_TICKETS_MCP47_TO_MCP75.md** - All 29 tickets detailed
- **WORKFLOW.md** - How Claude + Sub-Agents + Skills + Linear work together

**Technical:**
- **wpp-analytics-platform/README.md** - Platform features, 34 chart types
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

**This file (claude.md) provides quick reference and core concepts.**

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
- Reporting platform (33 charts, tech stack)
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
**📄 claude.md = Quick Reference (This File)**

**Always refer to PROJECT-BLUEPRINT.md for complete, authoritative information.**

