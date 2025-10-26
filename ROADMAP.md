# WPP Analytics Platform - Completion Roadmap

**Last Updated:** 2025-10-25
**Status:** Platform core architecture complete, finalizing features and agent knowledge

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

### 📚 **Documentation & Knowledge Issues**

**Critical Inaccuracies (Block Agent Usage):**
- ❌ `.claude/agents/frontend-developer.md` (1,257 lines)
  - Lines 167-591: Entire Cube.js section OBSOLETE
  - Lines 938-1028: Chart patterns reference Cube.js
  - Missing: Dataset-based query patterns, new API routes

- ❌ `.claude/agents/backend-api-specialist.md` (1,453 lines)
  - Lines 210-392: "Cube.js Semantic Layer" section OBSOLETE
  - Lines 471-591: Cube.js model examples OBSOLETE
  - Missing: Dataset registration API, query builder patterns

- ❌ `.claude/agents/database-analytics-architect.md` (657 lines)
  - Lines 210-392: "Cube.js Semantic Layer Design" OBSOLETE
  - Missing: New caching system, direct BigQuery optimization

**Documentation Files:**
- ❌ `wpp-analytics-platform/README.md` (325 lines)
  - Line 5: "Built with Supabase, Cube.js..." - INCORRECT (should be Recharts)
  - Line 45: "All connected via Cube.js semantic layer" - INCORRECT
  - Lines 79-105: Cube.js configuration section - OBSOLETE
  - Line 312: Cube Playground mention - OBSOLETE

- ✅ `.claude/skills/` (5 skills created with proper YAML, accurate content)
  - mcp-server.md, chrome-devtools-mcp.md, linear.md, oauth.md, reporting-platform.md

---

## 🗺️ Phase 4: Completion Plan

### **Phase 4.1: Documentation & Knowledge Update** (PRIORITY 1)

**Goal:** Get all documentation and agent knowledge 100% accurate before using agents.

#### 4.1.1 - Update Core Documentation
- [ ] **wpp-analytics-platform/README.md**
  - Remove all Cube.js references (lines 5, 45, 79-105, 312)
  - Add correct tech stack: Recharts 3.3.0, BigQuery direct
  - Document new dataset-based architecture
  - Add section on agentic design patterns
  - Update configuration section with dataset registration

#### 4.1.2 - Update Frontend Developer Agent
- [ ] **`.claude/agents/frontend-developer.md`**
  - **DELETE:** Lines 167-591 (entire Cube.js section)
  - **ADD:** New dataset-based query patterns:
    ```typescript
    // Correct pattern for data fetching
    const { data } = useQuery({
      queryKey: ['dataset', dataset_id, metrics],
      queryFn: () => fetch(`/api/datasets/${dataset_id}/query`, {
        method: 'POST',
        body: JSON.stringify({ metrics, dimensions, filters })
      })
    });
    ```
  - **UPDATE:** Lines 938-1028 chart component patterns
  - **ADD:** Style cascade documentation (Component > Theme > Global)
  - **ADD:** MCP tool usage examples for dashboard creation

#### 4.1.3 - Update Backend API Specialist Agent
- [ ] **`.claude/agents/backend-api-specialist.md`**
  - **DELETE:** Lines 210-392 (Cube.js semantic layer)
  - **DELETE:** Lines 471-591 (Cube.js model examples)
  - **ADD:** Dataset registration endpoint pattern:
    ```typescript
    POST /api/datasets/register
    {
      name: "Dataset Name",
      bigquery_table: "project.dataset.table",
      platform: "gsc",
      metadata: { dimensions: [...], metrics: [...] },
      refresh_interval_days: 1
    }
    ```
  - **ADD:** Query builder module usage
  - **ADD:** BigQuery client direct access patterns
  - **ADD:** Caching strategy documentation

#### 4.1.4 - Update Database Analytics Architect Agent
- [ ] **`.claude/agents/database-analytics-architect.md`**
  - **DELETE:** Lines 210-392 (Cube.js sections)
  - **ADD:** New architecture: Dataset caching system
  - **ADD:** BigQuery optimization strategies for new system
  - **ADD:** Query builder patterns and metadata registry
  - **ADD:** Data blending best practices (multi-platform joins)

