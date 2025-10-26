# Subagent Task Plan: Dashboard Home Page Enhancement

**Status:** Ready for Execution
**Phase:** Phase 2-3 (Dashboard Enhancement + Agent Capabilities)
**Estimated Time:** 2-3 hours total

---

## Overview

This document outlines the detailed subagent task breakdown for enhancing the WPP Analytics Platform dashboard home page with full shadcn/ui implementation and agent MCP capabilities.

### Current State
- ✅ Dashboard home page exists at `/app/dashboard/page.tsx` (365 lines)
- ✅ Full CRUD functionality (Create, Read, Update, Delete)
- ✅ Grid layout with dashboard cards
- ✅ Template selection (Blank, GSC Standard, Ads Performance)
- ✅ Search/filter and sorting implemented
- ✅ Empty state pattern enhanced
- ✅ Badge components for dashboard stats (KPIs, Charts, Filters count)

### Enhancements Needed
1. **UI/UX Polish** - Additional shadcn/ui components (Skeleton, Tooltip, Badge variants)
2. **Agent MCP Capabilities** - Enable agents to create/manage dashboards via MCP tools
3. **Performance Optimization** - Query optimization, pagination, indexing
4. **Advanced Filtering** - Filter by data source, creation date, update frequency

---

## Subagent Task Breakdown

### Task 1: Frontend Developer Agent - UI/UX Enhancement
**Time Estimate:** 45 minutes
**Difficulty:** Medium
**Dependencies:** None (can run in parallel)

#### Objectives
1. Add skeleton loading states during dashboard fetch
2. Add tooltips to dashboard stat badges
3. Implement dashboard card hover animations
4. Add data source color-coding with badge variants
5. Implement responsive improvements for mobile/tablet
6. Add visual feedback for search/filter operations

#### Specific Components to Add
```typescript
// Use these shadcn/ui components:
- Skeleton: Show loading placeholders while dashboards load
- Tooltip: Explain dashboard stats (KPIs, Charts, Filters)
- Badge: Already implemented, enhance with variants
  - Primary: KPI count
  - Secondary: Chart count
  - Outline: Filter count
  - Destructive: Delete action hint
- Card: Already used, enhance hover/focus states
```

#### Implementation Details

**1. Add Skeleton Loading Component**
- File: `/frontend/src/app/dashboard/page.tsx`
- Add skeleton grid while loading dashboards
- Show 3-4 skeleton cards with animated loading effect
```typescript
{isLoading && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    ))}
  </div>
)}
```

**2. Add Tooltips to Badges**
- Use Tooltip component from shadcn/ui
- Explain each stat badge
```typescript
<Tooltip>
  <TooltipTrigger asChild>
    <Badge variant="default">
      {dashboard.charts.filter(c => c.type === 'kpi').length} KPIs
    </Badge>
  </TooltipTrigger>
  <TooltipContent>
    <p>Key Performance Indicators</p>
  </TooltipContent>
</Tooltip>
```

**3. Enhance Card Hover Effects**
- Add shadow elevation on hover
- Add subtle scale transform
- Smooth transitions with CSS classes
```typescript
className="p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
```

**4. Add Data Source Color Coding**
- Create mapping of data sources to colors
```typescript
const dataSourceColors: Record<string, string> = {
  'gsc_performance_7days': 'bg-blue-100 text-blue-900',
  'ads_performance_7days': 'bg-green-100 text-green-900',
  'analytics_sessions_7days': 'bg-purple-100 text-purple-900',
};
```

**5. Mobile Responsive Improvements**
- Test and verify layout on mobile/tablet
- Adjust search/sort controls to stack vertically on small screens
- Ensure touch-friendly button sizes (min 44x44px)

**6. Search/Filter Visual Feedback**
- Highlight search input when active
- Show result count clearly
- Add "clear search" button visible state indicator

#### Files to Modify
- `/frontend/src/app/dashboard/page.tsx` - Main enhancement
- `/frontend/src/components/ui/skeleton.tsx` - Already exists, verify
- `/frontend/src/components/ui/tooltip.tsx` - Already exists, verify

#### Testing Checklist
- [ ] Skeleton loading shows while dashboards load
- [ ] Tooltips appear on hover over badges
- [ ] Card hover effects work smoothly
- [ ] Search/sort feedback is clear
- [ ] Mobile layout is responsive
- [ ] Touch interactions work on tablet

