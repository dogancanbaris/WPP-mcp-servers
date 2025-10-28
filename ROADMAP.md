# WPP Analytics Platform - Completion Roadmap

**Last Updated:** 2025-10-26
**Status:** Phase 4.1 Complete - Ready for UI Development (Phase 4.2)

---

## 🎯 Vision

Build a **fully agentic analytics platform** where both AI agents and practitioners have equal capabilities to:
- Create and customize dashboards with complete design control
- Query data from 7+ marketing platforms via unified BigQuery hub
- Export, share, and collaborate on insights
- Manage multi-tenant workspaces with OAuth-based security

---

## 📊 Current Platform State

### ✅ **Completed Architecture** (Phase 1-3)

**Core Infrastructure:**
- ✅ OAuth 2.0 authentication system (Google APIs, no service accounts)
- ✅ Supabase backend with multi-tenant RLS policies
- ✅ BigQuery as central data lake
- ✅ Dataset-based architecture (replaced Cube.js completely - 414MB saved)
- ✅ Metadata registry system (JSON configs per platform)
- ✅ 9 API endpoints for dashboards, datasets, metadata, queries
- ✅ Intelligent caching system for BigQuery queries

**MCP Tools (31 total across 7 Google APIs):**
- ✅ Search Console: 11 tools (analytics, indexing, CWV, sitemaps)
- ✅ Google Ads: 14 tools (campaigns, budgets, keywords, conversions)
- ✅ Analytics (GA4): 5 tools (properties, reports, realtime)
- ✅ BigQuery: 2 tools (datasets, queries)
- ✅ Business Profile: 3 tools (locations, updates)
- ✅ Reporting Platform: 4 tools (dashboards, data push, templates, insights)
- ✅ SERP Search: 1 tool (unlimited Google results, no API limits)

**Frontend Foundation:**
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ Recharts 3.3.0 for all visualizations
- ✅ Shadcn/ui components + Tailwind CSS
- ✅ Dark mode support
- ✅ Centralized theme system (wpp-branding)

### 🚧 **Partially Complete** (Needs Testing/Completion)

**UI Components:**
- 🚧 **EditorTopbar** (2-row: 40px menu + 48px toolbar) - EXISTS, needs connection testing
- 🚧 **SettingsSidebar** (3-tab: Setup, Style, Filters) - EXISTS, needs full implementation
  - ✅ Setup tab implemented
  - ⚠️ Style tab partially implemented
  - ❌ Filters tab incomplete
- 🚧 **Drag-and-drop Builder** - EXISTS, needs comprehensive testing

**Chart Components (57 total):**
- ✅ 4 Migrated to new architecture:
  - Scorecard.tsx
  - TimeSeriesChart.tsx
  - TableChart.tsx
  - PieChart.tsx
- ❌ **53 Unmigrated Charts** (many are placeholders "Chart not yet migrated"):
  - AreaChart, BarChart, LineChart, FunnelChart, GaugeChart
  - HeatmapChart, RadarChart, SankeyChart, ScatterChart
  - TreemapChart, WaterfallChart, BubbleChart
  - ComboChart, PolarChart, RadialBarChart
  - And 38+ more variants/specialized charts

### ❌ **Missing Critical Features**

**Platform Capabilities:**
- ❌ Export functionality (PDF, Excel, PNG)
- ❌ Sharing system (team collaboration, public links)
- ❌ Calculated fields (custom metrics, formulas)
- ❌ Version history (dashboard revisions, rollback)
- ❌ Real-time collaboration (multi-user editing)
- ❌ Mobile responsiveness (responsive grid system)
- ❌ Template marketplace (pre-built dashboards)

**MCP Tool Gaps:**
- ❌ Style parameters missing in create_dashboard tool
- ❌ Style parameters missing in update_dashboard_layout tool
- ❌ No MCP tool for calculated fields
- ❌ No MCP tool for export operations
- ❌ No MCP tool for sharing/permissions

### ✅ **Documentation & Agent Knowledge** (Phase 4.1 Complete)

**Agent System:**
- ✅ Old agents deleted (frontend-developer, backend-api-specialist, database-analytics-architect, devops-infrastructure-specialist, auth-security-specialist)
- ✅ New 9-agent system created (3 fast answer, 5 work, 1 maintenance)
- ✅ All agents have keyword triggers for proactive invocation
- ✅ WORKFLOW.md created (complete usage guide)
- ✅ Agent knowledge 100% accurate (no Cube.js references)

