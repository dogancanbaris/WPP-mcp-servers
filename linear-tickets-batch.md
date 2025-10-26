# Linear Tickets Creation Script - MCP-47 through MCP-75

## Ticket Details for Creation

### Documentation & Knowledge (MCP-47 to MCP-51)

#### MCP-47: [Documentation]: Update frontend-developer agent knowledge (remove Cube.js, add dataset patterns)

**Description:**
## 📋 What Needs to Be Done
- [ ] DELETE Lines 167-591 (entire Cube.js section from frontend-developer.md)
- [ ] ADD new dataset-based query patterns with useQuery examples
- [ ] UPDATE Lines 938-1028 chart component patterns to remove Cube.js references
- [ ] ADD style cascade documentation (Component > Theme > Global)
- [ ] ADD MCP tool usage examples for dashboard creation

## 📚 References Needed
- File: .claude/agents/frontend-developer.md (1,257 lines)
- Section: Lines 167-591 (Cube.js - OBSOLETE)
- Section: Lines 938-1028 (Chart patterns)
- Doc: ROADMAP.md Phase 4.1.2

## ✅ Completion Checklist
- [ ] Research completed - Review current frontend-developer.md
- [ ] Code changes made - Remove Cube.js, add dataset patterns
- [ ] Documentation updated - New query patterns documented
- [ ] Reviewed and tested - Agent can use updated knowledge
- [ ] Related agents notified

## 🎯 Definition of Done
frontend-developer.md has zero Cube.js references, includes dataset-based query patterns, style cascade docs, and MCP tool examples. Agent can successfully create dashboards using new architecture.

**Labels:** documentation, agent-experience
**Project:** WPP Marketing Analytics Platform

---

#### MCP-48: [Documentation]: Update backend-api-specialist agent knowledge (remove Cube.js semantic layer)

**Description:**
## 📋 What Needs to Be Done
- [ ] DELETE Lines 210-392 (Cube.js semantic layer section)
- [ ] DELETE Lines 471-591 (Cube.js model examples)
- [ ] ADD dataset registration endpoint pattern with code examples
- [ ] ADD query builder module usage documentation
- [ ] ADD BigQuery client direct access patterns
- [ ] ADD caching strategy documentation

## 📚 References Needed
- File: .claude/agents/backend-api-specialist.md (1,453 lines)
- Section: Lines 210-392 (Cube.js semantic layer - OBSOLETE)
- Section: Lines 471-591 (Cube.js models - OBSOLETE)
- Doc: ROADMAP.md Phase 4.1.3

## ✅ Completion Checklist
- [ ] Research completed - Review current backend-api-specialist.md
- [ ] Code changes made - Remove Cube.js sections
- [ ] Documentation updated - Add dataset registration patterns
- [ ] Reviewed and tested - Agent can build APIs correctly
- [ ] Related agents notified

## 🎯 Definition of Done
backend-api-specialist.md has zero Cube.js references, includes dataset registration API patterns, query builder usage, BigQuery direct access, and caching strategy docs.

**Labels:** documentation, agent-experience
**Project:** WPP Marketing Analytics Platform

---

#### MCP-49: [Documentation]: Update database-analytics-architect agent knowledge (remove Cube.js)

**Description:**
## 📋 What Needs to Be Done
- [ ] DELETE Lines 210-392 (Cube.js Semantic Layer Design section)
- [ ] ADD new architecture: Dataset caching system documentation
- [ ] ADD BigQuery optimization strategies for new system
- [ ] ADD query builder patterns and metadata registry
- [ ] ADD data blending best practices (multi-platform joins)

## 📚 References Needed
- File: .claude/agents/database-analytics-architect.md (657 lines)
- Section: Lines 210-392 (Cube.js sections - OBSOLETE)
- Doc: ROADMAP.md Phase 4.1.4

## ✅ Completion Checklist
- [ ] Research completed - Review current database-analytics-architect.md
- [ ] Code changes made - Remove Cube.js sections
- [ ] Documentation updated - Add new architecture patterns
- [ ] Reviewed and tested - Agent can design data architecture correctly
- [ ] Related agents notified

## 🎯 Definition of Done
database-analytics-architect.md has zero Cube.js references, includes dataset caching system, BigQuery optimization strategies, query builder patterns, and data blending best practices.

**Labels:** documentation, agent-experience
**Project:** WPP Marketing Analytics Platform

---

#### MCP-50: [Documentation]: Review and update remaining 5 agents (auth, devops, etc.)

**Description:**
## 📋 What Needs to Be Done
- [ ] Review auth-security-specialist.md - Verify OAuth patterns are current
- [ ] Review devops-infrastructure-specialist.md - Verify deployment patterns
- [ ] Review remaining 3 agents for any Cube.js or outdated references
- [ ] Update any incorrect architecture references
- [ ] Ensure all agents reference current tech stack (Recharts, BigQuery direct)

