# Linear Tickets: MCP-47 to MCP-75 (Phase 4 Roadmap)

**Team:** MCP Servers
**Project:** WPP Marketing Analytics Platform
**Total Tickets:** 29

---

## MCP-47: [Documentation] Update frontend-developer agent knowledge

**Labels:** `documentation`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Remove Cube.js sections (lines 167-591, 938-1028)
- [ ] Add dataset-based query patterns with React Query
- [ ] Add style cascade documentation
- [ ] Add MCP tool usage examples
- [ ] Update component integration patterns

### 📚 References Needed
- File: `.claude/agents/frontend-developer.md`
- File: `wpp-analytics-platform/backend/src/routes/datasets.ts` (dataset API)
- File: `wpp-analytics-platform/frontend/src/hooks/useDataset.ts` (React Query patterns)
- File: `wpp-analytics-platform/frontend/src/types/styles.ts` (style cascade)
- File: `src/wpp-analytics/tools/dashboards.ts` (MCP tools)

### ✅ Completion Checklist
- [ ] Remove lines 167-591 (Cube.js semantic layer documentation)
- [ ] Remove lines 938-1028 (Cube.js model examples)
- [ ] Add dataset API query patterns section
- [ ] Add React Query hooks documentation
- [ ] Add style cascade system documentation
- [ ] Add MCP tool usage examples
- [ ] Add loading/error state patterns
- [ ] Verify all references are current
- [ ] Test agent can answer dataset-related questions

### 🎯 Definition of Done
✓ All Cube.js references removed
✓ Dataset-based patterns documented
✓ Style cascade system explained
✓ MCP tool examples included
✓ Agent knowledge reflects current architecture

---

## MCP-48: [Documentation] Update backend-api-specialist agent knowledge

**Labels:** `documentation`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Remove Cube.js semantic layer section (lines 210-392)
- [ ] Remove Cube.js model examples (lines 471-591)
- [ ] Add dataset registration API patterns
- [ ] Add query builder documentation
- [ ] Add caching strategy details

### 📚 References Needed
- File: `.claude/agents/backend-api-specialist.md`
- File: `wpp-analytics-platform/backend/src/routes/datasets.ts` (dataset registration API)
- File: `wpp-analytics-platform/backend/src/services/queryBuilder.ts` (query builder)
- File: `wpp-analytics-platform/backend/src/services/cacheService.ts` (caching service)
- Folder: `wpp-analytics-platform/backend/supabase/migrations/` (metadata registry schema)

### ✅ Completion Checklist
- [ ] Remove lines 210-392 (Cube.js semantic layer)
- [ ] Remove lines 471-591 (Cube.js model examples)
- [ ] Add dataset registration API documentation
- [ ] Add query builder patterns and examples
- [ ] Add caching strategy documentation
- [ ] Add metadata registry structure
- [ ] Add API endpoint examples with curl/fetch
- [ ] Document error handling patterns
- [ ] Test agent can generate correct API code

### 🎯 Definition of Done
✓ All Cube.js references removed
✓ Dataset API patterns documented
✓ Query builder explained
✓ Caching strategy included
✓ Agent can generate correct backend code

---

## MCP-49: [Documentation] Update database-analytics-architect agent

**Labels:** `documentation`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Delete Cube.js sections (lines 210-392)
- [ ] Add dataset caching system architecture
- [ ] Add BigQuery optimization strategies
- [ ] Add data blending patterns

### 📚 References Needed
- File: `.claude/agents/database-analytics-architect.md`
- File: `wpp-analytics-platform/backend/src/services/cacheService.ts` (dataset caching)
- File: `wpp-analytics-platform/backend/src/clients/bigQueryClient.ts` (BigQuery client)
- File: `wpp-analytics-platform/backend/src/services/dataBlender.ts` (data blending)

### ✅ Completion Checklist
- [ ] Remove lines 210-392 (Cube.js semantic layer)
- [ ] Add dataset caching architecture section
- [ ] Add BigQuery optimization strategies
- [ ] Add data blending patterns documentation
- [ ] Add partitioning and clustering guidance
- [ ] Add cost optimization strategies
- [ ] Add query performance best practices
- [ ] Document materialized view patterns
- [ ] Test agent can provide architecture guidance

### 🎯 Definition of Done
✓ Cube.js references removed
✓ Dataset caching architecture documented
✓ BigQuery optimization strategies included
✓ Data blending patterns explained
✓ Agent provides accurate architecture guidance

---

## MCP-50: [Documentation] Review and update remaining 5 agents

**Labels:** `documentation`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Verify auth-security-specialist.md
- [ ] Verify devops-infrastructure-specialist.md
- [ ] Check 3 other agents in `.claude/agents/`
- [ ] Update if any reference outdated architecture
- [ ] Remove Cube.js references
- [ ] Update OAuth flow documentation
- [ ] Update deployment patterns

### 📚 References Needed
- Folder: `.claude/agents/` (all agent files)
- Folder: `src/oauth/` (current OAuth implementation)
- File: `wpp-analytics-platform/backend/vercel.json` (deployment config)
- Folder: `.claude/skills/` (infrastructure setup)

### ✅ Completion Checklist
- [ ] Verify auth-security-specialist.md (OAuth, RLS, security)
- [ ] Verify devops-infrastructure-specialist.md (deployment, monitoring)
- [ ] Identify and review 3 additional agent files
- [ ] Update any outdated architecture references
- [ ] Update OAuth flow documentation if needed
- [ ] Update deployment patterns if needed
- [ ] Verify security best practices are current
- [ ] Test agents can provide accurate guidance

### 🎯 Definition of Done
✓ All 5 agent files reviewed
✓ Outdated references removed or updated
✓ Current architecture reflected
✓ OAuth and security patterns current
✓ Agents provide accurate guidance

---

## MCP-51: [Documentation] Create DATA-LAYER-ARCHITECTURE.md

**Labels:** `documentation`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Create new documentation file DATA-LAYER-ARCHITECTURE.md
- [ ] Document BigQuery → Dataset → API → Frontend flow
- [ ] Explain metadata registry system
- [ ] Document caching strategy
- [ ] Provide data blending examples

