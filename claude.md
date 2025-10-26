# WPP Marketing Analytics Platform

**AI-powered analytics platform for WPP practitioners**

Practitioners → OMA Platform (AI) → MCP Server (31 tools, 7 Google APIs) → BigQuery → Reporting Platform → Dashboards

---

## 🎯 What We're Building

Complete agentic solution where **AI agents and practitioners have equal capabilities** to:
- Analyze marketing data (GSC, Google Ads, Analytics)
- Create custom dashboards with 34 chart types
- Optimize campaigns and budgets
- Track performance across platforms
- Export, share, and collaborate on insights

**For:** WPP marketing agencies and clients
**How:** OAuth 2.0 (user credentials only, no service accounts)

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

**See WORKFLOW.md for complete usage guide** 🚀
