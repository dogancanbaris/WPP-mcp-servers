# Filter Scope & Per-Component Filters Implementation

## Overview

This document describes the implementation of filter scope selector and per-component filters for the WPP Analytics Platform dashboard builder.

## Implementation Summary

### Task 1: Filter Scope Selector ✅

**File Modified:** `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/GlobalFilters.tsx`

Added a scope selector at the top of the Global Filters Sheet panel:

```tsx
<div className="flex items-center gap-3 py-2">
  <Label className="text-sm font-medium text-muted-foreground">Apply to:</Label>
  <ToggleGroup
    type="single"
    value={filterScope}
    onValueChange={(value) => value && setFilterScope(value as 'all-pages' | 'current-page')}
    className="bg-muted/50"
  >
    <ToggleGroupItem value="all-pages" className="text-xs">
      All Pages
    </ToggleGroupItem>
    <ToggleGroupItem value="current-page" className="text-xs">
      Current Page
    </ToggleGroupItem>
  </ToggleGroup>
</div>
```

**Features:**
- Toggle between "All Pages" and "Current Page" scope
- Visual indication with professional toggle group component
- Persists selection in Zustand store
- Automatically applies scope to new filters

### Task 2: Filter Store Updates ✅

**File Modified:** `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/store/filterStore.ts`

**Changes Made:**

1. **Added scope property to filter interfaces:**
```typescript
export interface DateRangeFilter {
  // ... existing properties
  scope?: 'all-pages' | 'current-page'; // Filter scope
}

export interface DimensionFilter {
  // ... existing properties
  scope?: 'all-pages' | 'current-page'; // Filter scope
}

export interface MeasureFilter {
  // ... existing properties
  scope?: 'all-pages' | 'current-page'; // Filter scope
}
```

2. **Added filterScope state:**
```typescript
interface FilterState {
  // ... existing state
  filterScope: 'all-pages' | 'current-page';

  // ... existing actions
  setFilterScope: (scope: 'all-pages' | 'current-page') => void;
}
```

3. **Updated addFilter to automatically apply scope:**
```typescript
addFilter: (filter) =>
  set((state) => ({
    filters: [...state.filters, { ...filter, scope: filter.scope || state.filterScope } as GlobalFilter],
  }), false, 'addFilter'),
```

4. **Persisted scope in localStorage:**
```typescript
partialize: (state) => ({
  filters: state.filters,
  activePreset: state.activePreset,
  isFilterBarVisible: state.isFilterBarVisible,
  filterScope: state.filterScope, // ← Added
}),
```

### Task 3: Visual Distinction with Badges ✅

**Global Filters Badge System:**

Each filter chip now displays a scope badge alongside the filter content:

```tsx
<div className="flex items-center gap-1.5">
  {/* Scope Badge */}
  <Badge
    variant="outline"
    className={cn('h-6 px-2 text-xs font-medium', getScopeBadgeColor())}
  >
    {filter.scope === 'current-page' ? 'Page' : 'Global'}
  </Badge>

  {/* Filter Badge */}
  <Badge variant={filter.enabled ? 'default' : 'outline'} /* ... */>
    {/* Filter content */}
  </Badge>
</div>
```

**Badge Colors:**
- **Global (All Pages):** Blue badge (`bg-blue-500/10 text-blue-700 border-blue-500/20`)
- **Page (Current Page):** Green badge (`bg-green-500/10 text-green-700 border-green-500/20`)
- **Component:** Purple badge (`bg-purple-500/10 text-purple-700 border-purple-500/20`)

### Task 4: Per-Component Filters ✅

**File Modified:** `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/sidebar/setup/FilterSection.tsx`

The FilterSection component already existed and was properly connected! Enhanced it with:

1. **Purple "Component" scope badge** for all component-level filters
2. **Improved visual hierarchy** to distinguish from global/page filters
3. **Proper integration** with ChartSetup component

**Component filters are:**
- Stored in individual component configs
- Only apply to the specific chart/component
- Persist with the dashboard layout
- Display with purple "Component" badge

### New Component Created ✅

**File Created:** `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/ui/toggle-group.tsx`

Created a new shadcn/ui component for the toggle group:

```tsx
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

const ToggleGroup = React.forwardRef<...>(({ ... }) => (
  <ToggleGroupPrimitive.Root /* ... */ />
))

const ToggleGroupItem = React.forwardRef<...>(({ ... }) => (
  <ToggleGroupPrimitive.Item /* ... */ />
))

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants }
```

