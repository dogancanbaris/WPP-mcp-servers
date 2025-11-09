---
name: wpp-mcp-server
description: Complete WPP MCP server guide - router+backend architecture, 98 Google tools, OAuth setup, startup from fresh PC. Use for starting servers, troubleshooting, OAuth setup, understanding architecture. Triggers "wpp mcp", "start mcp", "mcp setup", "oauth", "mcp not working", "mcp architecture", "fresh start"
---

# WPP MCP Server - Complete Setup & Architecture Guide

**ONE skill for EVERYTHING about the WPP Marketing MCP server - from fresh PC boot to fully operational 98 tools.**

---

## 🎉 BREAKTHROUGH: 97% Token Reduction Achieved!

**Before (Direct Tools):**
- 98 tools loaded at connection
- 65,000 tokens consumed
- Can't scale beyond ~150 tools

**After (Meta-Tools Pattern):**
- 3 meta-tools loaded at connection
- 2,028 tokens consumed
- **97% reduction!**
- Can scale to 500+ tools easily

**How it works:**
- All 98 tools hidden from tools/list
- Discovered on-demand via `search_tools`
- Schemas loaded on-demand via `get_tool_schema`
- Executed via `execute_tool` with full interactive workflows
- **Tool schemas NEVER enter context - proven!**

---

## 🎯 Fresh Start Scenario (Your Exact Use Case)

**Situation:** You restart your PC, start WSL, open VS Code, start Claude Code session.

**What happens:** You invoke this skill → Agent knows EVERYTHING needed to get MCP server running.

**Goal:** Go from zero to 98 working Google marketing tools in ~5 minutes.

---

## 📐 Architecture Overview (Meta-Tools Pattern)

### The Innovation: 97% Token Reduction via On-Demand Loading!

```
┌──────────────────────────┐
│ Claude Code CLI          │  You are here
│ (stdio connection)       │
└─────────┬────────────────┘
          │ stdio
┌─────────▼────────────────┐
│ MCP ROUTER               │  ← Loads ONLY 2K tokens!
│ (router/server.ts)       │    (3 meta-tools only!)
│                          │
│ What it exposes:         │
│ • search_tools           │
│ • get_tool_schema        │
│ • execute_tool           │
│                          │
│ 98 real tools HIDDEN     │
│ (discovered on-demand)   │
└─────────┬────────────────┘
          │ HTTP (localhost:3100)
┌─────────▼────────────────┐
│ GOOGLE BACKEND           │  ← ~50K tokens (NOT loaded!)
│ (port 3100, HTTP only)   │    (separate process)
│                          │
│ What it contains:        │
│ • All 98 tool impls      │
│ • Full schemas           │
│ • OAuth logic            │
│ • Interactive workflows  │
└──────────────────────────┘
```

**The Magic:**
- **Before:** All 98 tools = 65,000 tokens loaded at connection
- **After:** Only 3 meta-tools = 2,028 tokens loaded
- **Savings:** 62,972 tokens (**96.9% reduction!**)

**How:** Real tools hidden from tools/list. Discovered via `search_tools`, schemas retrieved via `get_tool_schema` on-demand, executed via `execute_tool`. Tool schemas NEVER enter context - only responses do!

**Proven:** Calling tools does NOT increase MCP tools context usage. Schemas stay server-side!

---

## 🚀 Complete Startup Sequence

### Step 1: Build the Code (If Not Already Built)

```bash
cd "/home/dogancanbaris/projects/MCP Servers"
npm run build
```

**When needed:**
- First time setup
- After pulling code changes
- After TypeScript errors

**What it does:**
- Compiles TypeScript → JavaScript in `dist/`
- Checks for type errors
- Takes ~30 seconds

### Step 2: Start the Google Backend Server

**Option A: Development (with TypeScript hot reload)**
```bash
cd "/home/dogancanbaris/projects/MCP Servers"
npm run dev:google-backend
```

**Option B: Production (compiled JavaScript)**
```bash
cd "/home/dogancanbaris/projects/MCP Servers"
GOOGLE_BACKEND_PORT=3100 node dist/backends/google-marketing/server.js
```