## 📚 References Needed
- File: .claude/agents/auth-security-specialist.md
- File: .claude/agents/devops-infrastructure-specialist.md
- File: .claude/agents/*.md (all remaining agents)
- Doc: ROADMAP.md Phase 4.1.5

## ✅ Completion Checklist
- [ ] Research completed - All agents reviewed
- [ ] Code changes made - Updates applied where needed
- [ ] Documentation updated - All agents current
- [ ] Reviewed and tested - Agents have accurate knowledge
- [ ] Cross-references validated

## 🎯 Definition of Done
All 5 remaining agents reviewed and updated. Zero Cube.js references across entire agent knowledge base. All agents reference current architecture.

**Labels:** documentation, agent-experience
**Project:** WPP Marketing Analytics Platform

---

#### MCP-51: [Documentation]: Create DATA-LAYER-ARCHITECTURE.md documentation

**Description:**
## 📋 What Needs to Be Done
- [ ] Create new file: DATA-LAYER-ARCHITECTURE.md
- [ ] Document BigQuery → Dataset → API → Frontend flow
- [ ] Explain metadata registry system
- [ ] Document caching strategy
- [ ] Provide examples of data blending across platforms
- [ ] Add diagrams showing architecture flow

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.1.7
- File: wpp-analytics-platform/src/lib/bigquery-client.ts
- File: wpp-analytics-platform/src/app/api/datasets/*

## ✅ Completion Checklist
- [ ] Research completed - Review current architecture implementation
- [ ] Documentation created - DATA-LAYER-ARCHITECTURE.md written
- [ ] Examples added - Data blending examples included
- [ ] Diagrams added - Architecture flow visualized
- [ ] Reviewed and tested - Documentation validated

## 🎯 Definition of Done
DATA-LAYER-ARCHITECTURE.md created with complete documentation of BigQuery → Dataset → API → Frontend flow, metadata registry, caching strategy, and data blending examples.

**Labels:** documentation
**Project:** WPP Marketing Analytics Platform

---

### UI Completion (MCP-52 to MCP-55)

#### MCP-52: [Reporting Platform]: Complete SettingsSidebar (Style & Filters tabs)

**Description:**
## 📋 What Needs to Be Done
- [ ] Complete Style Tab implementation:
  - [ ] Color picker for charts
  - [ ] Font size controls
  - [ ] Theme preset selector
  - [ ] Custom CSS input (advanced)
  - [ ] Style cascade visualization
- [ ] Complete Filters Tab implementation:
  - [ ] Date range picker integration
  - [ ] Dimension filter UI
  - [ ] Metric filter UI
  - [ ] Filter persistence
  - [ ] Filter sharing

## 📚 References Needed
- File: wpp-analytics-platform/src/components/SettingsSidebar.tsx
- Doc: ROADMAP.md Phase 4.2.1
- Related: MCP-46 (documentation cleanup)

## ✅ Completion Checklist
- [ ] Research completed - Review current SettingsSidebar implementation
- [ ] Code changes made - Style and Filters tabs completed
- [ ] Tests passing - All UI interactions tested
- [ ] Documentation updated - Component usage documented
- [ ] Reviewed and tested - Manual testing completed

## 🎯 Definition of Done
SettingsSidebar fully functional with complete Style tab (color picker, font controls, themes, custom CSS, cascade viz) and Filters tab (date range, dimension/metric filters, persistence, sharing).

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-53: [Reporting Platform]: Test and fix EditorTopbar

**Description:**
## 📋 What Needs to Be Done
- [ ] Verify menu row (40px) functionality
- [ ] Verify toolbar row (48px) buttons work
- [ ] Test save/publish/export buttons
- [ ] Test undo/redo functionality
- [ ] Test preview mode toggle
- [ ] Fix any connection issues between topbar and editor state

## 📚 References Needed
- File: wpp-analytics-platform/src/components/EditorTopbar.tsx
- Doc: ROADMAP.md Phase 4.2.2

## ✅ Completion Checklist
- [ ] Research completed - Review EditorTopbar component
- [ ] Code changes made - Fix any connection issues
- [ ] Tests passing - All buttons functional
- [ ] Documentation updated - Usage documented
- [ ] Reviewed and tested - Manual testing completed

## 🎯 Definition of Done
EditorTopbar fully tested and working. Menu row (40px) and toolbar row (48px) functional. Save/publish/export buttons work. Undo/redo works. Preview toggle works.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-54: [Reporting Platform]: Complete drag-and-drop builder testing

**Description:**
## 📋 What Needs to Be Done
- [ ] Test row creation/deletion
- [ ] Test column resizing (1/1, 1/2, 1/3, 2/3, 1/4, 3/4)
- [ ] Test component drag from palette
- [ ] Test component reordering
- [ ] Test grid snapping
- [ ] Fix any drag-drop bugs discovered

## 📚 References Needed
- File: wpp-analytics-platform/src/components/DragDropBuilder.tsx
- Doc: ROADMAP.md Phase 4.2.3

## ✅ Completion Checklist
- [ ] Research completed - Review drag-drop implementation
- [ ] Code changes made - Fix bugs found during testing
- [ ] Tests passing - All drag-drop interactions work
- [ ] Documentation updated - Usage documented
- [ ] Reviewed and tested - Comprehensive manual testing

## 🎯 Definition of Done
Drag-and-drop builder fully tested and working. Row creation/deletion works. Column resizing works for all widths. Component drag works. Reordering works. Grid snapping works. All bugs fixed.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-55: [Reporting Platform]: Implement mobile responsiveness

**Description:**
## 📋 What Needs to Be Done
- [ ] Implement responsive grid system
- [ ] Test mobile layout breakpoints (sm, md, lg, xl)
- [ ] Create mobile-optimized sidebar
- [ ] Test touch interactions
- [ ] Ensure all charts render properly on mobile

## 📚 References Needed
- File: wpp-analytics-platform/src/components/*
- Doc: ROADMAP.md Phase 4.2.4

## ✅ Completion Checklist
- [ ] Research completed - Review current responsive implementation
- [ ] Code changes made - Mobile responsiveness implemented
- [ ] Tests passing - All breakpoints tested
- [ ] Documentation updated - Mobile patterns documented
- [ ] Reviewed and tested - Tested on multiple devices

## 🎯 Definition of Done
Platform fully responsive on mobile. Responsive grid system works. Mobile sidebar optimized. Touch interactions work. Charts render properly on all screen sizes.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

### Chart Migration (MCP-56 to MCP-58)

#### MCP-56: [Reporting Platform]: Migrate 8 priority charts (Bar, Line, Area, Donut, Funnel, Gauge, Heatmap, Radar)

**Description:**
## 📋 What Needs to Be Done
- [ ] Migrate BarChart.tsx to dataset architecture
- [ ] Migrate LineChart.tsx to dataset architecture
- [ ] Migrate AreaChart.tsx to dataset architecture
- [ ] Migrate DonutChart.tsx to dataset architecture
- [ ] Migrate FunnelChart.tsx to dataset architecture
- [ ] Migrate GaugeChart.tsx to dataset architecture
- [ ] Migrate HeatmapChart.tsx to dataset architecture
- [ ] Migrate RadarChart.tsx to dataset architecture

**Migration Pattern for Each:**
1. Replace Cube.js imports with dataset fetch
2. Update query pattern to /api/datasets/[id]/query
3. Add style prop support (override theme)
4. Add loading/error states
5. Add export functionality
6. Test with BigQuery data

## 📚 References Needed
- File: wpp-analytics-platform/src/components/charts/*.tsx
- Reference: TimeSeriesChart.tsx, Scorecard.tsx (already migrated)
- Doc: ROADMAP.md Phase 4.3.1

## ✅ Completion Checklist
- [ ] Research completed - Review migration pattern
- [ ] Code changes made - All 8 charts migrated
- [ ] Tests passing - All charts work with dataset API
- [ ] Documentation updated - Usage examples added
- [ ] Reviewed and tested - Tested with real BigQuery data

## 🎯 Definition of Done
All 8 priority charts (Bar, Line, Area, Donut, Funnel, Gauge, Heatmap, Radar) migrated to dataset architecture. All charts work with BigQuery data. Style props supported. Loading/error states implemented.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-57: [Reporting Platform]: Migrate 7 secondary charts (Sankey, Scatter, Treemap, Waterfall, Bubble, Polar, RadialBar)

**Description:**
## 📋 What Needs to Be Done
- [ ] Migrate SankeyChart.tsx to dataset architecture
- [ ] Migrate ScatterChart.tsx to dataset architecture
- [ ] Migrate TreemapChart.tsx to dataset architecture
- [ ] Migrate WaterfallChart.tsx to dataset architecture
- [ ] Migrate BubbleChart.tsx to dataset architecture
- [ ] Migrate PolarChart.tsx to dataset architecture
- [ ] Migrate RadialBarChart.tsx to dataset architecture

**Migration Pattern:** Same as MCP-56 (replace Cube.js, add dataset API, style props, loading/error states)

## 📚 References Needed
- File: wpp-analytics-platform/src/components/charts/*.tsx
- Reference: Migrated priority charts from MCP-56
- Doc: ROADMAP.md Phase 4.3.2

## ✅ Completion Checklist
- [ ] Research completed - Review migration pattern from MCP-56
- [ ] Code changes made - All 7 charts migrated
- [ ] Tests passing - All charts work with dataset API
- [ ] Documentation updated - Usage examples added
- [ ] Reviewed and tested - Tested with real BigQuery data

## 🎯 Definition of Done
All 7 secondary charts (Sankey, Scatter, Treemap, Waterfall, Bubble, Polar, RadialBar) migrated to dataset architecture. All charts work with BigQuery data. Style props supported.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-58: [Reporting Platform]: Migrate remaining 38 specialized chart variants

**Description:**
## 📋 What Needs to Be Done
- [ ] Identify all 38 remaining chart variants
- [ ] Prioritize by usage/importance
- [ ] Migrate each chart to dataset architecture
- [ ] Test all variants with BigQuery data
- [ ] Document any special requirements

**Migration Pattern:** Same as MCP-56 and MCP-57

## 📚 References Needed
- File: wpp-analytics-platform/src/components/charts/*.tsx
- Reference: All previously migrated charts
- Doc: ROADMAP.md Phase 4.3.3

## ✅ Completion Checklist
- [ ] Research completed - All 38 charts identified
- [ ] Code changes made - All charts migrated
- [ ] Tests passing - All 57 charts (4 existing + 53 migrated) work
- [ ] Documentation updated - Complete chart library documented
- [ ] Reviewed and tested - Comprehensive testing completed

## 🎯 Definition of Done
All 38 specialized chart variants migrated. Total of 57 charts fully migrated to dataset architecture. All charts tested with BigQuery data. Complete chart library documented.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

### Platform Features (MCP-59 to MCP-63)

#### MCP-59: [Reporting Platform]: Implement export functionality (PDF, Excel, PNG)

**Description:**
## 📋 What Needs to Be Done
- [ ] **PDF Export:**
  - [ ] Install jspdf library
  - [ ] Create PDF renderer component
  - [ ] Add PDF export button to topbar
  - [ ] Support multi-page dashboards
- [ ] **Excel Export:**
  - [ ] Install xlsx library
  - [ ] Create Excel workbook generator
  - [ ] Export data tables and charts as sheets
- [ ] **PNG Export:**
  - [ ] Install html-to-image library
  - [ ] Capture dashboard as PNG
  - [ ] Handle high-DPI displays

## 📚 References Needed
- File: wpp-analytics-platform/src/components/EditorTopbar.tsx
- Doc: ROADMAP.md Phase 4.4.1
- Libraries: jspdf, xlsx, html-to-image

## ✅ Completion Checklist
- [ ] Research completed - Review export libraries
- [ ] Code changes made - All 3 export formats implemented
- [ ] Tests passing - Export functionality tested
- [ ] Documentation updated - Export usage documented
- [ ] Reviewed and tested - All formats tested

## 🎯 Definition of Done
Export functionality fully implemented. PDF export works (multi-page support). Excel export works (data + charts). PNG export works (high-DPI support). Export buttons in topbar functional.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-60: [Reporting Platform]: Implement sharing system (links, permissions, team collaboration)

**Description:**
## 📋 What Needs to Be Done
- [ ] Create database schema for shared dashboards
- [ ] Implement shareable link generation (public/private)
- [ ] Implement permission levels (view/edit/admin)
- [ ] Create team collaboration UI
- [ ] Implement email notifications for shares
- [ ] Add sharing controls to dashboard settings

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.4.2
- File: wpp-analytics-platform/supabase/migrations/*
- Related: Multi-tenant RLS policies

## ✅ Completion Checklist
- [ ] Research completed - Review sharing requirements
- [ ] Code changes made - Sharing system implemented
- [ ] Tests passing - All sharing features tested
- [ ] Documentation updated - Sharing usage documented
- [ ] Reviewed and tested - Multi-tenant security validated

## 🎯 Definition of Done
Sharing system fully implemented. Public/private links work. Permission levels (view/edit/admin) enforced. Team collaboration UI complete. Email notifications work. Multi-tenant security validated.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-61: [Reporting Platform]: Implement calculated fields (formula builder, validator)

**Description:**
## 📋 What Needs to Be Done
- [ ] Create UI for formula builder
- [ ] Implement formula validator (syntax checking)
- [ ] Support operations: SUM, AVG, COUNT, IF, CASE
- [ ] Save calculated fields to metadata
- [ ] Display calculated fields in chart config
- [ ] Add calculated field editor to SettingsSidebar

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.4.3
- File: wpp-analytics-platform/src/components/SettingsSidebar.tsx
- Related: Dataset metadata registry

## ✅ Completion Checklist
- [ ] Research completed - Review formula requirements
- [ ] Code changes made - Calculated fields implemented
- [ ] Tests passing - All formulas tested
- [ ] Documentation updated - Formula syntax documented
- [ ] Reviewed and tested - Complex formulas validated

## 🎯 Definition of Done
Calculated fields fully implemented. Formula builder UI complete. Syntax validator works. All operations supported (SUM, AVG, COUNT, IF, CASE). Calculated fields saved to metadata and displayed in chart config.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-62: [Reporting Platform]: Implement version history (auto-save, rollback)

**Description:**
## 📋 What Needs to Be Done
- [ ] Create database schema for dashboard versions
- [ ] Implement auto-save on edits
- [ ] Create version list UI in sidebar
- [ ] Implement rollback functionality
- [ ] Create diff viewer (show changes between versions)
- [ ] Add version management controls

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.4.4
- File: wpp-analytics-platform/supabase/migrations/*
- Related: Dashboard edit state management

## ✅ Completion Checklist
- [ ] Research completed - Review version control requirements
- [ ] Code changes made - Version history implemented
- [ ] Tests passing - All version features tested
- [ ] Documentation updated - Version control documented
- [ ] Reviewed and tested - Rollback tested

## 🎯 Definition of Done
Version history fully implemented. Auto-save works on edits. Version list UI complete. Rollback functionality works. Diff viewer shows changes. Version management controls functional.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

#### MCP-63: [Reporting Platform]: Implement real-time collaboration (presence, cursors, change broadcasting)

**Description:**
## 📋 What Needs to Be Done
- [ ] Set up WebSocket connection infrastructure
- [ ] Implement presence indicators (who's editing)
- [ ] Implement cursor sharing
- [ ] Implement edit conflict resolution
- [ ] Implement change broadcasting
- [ ] Add collaborative editing UI indicators

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.4.5
- Technology: WebSocket or Supabase Realtime
- Related: Multi-user editing patterns

## ✅ Completion Checklist
- [ ] Research completed - Review real-time collaboration options
- [ ] Code changes made - Collaboration features implemented
- [ ] Tests passing - Multi-user scenarios tested
- [ ] Documentation updated - Collaboration usage documented
- [ ] Reviewed and tested - Conflict resolution validated

## 🎯 Definition of Done
Real-time collaboration fully implemented. WebSocket/Realtime connection works. Presence indicators show who's editing. Cursor sharing works. Edit conflicts resolved. Change broadcasting functional.

**Labels:** reporting-platform
**Project:** WPP Marketing Analytics Platform

---

### MCP Tools (MCP-64 to MCP-66)

#### MCP-64: [MCP Tools]: Add style parameters to dashboard MCP tools

**Description:**
## 📋 What Needs to Be Done
- [ ] Enhance create_dashboard tool with style parameters:
  - [ ] Add style object to ComponentConfig
  - [ ] Support: backgroundColor, textColor, fontSize, borderRadius, customCSS
  - [ ] Add theme parameter to dashboard creation
- [ ] Enhance update_dashboard_layout tool:
  - [ ] Add update_component_style operation
  - [ ] Add apply_theme operation
- [ ] Update tool descriptions with style examples

## 📚 References Needed
- File: mcp-server/src/tools/reporting-platform/*.ts
- Doc: ROADMAP.md Phase 4.5.1 & 4.5.2
- Skill: .claude/skills/reporting-platform/SKILL.md

## ✅ Completion Checklist
- [ ] Research completed - Review current tool implementation
- [ ] Code changes made - Style parameters added
- [ ] Tests passing - Style parameters tested
- [ ] Documentation updated - Tool descriptions updated
- [ ] Reviewed and tested - Agents can use style parameters

## 🎯 Definition of Done
Both create_dashboard and update_dashboard_layout tools support style parameters. ComponentConfig includes style object. update_component_style and apply_theme operations work. Tool descriptions include style examples.

**Labels:** mcp-tools
**Project:** WPP Marketing Analytics Platform

---

#### MCP-65: [MCP Tools]: Create new MCP tools (calculated_field, export, share)

**Description:**
## 📋 What Needs to Be Done
- [ ] **create_calculated_field tool:**
  - [ ] Input: formula, name, dataset_id
  - [ ] Output: field_id
  - [ ] Validate formula syntax
- [ ] **export_dashboard tool:**
  - [ ] Input: dashboard_id, format (pdf|excel|png)
  - [ ] Output: download_url
- [ ] **share_dashboard tool:**
  - [ ] Input: dashboard_id, email, permission_level
  - [ ] Output: share_url

## 📚 References Needed
- File: mcp-server/src/tools/reporting-platform/*.ts
- Doc: ROADMAP.md Phase 4.5.3
- Related: MCP-59 (export), MCP-60 (sharing), MCP-61 (calculated fields)

## ✅ Completion Checklist
- [ ] Research completed - Review tool requirements
- [ ] Code changes made - All 3 tools implemented
- [ ] Tests passing - All tools tested
- [ ] Documentation updated - Tool descriptions written
- [ ] Reviewed and tested - Agents can use new tools

## 🎯 Definition of Done
Three new MCP tools created and functional. create_calculated_field validates and creates formulas. export_dashboard generates exports in all formats. share_dashboard creates shares with permissions.

**Labels:** mcp-tools
**Project:** WPP Marketing Analytics Platform

---

#### MCP-66: [Documentation]: Update reporting-platform skill with style and feature examples

**Description:**
## 📋 What Needs to Be Done
- [ ] Update reporting-platform.md skill with style parameter examples
- [ ] Add calculated field examples
- [ ] Add export examples
- [ ] Add sharing examples
- [ ] Update tool usage patterns
- [ ] Add complete workflow examples

## 📚 References Needed
- File: .claude/skills/reporting-platform/SKILL.md
- Doc: ROADMAP.md Phase 4.5.4
- Related: MCP-64 (style params), MCP-65 (new tools)

## ✅ Completion Checklist
- [ ] Research completed - Review new capabilities
- [ ] Documentation updated - Skill fully updated
- [ ] Examples added - All new features documented
- [ ] Reviewed and tested - Agents can follow examples
- [ ] Cross-references validated

## 🎯 Definition of Done
reporting-platform skill fully updated with style examples, calculated field examples, export examples, sharing examples, and complete workflow patterns. Agents can use skill to access all platform features.

**Labels:** documentation, agent-experience
**Project:** WPP Marketing Analytics Platform

---

### Integrations (MCP-67 to MCP-69)

#### MCP-67: [MCP Tools]: Bing Webmaster Tools integration

**Description:**
## 📋 What Needs to Be Done
- [ ] Set up OAuth 2.0 for Bing Webmaster Tools API
- [ ] Create MCP tools: list_bing_properties, query_bing_analytics
- [ ] Create BigQuery schema for Bing data
- [ ] Create dashboard templates for Bing
- [ ] Add Bing to platform integration list
- [ ] Document Bing integration usage

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.6.1
- API: Bing Webmaster Tools API documentation
- Reference: Google Search Console integration (similar pattern)

## ✅ Completion Checklist
- [ ] Research completed - Bing API reviewed
- [ ] OAuth setup - Bing OAuth 2.0 working
- [ ] MCP tools created - Bing tools functional
- [ ] BigQuery schema - Bing data structure defined
- [ ] Templates created - Dashboard templates available
- [ ] Documentation updated - Integration documented

## 🎯 Definition of Done
Bing Webmaster Tools fully integrated. OAuth 2.0 works. MCP tools (list_bing_properties, query_bing_analytics) functional. BigQuery schema created. Dashboard templates available. Documentation complete.

**Labels:** mcp-tools, oauth
**Project:** WPP Marketing Analytics Platform

---

#### MCP-68: [MCP Tools]: (Optional) Amazon Advertising integration

**Description:**
## 📋 What Needs to Be Done
- [ ] Set up OAuth 2.0 for Amazon Advertising API
- [ ] Create MCP tools for campaigns, products, metrics
- [ ] Create BigQuery schema for Amazon Ads data
- [ ] Create dashboard templates for Amazon Ads
- [ ] Add Amazon to platform integration list
- [ ] Document Amazon integration usage

**Note:** This is an OPTIONAL integration - proceed only if time allows.

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.6.2
- API: Amazon Advertising API documentation
- Reference: Google Ads integration (similar pattern)

## ✅ Completion Checklist
- [ ] Research completed - Amazon API reviewed
- [ ] OAuth setup - Amazon OAuth 2.0 working
- [ ] MCP tools created - Amazon tools functional
- [ ] BigQuery schema - Amazon data structure defined
- [ ] Templates created - Dashboard templates available
- [ ] Documentation updated - Integration documented

## 🎯 Definition of Done
(Optional) Amazon Advertising fully integrated. OAuth 2.0 works. MCP tools for campaigns/products/metrics functional. BigQuery schema created. Dashboard templates available.

**Labels:** mcp-tools, oauth
**Project:** WPP Marketing Analytics Platform

---

#### MCP-69: [MCP Tools]: (Optional) Meta Business Suite integration

**Description:**
## 📋 What Needs to Be Done
- [ ] Set up OAuth 2.0 for Meta Business Suite API
- [ ] Create MCP tools for Facebook/Instagram insights
- [ ] Create BigQuery schema for Meta data
- [ ] Create dashboard templates for Meta
- [ ] Add Meta to platform integration list
- [ ] Document Meta integration usage

**Note:** This is an OPTIONAL integration - proceed only if time allows.

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.6.3
- API: Meta Business Suite API documentation
- Reference: Google Analytics integration (similar pattern)

## ✅ Completion Checklist
- [ ] Research completed - Meta API reviewed
- [ ] OAuth setup - Meta OAuth 2.0 working
- [ ] MCP tools created - Meta tools functional
- [ ] BigQuery schema - Meta data structure defined
- [ ] Templates created - Dashboard templates available
- [ ] Documentation updated - Integration documented

## 🎯 Definition of Done
(Optional) Meta Business Suite fully integrated. OAuth 2.0 works. MCP tools for Facebook/Instagram insights functional. BigQuery schema created. Dashboard templates available.

**Labels:** mcp-tools, oauth
**Project:** WPP Marketing Analytics Platform

---

### Optimization (MCP-70 to MCP-71)

#### MCP-70: [Technical Debt]: Implement BigQuery hot/cold storage strategy

**Description:**
## 📋 What Needs to Be Done
- [ ] Create BigQuery cold storage tables (90+ days old data)
- [ ] Create BigQuery hot storage tables (<90 days data)
- [ ] Implement automated data archival cron job
- [ ] Create query router (check hot first, then cold)
- [ ] Monitor storage costs and performance
- [ ] Document hot/cold storage strategy

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.7.1
- File: wpp-analytics-platform/src/lib/bigquery-client.ts
- Google Cloud: BigQuery pricing and storage documentation

## ✅ Completion Checklist
- [ ] Research completed - Storage strategy reviewed
- [ ] Code changes made - Hot/cold storage implemented
- [ ] Tests passing - Query router tested
- [ ] Documentation updated - Storage strategy documented
- [ ] Monitoring setup - Cost tracking configured
- [ ] Performance validated - Query speed maintained

## 🎯 Definition of Done
Hot/cold storage strategy fully implemented. Cold storage tables created (90+ days). Hot storage tables created (<90 days). Automated archival cron job running. Query router functional. Storage costs reduced.

**Labels:** technical-debt
**Project:** WPP Marketing Analytics Platform

---

#### MCP-71: [Technical Debt]: Query performance optimization

**Description:**
## 📋 What Needs to Be Done
- [ ] Add BigQuery materialized views for common queries
- [ ] Implement query result caching (Redis or similar)
- [ ] Add query cost monitoring
- [ ] Optimize table partitioning
- [ ] Benchmark query performance before/after
- [ ] Document optimization strategies

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.7.2
- File: wpp-analytics-platform/src/lib/bigquery-client.ts
- Google Cloud: BigQuery optimization best practices

## ✅ Completion Checklist
- [ ] Research completed - Optimization strategies reviewed
- [ ] Code changes made - All optimizations implemented
- [ ] Tests passing - Performance benchmarked
- [ ] Documentation updated - Strategies documented
- [ ] Monitoring setup - Cost and performance tracked
- [ ] Target met - <2s response time, 50%+ cost reduction

## 🎯 Definition of Done
Query performance optimized. Materialized views created for common queries. Query result caching implemented. Cost monitoring active. Table partitioning optimized. <2s response time achieved. 50%+ query cost reduction achieved.

**Labels:** technical-debt
**Project:** WPP Marketing Analytics Platform

---

### Testing (MCP-72 to MCP-75)

#### MCP-72: [Production]: Comprehensive local testing

**Description:**
## 📋 What Needs to Be Done
- [ ] Test all 57 chart components (4 existing + 53 migrated)
- [ ] Test all 9 API endpoints
- [ ] Test all 31+ MCP tools
- [ ] Test agent workflows (create/edit dashboards via MCP)
- [ ] Test practitioner workflows (UI-based editing)
- [ ] Test multi-tenant isolation
- [ ] Test OAuth refresh flows
- [ ] Document all test results

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.8.1
- All component files: wpp-analytics-platform/src/components/**/*
- All API routes: wpp-analytics-platform/src/app/api/**/*
- All MCP tools: mcp-server/src/tools/**/*

