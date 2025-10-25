# WPP Marketing Analytics Platform - Agent Guide

## 🎯 What This Platform Does

Complete agentic solution for WPP practitioners to analyze and modify data across Google marketing platforms. Practitioners use OMA platform → AI Agent → MCP Server → Google APIs → BigQuery → Reporting Platform → Frontend.

## 🏗️ Architecture Flow

```
WPP Practitioner
  ↓ (uses)
OMA Platform (internal AI)
  ↓ (connects via)
MCP Server (wpp-digital-marketing)
  ↓ (31 tools across 7 Google APIs)
Data Platforms (GSC, Ads, Analytics, BigQuery, Business Profile, CrUX, SERP)
  ↓ (all data flows to)
BigQuery (central data hub)
  ↓ (queried by)
Reporting Platform API (9 backend endpoints)
  ↓ (displays in)
Frontend (Next.js + Recharts + Shadcn/ui)
```

## 🔑 Critical Concept: OAuth 2.0 is Our ONLY Authentication System

- **File:** src/shared/oauth-client-factory.ts
- Every API call uses user's OAuth access token
- No service accounts, no API keys
- Auto-refresh for expired tokens (< 5 minute check)
- **Skill trigger:** When authorization needed → invoke OAuth skill

## 🛠️ Available Skills (Invoke These!)

### 1. MCP Server Skill
**Trigger keywords:** "what tools available", "connected platforms", "which API", "what metrics", "list tools"
**Purpose:** Find available tools across 7 Google API modules (31 total tools)
**File:** .claude/agents/mcp-server.md

### 2. Chrome DevTools MCP Skill
**Trigger keywords:** "debug chrome", "devtools mcp", "wsl2 chrome", "target closed error", "browser debugging"
**Purpose:** Setup and troubleshoot chrome-devtools-mcp in WSL2 environment
**Reference:** CHROME-DEVTOOLS-MCP-FIX.md
**File:** .claude/agents/chrome-devtools-mcp.md

### 3. Linear Skill
**Trigger keywords:** "create issue", "update ticket", "linear format", "track work", "document in linear"
**Purpose:** Systematic issue creation (what to do → references → completion bullets)
**File:** .claude/agents/linear.md

### 4. OAuth Skill
**Trigger keywords:** "authorization", "connect platform", "oauth flow", "token refresh", "authenticate"
**Purpose:** Guide through OAuth setup for new platforms/users
**Reference:** src/shared/oauth-client-factory.ts, OAUTH-MIGRATION-GUIDE.md
**File:** .claude/agents/oauth.md

### 5. Reporting Platform Skill
**Trigger keywords:** "create dashboard", "bigquery data", "chart types", "reporting api", "visualize"
**Purpose:** Dashboard creation, API endpoints, BigQuery data flows
**Reference:** wpp-analytics-platform/, src/wpp-analytics/
**File:** .claude/agents/reporting-platform.md

## 📊 MCP Server Tools (31 Total)

### Google Search Console (11 tools)
File: src/gsc/tools/
- list_properties, query_search_analytics, inspect_url, submit_sitemap, delete_sitemap, list_sitemaps, get_sitemap, get_property, get_core_web_vitals_origin, get_core_web_vitals_url, compare_cwv_form_factors

### Google Ads (14 tools)
File: src/ads/tools/
- list_accessible_accounts, list_campaigns, get_campaign_performance, get_search_terms_report, list_budgets, create_budget, update_budget, update_campaign_status, create_campaign, add_keywords, add_negative_keywords, list_conversion_actions, upload_click_conversions, upload_conversion_adjustments

### Google Analytics (5 tools)
File: src/analytics/tools/
- list_analytics_accounts, list_analytics_properties, run_analytics_report, get_realtime_users, list_data_streams

### BigQuery (2 tools)
File: src/bigquery/tools.ts
- list_bigquery_datasets, run_bigquery_query

### Business Profile (3 tools)
File: src/business-profile/tools.ts
- list_business_locations, get_business_location, update_business_location

### Chrome DevTools (15 tools)
File: mcp__chrome-devtools__*
- list_pages, new_page, navigate_page, take_screenshot, click, fill, evaluate_script, etc.

### Additional Tools
- Core Web Vitals, SERP Search, and more

## 🎨 Reporting Platform Architecture

**Frontend:** wpp-analytics-platform/frontend/
- Next.js 15 + React 19 + TypeScript
- Recharts for visualizations (NOT Cube.js)
- Shadcn/ui components + Tailwind CSS
- 13 chart types supported
- Drag-and-drop dashboard builder
- Dark mode, export, sharing

**Backend API:** wpp-analytics-platform/frontend/src/app/api/
9 endpoints:
1. /dashboards/create - Create dashboard
2. /dashboards/[id] - Get/update/delete dashboard
3. /dashboards/fields - Available metrics/dimensions
4. /data/query - Execute data queries
5. /metadata/platforms - List platforms
6. /metadata/[platform] - Platform metadata
7. /datasets/register - Register dataset
8. /datasets/[id]/query - Query dataset
9. /datasets/[id]/insert - Insert data

**Data Flow:** BigQuery (central hub) → API calculates metrics → Frontend displays charts

**Agent-Ready:** Agents can modify everything practitioners can (dashboards, queries, datasets)

## 📁 Key Files Reference

**OAuth Implementation:**
- src/shared/oauth-client-factory.ts (271 lines, auto-refresh, all Google APIs)

**MCP Tools:**
- src/gsc/tools/ - Search Console tools
- src/ads/tools/ - Google Ads tools
- src/analytics/tools/ - Analytics tools
- src/wpp-analytics/tools/ - Dashboard management tools

**Reporting Platform:**
- wpp-analytics-platform/README.md (overview)
- src/wpp-analytics/README.md (dashboard MCP tools, 464 lines)

**Configuration:**
- .mcp.json - MCP server config
- package.json - Tech stack

## 📚 Documentation Structure

All detailed documentation in /docs:
- /docs/README.md - Documentation index
- /docs/architecture/ - System design, diagrams
- /docs/guides/ - Developer guides, integration guides
- /docs/api-reference/ - Complete tool documentation
- /docs/deployment/ - Production deployment
- /docs/oauth/ - OAuth implementation details
- /docs/reporting-platform/ - Platform architecture

## 🚀 For Developers

See /docs for detailed guides and comprehensive documentation.

## 🔄 Sub-Agents & Skills Alignment

All sub-agents are aligned with this system:
- Each agent has specific keyword triggers that invoke appropriate skills
- All agents reference this claude.md as foundation
- Skills provide domain-specific context for agents

## ✨ System Properties

✅ **100% OAuth 2.0 Authentication** - No service accounts
✅ **31 Production-Ready MCP Tools** - Comprehensive Google API coverage
✅ **9-Layer Safety System** - Approval workflows, budget caps, rollback capability
✅ **Central BigQuery Hub** - All data flows through for blending
✅ **Agent-Ready Architecture** - Agents can modify everything practitioners can
✅ **Systematic Linear Tracking** - All work tracked (MCP-1 through MCP-48+)
✅ **5-Skill System** - Keyword-driven skills for auto-invocation

---

**Last Updated:** 2025-10-25
**Status:** Production-ready with systematic architecture