**Documentation Files:**
- ✅ `wpp-analytics-platform/README.md` - Updated (34 chart types, 9 API endpoints, ECharts + Recharts)
- ✅ `DATA-LAYER-ARCHITECTURE.md` - Created (305 lines, complete technical reference)
- ✅ `claude.md` - Created (87 lines, entry point)
- ✅ `ROADMAP.md` - Created (613 lines, Phase 4.1-4.8)
- ✅ `WORKFLOW.md` - Created (412 lines, agent usage guide)
- ✅ `LINEAR_TICKETS_MCP47_TO_MCP75.md` - Created (1,364 lines, all tickets)

**Skills:**
- ✅ `.claude/skills/` (5 skills created with proper YAML, accurate content)
  - mcp-server.md, chrome-devtools-mcp.md, linear.md, oauth.md, reporting-platform.md

**Deprecated Tech Removal:**
- ✅ All Cube.js references removed from code (202 files affected, 0 in production)
- ✅ CraftJS references removed
- ✅ Metabase/Superset references removed
- ✅ Service account references removed
- ✅ Report: TECH_STACK_CLEANUP_FINAL.md created

---

## 🗺️ Phase 4: Completion Plan

### **Phase 4.1: Documentation & Knowledge Update** ✅ COMPLETE

**Goal:** Get all documentation and agent knowledge 100% accurate before using agents.

**Status:** ✅ **COMPLETED (Oct 25-26, 2025)**

**Implementation Note:** Phase 4.1 was completed via a different approach than originally planned:
- Instead of updating old agents (MCP-47, MCP-48, MCP-49), all 5 old agents were deleted
- Created 9 new specialized agents with keyword triggers (tracked as MCP-48)
- All objectives met: agent knowledge updated, docs accurate, deprecated tech removed
- Files created: DATA-LAYER-ARCHITECTURE.md, WORKFLOW.md, claude.md, TECH_STACK_CLEANUP_FINAL.md

#### 4.1.1 - Update Core Documentation ✅
- [x] **wpp-analytics-platform/README.md** - Updated with 34 chart types, 9 API endpoints (MCP-46)
  - Removed all Cube.js references
  - Added correct tech stack: ECharts 5.5 + Recharts 3.3.0, BigQuery direct
  - Documented dataset-based architecture
  - Added agentic design patterns

#### 4.1.2 - Update Agent System ✅
- [x] **Created 9 new specialized agents** (MCP-48):
  - **Fast Answer Agents (Haiku):** knowledge-base, mcp-tools-reference, linear-status-checker
  - **Work Agents (Sonnet):** chart-migrator, frontend-builder, mcp-tool-builder, database-optimizer
  - **Maintenance Agents (Haiku):** doc-syncer, code-reviewer
- [x] Added keyword triggers for proactive invocation
- [x] Created WORKFLOW.md with decision trees and example sessions
- [x] Simplified claude.md to 87 lines (entry point + links)

#### 4.1.3 - Remove Deprecated Tech ✅
- [x] **All Cube.js references removed** (MCP-47) - 202 files affected, 0 in production code
- [x] All CraftJS references removed
- [x] All Metabase/Superset references removed
- [x] All service account references removed
- [x] Created TECH_STACK_CLEANUP_FINAL.md report

#### 4.1.4 - Create New Architecture Documentation ✅
- [x] **Created DATA-LAYER-ARCHITECTURE.md** (305 lines) - Complete technical reference
  - Documented BigQuery → Dataset → API → Frontend flow
  - Explained metadata registry system
  - Documented caching strategy
  - Provided examples of data blending

#### 4.1.5 - Create Skills Library ✅
- [x] **Created 5 keyword-driven skills** (MCP-45):
  - mcp-server.md - 31 tool catalog
  - oauth.md - OAuth 2.0 patterns
  - linear.md - Ticket format guide
  - chrome-devtools-mcp.md - WSL2 debugging
  - reporting-platform.md - Dashboard MCP tools
- [x] Deleted 14 old generic skills

**Success Criteria:** ✅ **ALL MET**
- All agents and documentation reference only the current architecture
- No Cube.js mentions in production code
- Agents can be safely used for development work
- Complete documentation created (ROADMAP, WORKFLOW, DATA-LAYER-ARCHITECTURE)