### 📚 References Needed
- File: `.claude/agents/DATA-LAYER-ARCHITECTURE.md` (new file to create)
- File: `wpp-analytics-platform/backend/src/routes/datasets.ts` (dataset registration flow)
- Database: Supabase metadata registry schema
- File: `wpp-analytics-platform/backend/src/services/cacheService.ts`
- File: `wpp-analytics-platform/backend/src/services/queryBuilder.ts`
- File: `wpp-analytics-platform/frontend/src/hooks/useDataset.ts`

### ✅ Completion Checklist
- [ ] Create DATA-LAYER-ARCHITECTURE.md file
- [ ] Document complete data flow diagram (text-based)
- [ ] Explain BigQuery schema organization
- [ ] Document dataset registration process
- [ ] Explain metadata registry structure
- [ ] Document caching strategy (hot/cold, TTL)
- [ ] Provide data blending examples
- [ ] Add API request/response examples
- [ ] Add frontend integration examples
- [ ] Include performance optimization tips

### 🎯 Definition of Done
✓ New documentation file created
✓ Complete data flow documented
✓ Metadata registry explained
✓ Caching strategy detailed
✓ Data blending examples included
✓ Serves as reference for all agents

---

## MCP-52: [Reporting Platform] Complete SettingsSidebar (Style & Filters tabs)

**Labels:** `reporting-platform`, `ui`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Complete Style tab: color picker, font controls, theme presets, custom CSS
- [ ] Complete Filters tab: date range, dimension filters, metric filters
- [ ] Connect controls to component configuration
- [ ] Add live preview of changes

### 📚 References Needed
- File: `wpp-analytics-platform/frontend/src/components/dashboard-builder/sidebar/SettingsSidebar.tsx`
- File: `wpp-analytics-platform/frontend/src/types/styles.ts` (style type definitions)
- File: `wpp-analytics-platform/frontend/src/types/filters.ts` (filter types)
- Library: react-colorful (color picker)
- Library: react-datepicker (date picker)

### ✅ Completion Checklist
- [ ] Implement color picker with live preview
- [ ] Add font family dropdown (system fonts + Google Fonts)
- [ ] Add font size slider (12-24px)
- [ ] Create theme preset buttons (light/dark/custom)
- [ ] Add custom CSS textarea with syntax highlighting
- [ ] Implement date range picker with presets
- [ ] Add dimension filter multi-select
- [ ] Add metric filter with operators (=, !=, >, <, >=, <=)
- [ ] Connect filters to component configuration
- [ ] Add "Apply Filters" button
- [ ] Test style changes apply to selected component
- [ ] Test filters update component data

### 🎯 Definition of Done
✓ Style tab fully functional with all controls
✓ Filters tab fully functional with all filter types
✓ Style changes apply in real-time
✓ Filters update component data correctly
✓ UI is intuitive and responsive

---

## MCP-53: [Reporting Platform] Test and fix EditorTopbar

**Labels:** `reporting-platform`, `ui`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Test menu row (40px) functionality
- [ ] Test toolbar row (48px) buttons
- [ ] Verify save/publish/export buttons work
- [ ] Test undo/redo functionality
- [ ] Fix any connection issues

### 📚 References Needed
- File: `wpp-analytics-platform/frontend/src/components/dashboard-builder/topbar/EditorTopbar.tsx`
- State: Dashboard state management (zustand/context)
- API: Save/publish API endpoints
- Feature: Export functionality implementation
- State: Undo/redo state management

### ✅ Completion Checklist
- [ ] Test dashboard name editing (inline or modal)
- [ ] Test breadcrumb navigation
- [ ] Test user menu dropdown
- [ ] Test save button (save to Supabase)
- [ ] Test publish button (change status)
- [ ] Test export button (PDF/Excel/PNG options)
- [ ] Test undo button (revert last change)
- [ ] Test redo button (reapply change)
- [ ] Test add component button (opens palette)
- [ ] Test preview button (shows dashboard view)
- [ ] Fix any broken button connections
- [ ] Fix any styling issues
- [ ] Add loading states to async actions
- [ ] Add success/error toasts
- [ ] Test keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)

### 🎯 Definition of Done
✓ All menu row items functional
✓ All toolbar buttons functional
✓ Save/publish/export working
✓ Undo/redo working correctly
✓ No broken connections or errors
✓ Loading states and feedback present

---

## MCP-54: [Reporting Platform] Complete drag-and-drop builder testing

**Labels:** `reporting-platform`, `ui`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Test row creation and deletion
- [ ] Test column resizing (1/1, 1/2, 1/3, 2/3, 1/4, 3/4)
- [ ] Test component palette drag
- [ ] Test component reordering
- [ ] Test grid snapping

### 📚 References Needed
- File: `wpp-analytics-platform/frontend/src/app/dashboard/[id]/builder/page.tsx`
- Library: DnD library (react-dnd or dnd-kit)
- File: `wpp-analytics-platform/frontend/src/components/dashboard-builder/Grid.tsx`
- File: `wpp-analytics-platform/frontend/src/components/dashboard-builder/ComponentPalette.tsx`

### ✅ Completion Checklist
- [ ] Test adding new row at top/middle/bottom
- [ ] Test deleting row (with confirmation)
- [ ] Test deleting row with components (warn user)
- [ ] Test resizing column to 1/1 (full width)
- [ ] Test resizing column to 1/2 (half width)
- [ ] Test resizing column to 1/3, 2/3
- [ ] Test resizing column to 1/4, 3/4
- [ ] Test dragging component from palette to row
- [ ] Test dragging component within same row
- [ ] Test dragging component between different rows
- [ ] Test grid snapping aligns components
- [ ] Test hover states and drop zones
- [ ] Fix any drag performance issues
- [ ] Fix any visual glitches
- [ ] Add drag preview/ghost element

### 🎯 Definition of Done
✓ Row creation/deletion works smoothly
✓ All column resize options functional
✓ Component drag from palette works
✓ Component reordering works correctly
✓ Grid snapping provides good UX
✓ No performance or visual issues

---

## MCP-55: [Reporting Platform] Implement mobile responsiveness