**Expected Output:**
```
Loading MCP SDK...
MCP SDK loaded successfully
Loading tools from gsc/tools/index.js...
Tools loaded successfully: 98 tools
🚀 Google Marketing Backend running on http://localhost:3100/mcp
✅ Serving 98 tools
```

**Verify it's running:**
```bash
curl http://localhost:3100/health
# Should return: {"status":"healthy","tools":98}
```

### Step 3: Reconnect MCP in Claude Code

```bash
/mcp reconnect wpp-digital-marketing
```

**Or restart Claude Code entirely (kills and respawns router).**

### Step 4: Verify Tools Loaded

```bash
/context
```

**What you should see:**
```
MCP tools: ~22.5K tokens total
└ mcp__wpp-digital-marketing__search_tools (737 tokens)
└ mcp__wpp-digital-marketing__get_tool_schema (605 tokens)
└ mcp__wpp-digital-marketing__execute_tool (686 tokens)
... (only 3 meta-tools! 98 real tools hidden)
```

**WPP tools use:** ~2K tokens (vs 65K with direct tool loading!)

**If you see 0 tools:** Backend isn't running or router can't connect.

---

## 🔍 How to Use Meta-Tools (On-Demand Tool Discovery)

### The New Workflow Pattern

**All 98 tools are accessed through 3 meta-tools:**

1. **`search_tools`** - Find tools by keyword, category, or platform
2. **`get_tool_schema`** - Get full schema for a specific tool (on-demand)
3. **`execute_tool`** - Execute the tool with interactive workflows

### Pattern 1: Browse All Categories

```typescript
search_tools({})
```

**Returns:** List of 29 categories with tool counts
- Google Search Console: 4 categories, 8 tools
- Google Ads: 16 categories, 60 tools
- Google Analytics: 3 categories, 11 tools
- Core Web Vitals: 1 category, 5 tools
- And more...

### Pattern 2: Search by Keyword

```typescript
search_tools({ query: "campaign" })
```

**Returns:** All tools matching "campaign" (12 tools)
- create_campaign
- list_campaigns
- update_campaign_status
- get_campaign_performance
- And 8 more campaign-related tools

**Other useful keywords:**
- "keyword" → 12 keyword tools
- "budget" → 7 budget tools
- "analytics" → 13 analytics tools
- "dashboard" → 10 dashboard tools

### Pattern 3: Filter by Category

```typescript
search_tools({ category: "ads.campaigns" })
```

**Returns:** All tools in the campaigns category (4 tools)

**Popular categories:**
- `ads.campaigns` - Campaign management
- `ads.keywords` - Keyword management (8 tools)
- `gsc.analytics` - Search Console data
- `analytics.reporting` - GA4 reports

### Pattern 4: Filter by Platform

```typescript
search_tools({ platform: "google-ads" })
```

**Returns:** All 60 Google Ads tools across all categories

**Available platforms:**
- `google-search-console` - 8 tools
- `google-ads` - 60 tools
- `google-analytics` - 11 tools
- `core-web-vitals` - 5 tools
- `google-business` - 3 tools
- `bigquery` - 3 tools
- `serp` - 1 tool
- `wpp-analytics` - 7 tools

### Pattern 5: Get Tool Schema (On-Demand)

```typescript
get_tool_schema({ toolName: "list_campaigns" })
```

**Returns:**
- Full description
- All parameters with types
- Required vs optional parameters
- Usage example
- Category information

**Token cost:** Schema appears in Messages (~600 tokens), NOT in MCP tools context!

### Pattern 6: Execute Tool

```typescript
execute_tool({
  toolName: "list_campaigns",
  params: {
    customerId: "2191558405"
  }
})
```

**Returns:** Full interactive workflow response!
- Step-by-step guidance if params missing
- Rich analysis when complete
- Next-step suggestions
- Dry-run previews for WRITE operations

**Token cost:** Response in Messages (~800 tokens), schema stays out of context!

### Complete Example Workflow