#### 4.1.5 - Review & Update Other Agents
- [ ] auth-security-specialist.md - Verify OAuth patterns are current
- [ ] devops-infrastructure-specialist.md - Verify deployment patterns
- [ ] [Review remaining 3 agents as needed]

#### 4.1.6 - Review & Enhance Skills
- [ ] mcp-server.md - Verify 31 tools documented correctly
- [ ] reporting-platform.md - Add style parameter examples
- [ ] oauth.md - Verify OAuth flow is current
- [ ] chrome-devtools-mcp.md - Verify WSL2 setup correct
- [ ] linear.md - Verify issue format is optimal

#### 4.1.7 - Create New Architecture Documentation
- [ ] **Create `DATA-LAYER-ARCHITECTURE.md`**
  - Document BigQuery → Dataset → API → Frontend flow
  - Explain metadata registry system
  - Document caching strategy
  - Provide examples of data blending

**Success Criteria:** All agents and documentation reference only the current architecture. No Cube.js mentions. Agents can be safely used for development work.

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

#### 4.3.1 - Priority Charts (Most Used)
- [ ] BarChart.tsx
- [ ] LineChart.tsx
- [ ] AreaChart.tsx
- [ ] DonutChart.tsx
- [ ] FunnelChart.tsx
- [ ] GaugeChart.tsx
- [ ] HeatmapChart.tsx
- [ ] RadarChart.tsx

#### 4.3.2 - Secondary Charts
- [ ] SankeyChart.tsx
- [ ] ScatterChart.tsx
- [ ] TreemapChart.tsx
- [ ] WaterfallChart.tsx
- [ ] BubbleChart.tsx
- [ ] PolarChart.tsx
- [ ] RadialBarChart.tsx

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

### **Phase 4.7: BigQuery Optimization** (PRIORITY 7)

**Goal:** Optimize data storage and query performance.

#### 4.7.1 - Implement Hot/Cold Storage
- [ ] Create BigQuery cold storage tables (90+ days)
- [ ] Create BigQuery hot storage tables (<90 days)
- [ ] Automated data archival cron job
- [ ] Query router (check hot first, then cold)

#### 4.7.2 - Query Performance
- [ ] Add BigQuery materialized views for common queries
- [ ] Implement query result caching (Redis or similar)
- [ ] Add query cost monitoring
- [ ] Optimize table partitioning

**Success Criteria:** Query costs reduced by 50%+, <2s response time for all dashboards.

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

### Completed Tickets
- ✅ **MCP-44:** Documentation consolidation (Done)
- ✅ **MCP-45:** Create 5 Claude Code skills (Done)

### In Progress
- 🚧 **MCP-46:** Clean up WPP platform documentation (remove Cube.js references)

### New Tickets Needed

**Documentation & Knowledge (Phase 4.1):**
- **MCP-47:** Update frontend-developer agent knowledge (remove Cube.js)
- **MCP-48:** Update backend-api-specialist agent knowledge (remove Cube.js)
- **MCP-49:** Update database-analytics-architect agent knowledge (remove Cube.js)
- **MCP-50:** Review and update remaining 5 agents
- **MCP-51:** Create DATA-LAYER-ARCHITECTURE.md

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
- [ ] 100% of documentation accurate (no Cube.js references)
- [ ] 100% of agents updated with current architecture
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

1. **Complete MCP-46:** Finish README.md cleanup (remove all Cube.js references)
2. **Create Linear Tickets:** Create MCP-47 through MCP-75 based on this roadmap
3. **Update Agents:** Execute Phase 4.1 (documentation & knowledge update)
4. **Use Agents for Development:** Once agents are updated, use them to help with Phase 4.2-4.8

---

## 📝 Notes

- **Agentic-First Design:** Every feature must be accessible via MCP tools for agents
- **Style Cascade:** Component > Theme > Global (always allow override)
- **OAuth Best Practice:** No API keys, no service accounts, only user credentials
- **BigQuery as Hub:** Never push data direct to platform, always via BigQuery
- **Multi-Tenant:** Workspace isolation with Supabase RLS at all times