**Labels:** `reporting-platform`, `ui`, `mobile`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Create responsive grid system
- [ ] Implement mobile layout breakpoints
- [ ] Create mobile-optimized sidebar
- [ ] Add touch interaction handling

### 📚 References Needed
- Current grid implementation
- File: Sidebar components (ComponentPalette, SettingsSidebar)
- Library: DnD library touch support documentation
- Framework: Tailwind CSS responsive utilities

### ✅ Completion Checklist
- [ ] Define breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- [ ] Implement responsive grid (columns collapse on mobile)
- [ ] Convert sidebar to drawer on mobile (slide from left/right)
- [ ] Add touch event handlers for drag-and-drop
- [ ] Make topbar responsive (collapse buttons, hamburger menu)
- [ ] Make component palette mobile-friendly
- [ ] Make settings sidebar mobile-friendly
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on tablet (iPad, Android tablet)
- [ ] Add touch gestures (swipe to open sidebar, pinch to zoom)
- [ ] Ensure text is readable on small screens
- [ ] Ensure buttons are large enough for touch (44x44px min)
- [ ] Test landscape and portrait orientations

### 🎯 Definition of Done
✓ Dashboard builder works on mobile (portrait/landscape)
✓ Dashboard viewer works on mobile
✓ Sidebar adapts to mobile with drawer
✓ Touch interactions work smoothly
✓ All breakpoints tested
✓ No layout breaking or overflow issues

---

## MCP-56: [Reporting Platform] Migrate 8 priority charts

**Labels:** `reporting-platform`, `charts`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Migrate BarChart, LineChart, AreaChart, DonutChart
- [ ] Migrate FunnelChart, GaugeChart, HeatmapChart, RadarChart
- [ ] Replace Cube.js with dataset API
- [ ] Add style prop support
- [ ] Add loading/error states
- [ ] Test with BigQuery data

### 📚 References Needed
- Folder: `wpp-analytics-platform/frontend/src/components/charts/`
- File: `wpp-analytics-platform/frontend/src/hooks/useDataset.ts` (dataset API hook)
- File: `wpp-analytics-platform/frontend/src/types/styles.ts` (style types)
- Library: Chart library documentation (recharts or similar)

### ✅ Completion Checklist
- [ ] Migrate BarChart (replace Cube.js, add styles, test)
- [ ] Migrate LineChart (replace Cube.js, add styles, test)
- [ ] Migrate AreaChart (replace Cube.js, add styles, test)
- [ ] Migrate DonutChart (replace Cube.js, add styles, test)
- [ ] Migrate FunnelChart (replace Cube.js, add styles, test)
- [ ] Migrate GaugeChart (replace Cube.js, add styles, test)
- [ ] Migrate HeatmapChart (replace Cube.js, add styles, test)
- [ ] Migrate RadarChart (replace Cube.js, add styles, test)
- [ ] Add loading skeleton for each chart
- [ ] Add error state UI for each chart
- [ ] Test with GSC data from BigQuery
- [ ] Test with Google Ads data
- [ ] Test style prop changes
- [ ] Update TypeScript types

### 🎯 Definition of Done
✓ All 8 charts migrated from Cube.js
✓ Dataset API integration working
✓ Style props functional
✓ Loading/error states implemented
✓ Tested with real BigQuery data
✓ TypeScript types updated

---

## MCP-57: [Reporting Platform] Migrate 7 secondary charts

**Labels:** `reporting-platform`, `charts`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Migrate SankeyChart, ScatterChart, TreemapChart
- [ ] Migrate WaterfallChart, BubbleChart, PolarChart, RadialBarChart
- [ ] Replace Cube.js with dataset API
- [ ] Add style prop support
- [ ] Add loading/error states
- [ ] Test with BigQuery data

### 📚 References Needed
- Migration pattern from MCP-56 (8 priority charts)
- Folder: `wpp-analytics-platform/frontend/src/components/charts/`
- File: `wpp-analytics-platform/frontend/src/hooks/useDataset.ts`
- File: `wpp-analytics-platform/frontend/src/types/styles.ts`

### ✅ Completion Checklist
- [ ] Migrate SankeyChart (replace Cube.js, add styles, test)
- [ ] Migrate ScatterChart (replace Cube.js, add styles, test)
- [ ] Migrate TreemapChart (replace Cube.js, add styles, test)
- [ ] Migrate WaterfallChart (replace Cube.js, add styles, test)
- [ ] Migrate BubbleChart (replace Cube.js, add styles, test)
- [ ] Migrate PolarChart (replace Cube.js, add styles, test)
- [ ] Migrate RadialBarChart (replace Cube.js, add styles, test)
- [ ] Add loading skeleton for each chart
- [ ] Add error state UI for each chart
- [ ] Test with different datasets
- [ ] Test style prop changes
- [ ] Update TypeScript types

### 🎯 Definition of Done
✓ All 7 charts migrated from Cube.js
✓ Dataset API integration working
✓ Style props functional
✓ Loading/error states implemented
✓ Tested with real data
✓ TypeScript types updated

---

## MCP-58: [Reporting Platform] Migrate remaining 38 specialized charts

**Labels:** `reporting-platform`, `charts`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Complete migration of all remaining 38 specialized chart variants
- [ ] Use batch agent assistance for consistency
- [ ] Apply same pattern as MCP-56 and MCP-57
- [ ] Focus on consistency and reusability

### 📚 References Needed
- Migration patterns from MCP-56 and MCP-57
- Complete list of remaining charts in charts directory
- File: `wpp-analytics-platform/frontend/src/hooks/useDataset.ts`
- File: `wpp-analytics-platform/frontend/src/types/styles.ts`

### ✅ Completion Checklist
- [ ] Inventory all remaining chart components (38 total)
- [ ] Group charts by similarity (e.g., all bar variants, line variants)
- [ ] Create migration template/script for batch processing
- [ ] Migrate group 1 (10 charts)
- [ ] Migrate group 2 (10 charts)
- [ ] Migrate group 3 (10 charts)
- [ ] Migrate group 4 (8 charts)
- [ ] Add loading/error states to all
- [ ] Test sample of charts with real data
- [ ] Update TypeScript types for all
- [ ] Update chart component registry
- [ ] Document any chart-specific configuration needs