```typescript
// 1. Find campaign tools
search_tools({ query: "campaign" })
// → Discover: list_campaigns, create_campaign, etc.

// 2. Get schema for specific tool
get_tool_schema({ toolName: "list_campaigns" })
// → See parameters: customerId (optional)

// 3. Execute the tool
execute_tool({
  toolName: "list_campaigns",
  params: {}
})
// → Interactive discovery: "SELECT ACCOUNT (Step 1/2)..."

// 4. Execute with account
execute_tool({
  toolName: "list_campaigns",
  params: { customerId: "2191558405" }
})
// → Returns full campaign list with rich analysis
```

**Key Benefits:**
- ✅ Only load what you need
- ✅ Discover tools organically
- ✅ Full interactive workflows preserved
- ✅ Zero context pollution

---

## 🔐 OAuth Setup (Interactive - DO NOT RUN IN BACKGROUND!)

### ⚠️ CRITICAL: Must Be Interactive with User

**Why:** OAuth requires user to authorize in browser → copy callback URL → paste into terminal.

**DO NOT** run `npx tsx src/setup-auth.ts &` (background mode) - it WILL FAIL!

### Option 1: Full OAuth Setup (First Time)

**When:** Fresh setup, token expired, or refresh token invalid.

**Steps:**

```bash
cd "/home/dogancanbaris/projects/MCP Servers"
npx tsx src/setup-auth.ts
```

**What happens:**

1. **Script opens browser** with Google OAuth consent page
   ```
   https://accounts.google.com/o/oauth2/v2/auth?...
   ```

2. **User authorizes** (clicks "Allow")
   - Grants access to:
     - Google Search Console
     - Google Ads
     - Google Analytics
     - BigQuery
     - Business Profile

3. **Browser redirects** to callback:
   ```
   http://localhost:6000/callback?code=4/0Ab32j935xK...
   ```

4. **User COPIES the ENTIRE callback URL** from browser address bar

5. **User PASTES into terminal** when prompted

6. **Script exchanges code for tokens**:
   - Access token (expires in 1 hour)
   - Refresh token (never expires, unless revoked)

7. **Tokens saved** to `/config/gsc-tokens.json`

8. **Done!** ✅

### Option 2: Quick Token Refresh (If You Have Refresh Token)

**When:** Access token expired but refresh token still valid.

```bash
cd "/home/dogancanbaris/projects/MCP Servers"
node refresh-oauth-token.cjs
```

**What happens:**
- Uses refresh token to get new access token from Google
- Updates `/config/gsc-tokens.json`
- Takes ~2 seconds

**If this fails** (`invalid_grant`): Refresh token is invalid/revoked → Use Option 1.

### Where Tokens Are Stored

**File:** `/home/dogancanbaris/projects/MCP Servers/config/gsc-tokens.json`

**Format:**
```json
{
  "accessToken": "ya29.a0ATi6K2...",
  "refreshToken": "1//05rMk1EXI...",
  "expiryDate": "2025-11-09T18:28:08.227Z",
  "tokenType": "Bearer"
}
```

**Auto-Refresh:**
- Tools automatically check expiry before API calls
- If < 5 min to expiry → Auto-refresh
- No manual intervention needed!

### OAuth Scopes Granted

```
https://www.googleapis.com/auth/webmasters            # Search Console
https://www.googleapis.com/auth/adwords               # Google Ads
https://www.googleapis.com/auth/analytics             # Google Analytics (write)
https://www.googleapis.com/auth/analytics.readonly    # Google Analytics (read)
https://www.googleapis.com/auth/bigquery              # BigQuery
https://www.googleapis.com/auth/cloud-platform        # GCP APIs
https://www.googleapis.com/auth/business.manage       # Business Profile
```

**Code Location:** `/src/shared/oauth-client-factory.ts`

**See also:** `.claude/skills/oauth/SKILL.md` for deep OAuth details

---

## 🛠️ Available Tools (98 Total)

### Google Search Console (8 tools)