---

### **Phase 4.2: UI Completion** (PRIORITY 2)

**Goal:** Complete all UI elements for practitioner and agent use.

#### 4.2.1 - Complete SettingsSidebar Tabs
- [ ] **Style Tab** (partial → complete)
  - Color picker for charts
  - Font size controls
  - Theme preset selector
  - Custom CSS input (advanced)
  - Style cascade visualization

- [ ] **Filters Tab** (incomplete → complete)
  - Date range picker integration
  - Dimension filter UI
  - Metric filter UI
  - Filter persistence
  - Filter sharing

#### 4.2.2 - Test & Fix EditorTopbar
- [ ] Verify menu row (40px) functionality
- [ ] Verify toolbar row (48px) buttons work
- [ ] Test save/publish/export buttons
- [ ] Test undo/redo functionality
- [ ] Test preview mode toggle

#### 4.2.3 - Complete Drag-and-Drop Builder
- [ ] Test row creation/deletion
- [ ] Test column resizing (1/1, 1/2, 1/3, 2/3, 1/4, 3/4)
- [ ] Test component drag from palette
- [ ] Test component reordering
- [ ] Test grid snapping
- [ ] Fix any drag-drop bugs

#### 4.2.4 - Mobile Responsiveness
- [ ] Implement responsive grid system
- [ ] Test mobile layout breakpoints
- [ ] Create mobile-optimized sidebar
- [ ] Test touch interactions

**Success Criteria:** UI is fully functional for both practitioners and agents via MCP tools.

---

### **Phase 4.3: Chart Migration** (PRIORITY 3)

**Goal:** Migrate all 53 remaining charts to new dataset-based architecture.

#### 4.3.1 - Priority Charts (Most Used) ✅ COMPLETE
- [x] BarChart.tsx (Recharts - vertical/horizontal bars with stacking)
- [x] LineChart.tsx (Recharts - smooth/linear lines with dots)
- [x] AreaChart.tsx (Recharts - filled areas with gradients)
- [x] FunnelChart.tsx (ECharts - conversion stages)
- [x] GaugeChart.tsx (ECharts - single metric gauge)
- [x] HeatmapChart.tsx (ECharts - 2D data matrix)
- [x] RadarChart.tsx (ECharts - multivariate radial data)
- [ ] DonutChart.tsx (Not needed - PieChart already supports donut mode)

#### 4.3.2 - Secondary Charts (MCP-57) ✅ COMPLETE
- [x] SankeyChart.tsx (ECharts-based Sankey diagram)
- [x] ScatterChart.tsx (Recharts scatter plot)
- [x] TreemapChart.tsx (ECharts treemap)
- [x] WaterfallChart.tsx (Recharts waterfall chart)
- [x] BubbleChart.tsx (Recharts bubble chart with ZAxis)
- [x] ComboChart.tsx (Recharts composed chart - bar + line)
- [ ] PolarChart.tsx (Does not exist - skipped)
- [ ] RadialBarChart.tsx (Does not exist - skipped)

#### 4.3.3 - Specialized Charts (Lower Priority)
- [ ] Remaining 38 chart variants

**Migration Pattern for Each Chart:**
```typescript
// 1. Replace Cube.js imports with dataset fetch
// 2. Update query pattern to /api/datasets/[id]/query
// 3. Add style prop support (override theme)
// 4. Add loading/error states
// 5. Add export functionality
// 6. Test with BigQuery data
```

**Success Criteria:** All 57 charts migrated and working with dataset API.

---

### **Phase 4.4: Platform Features** (PRIORITY 4)

**Goal:** Add missing critical features for production readiness.

#### 4.4.1 - Export Functionality
- [ ] **PDF Export**
  - Install jspdf library
  - Create PDF renderer component
  - Add PDF export button to topbar
  - Support multi-page dashboards

- [ ] **Excel Export**
  - Install xlsx library
  - Create Excel workbook generator
  - Export data tables and charts as sheets

- [ ] **PNG Export**
  - Install html-to-image library
  - Capture dashboard as PNG
  - Handle high-DPI displays

#### 4.4.2 - Sharing System
- [ ] Database schema for shared dashboards
- [ ] Generate shareable links (public/private)
- [ ] Permission levels (view/edit/admin)
- [ ] Team collaboration UI
- [ ] Email notifications for shares