## ✅ Completion Checklist
- [ ] Research completed - Test plan created
- [ ] Chart testing - All 57 charts tested
- [ ] API testing - All 9 endpoints tested
- [ ] MCP testing - All 31+ tools tested
- [ ] Workflow testing - Agent and practitioner workflows tested
- [ ] Security testing - Multi-tenant isolation validated
- [ ] OAuth testing - Refresh flows tested
- [ ] Documentation updated - Test results documented

## 🎯 Definition of Done
Comprehensive local testing completed. All 57 charts work. All 9 API endpoints work. All 31+ MCP tools work. Agent workflows validated. Practitioner workflows validated. Multi-tenant isolation confirmed. OAuth refresh flows work.

**Labels:** production
**Project:** WPP Marketing Analytics Platform

---

#### MCP-73: [Production]: Integration testing

**Description:**
## 📋 What Needs to Be Done
- [ ] Test GSC → BigQuery → Dashboard flow
- [ ] Test Google Ads → BigQuery → Dashboard flow
- [ ] Test GA4 → BigQuery → Dashboard flow
- [ ] Test Bing → BigQuery → Dashboard flow (if implemented)
- [ ] Test cross-platform data blending
- [ ] Test export/sharing features end-to-end
- [ ] Document all integration test results

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.8.2
- Related: All platform integrations (GSC, Ads, GA4, Bing)
- Related: Export (MCP-59), Sharing (MCP-60)