**Read Operations:**
- `google__list_properties` - List all GSC properties you have access to
- `google__get_property` - Get detailed property information
- `google__query_search_analytics` - Get search traffic data (clicks, impressions, CTR, position)
- `google__inspect_url` - Check URL indexing status and issues
- `google__list_sitemaps` - List submitted sitemaps
- `google__get_sitemap` - Get specific sitemap details

**Write Operations:**
- `google__submit_sitemap` - Submit new sitemap for indexing
- `google__delete_sitemap` - Remove sitemap from Search Console

### Google Ads (60 tools)

**Campaigns (5):**
- `google__create_campaign` - Create new campaign
- `google__update_campaign_status` - Pause, enable, or remove campaign
- `google__list_campaigns` - List all campaigns with status
- `google__pause_campaign` - Quick pause/enable
- `google__get_campaign_performance` - Get performance metrics

**Ad Groups (5):**
- `google__create_ad_group` - Create new ad group
- `google__update_ad_group` - Modify ad group settings
- `google__list_ad_groups` - List all ad groups
- `google__get_ad_group_quality_score` - Get quality scores
- `google__set_ad_group_bid_modifier` - Adjust bids by percentage

**Keywords (12):**
- `google__add_keywords` - Add keywords to ad group
- `google__remove_keywords` - Remove keywords
- `google__add_negative_keywords` - Add negative keywords (campaign level)
- `google__remove_negative_keywords` - Remove negatives
- `google__list_keywords` - List all keywords with performance
- `google__update_keyword_bid` - Set max CPC bid
- `google__update_keyword_match_type` - Change match type
- `google__get_search_terms` - Get actual search queries
- `google__remove_search_term` - Block specific search term
- `google__generate_keyword_ideas` - Get keyword suggestions
- `google__get_keyword_forecasts` - Estimate performance
- `google__get_keyword_performance` - Detailed keyword metrics

**Ads (4):**
- `google__create_ad` - Create responsive search ad
- `google__update_ad` - Modify ad status
- `google__list_ads` - List all ads
- `google__pause_ad` - Quick pause/enable

**Budgets (3):**
- `google__create_budget` - Create campaign budget
- `google__update_budget` - Modify daily budget
- `google__list_budgets` - List all budgets

**Bidding Strategies (4):**
- `google__list_bidding_strategies` - List portfolio strategies
- `google__create_portfolio_bidding_strategy` - Create Target CPA/ROAS
- `google__update_bidding_strategy` - Modify targets
- `google__set_ad_group_cpc_bid` - Set manual CPC bid

**Bid Modifiers (4):**
- `google__create_device_bid_modifier` - Adjust by device
- `google__create_location_bid_modifier` - Adjust by location
- `google__create_demographic_bid_modifier` - Adjust by age/gender
- `google__create_ad_schedule_bid_modifier` - Adjust by time

**Labels (6):**
- `google__create_label` - Create new label
- `google__list_labels` - List all labels
- `google__remove_label` - Delete label
- `google__apply_label_to_campaign` - Tag campaign
- `google__apply_label_to_ad_group` - Tag ad group
- `google__apply_label_to_keyword` - Tag keyword

**Targeting (5):**
- `google__add_location_criteria` - Add geo targeting
- `google__add_language_criteria` - Add language targeting
- `google__add_demographic_criteria` - Age/gender/income targeting
- `google__add_audience_criteria` - In-market/affinity audiences
- `google__set_ad_schedule` - Set day-parting

**Conversions (5):**
- `google__list_conversion_actions` - List all conversions
- `google__get_conversion_action` - Get conversion details
- `google__create_conversion_action` - Create new conversion
- `google__upload_click_conversions` - Upload offline conversions
- `google__upload_conversion_adjustments` - Adjust/retract conversions

**Audiences (4):**
- `google__list_user_lists` - List remarketing lists
- `google__create_user_list` - Create remarketing list
- `google__upload_customer_match_list` - Upload email/phone list
- `google__create_audience` - Create audience segment

**Accounts (1):**
- `google__list_accessible_accounts` - List all Ads accounts

**Assets (1):**
- `google__list_assets` - List images, videos, text assets