### 🎯 Definition of Done
✓ All 38 remaining charts migrated
✓ Consistent pattern across all charts
✓ Dataset API integration working
✓ Style props functional
✓ Loading/error states implemented
✓ TypeScript types updated
✓ Chart registry updated

---

## MCP-59: [Reporting Platform] Implement export functionality

**Labels:** `reporting-platform`, `features`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Implement PDF export using jspdf library
- [ ] Implement Excel export using xlsx library
- [ ] Implement PNG export using html-to-image library
- [ ] Support multi-page dashboards

### 📚 References Needed
- Library: jspdf documentation for PDF generation
- Library: xlsx (SheetJS) documentation for Excel export
- Library: html-to-image documentation for PNG export
- Current dashboard structure
- Chart rendering components

### ✅ Completion Checklist
- [ ] Install required libraries (jspdf, xlsx, html-to-image)
- [ ] Create ExportModal component with format selection
- [ ] Implement PDF export function (single page)
- [ ] Implement PDF export for multi-page dashboards
- [ ] Implement Excel export (data tables + charts as images)
- [ ] Implement PNG export (full dashboard screenshot)
- [ ] Add export progress indicator
- [ ] Add export success/error notifications
- [ ] Test PDF export with various chart types
- [ ] Test Excel export with data tables
- [ ] Test PNG export quality
- [ ] Add export button to EditorTopbar
- [ ] Add export button to dashboard viewer
- [ ] Test export with large dashboards
- [ ] Add export options (page size, orientation, quality)

### 🎯 Definition of Done
✓ PDF export working for all dashboard types
✓ Excel export includes data and charts
✓ PNG export produces high-quality images
✓ Multi-page dashboard export supported
✓ Export UI is intuitive
✓ Progress feedback provided
✓ All chart types render correctly in exports

---

## MCP-60: [Reporting Platform] Implement sharing system

**Labels:** `reporting-platform`, `features`, `collaboration`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Generate shareable links (public/private)
- [ ] Implement permission levels (view/edit/admin)
- [ ] Create team collaboration UI
- [ ] Implement email notifications

### 📚 References Needed
- Supabase RLS policies for sharing
- Dashboard schema in Supabase
- User/team tables in Supabase
- Email service (SendGrid, Resend, or similar)
- JWT token generation for public links

### ✅ Completion Checklist
- [ ] Create database schema for shares (dashboard_shares table)
- [ ] Create database schema for permissions (dashboard_permissions table)
- [ ] Implement RLS policies for shared dashboards
- [ ] Create ShareModal component (email input, permission dropdown)
- [ ] Implement generate public link function
- [ ] Implement generate private link function (requires login)
- [ ] Add permission level selector (view/edit/admin)
- [ ] Create share management UI (list of users with access)
- [ ] Implement revoke access functionality
- [ ] Implement email notification service
- [ ] Add "Share" button to EditorTopbar
- [ ] Add "Share" button to dashboard viewer
- [ ] Test public link access (no login required)
- [ ] Test private link access (login required)
- [ ] Test view permission (read-only)
- [ ] Test edit permission (can modify)
- [ ] Test admin permission (can manage shares)
- [ ] Test email notifications

### 🎯 Definition of Done
✓ Public/private sharing links working
✓ Permission levels enforced correctly
✓ Team collaboration UI functional
✓ Email notifications sent
✓ Share management interface complete
✓ RLS policies secure and tested

---

## MCP-61: [Reporting Platform] Implement calculated fields

**Labels:** `reporting-platform`, `features`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Create formula builder UI component
- [ ] Implement syntax validator
- [ ] Support functions: SUM, AVG, COUNT, IF, CASE
- [ ] Save calculated fields to metadata
- [ ] Display in chart configuration

### 📚 References Needed
- Metadata registry schema in Supabase
- Dataset API for retrieving available fields
- Formula parsing library (expr-eval or similar)
- Chart configuration UI components

### ✅ Completion Checklist
- [ ] Create calculated_fields table in Supabase
- [ ] Install formula parsing library (expr-eval)
- [ ] Create CalculatedFieldBuilder component
- [ ] Add formula input with syntax highlighting
- [ ] Add function reference panel (SUM, AVG, COUNT, IF, CASE)
- [ ] Implement syntax validator (real-time)
- [ ] Add field name and description inputs
- [ ] Implement save calculated field API endpoint
- [ ] Implement list calculated fields API endpoint
- [ ] Implement delete calculated field functionality
- [ ] Add calculated fields to dataset metadata
- [ ] Display calculated fields in chart config dropdowns
- [ ] Test SUM formula (e.g., SUM(clicks) + SUM(impressions))
- [ ] Test AVG formula (e.g., AVG(ctr))
- [ ] Test COUNT formula (e.g., COUNT(DISTINCT page))
- [ ] Test IF formula (e.g., IF(clicks > 100, "High", "Low"))
- [ ] Test CASE formula
- [ ] Test calculated field in chart rendering

### 🎯 Definition of Done
✓ Formula builder UI complete and intuitive
✓ Syntax validator working in real-time
✓ All supported functions working (SUM, AVG, COUNT, IF, CASE)
✓ Calculated fields saved to metadata
✓ Calculated fields available in chart configuration
✓ Formulas execute correctly in charts

---

## MCP-62: [Reporting Platform] Implement version history

**Labels:** `reporting-platform`, `features`, `phase-4`
**Priority:** Low

### 📋 What Needs to Be Done
- [ ] Create database schema for dashboard versions
- [ ] Implement auto-save on edits (debounced)
- [ ] Create version list UI in sidebar
- [ ] Implement rollback functionality
- [ ] Create diff viewer (show changes)

### 📚 References Needed
- Dashboard schema in Supabase
- Dashboard state management
- Diff library (jsondiffpatch or similar)
- Version history UI patterns