## ✅ Completion Checklist
- [ ] Research completed - Integration test plan created
- [ ] GSC flow tested - Full end-to-end working
- [ ] Google Ads flow tested - Full end-to-end working
- [ ] GA4 flow tested - Full end-to-end working
- [ ] Data blending tested - Cross-platform queries working
- [ ] Export tested - All formats working end-to-end
- [ ] Sharing tested - Full sharing workflow working
- [ ] Documentation updated - Integration results documented

## 🎯 Definition of Done
Integration testing completed. All platform → BigQuery → Dashboard flows work. Cross-platform data blending works. Export features work end-to-end. Sharing features work end-to-end. All integration results documented.

**Labels:** production
**Project:** WPP Marketing Analytics Platform

---

#### MCP-74: [Production]: Performance testing

**Description:**
## 📋 What Needs to Be Done
- [ ] Conduct load testing (100+ concurrent users)
- [ ] Test BigQuery query performance under load
- [ ] Test dashboard render performance
- [ ] Test memory leak scenarios
- [ ] Benchmark against performance targets (<2s load time)
- [ ] Document all performance metrics
- [ ] Create performance monitoring dashboard

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.8.3
- Tools: Load testing tools (k6, Artillery, or similar)
- Related: Query optimization (MCP-71)

## ✅ Completion Checklist
- [ ] Research completed - Performance test plan created
- [ ] Load testing - 100+ concurrent users tested
- [ ] Query performance - BigQuery performance validated
- [ ] Render performance - Dashboard load times measured
- [ ] Memory testing - No leaks detected
- [ ] Targets met - <2s load time achieved
- [ ] Monitoring setup - Performance dashboard created
- [ ] Documentation updated - All metrics documented