---

### Task 2: Backend API Specialist Agent - Dashboard API Optimization
**Time Estimate:** 30 minutes
**Difficulty:** Medium
**Dependencies:** Task 1 (can run in parallel for most parts)

#### Objectives
1. Add pagination support to dashboard list endpoint
2. Add filtering by data source
3. Optimize Supabase queries with proper indexes
4. Add dashboard metadata caching
5. Implement MCP tool for agent dashboard management

#### Implementation Details

**1. Add Pagination to Dashboard List**
- File: `/frontend/src/lib/supabase/dashboard-service.ts`
- Modify `listDashboards` function:
```typescript
interface ListDashboardsOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'name';
  filterByDataSource?: string;
}

export async function listDashboards(options?: ListDashboardsOptions) {
  let query = supabase
    .from('dashboards')
    .select('*', { count: 'exact' });

  if (options?.filterByDataSource) {
    query = query.eq('datasource', options.filterByDataSource);
  }

  const pageSize = options?.pageSize || 20;
  const page = options?.page || 0;
  const start = page * pageSize;

  query = query.range(start, start + pageSize - 1);

  if (options?.sortBy === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data, error, count } = await query;
  return { success: !error, data, error, count };
}
```

**2. Add Dashboard Metadata Endpoint**
- Create new API route: `/frontend/src/app/api/dashboards/metadata.ts`
- Returns quick stats: total count, by data source breakdown, recent updates
```typescript
export async function GET() {
  const { data: dashboards } = await supabase
    .from('dashboards')
    .select('datasource, updated_at');

  const metadata = {
    total: dashboards?.length || 0,
    byDataSource: {
      gsc: dashboards?.filter(d => d.datasource === 'gsc_performance_7days').length || 0,
      ads: dashboards?.filter(d => d.datasource === 'ads_performance_7days').length || 0,
      analytics: dashboards?.filter(d => d.datasource === 'analytics_sessions_7days').length || 0,
    },
    lastUpdated: dashboards?.[0]?.updated_at || null,
  };

  return Response.json(metadata);
}
```

**3. Add Supabase Query Indexes**
- File: Run these as migrations
- Indexes needed:
```sql
-- Migration: add_dashboard_performance_indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_workspace_id ON dashboards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_datasource ON dashboards(datasource);
CREATE INDEX IF NOT EXISTS idx_dashboards_updated_at ON dashboards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboards_name_search ON dashboards(name);
```

**4. Implement MCP Tool for Agent Dashboard Management**
- File: `/mcp_server_tools/dashboard_management.ts`
- Create these MCP tools:

```typescript
/**
 * MCP Tool: create_dashboard_for_agent
 *
 * Allows agents to create dashboards programmatically
 *
 * Parameters:
 * - name: string (dashboard name)
 * - dataSource: 'gsc' | 'ads' | 'analytics'
 * - template: 'blank' | 'gsc_standard' | 'ads_standard'
 * - description: string (optional)
 *
 * Returns:
 * - dashboardId: string
 * - name: string
 * - dataSource: string
 * - created_at: timestamp
 *
 * Example:
 * {
 *   "name": "Q4 GSC Performance",
 *   "dataSource": "gsc",
 *   "template": "gsc_standard",
 *   "description": "Q4 2024 GSC analytics dashboard"
 * }
 */
export async function createDashboardForAgent(
  name: string,
  dataSource: 'gsc' | 'ads' | 'analytics',
  template: 'blank' | 'gsc_standard' | 'ads_standard',
  description?: string
) {
  // Implementation
}

/**
 * MCP Tool: list_agent_dashboards
 *
 * Lists all dashboards accessible to agent
 *
 * Parameters:
 * - dataSourceFilter: 'gsc' | 'ads' | 'analytics' (optional)
 * - limit: number (default: 50)
 *
 * Returns:
 * - dashboards: Array<DashboardConfig>
 * - count: number
 * - total: number (unfiltered total)
 */
export async function listAgentDashboards(
  dataSourceFilter?: string,
  limit: number = 50
) {
  // Implementation
}

/**
 * MCP Tool: update_dashboard_for_agent
 *
 * Allows agents to update dashboard configuration
 *
 * Parameters:
 * - dashboardId: string
 * - updates: Partial<DashboardConfig>
 *
 * Returns:
 * - success: boolean
 * - dashboard: DashboardConfig
 * - error?: string
 */
export async function updateDashboardForAgent(
  dashboardId: string,
  updates: Partial<DashboardConfig>
) {
  // Implementation
}

/**
 * MCP Tool: duplicate_dashboard_for_agent
 *
 * Duplicates an existing dashboard
 *
 * Parameters:
 * - dashboardId: string (source dashboard)
 * - newName: string (name for duplicated dashboard)
 *
 * Returns:
 * - newDashboardId: string
 * - newDashboard: DashboardConfig
 */
export async function duplicateDashboardForAgent(
  dashboardId: string,
  newName: string
) {
  // Implementation
}

/**
 * MCP Tool: delete_dashboard_for_agent
 *
 * Deletes a dashboard
 *
 * Parameters:
 * - dashboardId: string
 * - confirmDelete: boolean (safety check)
 *
 * Returns:
 * - success: boolean
 * - deleted: boolean
 * - error?: string
 */
export async function deleteDashboardForAgent(
  dashboardId: string,
  confirmDelete: boolean = false
) {
  if (!confirmDelete) {
    return { success: false, error: 'Deletion not confirmed' };
  }
  // Implementation
}
```