**Package Installed:**
```bash
npm install @radix-ui/react-toggle-group
```

## Visual Hierarchy

### Filter Types and Visual Identity

1. **Global Filters (All Pages)**
   - Blue badge: "Global"
   - Applies to all pages in dashboard
   - Managed via top-level Global Filters panel

2. **Page Filters (Current Page)**
   - Green badge: "Page"
   - Applies only to current dashboard page
   - Managed via top-level Global Filters panel

3. **Component Filters**
   - Purple badge: "Component"
   - Applies only to specific chart/component
   - Managed in chart Setup tab → Filters section

## User Workflow

### Creating a Global Filter

1. Click "Filters" button in dashboard toolbar
2. Global Filters panel slides in from top
3. Select scope: "All Pages" or "Current Page"
4. Click "Add Filter"
5. Configure filter (type, dimension/measure, operator, value)
6. Filter is created with selected scope
7. Blue/Green badge indicates scope visually

### Creating a Component Filter

1. Select a chart/component
2. Open sidebar → "Setup" tab
3. Scroll to "Filters" section
4. Click "Add filter"
5. Configure filter
6. Filter applies only to this component
7. Purple "Component" badge indicates local scope

### Visual Example

```
┌─────────────────────────────────────────────────┐
│ Global Filters Panel                            │
├─────────────────────────────────────────────────┤
│ Apply to: [All Pages] [Current Page]  ← Toggle │
├─────────────────────────────────────────────────┤
│                                                 │
│ Date Range:                                     │
│   [Global] Last 30 Days              [👁] [×]   │
│                                                 │
│ Dimensions:                                     │
│   [Page] Country: US, UK             [👁] [×]   │
│   [Global] Device: Mobile            [👁] [×]   │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Chart Setup → Filters                           │
├─────────────────────────────────────────────────┤
│   [Component] Campaign contains "Brand" [×]     │
│   [Component] Cost > 1000           [×]         │
└─────────────────────────────────────────────────┘
```

## Technical Details

### State Management

**Zustand Store (filterStore.ts):**
- Manages global filter state
- Tracks current scope selection
- Persists to localStorage
- Provides helper methods for filter operations

**Component State (ChartSetup.tsx):**
- Filters stored in `config.filters` array
- Passed to FilterSection component
- Updated via `onUpdate()` callback
- Persists with dashboard layout

### Type Safety

All filter types are fully typed with TypeScript:

```typescript
type FilterScope = 'all-pages' | 'current-page';

interface GlobalFilter {
  id: string;
  type: 'dateRange' | 'dimension' | 'measure';
  enabled: boolean;
  scope?: FilterScope;
  // ... type-specific properties
}
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action (Global) OR Component Config Update (Component)
    ↓
State Update
    ↓
React Re-render
    ↓
Badge Color Update
```

## Testing Checklist

- [x] ToggleGroup component created
- [x] @radix-ui/react-toggle-group package installed
- [x] Filter scope state added to store
- [x] Global filter scope selector renders
- [x] Scope selection persists
- [x] Blue badge for global (all-pages) filters
- [x] Green badge for page (current-page) filters
- [x] Purple badge for component filters
- [x] FilterSection properly integrated
- [x] No TypeScript errors
- [x] Component filters saved to config

## Next Steps (Optional Enhancements)

1. **Filter Inheritance Visualization**
   - Show which global/page filters apply to each component
   - Add "inherited filters" section in component setup

2. **Filter Conflicts**
   - Detect when component filter conflicts with global filter
   - Provide merge/override options

3. **Bulk Filter Operations**
   - Apply multiple filters at once
   - Copy filters between components
   - Filter templates/presets

4. **Advanced Scope Options**
   - "All pages in folder"
   - "Specific pages" (multi-select)
   - Filter groups with custom scopes

## Files Modified

1. `/src/store/filterStore.ts` - Added scope state and properties
2. `/src/components/dashboard-builder/GlobalFilters.tsx` - Added scope selector and badges
3. `/src/components/dashboard-builder/sidebar/setup/FilterSection.tsx` - Added component badge
4. `/src/components/ui/toggle-group.tsx` - New component created
5. `package.json` - Added @radix-ui/react-toggle-group dependency

## Completion Status

✅ **Task 1:** Filter scope selector added to Global Filters panel
✅ **Task 2:** Per-component filters working and connected
✅ **Task 3:** Visual distinction with colored badges (Blue/Green/Purple)

All requirements have been successfully implemented!