## 🎯 Definition of Done
Performance testing completed. Load testing (100+ users) passed. BigQuery query performance validated. Dashboard render performance <2s. No memory leaks. Performance monitoring dashboard created. All metrics documented.

**Labels:** production
**Project:** WPP Marketing Analytics Platform

---

#### MCP-75: [Production]: Production deployment

**Description:**
## 📋 What Needs to Be Done
- [ ] Deploy to production Supabase
- [ ] Configure production BigQuery project
- [ ] Set up monitoring (Sentry, LogRocket, or similar)
- [ ] Configure CDN for assets
- [ ] Set up backup/restore procedures
- [ ] Document complete deployment process
- [ ] Create rollback plan
- [ ] Verify all services operational

## 📚 References Needed
- Doc: ROADMAP.md Phase 4.8.4
- Related: All previous testing tickets (MCP-72, MCP-73, MCP-74)
- Infrastructure: Supabase production, BigQuery, CDN

## ✅ Completion Checklist
- [ ] Research completed - Deployment plan created
- [ ] Supabase deployed - Production instance configured
- [ ] BigQuery configured - Production project setup
- [ ] Monitoring setup - Sentry/LogRocket configured
- [ ] CDN configured - Assets served via CDN
- [ ] Backup setup - Backup/restore procedures tested
- [ ] Documentation complete - Deployment process documented
- [ ] Verification complete - All services operational

## 🎯 Definition of Done
Platform deployed to production. Supabase production instance configured. BigQuery production project configured. Monitoring active (Sentry/LogRocket). CDN serving assets. Backup/restore procedures in place. Deployment process documented. All services operational.

**Labels:** production
**Project:** WPP Marketing Analytics Platform

---

## Summary

**Total Tickets:** 29 (MCP-47 through MCP-75)

**By Phase:**
- Documentation & Knowledge: 5 tickets (MCP-47 to MCP-51)
- UI Completion: 4 tickets (MCP-52 to MCP-55)
- Chart Migration: 3 tickets (MCP-56 to MCP-58)
- Platform Features: 5 tickets (MCP-59 to MCP-63)
- MCP Tools: 3 tickets (MCP-64 to MCP-66)
- Integrations: 3 tickets (MCP-67 to MCP-69, 2 optional)
- Optimization: 2 tickets (MCP-70 to MCP-71)
- Testing: 4 tickets (MCP-72 to MCP-75)

**Labels Used:**
- documentation
- agent-experience
- reporting-platform
- mcp-tools
- oauth
- technical-debt
- production

**Project:** WPP Marketing Analytics Platform