#### Files to Create/Modify
- Modify: `/frontend/src/lib/supabase/dashboard-service.ts`
- Create: `/frontend/src/app/api/dashboards/metadata.ts`
- Create/Modify: `/mcp_server_tools/dashboard_management.ts`
- Create migrations for database indexes

#### Testing Checklist
- [ ] Pagination works correctly
- [ ] Filtering by data source works
- [ ] Database indexes created successfully
- [ ] Metadata endpoint returns correct counts
- [ ] MCP tools callable and return expected format
- [ ] Agent can create dashboard via MCP
- [ ] Agent can list dashboards via MCP

---

### Task 3: Database Architect Agent - Data Optimization
**Time Estimate:** 20 minutes
**Difficulty:** Low-Medium
**Dependencies:** Task 2 (indexing already mentioned, this confirms/enhances)

#### Objectives
1. Add RLS policies for multi-tenant dashboard isolation
2. Create workspace-level isolation
3. Optimize query performance
4. Add audit logging for dashboard operations

#### Implementation Details

**1. Add Row Level Security (RLS) Policies**
- File: Create migration `/supabase/migrations/add_dashboard_rls.sql`
```sql
-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own workspace dashboards
CREATE POLICY "Users can view their workspace dashboards"
ON dashboards FOR SELECT
USING (workspace_id = auth.jwt() ->> 'workspace_id');

-- Policy: Users can create dashboards
CREATE POLICY "Users can create dashboards in their workspace"
ON dashboards FOR INSERT
WITH CHECK (
  workspace_id = auth.jwt() ->> 'workspace_id' AND
  user_id = auth.uid()
);

-- Policy: Users can only update their own dashboards
CREATE POLICY "Users can update their own dashboards"
ON dashboards FOR UPDATE
USING (workspace_id = auth.jwt() ->> 'workspace_id')
WITH CHECK (workspace_id = auth.jwt() ->> 'workspace_id');

-- Policy: Users can delete their own dashboards
CREATE POLICY "Users can delete their own dashboards"
ON dashboards FOR DELETE
USING (workspace_id = auth.jwt() ->> 'workspace_id');
```

**2. Add Dashboard Audit Log Table**
- File: Create migration `/supabase/migrations/add_dashboard_audit.sql`
```sql
CREATE TABLE dashboard_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  dashboard_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'duplicate'
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS for audit logs
ALTER TABLE dashboard_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workspace audit logs"
ON dashboard_audit_logs FOR SELECT
USING (workspace_id = auth.jwt() ->> 'workspace_id');

-- Create index for efficient queries
CREATE INDEX idx_audit_workspace_user ON dashboard_audit_logs(workspace_id, user_id);
CREATE INDEX idx_audit_dashboard ON dashboard_audit_logs(dashboard_id);
CREATE INDEX idx_audit_created_at ON dashboard_audit_logs(created_at DESC);
```