**Reporting (8):**
- `google__get_campaign_performance` - Campaign metrics
- `google__get_ad_group_performance` - Ad group metrics
- `google__get_ad_performance` - Individual ad metrics
- `google__get_keyword_performance` - Keyword metrics
- `google__list_budgets` - Budget overview
- `google__get_ad_group_quality_score` - Quality score analysis
- `google__run_custom_report` - Custom GAQL queries
- `google__get_search_terms_report` - Search query analysis

### Google Analytics 4 (11 tools)

**Account Management:**
- `google__list_analytics_accounts` - List all GA4 accounts
- `google__list_analytics_properties` - List properties (websites/apps)
- `google__list_data_streams` - List data streams
- `google__create_analytics_property` - Create new property
- `google__create_data_stream` - Create web/app stream

**Reporting:**
- `google__run_analytics_report` - Custom reports with dimensions/metrics
- `google__get_realtime_users` - Real-time active users (last 30 min)

**Configuration:**
- `google__create_custom_dimension` - Add custom dimension
- `google__create_custom_metric` - Add custom metric
- `google__create_conversion_event` - Mark event as conversion
- `google__create_google_ads_link` - Link to Google Ads

### Core Web Vitals (5 tools)

- `google__get_core_web_vitals_origin` - Get CWV for entire domain
- `google__get_core_web_vitals_url` - Get CWV for specific page
- `google__get_cwv_history_origin` - Historical CWV trends (domain)
- `google__get_cwv_history_url` - Historical CWV trends (page)
- `google__compare_cwv_form_factors` - Compare desktop/mobile/tablet

### Google Business Profile (3 tools)

- `google__list_business_locations` - List all locations
- `google__get_business_location` - Get location details
- `google__update_business_location` - Update hours, phone, website

### BigQuery (3 tools)

- `google__list_bigquery_datasets` - List all datasets
- `google__create_bigquery_dataset` - Create new dataset
- `google__run_bigquery_query` - Execute SQL query

### SERP API (1 tool)

- `google__search_google` - Get Google search results (rank tracking)

### WPP Analytics Platform (7 tools)

**Dashboard Management:**
- `google__create_dashboard` - Create new dashboard
- `google__get_dashboard` - Get dashboard configuration
- `google__list_dashboards` - List all dashboards
- `google__update_dashboard_layout` - Modify dashboard
- `google__delete_dashboard` - Delete dashboard

**Data Integration:**
- `google__list_datasets` - List shareable BigQuery datasets
- `google__push_platform_data_to_bigquery` - Pull GSC/Ads/GA4 data to BigQuery
- `google__create_dashboard_from_table` - Create dashboard from BigQuery table
- `google__analyze_gsc_data_for_insights` - GSC data analysis and insights

---

## 🎨 Interactive Workflow System

### How Tools Guide You (No Errors for Missing Params!)

**Old Pattern (Frustrating):**
```
Agent: Call tool without property
Tool: ERROR - property is required
Agent: Confused, asks user what property
```

**New Pattern (Guided):**
```
Agent: Call google__query_search_analytics()

Tool: "🔍 SELECT PROPERTY (Step 1/3)

      1. sc-domain:example.com (siteOwner)
      2. https://site2.com/ (siteFullUser)

      Which property?"

Agent: Call with property="sc-domain:example.com"

Tool: "📅 DATE RANGE (Step 2/3)

      Quick options:
      - Last 7 days
      - Last 30 days
      - Last 90 days

      Or specify: YYYY-MM-DD to YYYY-MM-DD"

Agent: Call with startDate="2025-10-01", endDate="2025-10-31"

Tool: "📊 SEARCH PERFORMANCE ANALYSIS

      **Property:** sc-domain:example.com
      **Period:** Oct 1-31, 2025

      **SUMMARY:**
      - Total Clicks: 12,345
      - Total Impressions: 456,789
      - Avg CTR: 2.7%
      - Avg Position: 8.3

      💡 KEY INSIGHTS:
      - Good CTR for position 8.3
      - Top query: "marketing analytics" (2,456 clicks)
      - Mobile: 68% of traffic

      🎯 NEXT STEPS:
      - Check indexing: use inspect_url
      - Core Web Vitals: use get_core_web_vitals_origin
      - Compare with paid: use list_campaigns"
```

