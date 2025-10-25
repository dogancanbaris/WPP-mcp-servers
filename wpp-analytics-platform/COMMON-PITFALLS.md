# Common Pitfalls & Solutions

This document catalogs issues we've encountered during development and their solutions. Use this as a checklist when implementing new features.

## 1. Nested `asChild` Props

### The Problem

shadcn/ui components use the `asChild` prop to merge props with a child element. **Nesting multiple `asChild` components breaks rendering.**

### Bad Code

```tsx
// ❌ BROKEN: Double asChild nesting
<DropdownMenuTrigger asChild>
  <Button variant="ghost" size="icon" asChild>
    <MoreVertical className="h-4 w-4" />
  </Button>
</DropdownMenuTrigger>

// Result: Nothing renders, no error thrown
```

### Good Code

```tsx
// ✅ FIXED: Single asChild, icon as child
<DropdownMenuTrigger asChild>
  <Button variant="ghost" size="icon">
    <MoreVertical className="h-4 w-4" />
  </Button>
</DropdownMenuTrigger>

// or without asChild if you don't need prop merging
<DropdownMenuTrigger>
  <Button variant="ghost" size="icon">
    <MoreVertical className="h-4 w-4" />
  </Button>
</DropdownMenuTrigger>
```

### Why This Happens

The `asChild` prop uses `React.cloneElement()` to merge props. When nested:

```tsx
// What happens internally:
React.cloneElement(
  React.cloneElement(<MoreVertical />, buttonProps),
  triggerProps
)
// MoreVertical doesn't accept button props → breaks
```

### Detection Checklist

- [ ] Search for `asChild` in your component
- [ ] Check if any child component also has `asChild`
- [ ] Verify the actual child element can accept merged props

### Real-World Example

```tsx
// ❌ BEFORE: Row actions not visible
<Card className="group">
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" asChild>
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
</Card>

// ✅ AFTER: Fixed
<Card className="group">
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
</Card>
```

## 2. Hover Visibility Issues

### The Problem

Elements with `opacity-0 group-hover:opacity-100` don't appear on hover when CSS specificity or structure is wrong.

### Bad Code

```tsx
// ❌ BROKEN: Missing 'group' class on parent
<div className="flex items-center">
  <h3>Title</h3>
  <Button className="opacity-0 group-hover:opacity-100">
    <Edit />
  </Button>
</div>
// Button never becomes visible
```

### Good Code

```tsx
// ✅ FIXED: 'group' class on parent container
<div className="group flex items-center">
  <h3>Title</h3>
  <Button className="opacity-0 group-hover:opacity-100 transition-opacity">
    <Edit className="h-4 w-4" />
  </Button>
</div>
```

### Common Causes

1. **Missing `group` class**: Parent must have `group` class
2. **Wrong parent**: `group` must be on the hover target
3. **Specificity conflict**: Inline styles override Tailwind
4. **Z-index issues**: Element rendered behind others

### Detection Checklist

- [ ] Parent container has `group` class
- [ ] Hover element has `group-hover:` prefix
- [ ] No inline styles overriding opacity
- [ ] Element is visible in DOM (use DevTools)
- [ ] Z-index allows element to be on top
- [ ] Add `transition-opacity` for smooth fade

### Real-World Example

```tsx
// ❌ BEFORE: Delete button never visible
function DashboardRow({ dashboard }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <h3>{dashboard.name}</h3>
        <p className="text-sm text-gray-500">
          {dashboard.widgetCount} widgets
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ✅ AFTER: Fixed with proper structure
function DashboardRow({ dashboard }) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
      <div>
        <h3>{dashboard.name}</h3>
        <p className="text-sm text-gray-500">
          {dashboard.widgetCount} widgets
        </p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### Advanced Pattern: Multiple Hover Triggers

```tsx
// If you need different elements to trigger different hovers
<div className="group/row">
  <div className="group/title">
    <h3>Title</h3>
    <Button className="opacity-0 group-hover/title:opacity-100">
      <Edit />
    </Button>
  </div>
  <Button className="opacity-0 group-hover/row:opacity-100">
    <Trash />
  </Button>
</div>
```

## 3. Date Range Format Issues

### The Problem

Date ranges must be formatted consistently for BigQuery queries and display. Inconsistent formats cause query failures or display bugs.

### Bad Code

```tsx
// ❌ BROKEN: Inconsistent date formats
const dateRange = {
  start: new Date(),  // Date object
  end: "2025-10-23"   // String
};