**3. Create Audit Trigger Function**
- Log all dashboard changes automatically
```sql
CREATE OR REPLACE FUNCTION log_dashboard_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dashboard_audit_logs (workspace_id, user_id, dashboard_id, action, changes)
  VALUES (
    COALESCE(NEW.workspace_id, OLD.workspace_id),
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_ARGV[0],
    jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers
CREATE TRIGGER dashboard_insert_audit
AFTER INSERT ON dashboards
FOR EACH ROW
EXECUTE FUNCTION log_dashboard_changes('create');

CREATE TRIGGER dashboard_update_audit
AFTER UPDATE ON dashboards
FOR EACH ROW
EXECUTE FUNCTION log_dashboard_changes('update');

CREATE TRIGGER dashboard_delete_audit
AFTER DELETE ON dashboards
FOR EACH ROW
EXECUTE FUNCTION log_dashboard_changes('delete');
```

**4. Query Optimization**
- Ensure all indexes from Task 2 are created
- Add composite index for common queries:
```sql
CREATE INDEX idx_dashboards_workspace_updated
ON dashboards(workspace_id, updated_at DESC);

CREATE INDEX idx_dashboards_workspace_datasource
ON dashboards(workspace_id, datasource);
```

#### Files to Create/Modify
- Create: `/supabase/migrations/add_dashboard_rls.sql`
- Create: `/supabase/migrations/add_dashboard_audit.sql`
- Create: `/supabase/migrations/add_dashboard_indexes.sql`

#### Testing Checklist
- [ ] RLS policies prevent cross-workspace access
- [ ] Users can only see their dashboards
- [ ] Audit logs created on create/update/delete
- [ ] Queries use indexes (verify with EXPLAIN ANALYZE)
- [ ] Performance acceptable (<100ms for typical queries)

---

## Implementation Order

### Phase 1: Immediate (Already Complete)
1. ✅ Fix root page redirect with auth check
2. ✅ Clean .env.local (remove Dataset API config)
3. ✅ Add search/filter to dashboard page
4. ✅ Add sorting dropdown
5. ✅ Enhance empty state

### Phase 2: Parallel Execution (Recommended)
**Run all three tasks in parallel to minimize total time**

- **Task 1** (Frontend) → 45 minutes
  - UI enhancements, skeleton loading, tooltips
  - Can test independently without backend changes

- **Task 2** (Backend) → 30 minutes
  - API optimization, pagination, MCP tools
  - Requires Task 3 for RLS, can test with debug auth

- **Task 3** (Database) → 20 minutes
  - RLS policies, audit logging, indexes
  - Should complete before Tasks 1-2 go to production

### Phase 3: Integration Testing (15 minutes)
- All tasks completed
- Full end-to-end testing
- Agent capabilities testing

**Total Time:** ~2.5 hours (parallel execution)

---

## Agent Capabilities Matrix

### What Agents Can Do (via MCP Tools)

| Operation | Tool | Input | Output |
|-----------|------|-------|--------|
| Create Dashboard | `create_dashboard_for_agent` | name, dataSource, template | dashboardId, config |
| List Dashboards | `list_agent_dashboards` | filter, limit | dashboards[], count |
| Update Dashboard | `update_dashboard_for_agent` | dashboardId, updates | updated config |
| Duplicate Dashboard | `duplicate_dashboard_for_agent` | dashboardId, newName | newDashboardId |
| Delete Dashboard | `delete_dashboard_for_agent` | dashboardId | success, deleted |
| Get Dashboard Stats | `get_dashboard_metadata` | - | total, byDataSource, lastUpdated |

### What Practitioners Can Do (via UI)

- Create dashboard with wizard (name, data source, template)
- Edit dashboard in builder
- Duplicate dashboard
- Delete dashboard with confirmation
- Search dashboards by name
- Sort dashboards (by date, name)
- See dashboard stats (KPIs, Charts, Filters)
- View last updated time
- See data source assignment

---

## Dual-Agent Architecture Summary

### Practitioner (UI Agent)
- Uses the dashboard page UI
- Creates dashboards through dialog form
- Edits dashboards in builder
- All operations through visual interface

### MCP Agent (API Agent)
- Uses MCP tools for programmatic access
- Can batch create multiple dashboards
- Can integrate with external systems
- Returns structured JSON responses
- No UI interaction needed

### Shared Backend
- Single source of truth: Supabase database
- Identical operations regardless of access method
- Audit trail captures all changes
- RLS ensures security and isolation