**Result:**
- No cryptic errors
- Step-by-step guidance
- Rich analysis when done
- Suggested next tools

### WRITE Operations (Multi-Step Approval)

**Example: Update Campaign Budget**

**Step 1-3: Discovery**
```
Step 1: Account selection (if not provided)
Step 2: Campaign/budget selection
Step 3: New amount specification
```

**Step 4: DRY-RUN PREVIEW (Requires User Approval)**
```
Tool: "📋 BUDGET UPDATE - REVIEW & CONFIRM (Step 4/5)

      **CURRENT STATE:**
      Budget: $50/day
      Campaign: Brand Campaign

      **PROPOSED CHANGE:**
      New Budget: $75/day
      Increase: +$25/day (+50%)

      **FINANCIAL IMPACT:**
      Daily: +$25
      Monthly (30 days): +$750
      Yearly: +$9,125

      ⚠️ WARNINGS:
      • Large increase (>25%) - consider gradual changes
      • Monitor closely for first 48 hours

      ✅ To proceed, call with confirmationToken: "abc123xyz"
      ❌ To cancel, stop here"
```

**Step 5: EXECUTE (With Confirmation Token)**
```
Agent: Call with confirmationToken="abc123xyz"

Tool: "✅ BUDGET UPDATED SUCCESSFULLY

      **Change Summary:**
      Previous: $50/day
      New: $75/day
      Effective: Immediately

      **Audit Trail:**
      Audit ID: aud_20251109_123456
      Changed By: user@example.com (via OAuth)
      Timestamp: 2025-11-09 12:34:56 UTC

      💡 NEXT STEPS:
      - Monitor performance: use get_campaign_performance
      - Check impressions: use get_campaign_performance
      - Review in 48h: assess impact"
```

**Safety Features:**
- Can't skip preview (no token = shows preview)
- Clear financial impact shown
- Warnings for risky changes
- Audit trail for compliance

---

## 🔧 Troubleshooting Guide

### Problem: Tools Not Showing in /context

**Step 1: Check if backend is running**
```bash
curl http://localhost:3100/health
```

**If fails:**
```bash
# Start backend
npm run dev:google-backend
# Wait for: "✅ Serving 98 tools"
```

**Step 2: Reconnect MCP**
```bash
/mcp reconnect wpp-digital-marketing
```

**Step 3: Verify**
```bash
/context
# Should show 98 tools with prefix: mcp__wpp-digital-marketing__google__*
```

### Problem: Backend Crashes on Start

**Check build errors:**
```bash
npm run build
# Fix any TypeScript errors shown
```

**Check port 3100:**
```bash
lsof -i :3100
# If something else is using it:
kill -9 <PID>
```

**Check logs:**
```bash
# Backend should output:
Loading MCP SDK...
MCP SDK loaded successfully
Loading tools...
Tools loaded successfully: 98 tools
```

### Problem: OAuth Token Error

**Error:** `OAuth token required for Google Search Console API access`

**Step 1: Check token exists**
```bash
cat config/gsc-tokens.json
# Should show accessToken, refreshToken, expiryDate
```

**Step 2: Check expiry**
```json
{
  "expiryDate": "2025-11-09T18:28:08.227Z"  // Check if past
}
```

**If expired:**
```bash
# Try quick refresh
node refresh-oauth-token.cjs

# If that fails with "invalid_grant":
# Run full OAuth setup (INTERACTIVE!)
npx tsx src/setup-auth.ts
```

### Problem: "invalid_grant" Error

**Cause:** Refresh token expired, revoked, or invalid

**Solution:** Full OAuth re-authorization
```bash
npx tsx src/setup-auth.ts
# Follow interactive prompts
# Copy callback URL from browser
# Paste into terminal
```

### Problem: Router Shows 0 Tools

**Backend not accessible to router**