// ❌ BROKEN: Wrong format for BigQuery
const query = `
  SELECT * FROM table
  WHERE date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
`;
// Result: "Invalid date format" error
```

### Good Code

```tsx
// ✅ FIXED: Use utility functions
import { formatDateForBigQuery, formatDateForDisplay } from '@/lib/date-utils';

const dateRange = {
  start: formatDateForBigQuery(startDate),  // "2025-10-01"
  end: formatDateForBigQuery(endDate)        // "2025-10-23"
};

const displayText = `${formatDateForDisplay(dateRange.start)} - ${formatDateForDisplay(dateRange.end)}`;
// "Oct 1, 2025 - Oct 23, 2025"
```

### Date Utility Functions

```typescript
// lib/date-utils.ts

/**
 * Format date for BigQuery (YYYY-MM-DD)
 */
export function formatDateForBigQuery(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "Oct 23, 2025")
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get relative date (e.g., "7 days ago")
 */
export function getRelativeDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateForBigQuery(date);
}

/**
 * Parse BigQuery date string to Date object
 */
export function parseBigQueryDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

/**
 * Validate date range
 */
export function isValidDateRange(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate <= endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
}
```

### Detection Checklist

- [ ] All date queries use `formatDateForBigQuery()`
- [ ] Display uses `formatDateForDisplay()`
- [ ] Date ranges validated with `isValidDateRange()`
- [ ] No direct Date object in SQL queries
- [ ] Date picker components emit YYYY-MM-DD format

### Real-World Example

```tsx
// ❌ BEFORE: Date format inconsistencies
function DateRangePicker({ onChange }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleApply = () => {
    onChange({
      start: startDate.toISOString(),  // Wrong format
      end: endDate.toLocaleDateString()  // Wrong format
    });
  };

  return (
    <div>
      <input type="date" onChange={(e) => setStartDate(new Date(e.target.value))} />
      <input type="date" onChange={(e) => setEndDate(new Date(e.target.value))} />
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}

// ✅ AFTER: Consistent formatting
import { formatDateForBigQuery, formatDateForDisplay, isValidDateRange } from '@/lib/date-utils';

function DateRangePicker({ onChange }) {
  const [startDate, setStartDate] = useState(formatDateForBigQuery(new Date()));
  const [endDate, setEndDate] = useState(formatDateForBigQuery(new Date()));

  const handleApply = () => {
    if (!isValidDateRange(startDate, endDate)) {
      toast.error('Invalid date range');
      return;
    }

    onChange({ start: startDate, end: endDate });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <span>to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Button onClick={handleApply}>Apply</Button>
      <p className="text-sm text-gray-500">
        {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
      </p>
    </div>
  );
}
```

## 4. Missing Modal Rendering

### The Problem

Modals/dialogs don't appear because they're not rendered in the DOM, not properly triggered, or have CSS issues.

### Bad Code

```tsx
// ❌ BROKEN: Modal never renders
function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Create Dashboard
      </Button>
      {/* Modal component exists but never mounted */}
    </div>
  );
}
```

### Good Code

```tsx
// ✅ FIXED: Modal properly rendered
function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Create Dashboard
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          <form>{/* Form fields */}</form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Common Causes

1. **Not rendered**: Modal component not in JSX
2. **Wrong open prop**: `isOpen` vs `open`
3. **Missing portal**: Dialog not portaled to body
4. **CSS z-index**: Modal behind other elements
5. **Event handlers**: Click handler not calling state setter

### Modal Rendering Checklist

```typescript
// Before creating a modal, verify:

// 1. State management
const [isOpen, setIsOpen] = useState(false);  ✓

// 2. Trigger button
<Button onClick={() => setIsOpen(true)}>  ✓

// 3. Dialog component rendered
<Dialog open={isOpen} onOpenChange={setIsOpen}>  ✓

// 4. Dialog content exists
<DialogContent>  ✓

// 5. Dialog header (required for accessibility)
<DialogHeader>
  <DialogTitle>Title</DialogTitle>  ✓
</DialogHeader>

// 6. Close mechanism
<DialogFooter>
  <Button onClick={() => setIsOpen(false)}>Cancel</Button>  ✓
</DialogFooter>

// 7. Portal rendered (check DevTools)
// Should see <div data-radix-portal> in body  ✓
```

### Real-World Example