### ✅ Completion Checklist
- [ ] Create dashboard_versions table in Supabase
- [ ] Add version tracking to dashboard updates
- [ ] Implement auto-save function (debounce 3 seconds)
- [ ] Create VersionHistorySidebar component
- [ ] Implement list versions API endpoint
- [ ] Display version list with timestamps and user
- [ ] Implement rollback API endpoint
- [ ] Add rollback button to each version
- [ ] Add confirmation modal for rollback
- [ ] Install diff library (jsondiffpatch)
- [ ] Create DiffViewer component
- [ ] Display changes between versions (added/removed/modified)
- [ ] Add "Compare versions" functionality
- [ ] Test auto-save triggers correctly
- [ ] Test version list displays correctly
- [ ] Test rollback restores dashboard state
- [ ] Test diff viewer shows accurate changes
- [ ] Add version naming/tagging feature
- [ ] Add "Save as new version" manual button

### 🎯 Definition of Done
✓ Dashboard versions saved automatically
✓ Version history displayed in sidebar
✓ Rollback functionality working
✓ Diff viewer shows changes accurately
✓ Auto-save working with proper debounce
✓ Version list shows timestamps and users

---

## MCP-63: [Reporting Platform] Implement real-time collaboration

**Labels:** `reporting-platform`, `features`, `collaboration`, `realtime`, `phase-4`
**Priority:** Low