---

## Dependencies and Requirements

### Environment Variables
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Already configured
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Already configured
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Already configured

### shadcn/ui Components (Already Available)
- ✅ `Card` - Dashboard cards
- ✅ `Button` - All buttons
- ✅ `Input` - Search input
- ✅ `Select` - Sort dropdown, template selector
- ✅ `Dialog` - Create dashboard dialog
- ✅ `DropdownMenu` - Dashboard actions menu
- ✅ `Badge` - Dashboard stats (KPIs, Charts, Filters)
- ⏳ `Skeleton` - Loading states (create if needed)
- ⏳ `Tooltip` - Badge tooltips (create if needed)

### API Dependencies
- Supabase JS client
- date-fns (already in use)
- lucide-react icons (already in use)

---

## Deliverables

### Task 1 Deliverables
- [ ] Enhanced dashboard page with skeleton loading
- [ ] Tooltip components on all stat badges
- [ ] Smooth hover animations on cards
- [ ] Data source color coding implemented
- [ ] Mobile responsive verified

### Task 2 Deliverables
- [ ] Pagination support in dashboard service
- [ ] Data source filtering implemented
- [ ] 5 MCP tools created and documented
- [ ] Metadata API endpoint created
- [ ] Agent-friendly response formats

### Task 3 Deliverables
- [ ] RLS policies implemented and tested
- [ ] Audit logging system in place
- [ ] Database indexes optimized
- [ ] Performance verified (<100ms queries)
- [ ] Multi-tenant isolation confirmed

---

## Acceptance Criteria

### Functional Requirements
- [ ] Root page redirects correctly (logged in → /dashboard, not logged in → /login)
- [ ] Dashboard page shows all user's dashboards
- [ ] Search/filter works correctly
- [ ] Sorting by date and name works
- [ ] Create, Edit, Duplicate, Delete all work
- [ ] Empty states show appropriate messages
- [ ] Loading states show skeleton or spinner

### Agent Capabilities
- [ ] Agents can create dashboards via MCP tools
- [ ] Agents can list dashboards with filtering
- [ ] Agents can update dashboard metadata
- [ ] Agents can duplicate dashboards
- [ ] Agents can delete dashboards
- [ ] All MCP tools return structured JSON

### UI/UX Requirements
- [ ] All shadcn/ui components used
- [ ] Responsive on mobile/tablet/desktop
- [ ] Smooth animations and transitions
- [ ] Clear visual hierarchy
- [ ] Proper error handling and messages

### Performance Requirements
- [ ] Dashboard list loads in <500ms
- [ ] Search/filter responds instantly (<100ms)
- [ ] Sorting completes in <100ms
- [ ] Database queries use indexes
- [ ] No N+1 query problems

### Security Requirements
- [ ] RLS policies prevent cross-workspace access
- [ ] Users only see their dashboards
- [ ] Audit logs all dashboard changes
- [ ] MCP tools require authentication
- [ ] No sensitive data in logs

---

## Success Metrics

1. **User Adoption**
   - All practitioners can access dashboard home page
   - Create/edit/delete workflows are intuitive
   - No support tickets about dashboard management

2. **Agent Capabilities**
   - Agents can automate dashboard creation
   - MCP tools fully functional and tested
   - Clear documentation for agent developers

3. **Performance**
   - Dashboard list loads in <500ms
   - All interactions are smooth (<100ms latency)
   - Database queries optimized

4. **Reliability**
   - 99.9% uptime for dashboard operations
   - Comprehensive audit trail
   - No data loss on delete operations

---

## Timeline

| Task | Start | Duration | End |
|------|-------|----------|-----|
| Task 1 (Frontend) | Now | 45 min | +45 min |
| Task 2 (Backend) | Now | 30 min | +30 min |
| Task 3 (Database) | Now | 20 min | +20 min |
| Integration Testing | After All | 15 min | +80 min |
| **Total** | | | **80 min** |

---

## Notes

- All tasks can run in parallel
- Task 3 (Database) should complete before production deployment
- Frontend Task 1 has no dependencies and can be deployed independently
- Backend Task 2 depends on database being ready but can be tested in isolation
- Regular testing throughout prevents late-stage surprises

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Status:** Ready for Agent Execution