```tsx
// ❌ BEFORE: Create dashboard modal not working
function DashboardList() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowCreateModal(true)}>
        New Dashboard
      </Button>

      {/* Modal was here but with wrong props */}
      {showCreateModal && (
        <div className="modal">  {/* Custom modal, no portal */}
          <h2>Create Dashboard</h2>
          {/* ... */}
        </div>
      )}
    </div>
  );
}

// ✅ AFTER: Using shadcn Dialog properly
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

function DashboardList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState('');

  const handleCreate = () => {
    if (!dashboardName.trim()) {
      toast.error('Dashboard name is required');
      return;
    }

    // Create dashboard
    useDashboardStore.getState().createDashboard({
      name: dashboardName,
      widgets: []
    });

    // Close modal
    setIsCreateModalOpen(false);
    setDashboardName('');

    toast.success('Dashboard created');
  };

  return (
    <div>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Dashboard
      </Button>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>
              Enter a name for your dashboard. You can add widgets later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                placeholder="SEO Performance Dashboard"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## 5. Import Errors

### The Problem

TypeScript import errors due to wrong paths, missing exports, or type mismatches.

### Common Import Errors

```typescript
// ❌ ERROR: Cannot find module '@/components/Dashboard'
import { Dashboard } from '@/components/Dashboard';

// CAUSES:
// 1. File doesn't exist at that path
// 2. No default export in Dashboard.tsx
// 3. Wrong alias configuration

// ✅ FIXES:

// 1. Check file exists
// ls src/components/Dashboard.tsx  ✓

// 2. Check export in Dashboard.tsx
export function Dashboard() { /* ... */ }  // Named export
// or
export default Dashboard;  // Default export

// 3. Import correctly
import { Dashboard } from '@/components/Dashboard';  // Named
// or
import Dashboard from '@/components/Dashboard';  // Default
```

### Path Alias Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Import Error Checklist

```typescript
// When you get an import error:

// 1. File exists?
// ✓ Check file is at expected path

// 2. Export exists?
// ✓ Check file has export matching import

// 3. Named vs default?
// ✓ Match import style to export style

// 4. Path alias works?
// ✓ Check tsconfig.json paths configuration

// 5. TypeScript sees it?
// ✓ Run: npx tsc --noEmit

// 6. Build cache?
// ✓ Clear: rm -rf node_modules/.cache
```

### Real-World Example

```typescript
// ❌ BEFORE: Import errors everywhere
import { useDashboardStore } from '@/stores/dashboard';  // Error: Cannot find
import { formatDate } from '@/lib/utils';  // Error: formatDate doesn't exist
import Dashboard from '@/components/Dashboard';  // Error: No default export

// FIXES:

// 1. Check file: src/stores/dashboard.ts exists ✓
// 2. Check export:
// File had: export const dashboardStore = create(...)
// Missing: export { useDashboardStore }

// FIX: Add named export
export const useDashboardStore = dashboardStore;

// 3. Check formatDate in src/lib/utils.ts
// Function was named formatDateForBigQuery

// FIX: Import correct name
import { formatDateForBigQuery } from '@/lib/utils';

// 4. Dashboard component export
// File had named export: export function Dashboard()

// FIX: Import as named
import { Dashboard } from '@/components/Dashboard';
```

### Type Import Errors

```typescript
// ❌ BROKEN: Type import errors
import { Dashboard } from '@/types';  // Error: Dashboard not exported

// FIX: Check types/index.ts
export interface Dashboard {
  id: string;
  name: string;
  // ...
}

// OR: Import from specific file
import { Dashboard } from '@/types/dashboard';

// TYPE vs VALUE imports
import type { Dashboard } from '@/types';  // Type-only import
import { Dashboard } from '@/types';  // Value import

// Use type-only when:
// - Only using as type annotation
// - Avoiding circular dependencies
// - Better tree-shaking
```

## 6. Type Definition Mismatches

### The Problem

TypeScript errors due to type mismatches between components, stores, and APIs.

### Bad Code

```typescript
// ❌ BROKEN: Type mismatch
interface Widget {
  id: string;
  type: string;
  config: any;  // Too loose
}

function updateWidget(id: string, config: WidgetConfig) {
  const widget: Widget = {
    id,
    type: 'chart',
    config: config  // WidgetConfig !== any
  };
}
```

### Good Code

```typescript
// ✅ FIXED: Proper type definitions
interface WidgetConfig {
  title: string;
  metrics: string[];
  dimensions: string[];
}

interface Widget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
}

type WidgetType = 'chart' | 'metric-card' | 'table';