### 📋 What Needs to Be Done
- [ ] Set up WebSocket connection (Supabase Realtime)
- [ ] Implement presence indicators (who's editing)
- [ ] Implement cursor sharing
- [ ] Implement edit conflict resolution
- [ ] Broadcast changes to all connected users

### 📚 References Needed
- Supabase Realtime documentation
- Dashboard state management
- WebSocket patterns for collaboration
- Conflict resolution strategies (operational transform or CRDT)

### ✅ Completion Checklist
- [ ] Set up Supabase Realtime channel for dashboard
- [ ] Implement presence tracking (online users)
- [ ] Create PresenceIndicator component (avatar stack)
- [ ] Broadcast user joins/leaves
- [ ] Implement cursor position sharing
- [ ] Create RemoteCursor component (show other users' cursors)
- [ ] Broadcast component add/delete operations
- [ ] Broadcast component move operations
- [ ] Broadcast component edit operations
- [ ] Implement conflict resolution (last-write-wins or OT)
- [ ] Add optimistic updates for local changes
- [ ] Add change reconciliation for remote changes
- [ ] Show notification when another user makes a change
- [ ] Test with 2 users editing simultaneously
- [ ] Test with 5+ users editing simultaneously
- [ ] Test conflict scenarios (same component edited)
- [ ] Test connection drop and reconnection
- [ ] Add "View only" mode when conflict detected
- [ ] Add collaborative editing indicator in topbar

### 🎯 Definition of Done
✓ WebSocket connection established via Supabase Realtime
✓ Presence indicators show online users
✓ Cursor sharing functional
✓ Changes broadcast to all users in real-time
✓ Conflict resolution working correctly
✓ No data loss or corruption from concurrent edits
✓ Performance acceptable with multiple users

---

## MCP-64: [MCP Tools] Add style parameters to dashboard MCP tools

**Labels:** `mcp-tools`, `reporting-platform`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Add style field to ComponentConfig type
- [ ] Add theme parameter to create_dashboard tool
- [ ] Update tool descriptions with style examples
- [ ] Update tool response formats

### 📚 References Needed
- File: `src/wpp-analytics/tools/dashboards.ts`
- File: `wpp-analytics-platform/frontend/src/types/styles.ts` (style types)
- ComponentConfig type definition
- MCP tool documentation format

### ✅ Completion Checklist
- [ ] Add style field to ComponentConfig TypeScript type
- [ ] Update create_dashboard tool signature (add theme parameter)
- [ ] Update create_dashboard tool description with style examples
- [ ] Add style parameter validation
- [ ] Update create_dashboard_from_table tool
- [ ] Update update_dashboard_layout tool
- [ ] Add style examples to tool descriptions
- [ ] Document color format (hex, rgb, named)
- [ ] Document font options
- [ ] Document spacing units (px, rem, em)
- [ ] Test style parameters in create_dashboard call
- [ ] Test style parameters persist to Supabase
- [ ] Test frontend renders styles correctly
- [ ] Update TypeScript types for all tools

### 🎯 Definition of Done
✓ Style field added to ComponentConfig
✓ Theme parameter added to create_dashboard
✓ Tool descriptions include style examples
✓ Style parameters validated correctly
✓ Styles persist and render correctly
✓ TypeScript types updated

---

## MCP-65: [MCP Tools] Create new MCP tools

**Labels:** `mcp-tools`, `reporting-platform`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Create create_calculated_field tool
- [ ] Create export_dashboard tool
- [ ] Create share_dashboard tool

**New Tools:**
1. **create_calculated_field**: Create custom metric formulas
   - Input: formula, name, dataset_id
   - Output: field_id

2. **export_dashboard**: Export dashboard to file
   - Input: dashboard_id, format (pdf|excel|png)
   - Output: download_url

3. **share_dashboard**: Share dashboard with user
   - Input: dashboard_id, email, permission (view|edit|admin)
   - Output: share_url

### 📚 References Needed
- File: `src/wpp-analytics/tools/dashboards.ts`
- Calculated fields API endpoint
- Export functionality implementation
- Sharing system API endpoints
- Existing MCP tool patterns

### ✅ Completion Checklist
- [ ] Create create_calculated_field tool function
- [ ] Add formula syntax validation to tool
- [ ] Test create_calculated_field with various formulas
- [ ] Create export_dashboard tool function
- [ ] Implement format validation (pdf|excel|png)
- [ ] Test export_dashboard for all formats
- [ ] Create share_dashboard tool function
- [ ] Implement permission validation (view|edit|admin)
- [ ] Test share_dashboard creates share records
- [ ] Add comprehensive tool descriptions
- [ ] Add usage examples for each tool
- [ ] Add error handling for each tool
- [ ] Register new tools in MCP server
- [ ] Update tool registry/index
- [ ] Test tools via MCP client
- [ ] Document tools in reporting-platform skill

### 🎯 Definition of Done
✓ create_calculated_field tool working
✓ export_dashboard tool working for all formats
✓ share_dashboard tool working with all permissions
✓ All tools registered in MCP server
✓ Tool descriptions comprehensive
✓ Usage examples included
✓ Error handling implemented

---

## MCP-66: [Documentation] Update reporting-platform skill

**Labels:** `documentation`, `reporting-platform`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Add style parameter examples
- [ ] Add calculated field examples
- [ ] Add export functionality examples
- [ ] Add sharing examples
- [ ] Update workflow documentation

### 📚 References Needed
- File: `.claude/skills/reporting-platform/SKILL.md`
- Updated MCP tools with style parameters
- New MCP tools (calculated fields, export, share)
- Style types documentation

### ✅ Completion Checklist
- [ ] Add style parameters section to skill
- [ ] Add style parameter examples (colors, fonts, spacing)
- [ ] Add theme presets documentation
- [ ] Add calculated field creation examples
- [ ] Add formula syntax reference
- [ ] Add export dashboard examples (PDF, Excel, PNG)
- [ ] Add share dashboard examples
- [ ] Add permission levels documentation
- [ ] Update workflow examples with new features
- [ ] Add "Create styled dashboard" workflow
- [ ] Add "Create dashboard with calculated fields" workflow
- [ ] Add "Export and share dashboard" workflow
- [ ] Update tool reference section
- [ ] Add troubleshooting section for new features
- [ ] Test skill prompts work with Claude

### 🎯 Definition of Done
✓ Style parameters documented with examples
✓ Calculated fields documented with formulas
✓ Export functionality documented
✓ Sharing system documented
✓ Workflow examples updated
✓ Skill prompts tested and working

---

## MCP-67: [Reporting Platform] Bing Webmaster Tools integration

**Labels:** `reporting-platform`, `integrations`, `phase-4`
**Priority:** Low

### 📋 What Needs to Be Done
- [ ] Set up OAuth 2.0 for Bing Webmaster Tools
- [ ] Create MCP tools: list_bing_properties, query_bing_analytics
- [ ] Create BigQuery schema for Bing data
- [ ] Create dashboard templates for Bing metrics

### 📚 References Needed
- Bing Webmaster Tools API documentation
- OAuth 2.0 flow implementation pattern from GSC/Ads
- BigQuery schema patterns
- MCP tool implementation patterns
- Dashboard template structure

### ✅ Completion Checklist
- [ ] Register Bing Webmaster Tools OAuth app
- [ ] Implement OAuth 2.0 flow for Bing
- [ ] Create Bing client class
- [ ] Implement list_bing_properties MCP tool
- [ ] Implement query_bing_analytics MCP tool
- [ ] Create BigQuery schema for Bing data
- [ ] Implement data sync function (Bing → BigQuery)
- [ ] Test OAuth flow end-to-end
- [ ] Test data retrieval from Bing API
- [ ] Test data insertion to BigQuery
- [ ] Create Bing SEO dashboard template
- [ ] Add Bing as data source option in UI
- [ ] Test dashboard creation with Bing data
- [ ] Add Bing integration to documentation
- [ ] Add Bing examples to reporting-platform skill

### 🎯 Definition of Done
✓ OAuth 2.0 working for Bing Webmaster Tools
✓ MCP tools implemented and working
✓ BigQuery schema created and tested
✓ Data sync working reliably
✓ Dashboard templates available
✓ Integration documented

---

## MCP-68: [Reporting Platform] Amazon Advertising integration (Optional)

**Labels:** `reporting-platform`, `integrations`, `optional`, `phase-4`
**Priority:** Low

### 📋 What Needs to Be Done
- [ ] Set up OAuth 2.0 for Amazon Advertising
- [ ] Create MCP tools for campaigns, products, and metrics
- [ ] Create BigQuery schema for Amazon Ads data
- [ ] Create dashboard templates for Amazon advertising

### 📚 References Needed
- Amazon Advertising API documentation
- OAuth 2.0 flow patterns
- BigQuery schema patterns
- MCP tool implementation patterns

### ✅ Completion Checklist
- [ ] Register Amazon Advertising API application
- [ ] Implement OAuth 2.0 flow for Amazon Ads
- [ ] Create Amazon Ads client class
- [ ] Implement list_amazon_campaigns MCP tool
- [ ] Implement get_amazon_campaign_performance MCP tool
- [ ] Implement get_amazon_product_ads MCP tool
- [ ] Create BigQuery schema for Amazon Ads data
- [ ] Implement data sync function (Amazon → BigQuery)
- [ ] Test OAuth flow end-to-end
- [ ] Test data retrieval from Amazon API
- [ ] Test data insertion to BigQuery
- [ ] Create Amazon Advertising dashboard template
- [ ] Add Amazon Ads as data source in UI
- [ ] Test dashboard with Amazon data
- [ ] Document Amazon Ads integration

### 🎯 Definition of Done
✓ OAuth 2.0 working for Amazon Advertising
✓ MCP tools implemented and working
✓ BigQuery schema created
✓ Data sync working
✓ Dashboard templates available
✓ Integration documented

---

## MCP-69: [Reporting Platform] Meta Business Suite integration (Optional)

**Labels:** `reporting-platform`, `integrations`, `optional`, `phase-4`
**Priority:** Low

### 📋 What Needs to Be Done
- [ ] Set up OAuth 2.0 for Meta Business Suite
- [ ] Create MCP tools for Facebook/Instagram insights
- [ ] Create BigQuery schema for Meta data
- [ ] Create dashboard templates for social media metrics

### 📚 References Needed
- Meta Graph API documentation
- Meta Business API documentation
- OAuth 2.0 flow patterns
- BigQuery schema patterns
- MCP tool implementation patterns

### ✅ Completion Checklist
- [ ] Register Meta Business App
- [ ] Implement OAuth 2.0 flow for Meta
- [ ] Create Meta Business client class
- [ ] Implement list_meta_pages MCP tool
- [ ] Implement get_facebook_insights MCP tool
- [ ] Implement get_instagram_insights MCP tool
- [ ] Create BigQuery schema for Meta data
- [ ] Implement data sync function (Meta → BigQuery)
- [ ] Test OAuth flow end-to-end
- [ ] Test Facebook insights retrieval
- [ ] Test Instagram insights retrieval
- [ ] Test data insertion to BigQuery
- [ ] Create social media dashboard template
- [ ] Add Meta as data source in UI
- [ ] Test dashboard with Meta data
- [ ] Document Meta integration

### 🎯 Definition of Done
✓ OAuth 2.0 working for Meta Business Suite
✓ MCP tools implemented for Facebook and Instagram
✓ BigQuery schema created
✓ Data sync working
✓ Dashboard templates available
✓ Integration documented

---

## MCP-70: [Reporting Platform] Implement BigQuery hot/cold storage

**Labels:** `reporting-platform`, `optimization`, `bigquery`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Create cold storage tables (90+ days old)
- [ ] Create hot storage tables (<90 days)
- [ ] Implement automated data archival cron job
- [ ] Create query router (check hot first, then cold)

### 📚 References Needed
- BigQuery table partitioning documentation
- BigQuery long-term storage pricing
- Cron job implementation (Supabase Edge Functions or Cloud Scheduler)
- Query builder service

### ✅ Completion Checklist
- [ ] Design hot/cold storage table structure
- [ ] Create cold storage tables for each data source (GSC, Ads, GA4)
- [ ] Implement partition by date for all tables
- [ ] Create data archival function (move 90+ day data to cold)
- [ ] Set up cron job for daily archival (runs at 2 AM UTC)
- [ ] Implement query router logic (check hot, fallback to cold)
- [ ] Update dataset API to use query router
- [ ] Test archival function moves data correctly
- [ ] Test query router returns correct data
- [ ] Test query performance (hot vs cold)
- [ ] Monitor storage costs before/after
- [ ] Add cold storage retrieval warning (slower)
- [ ] Document hot/cold storage strategy
- [ ] Add configuration for archival threshold (90 days default)

### 🎯 Definition of Done
✓ Hot and cold storage tables created
✓ Automated archival cron job working
✓ Query router retrieves from both storage tiers
✓ Data older than 90 days moved to cold storage
✓ Query performance acceptable
✓ Storage costs reduced
✓ Strategy documented

---

## MCP-71: [Reporting Platform] Query performance optimization

**Labels:** `reporting-platform`, `optimization`, `bigquery`, `performance`, `phase-4`
**Priority:** Medium

### 📋 What Needs to Be Done
- [ ] Add BigQuery materialized views for common queries
- [ ] Implement query result caching (Redis)
- [ ] Add query cost monitoring
- [ ] Optimize table partitioning

### 📚 References Needed
- BigQuery materialized views documentation
- Redis caching patterns
- BigQuery query cost analysis
- Table partitioning and clustering best practices
- Current query patterns from logs

### ✅ Completion Checklist
- [ ] Analyze top 20 most frequent queries from logs
- [ ] Create materialized views for top 10 queries
- [ ] Set up Redis instance (Upstash or Cloud Memorystore)
- [ ] Implement query result caching layer
- [ ] Set cache TTL (Time To Live) appropriately per query type
- [ ] Add cache invalidation on data updates
- [ ] Implement query cost tracking (BigQuery job statistics)
- [ ] Set up cost alerting (alert if query > $1)
- [ ] Review and optimize table partitioning (by date)
- [ ] Add clustering to high-cardinality columns
- [ ] Test materialized view performance improvements
- [ ] Test cache hit rates (target >70%)
- [ ] Test cache invalidation works correctly
- [ ] Monitor query costs before/after optimization
- [ ] Document optimization strategies
- [ ] Create runbook for query optimization

### 🎯 Definition of Done
✓ Materialized views created for common queries
✓ Redis caching implemented with proper TTL
✓ Query cost monitoring and alerting active
✓ Table partitioning and clustering optimized
✓ Query performance improved (faster response times)
✓ Query costs reduced
✓ Cache hit rate >70%
✓ Optimization strategies documented

---

## MCP-72: [Testing] Comprehensive local testing

**Labels:** `reporting-platform`, `testing`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Test all 57 chart components
- [ ] Test all 9 API endpoints
- [ ] Test all 31 MCP tools
- [ ] Test agent workflows
- [ ] Test practitioner workflows
- [ ] Test multi-tenant isolation
- [ ] Test OAuth refresh flows

### 📚 References Needed
- Complete chart component list
- API endpoint documentation
- MCP tool registry
- Agent workflow documentation
- Test data sets for each platform (GSC, Ads, GA4)

### ✅ Completion Checklist
- [ ] Create test plan document
- [ ] Test all 57 chart components render correctly
- [ ] Test all 9 API endpoints (success and error cases)
- [ ] Test all 31 MCP tools via MCP client
- [ ] Test agent workflow: Create dashboard from GSC data
- [ ] Test agent workflow: Create dashboard from Ads data
- [ ] Test agent workflow: Create dashboard from GA4 data
- [ ] Test agent workflow: Create calculated field
- [ ] Test agent workflow: Export dashboard
- [ ] Test agent workflow: Share dashboard
- [ ] Test practitioner workflow: Build dashboard manually
- [ ] Test practitioner workflow: Customize styles
- [ ] Test practitioner workflow: Add filters
- [ ] Test multi-tenant isolation (user A can't access user B's data)
- [ ] Test OAuth token refresh (GSC, Ads, GA4)
- [ ] Test error handling and recovery
- [ ] Test edge cases (empty data, large datasets)
- [ ] Document all bugs found
- [ ] Fix critical bugs
- [ ] Retest after bug fixes

### 🎯 Definition of Done
✓ All chart components tested and working
✓ All API endpoints tested and working
✓ All MCP tools tested and working
✓ Agent workflows tested end-to-end
✓ Practitioner workflows tested end-to-end
✓ Multi-tenant isolation verified
✓ OAuth refresh working reliably
✓ Critical bugs fixed
✓ Test results documented

---

## MCP-73: [Testing] Integration testing

**Labels:** `reporting-platform`, `testing`, `integration`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Test GSC → BigQuery → Dashboard flow
- [ ] Test Google Ads → BigQuery → Dashboard flow
- [ ] Test GA4 → BigQuery → Dashboard flow
- [ ] Test cross-platform data blending
- [ ] Test export and sharing features

### 📚 References Needed
- Data sync functions for each platform
- BigQuery schemas
- Dashboard creation workflows
- Data blending logic
- Export and sharing implementations

### ✅ Completion Checklist
- [ ] Test GSC data sync to BigQuery
- [ ] Test GSC dashboard creation from BigQuery data
- [ ] Test GSC dashboard displays correct data
- [ ] Test Google Ads data sync to BigQuery
- [ ] Test Ads dashboard creation from BigQuery data
- [ ] Test Ads dashboard displays correct metrics
- [ ] Test GA4 data sync to BigQuery
- [ ] Test GA4 dashboard creation from BigQuery data
- [ ] Test GA4 dashboard displays correct metrics
- [ ] Test blending GSC + Ads data in single dashboard
- [ ] Test blending GA4 + Ads data
- [ ] Test blending all 3 platforms (GSC + Ads + GA4)
- [ ] Test calculated fields across blended data
- [ ] Test export to PDF with blended data
- [ ] Test export to Excel with blended data
- [ ] Test export to PNG with blended data
- [ ] Test sharing dashboard (public link)
- [ ] Test sharing dashboard (private with permissions)
- [ ] Test dashboard updates reflect in shared views
- [ ] Document integration test results

### 🎯 Definition of Done
✓ All platform → BigQuery flows working
✓ All BigQuery → Dashboard flows working
✓ Cross-platform data blending working correctly
✓ Export features working with all data types
✓ Sharing features working with all permission levels
✓ Data accuracy verified
✓ Integration test results documented

---

## MCP-74: [Testing] Performance testing

**Labels:** `reporting-platform`, `testing`, `performance`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Load testing (100+ concurrent users)
- [ ] BigQuery query performance
- [ ] Dashboard render performance
- [ ] Memory leak testing

### 📚 References Needed
- Load testing tools (Artillery, k6, or JMeter)
- Performance monitoring tools (Lighthouse, WebPageTest)
- Memory profiling tools (Chrome DevTools)
- BigQuery query performance metrics

### ✅ Completion Checklist
- [ ] Set up load testing tool (Artillery or k6)
- [ ] Create load test scenarios (user workflows)
- [ ] Run load test: 10 concurrent users
- [ ] Run load test: 50 concurrent users
- [ ] Run load test: 100 concurrent users
- [ ] Run load test: 200 concurrent users
- [ ] Monitor API response times under load
- [ ] Monitor database connection pool under load
- [ ] Monitor BigQuery quota usage under load
- [ ] Test dashboard render time with 5 charts
- [ ] Test dashboard render time with 10 charts
- [ ] Test dashboard render time with 20 charts
- [ ] Identify slow queries in BigQuery
- [ ] Run memory leak test (open/close dashboards repeatedly)
- [ ] Check for memory leaks in browser DevTools
- [ ] Run Lighthouse performance audit
- [ ] Optimize identified bottlenecks
- [ ] Rerun tests after optimizations
- [ ] Document performance test results
- [ ] Set performance benchmarks for monitoring

### 🎯 Definition of Done
✓ Platform handles 100+ concurrent users
✓ API response times < 500ms (p95)
✓ Dashboard render times < 3 seconds
✓ BigQuery queries optimized
✓ No memory leaks detected
✓ Performance benchmarks established
✓ Bottlenecks identified and resolved
✓ Performance test results documented

---

## MCP-75: [Production] Production deployment

**Labels:** `reporting-platform`, `deployment`, `production`, `phase-4`
**Priority:** High

### 📋 What Needs to Be Done
- [ ] Deploy to production Supabase
- [ ] Configure production BigQuery
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for assets
- [ ] Set up backup/restore

### 📚 References Needed
- Production Supabase project credentials
- Production BigQuery project setup
- Sentry setup guide
- CDN setup (Vercel, Cloudflare, or AWS CloudFront)
- Backup and restore documentation

### ✅ Completion Checklist
- [ ] Create production Supabase project
- [ ] Run all database migrations on production
- [ ] Configure production RLS policies
- [ ] Set up production environment variables
- [ ] Create production BigQuery project
- [ ] Create BigQuery datasets for production
- [ ] Configure BigQuery service account
- [ ] Set up BigQuery table partitioning
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Vercel/Railway/Render
- [ ] Configure custom domain and SSL
- [ ] Set up CDN for assets (images, fonts)
- [ ] Set up Sentry for error tracking
- [ ] Set up LogRocket for session replay
- [ ] Configure log aggregation (Datadog, LogDNA)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure automated backups (Supabase + BigQuery)
- [ ] Document backup restore procedure
- [ ] Test production deployment end-to-end
- [ ] Set up staging environment (mirror of production)
- [ ] Document deployment process
- [ ] Create runbook for common operations

### 🎯 Definition of Done
✓ Production deployment complete and live
✓ All monitoring tools configured
✓ CDN configured for optimal performance
✓ Automated backups running
✓ Restore procedure tested
✓ Staging environment available
✓ Deployment process documented
✓ Runbook created for operations

---

## Summary

**Total Tickets:** 29 (MCP-47 to MCP-75)

**Phase Breakdown:**
- **Documentation (MCP-47 to MCP-51):** 5 tickets
- **UI Completion (MCP-52 to MCP-55):** 4 tickets
- **Chart Migration (MCP-56 to MCP-58):** 3 tickets
- **Platform Features (MCP-59 to MCP-63):** 5 tickets
- **MCP Tools (MCP-64 to MCP-66):** 3 tickets
- **Integrations (MCP-67 to MCP-69):** 3 tickets (1 required, 2 optional)
- **Optimization (MCP-70 to MCP-71):** 2 tickets
- **Testing (MCP-72 to MCP-74):** 3 tickets
- **Production (MCP-75):** 1 ticket

**Priority Breakdown:**
- High Priority: 11 tickets
- Medium Priority: 13 tickets
- Low Priority: 5 tickets

**Next Steps:**
1. Copy each ticket to Linear manually
2. Assign tickets to team members
3. Set sprint/milestone targets
4. Begin Phase 4.1 (Documentation) work