**Check:**
```bash
# 1. Is backend running?
curl http://localhost:3100/health

# 2. Check router config
cat .mcp.json
# Should show: "GOOGLE_BACKEND_URL": "http://localhost:3100/mcp"

# 3. Restart both
pkill -f "google-backend"
npm run dev:google-backend

# Then reconnect
/mcp reconnect wpp-digital-marketing
```

---

## 📁 File Structure Reference

```
/home/dogancanbaris/projects/MCP Servers/

├── src/
│   ├── router/                       # MCP Router (6K tokens)
│   │   ├── server.ts                 # Main router (stdio + HTTP)
│   │   ├── backend-registry.ts       # Description extraction logic
│   │   └── config.ts                 # Backend configurations
│   │
│   ├── backends/
│   │   └── google-marketing/
│   │       └── server.ts             # Google backend (port 3100, 98 tools)
│   │
│   ├── shared/
│   │   ├── oauth-client-factory.ts   # OAuth token management + auto-refresh
│   │   ├── interactive-workflow.ts   # Guided workflow utilities
│   │   ├── logger.ts                 # Structured logging
│   │   └── dry-run-builder.ts        # Preview builder for WRITE ops
│   │
│   ├── gsc/                          # Google Search Console (8 tools)
│   │   ├── auth.ts                   # OAuth authorization flow
│   │   └── tools/
│   │
│   ├── ads/                          # Google Ads (60 tools)
│   │   └── tools/
│   │       ├── campaigns/
│   │       ├── ad-groups/
│   │       ├── keywords/
│   │       └── bidding/
│   │
│   ├── analytics/                    # Google Analytics (11 tools)
│   ├── business-profile/             # Business Profile (3 tools)
│   ├── crux/                         # Core Web Vitals (5 tools)
│   ├── bigquery/                     # BigQuery (3 tools)
│   ├── serp/                         # SERP API (1 tool)
│   └── wpp-analytics/                # Dashboard tools (7 tools)
│
├── config/
│   └── gsc-tokens.json               # OAuth tokens (auto-refreshed)
│
├── .env                              # OAuth credentials, API keys
├── .mcp.json                         # MCP server configuration
├── package.json                      # NPM scripts
├── tsconfig.json                     # TypeScript config
│
└── dist/                             # Compiled JavaScript (after build)
    ├── router/
    └── backends/
```

---

## ⚙️ Environment Configuration

### .env File Location
`/home/dogancanbaris/projects/MCP Servers/.env`

### Required Variables

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=60184572847-2knv6l327muo06kdp35km87049hagsot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:6000/callback

# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=_rj-sEShX-fFZuMAIx3ouA

# Token Paths
GSC_CONFIG_PATH=./config/gsc-config.json
GSC_TOKENS_PATH=./config/gsc-tokens.json

# OMA Configuration (for future integration)
OMA_API_KEY=test-key-123
```

---

## 📚 Additional Documentation

**For deep dives:**

| Topic | File | Use When |
|-------|------|----------|
| **OAuth Details** | `.claude/skills/oauth/SKILL.md` | Understanding OAuth flow, scopes, token refresh |
| **Reporting Platform** | `.claude/skills/reporting-platform/SKILL.md` | Creating dashboards, chart types, BigQuery integration |
| **Router Architecture** | `/docs/router-architecture.md` | Understanding router implementation details |
| **Interactive Workflows** | `/docs/SESSION-HANDOVER-interactive-tool-transformation.md` | How guided workflows were implemented |
| **Complete Blueprint** | `/PROJECT-BLUEPRINT.md` | Full project architecture (2,427 lines) |
| **Quick Reference** | `/CLAUDE.md` | AI agent guide + quick reference |

---

## 💡 Remember

**This is ONE master skill that covers:**
- ✅ Fresh start scenario (PC boot → working tools)
- ✅ Complete architecture (router + backend)
- ✅ Exact startup commands
- ✅ Interactive OAuth setup (NOT background!)
- ✅ All 98 tools reference
- ✅ Troubleshooting decision trees
- ✅ File locations
- ✅ Token management

**Invoke this skill** and you know everything needed to operate the WPP MCP server.

🚀 **Ready to start!**