function updateWidget(id: string, config: WidgetConfig) {
  const widget: Widget = {
    id,
    type: 'chart',
    config
  };
}
```

### Type Definition Best Practices

```typescript
// 1. Avoid 'any' - use specific types
// ❌ config: any
// ✅ config: WidgetConfig

// 2. Use union types for variants
// ❌ type: string
// ✅ type: 'line' | 'bar' | 'pie'

// 3. Make optional fields explicit
interface Widget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
  position?: { x: number; y: number };  // Optional
}

// 4. Use Partial for updates
function updateWidget(id: string, updates: Partial<Widget>) {
  // updates can have any subset of Widget properties
}

// 5. Extend instead of duplicate
interface ChartConfig extends WidgetConfig {
  chartType: 'line' | 'bar';
  yAxis: string;
}

// 6. Use discriminated unions
type Widget =
  | { type: 'chart'; config: ChartConfig }
  | { type: 'metric'; config: MetricConfig }
  | { type: 'table'; config: TableConfig };

// TypeScript now knows config type based on widget type
function renderWidget(widget: Widget) {
  if (widget.type === 'chart') {
    // widget.config is ChartConfig here
  }
}
```

### Real-World Example

```typescript
// ❌ BEFORE: Type mismatches causing errors
interface Dashboard {
  id: string;
  name: string;
  widgets: any[];  // Too loose
  createdAt: Date;  // Not serializable
}

function createDashboard(name: string) {
  const dashboard: Dashboard = {
    id: crypto.randomUUID(),
    name,
    widgets: [],
    createdAt: new Date()  // Can't serialize to JSON
  };

  // Error: Argument of type 'Date' is not assignable to parameter of type 'string'
  saveDashboard(dashboard);
}

// ✅ AFTER: Proper type definitions
interface WidgetConfig {
  title: string;
  type: WidgetType;
  metrics: string[];
  dimensions?: string[];
}

interface Widget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
  createdAt: string;  // ISO string, serializable
  updatedAt: string;
}

type WidgetType = 'metric-card' | 'time-series' | 'bar-chart' | 'table';

function createDashboard(name: string): Dashboard {
  return {
    id: crypto.randomUUID(),
    name,
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Type-safe widget creation
function createWidget(type: WidgetType, config: WidgetConfig): Widget {
  return {
    id: crypto.randomUUID(),
    type,
    config,
    position: { x: 0, y: 0 },
    size: { width: 4, height: 3 }
  };
}
```

## 7. Missing Error Boundaries

### The Problem

Component errors crash entire app instead of showing graceful fallback.

### Bad Code

```tsx
// ❌ BROKEN: Error crashes entire dashboard
function Dashboard() {
  const data = useDashboardData();

  // If data fetch fails, entire app crashes
  return (
    <div>
      {data.widgets.map((widget) => (
        <Widget key={widget.id} config={widget.config} />
      ))}
    </div>
  );
}
```

### Good Code

```tsx
// ✅ FIXED: Error boundary catches errors
import { ErrorBoundary } from '@/components/error-boundary';

function Dashboard() {
  const data = useDashboardData();

  return (
    <div>
      {data.widgets.map((widget) => (
        <ErrorBoundary
          key={widget.id}
          fallback={<WidgetErrorFallback widgetId={widget.id} />}
        >
          <Widget config={widget.config} />
        </ErrorBoundary>
      ))}
    </div>
  );
}

function WidgetErrorFallback({ widgetId }: { widgetId: string }) {
  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <p className="text-red-800">
        Failed to load widget. <Button onClick={() => window.location.reload()}>Retry</Button>
      </p>
    </Card>
  );
}
```

### Error Boundary Implementation

```tsx
// components/error-boundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 bg-red-50 rounded">
          <p className="text-red-800">Something went wrong</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Quick Reference Checklist

Use this before submitting any component:

### Component Checklist

- [ ] No nested `asChild` props
- [ ] Hover states have `group` class on parent
- [ ] Date ranges use `formatDateForBigQuery()`
- [ ] Modals have `open` and `onOpenChange` props
- [ ] All imports resolve correctly
- [ ] Types are specific (no `any`)
- [ ] Error boundaries wrap risky components
- [ ] Keyboard navigation works
- [ ] Dark mode colors defined
- [ ] ARIA labels on icon buttons

### Pre-Commit Tests

```bash
# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Build
npm run build
```

---

**Remember**: Most bugs are caught by this checklist. Review it before asking for code review.

---

**Last Updated**: 2025-10-23
**Version**: 1.0