#### 4.4.3 - Calculated Fields
- [ ] UI for formula builder
- [ ] Formula validator (syntax checking)
- [ ] Support for: SUM, AVG, COUNT, IF, CASE
- [ ] Save calculated fields to metadata
- [ ] Display calculated fields in chart config

#### 4.4.4 - Version History
- [ ] Database schema for dashboard versions
- [ ] Auto-save on edits
- [ ] Version list UI in sidebar
- [ ] Rollback functionality
- [ ] Diff viewer (show changes)

#### 4.4.5 - Real-time Collaboration
- [ ] WebSocket connection setup
- [ ] Presence indicators (who's editing)
- [ ] Cursor sharing
- [ ] Edit conflict resolution
- [ ] Change broadcasting

**Success Criteria:** All 5 features implemented and tested.

---

### **Phase 4.5: MCP Tool Enhancements** (PRIORITY 5)

**Goal:** Add style parameters and new capabilities to MCP tools.

#### 4.5.1 - Enhance create_dashboard Tool
- [ ] Add style parameters to ComponentConfig:
  ```typescript
  {
    type: "scorecard",
    title: "Total Clicks",
    metrics: ["clicks"],
    style: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontSize: "24px",
      borderRadius: "8px",
      customCSS: "..."
    }
  }
  ```
- [ ] Add theme parameter to dashboard creation
- [ ] Update tool description with style examples

#### 4.5.2 - Enhance update_dashboard_layout Tool
- [ ] Add update_component_style operation
- [ ] Add apply_theme operation
- [ ] Update tool description

#### 4.5.3 - Create New MCP Tools
- [ ] **create_calculated_field**
  - Input: formula, name, dataset_id
  - Output: field_id

- [ ] **export_dashboard**
  - Input: dashboard_id, format (pdf|excel|png)
  - Output: download_url

- [ ] **share_dashboard**
  - Input: dashboard_id, email, permission_level
  - Output: share_url

#### 4.5.4 - Update Skills with New Capabilities
- [ ] Update reporting-platform.md with style examples
- [ ] Add calculated field examples
- [ ] Add export examples
- [ ] Add sharing examples

**Success Criteria:** Agents can create fully styled dashboards with all features via MCP tools.

---

### **Phase 4.6: Platform Integrations** (PRIORITY 6)

**Goal:** Add additional marketing platforms beyond Google.

#### 4.6.1 - Bing Webmaster Tools
- [ ] OAuth 2.0 setup for Bing
- [ ] MCP tools: list_bing_properties, query_bing_analytics
- [ ] BigQuery schema for Bing data
- [ ] Dashboard templates for Bing

#### 4.6.2 - Amazon Advertising (Optional)
- [ ] OAuth 2.0 setup for Amazon Ads
- [ ] MCP tools for campaigns, products, metrics
- [ ] BigQuery schema for Amazon data

#### 4.6.3 - Meta Business Suite (Optional)
- [ ] OAuth 2.0 setup for Meta
- [ ] MCP tools for Facebook/Instagram insights
- [ ] BigQuery schema for Meta data

**Success Criteria:** At least Bing integration complete, others as time allows.

---

### **Phase 4.7: BigQuery Data Lake - Hot/Cold Storage System** (PRIORITY 1 - CRITICAL) 🔥

**Goal:** Implement shared BigQuery data lake with on-demand pulls and daily refresh for truly live dashboards.

**Architecture:** Shared tables (one per platform) with workspace_id isolation, organic growth as practitioners use system.

**Reference:** See BIGQUERY-DATA-LAKE-ARCHITECTURE.md for complete design.

#### 4.7.1 - Create Shared Table Infrastructure (Week 1)
- [ ] Create `gsc_performance_shared` table with partitioning/clustering
- [ ] Create `ga4_sessions_shared` table
- [ ] Create `ads_performance_shared` table
- [ ] Add row-level security policies
- [ ] Create property_registry table in Supabase

#### 4.7.2 - Implement On-Demand Pull System (Week 1)
- [ ] Update dashboard creation API to check for existing data
- [ ] Add OAuth flow for property access
- [ ] Implement initial 12-month pull on first dashboard
- [ ] Add smart deduplication (same workspace + property = reuse)
- [ ] Store encrypted OAuth tokens for refresh

#### 4.7.3 - Daily Refresh Automation (Week 2)
- [ ] Deploy Cloud Function for daily refresh
- [ ] Configure Cloud Scheduler (2 AM UTC daily)
- [ ] Implement MERGE logic (yesterday's data only)
- [ ] Add active property detection (last 30 days)
- [ ] Add OAuth token expiry handling

#### 4.7.4 - GSC Trial Run (Week 2)
- [ ] Test with themindfulsteward.com property
- [ ] Verify initial pull works (12 months)
- [ ] Verify daily refresh works (yesterday only)
- [ ] Verify dashboard shows fresh data daily
- [ ] Verify filtering works (device, country, query, page)

#### 4.7.5 - GA4 Implementation (Week 3)
- [ ] Replicate pattern for GA4
- [ ] Test with your GA4 property
- [ ] Verify session-level aggregation
- [ ] Add 25 core metrics + 20 dimensions

#### 4.7.6 - Platform Metadata Registry (Week 3)
- [ ] Create ads.json (20 metrics, 12 dimensions)
- [ ] Create ga4.json (25 metrics, 20 dimensions)
- [ ] Update gsc.json (already complete)
- [ ] Add schema evolution documentation

**Success Criteria:**
- ✅ Dashboards show fresh data when opened (even after 2 years)
- ✅ Deduplication works (no duplicate tables)
- ✅ Daily refresh runs automatically
- ✅ Cost < $500/month for 1,000 properties
- ✅ Query response < 2 seconds

---

### **Phase 4.8: Testing & Deployment** (PRIORITY 8)

**Goal:** Comprehensive testing and production deployment.

#### 4.8.1 - Local Testing
- [ ] Test all 57 chart components
- [ ] Test all 9 API endpoints
- [ ] Test all 31 MCP tools
- [ ] Test agent workflows (create/edit dashboards via MCP)
- [ ] Test practitioner workflows (UI-based editing)
- [ ] Test multi-tenant isolation
- [ ] Test OAuth refresh flows

#### 4.8.2 - Integration Testing
- [ ] Test GSC → BigQuery → Dashboard flow
- [ ] Test Google Ads → BigQuery → Dashboard flow
- [ ] Test GA4 → BigQuery → Dashboard flow
- [ ] Test cross-platform data blending
- [ ] Test export/sharing features

#### 4.8.3 - Performance Testing
- [ ] Load testing (100+ concurrent users)
- [ ] BigQuery query performance
- [ ] Dashboard render performance
- [ ] Memory leak testing

#### 4.8.4 - Production Deployment
- [ ] Deploy to production Supabase
- [ ] Configure production BigQuery
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for assets
- [ ] Set up backup/restore
- [ ] Document deployment process

**Success Criteria:** Platform fully tested and deployed to production.

---

## 📋 Linear Ticket Mapping

### ✅ Completed Tickets (Phase 4.1)
- ✅ **MCP-44:** Documentation consolidation (Done)
- ✅ **MCP-45:** Create 5 Claude Code skills (Done)
- ✅ **MCP-46:** Fix WPP Analytics Platform documentation (Done)
- ✅ **MCP-47:** Remove deprecated tech references (Done)
- ✅ **MCP-48:** Finalize agentic architecture system (Done)
- ✅ **MCP-51:** Create DATA-LAYER-ARCHITECTURE.md (Done)

**Note:** MCP-49 and MCP-50 were superseded by MCP-48 (complete agent system rebuild)

### 🔜 Next Phase (Phase 4.2 - UI Completion)

**UI Completion (Phase 4.2):**
- **MCP-52:** Complete SettingsSidebar (Style & Filters tabs)
- **MCP-53:** Test and fix EditorTopbar
- **MCP-54:** Complete drag-and-drop builder testing
- **MCP-55:** Implement mobile responsiveness

**Chart Migration (Phase 4.3):**
- **MCP-56:** Migrate 8 priority charts (Bar, Line, Area, etc.)
- **MCP-57:** Migrate 7 secondary charts (Sankey, Scatter, etc.)
- **MCP-58:** Migrate remaining 38 specialized charts

**Platform Features (Phase 4.4):**
- **MCP-59:** Implement export functionality (PDF, Excel, PNG)
- **MCP-60:** Implement sharing system
- **MCP-61:** Implement calculated fields
- **MCP-62:** Implement version history
- **MCP-63:** Implement real-time collaboration

**MCP Tools (Phase 4.5):**
- **MCP-64:** Add style parameters to dashboard MCP tools
- **MCP-65:** Create new MCP tools (calculated_field, export, share)
- **MCP-66:** Update reporting-platform skill with new examples

**Integrations (Phase 4.6):**
- **MCP-67:** Bing Webmaster Tools integration
- **MCP-68:** (Optional) Amazon Advertising integration
- **MCP-69:** (Optional) Meta Business Suite integration

**Optimization (Phase 4.7):**
- **MCP-70:** Implement BigQuery hot/cold storage
- **MCP-71:** Query performance optimization

**Testing (Phase 4.8):**
- **MCP-72:** Comprehensive local testing
- **MCP-73:** Integration testing
- **MCP-74:** Performance testing
- **MCP-75:** Production deployment

---

## 🎯 Success Metrics

**Platform Readiness:**
- [x] 100% of documentation accurate (no Cube.js references) ✅ Phase 4.1 Complete
- [x] 100% of agents updated with current architecture ✅ Phase 4.1 Complete
- [ ] 100% of chart components migrated (57/57)
- [ ] 100% of critical features implemented (export, sharing, calculated fields, version history, real-time)
- [ ] 100% of MCP tools support style parameters
- [ ] <2s dashboard load time
- [ ] >50% query cost reduction

**Agent Capability:**
- [ ] Agents can create dashboards via MCP (all chart types)
- [ ] Agents can apply custom styling via MCP
- [ ] Agents can create calculated fields via MCP
- [ ] Agents can export dashboards via MCP
- [ ] Agents can share dashboards via MCP

**Practitioner Experience:**
- [ ] Drag-and-drop builder fully functional
- [ ] All 13 chart types available and working
- [ ] Export to PDF/Excel/PNG working
- [ ] Sharing with team working
- [ ] Mobile-responsive design working

---

## 📅 Timeline Estimate

**Phase 4.1 - Documentation (3-5 days):**
- Update 3 core agents
- Update README.md
- Create new architecture docs

**Phase 4.2 - UI Completion (2-3 days):**
- Complete sidebar tabs
- Test topbar and drag-drop

**Phase 4.3 - Chart Migration (5-7 days):**
- 8 priority charts (2 days)
- 7 secondary charts (2 days)
- 38 specialized charts (3 days)

**Phase 4.4 - Platform Features (7-10 days):**
- Export (2 days)
- Sharing (2 days)
- Calculated fields (2 days)
- Version history (2 days)
- Real-time collab (2 days)

**Phase 4.5 - MCP Tools (2-3 days):**
- Enhance existing tools
- Create new tools

**Phase 4.6 - Integrations (5-7 days):**
- Bing (3 days)
- Others as time allows

**Phase 4.7 - Optimization (3-5 days):**
- Hot/cold storage
- Query performance

**Phase 4.8 - Testing (5-7 days):**
- Local, integration, performance testing
- Deployment

**Total: 32-47 days (6-9 weeks)**

---

## 🚀 Next Actions

**Phase 4.1:** ✅ **COMPLETE** (Oct 25-26, 2025)
- All documentation updated and accurate
- 9 new specialized agents created
- Ready for Phase 4.2 development

**Phase 4.2:** 🔜 **START HERE** (UI Completion)
1. **MCP-52:** Complete SettingsSidebar (Style & Filters tabs)
2. **MCP-53:** Test and fix EditorTopbar
3. **MCP-54:** Complete drag-and-drop builder testing
4. **MCP-55:** Implement mobile responsiveness

**Using Agents:**
- Use **frontend-builder** agent for all UI work (Phase 4.2)
- Use **chart-migrator** agent for chart migration (Phase 4.3)
- Use **knowledge-base** agent for quick architecture questions

---

## 📝 Notes

- **Agentic-First Design:** Every feature must be accessible via MCP tools for agents
- **Style Cascade:** Component > Theme > Global (always allow override)
- **OAuth Best Practice:** No API keys, no service accounts, only user credentials
- **BigQuery as Hub:** Never push data direct to platform, always via BigQuery
- **Multi-Tenant:** Workspace isolation with Supabase RLS at all times
