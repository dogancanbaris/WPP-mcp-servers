# Agentic Design Principles

## Philosophy: Building for Humans AND AI Agents

This platform is designed with a **dual-use philosophy**: every feature, component, and interaction pattern must work seamlessly for both human users clicking in a browser AND AI agents programmatically controlling the interface.

### Why This Matters

Traditional web applications are built for human interaction:
- State is often internal to components (useState)
- Actions happen through DOM events
- Configuration exists in component code
- Control is exclusively through mouse/keyboard

**Our approach** makes everything **observable, controllable, and programmable**:
- State lives in a global store (Zustand)
- Every UI action has a corresponding store action
- Configuration is JSON-serializable
- Control works through both UI and programmatic APIs

### Real-World Example

```tsx
// ❌ TRADITIONAL: Human-only design
function Dashboard() {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);

  const handleAddWidget = (type) => {
    setWidgets([...widgets, { id: Date.now(), type }]);
  };

  // Agent problem: Can't access state, can't trigger actions
  // Only way to interact is DOM manipulation (brittle, unreliable)
}

// ✅ AGENTIC: Human AND AI design
function Dashboard() {
  const widgets = useDashboardStore((state) => state.widgets);
  const selectedWidget = useDashboardStore((state) => state.selectedWidget);
  const addWidget = useDashboardStore((state) => state.addWidget);

  // Human: Clicks button → UI updates
  // Agent: Calls addWidget() → Same result
  // Both paths go through the same store action
}
```

## Core Principle 1: Observable State Architecture

### Why Zustand Over React Context

**React Context Problems for Agents**:
```tsx
// ❌ Context is component-scoped
const DashboardContext = createContext();

function SomeNestedComponent() {
  const context = useContext(DashboardContext);
  // Agent can't access this without traversing component tree
  // No way to observe changes from outside React
}
```

**Zustand Benefits for Agents**:
```tsx
// ✅ Global, observable store
import { useDashboardStore } from '@/stores/dashboard';

// Anywhere in the app (human UI)
function Component() {
  const widgets = useDashboardStore((state) => state.widgets);
}

// Outside React (agent code)
import { dashboardStore } from '@/stores/dashboard';

const currentState = dashboardStore.getState();
const unsubscribe = dashboardStore.subscribe((state) => {
  console.log('State changed:', state);
});
```

### Store Architecture

```typescript
// stores/dashboard.ts
interface DashboardState {
  // Observable state
  dashboards: Dashboard[];
  activeDashboardId: string | null;
  widgets: Widget[];
  editMode: boolean;
  selectedWidgets: string[];

  // Programmatic actions
  createDashboard: (config: DashboardConfig) => void;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  addWidget: (dashboardId: string, widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  setEditMode: (enabled: boolean) => void;
  selectWidget: (id: string) => void;
  deselectWidget: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: [],
  activeDashboardId: null,
  widgets: [],
  editMode: false,
  selectedWidgets: [],

  createDashboard: (config) => {
    const newDashboard = {
      id: crypto.randomUUID(),
      ...config,
      createdAt: new Date().toISOString()
    };
    set((state) => ({
      dashboards: [...state.dashboards, newDashboard],
      activeDashboardId: newDashboard.id
    }));

    // Emit event for external listeners (agents)
    window.dispatchEvent(new CustomEvent('dashboard:created', {
      detail: newDashboard
    }));
  },

  // ... other actions
}));
```

### Agent Interaction Example

```typescript
// Agent can observe and control
const agent = {
  async createDashboard(name: string) {
    const { createDashboard } = dashboardStore.getState();

    // Programmatic action
    createDashboard({
      name,
      layout: 'grid',
      widgets: []
    });

    // Wait for creation event
    return new Promise((resolve) => {
      const handler = (e: CustomEvent) => {
        window.removeEventListener('dashboard:created', handler);
        resolve(e.detail);
      };
      window.addEventListener('dashboard:created', handler);
    });
  },

  async addWidget(dashboardId: string, type: string) {
    const { addWidget } = dashboardStore.getState();

    addWidget(dashboardId, {
      id: crypto.randomUUID(),
      type,
      config: {},
      position: { x: 0, y: 0 },
      size: { width: 4, height: 3 }
    });
  },

  getState() {
    return dashboardStore.getState();
  },

  subscribe(callback: (state: DashboardState) => void) {
    return dashboardStore.subscribe(callback);
  }
};

// Now agent can control dashboard like a human
await agent.createDashboard('SEO Performance');
await agent.addWidget(dashboardId, 'time-series-chart');
```

## Core Principle 2: Event-Driven Patterns

### Custom DOM Events for Cross-Cutting Concerns

**Why Not Just Store Actions?**
- Decouples components (widget doesn't need to import dashboard store)
- Allows external observation (agents, browser extensions)
- Standard browser API (works everywhere)
- Easy to debug (visible in DevTools)

### Common Event Patterns

```typescript
// Event definitions
export const DashboardEvents = {
  CREATED: 'dashboard:created',
  UPDATED: 'dashboard:updated',
  DELETED: 'dashboard:deleted',
  WIDGET_ADDED: 'dashboard:widget:added',
  WIDGET_UPDATED: 'dashboard:widget:updated',
  WIDGET_DELETED: 'dashboard:widget:deleted',
  REFRESH_REQUESTED: 'dashboard:refresh',
  EDIT_MODE_CHANGED: 'dashboard:editmode:changed'
} as const;

// Event dispatcher utility
export function emitDashboardEvent<T = any>(
  event: string,
  detail?: T
) {
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

// Usage in store actions
updateWidget: (id, updates) => {
  set((state) => ({
    widgets: state.widgets.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    )
  }));

  emitDashboardEvent(DashboardEvents.WIDGET_UPDATED, { id, updates });
}
```

### Refresh Pattern (Critical for Agents)

```typescript
// Widget component listens for refresh events
function TimeSeriesWidget({ id, config }) {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const result = await queryData(config);
    setData(result);
  }, [config]);

  useEffect(() => {
    fetchData(); // Initial load
  }, [fetchData]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = (e: CustomEvent) => {
      // Refresh all widgets, or specific widget
      if (!e.detail?.widgetId || e.detail.widgetId === id) {
        fetchData();
      }
    };

    window.addEventListener(DashboardEvents.REFRESH_REQUESTED, handleRefresh);
    return () => {
      window.removeEventListener(DashboardEvents.REFRESH_REQUESTED, handleRefresh);
    };
  }, [id, fetchData]);

  return <Chart data={data} />;
}

// Agent triggers refresh
function refreshDashboard(widgetId?: string) {
  emitDashboardEvent(DashboardEvents.REFRESH_REQUESTED, { widgetId });
}

// Human triggers refresh via UI
<Button onClick={() => refreshDashboard()}>
  <RefreshCw className="h-4 w-4" />
  Refresh All
</Button>
```

## Core Principle 3: Programmatic Control

### Every UI Action Has a Store Action

```tsx
// Human path
<Button onClick={() => useDashboardStore.getState().addWidget(...)}>
  Add Widget
</Button>

// Agent path
dashboardStore.getState().addWidget(...);

// SAME underlying action - no duplicate logic
```

### Component API Consistency

```typescript
// All widgets follow same interface
interface WidgetProps {
  id: string;
  config: WidgetConfig;  // JSON-serializable
  onUpdate?: (updates: Partial<WidgetConfig>) => void;
  onDelete?: () => void;
}

// Agent can create any widget with same pattern
function createWidget(type: string, config: WidgetConfig) {
  const Component = WIDGET_REGISTRY[type];
  return (
    <Component
      id={crypto.randomUUID()}
      config={config}
      onUpdate={(updates) => updateWidget(id, updates)}
      onDelete={() => deleteWidget(id)}
    />
  );
}
```

### Configuration as Data

```typescript
// ❌ BAD: Configuration in component code
function Dashboard() {
  return (
    <div>
      <MetricCard title="Clicks" metric="clicks" format="number" />
      <MetricCard title="CTR" metric="ctr" format="percent" />
    </div>
  );
}
// Agent can't modify this without code changes

// ✅ GOOD: Configuration as JSON
interface DashboardConfig {
  widgets: WidgetConfig[];
}

interface WidgetConfig {
  type: string;
  title: string;
  metric?: string;
  format?: string;
  chartType?: string;
  dimensions?: string[];
  // ... all config as data
}

function Dashboard({ config }: { config: DashboardConfig }) {
  return (
    <div>
      {config.widgets.map((widget) => (
        <WidgetRenderer key={widget.id} config={widget} />
      ))}
    </div>
  );
}

// Agent can create dashboards programmatically
const dashboardConfig: DashboardConfig = {
  widgets: [
    { type: 'metric-card', title: 'Clicks', metric: 'clicks', format: 'number' },
    { type: 'metric-card', title: 'CTR', metric: 'ctr', format: 'percent' },
    { type: 'time-series', title: 'Trend', dimensions: ['date'], metrics: ['clicks'] }
  ]
};

createDashboard(dashboardConfig);
```

## Core Principle 4: JSON-Serializable Everything

### Why JSON Serialization Matters

Agents need to:
1. Save dashboard configs to database
2. Send configs over API
3. Store configs in localStorage
4. Share configs between instances
5. Version control configurations

**Rule**: If it's configuration, it must be JSON-serializable.

```typescript
// ✅ GOOD: Serializable
interface WidgetConfig {
  type: 'time-series';
  title: string;
  metrics: string[];
  dimensions: string[];
  dateRange: { start: string; end: string };
  chartType: 'line' | 'bar' | 'area';
}

// ❌ BAD: Not serializable
interface WidgetConfig {
  type: 'time-series';
  title: string;
  dataFetcher: () => Promise<Data>;  // Function - can't serialize
  dateRange: { start: Date; end: Date };  // Date object - loses info
  customRenderer: (data: Data) => JSX.Element;  // JSX - can't serialize
}
```

### Serialization Utilities

```typescript
// utils/serialization.ts

// Safe date handling
export function serializeDate(date: Date): string {
  return date.toISOString();
}

export function deserializeDate(dateStr: string): Date {
  return new Date(dateStr);
}

// Dashboard config serialization
export function serializeDashboard(dashboard: Dashboard): string {
  return JSON.stringify({
    ...dashboard,
    createdAt: serializeDate(dashboard.createdAt),
    updatedAt: serializeDate(dashboard.updatedAt)
  });
}

export function deserializeDashboard(json: string): Dashboard {
  const data = JSON.parse(json);
  return {
    ...data,
    createdAt: deserializeDate(data.createdAt),
    updatedAt: deserializeDate(data.updatedAt)
  };
}

// Widget config validation
export function isValidWidgetConfig(config: unknown): config is WidgetConfig {
  try {
    const json = JSON.stringify(config);
    const parsed = JSON.parse(json);
    return parsed !== null && typeof parsed === 'object';
  } catch {
    return false;
  }
}
```

## Technology Choices Explained

### Zustand Over Context API

**Context API Issues**:
- Component-scoped (can't access from outside React)
- Re-renders entire subtree on updates
- No built-in middleware (persistence, devtools)
- Can't subscribe from vanilla JS

**Zustand Benefits**:
- Global store (accessible anywhere)
- Granular subscriptions (less re-renders)
- Built-in middleware (persist, devtools)
- Works outside React
- Simpler API

```typescript
// Zustand: One line to subscribe
const widgets = useDashboardStore((state) => state.widgets);

// Context: Provider boilerplate
const DashboardContext = createContext();
const DashboardProvider = ({ children }) => {
  const [state, setState] = useState();
  // ... lots of boilerplate
};
// Then wrap entire app
```

### dnd-kit Over React DnD

**React DnD Issues**:
- HTML5 backend doesn't work well on mobile
- Complex API (monitors, connectors, etc.)
- Hard to customize drag preview
- Performance issues with many items

**dnd-kit Benefits**:
- Touch support built-in
- Accessible (keyboard navigation)
- Better performance (pointer events)
- Modular sensors (mouse, touch, keyboard)
- Simpler API

```tsx
// dnd-kit: Clean, simple
import { useDraggable } from '@dnd-kit/core';

function DraggableWidget({ id }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      Widget
    </div>
  );
}
```

### Why NOT Craft.js

**Craft.js Problems**:
1. **Too opinionated**: Forces specific editor UX
2. **Not agent-friendly**: Internal state not easily accessible
3. **Heavyweight**: Includes editor UI we don't need
4. **Limited control**: Hard to customize drag behavior

**Our Approach**:
- Use dnd-kit for drag-and-drop (flexible)
- Use Zustand for state (observable)
- Custom editor UI (full control)
- Agent-friendly from ground up

### TanStack Query for Data Fetching

**Why**:
- Automatic caching (performance)
- Background refetching (fresh data)
- Optimistic updates (better UX)
- Works with Zustand (not exclusive)

```tsx
// Fetching with caching
import { useQuery } from '@tanstack/react-query';

function Widget({ config }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['widget-data', config.metric],
    queryFn: () => fetchMetricData(config),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    refetchInterval: 60 * 1000  // Auto-refresh every minute
  });

  // Agent can trigger refetch
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('dashboard:refresh', handler);
    return () => window.removeEventListener('dashboard:refresh', handler);
  }, [refetch]);

  return <Chart data={data} />;
}
```

## Practical Patterns for Agent Development

### Pattern 1: Command Interface

```typescript
// Expose command interface for agents
export const DashboardCommands = {
  async create(name: string, config?: Partial<DashboardConfig>) {
    const { createDashboard } = dashboardStore.getState();
    const id = crypto.randomUUID();

    createDashboard({
      id,
      name,
      layout: config?.layout || 'grid',
      widgets: config?.widgets || [],
      ...config
    });

    return id;
  },

  async addWidget(dashboardId: string, widgetType: string, config: WidgetConfig) {
    const { addWidget } = dashboardStore.getState();

    addWidget(dashboardId, {
      id: crypto.randomUUID(),
      type: widgetType,
      config,
      position: { x: 0, y: 0 },
      size: { width: 4, height: 3 }
    });
  },

  async delete(dashboardId: string) {
    const { deleteDashboard } = dashboardStore.getState();
    deleteDashboard(dashboardId);
  },

  refresh(widgetId?: string) {
    emitDashboardEvent(DashboardEvents.REFRESH_REQUESTED, { widgetId });
  },

  getState() {
    return dashboardStore.getState();
  }
};

// Expose globally for agents
if (typeof window !== 'undefined') {
  (window as any).DashboardCommands = DashboardCommands;
}
```

### Pattern 2: State Snapshots

```typescript
// Take state snapshot for debugging/testing
export function captureSnapshot() {
  return {
    timestamp: new Date().toISOString(),
    state: dashboardStore.getState(),
    events: [] // Could track recent events
  };
}

// Restore state snapshot
export function restoreSnapshot(snapshot: Snapshot) {
  dashboardStore.setState(snapshot.state);
}

// Agent usage
const before = captureSnapshot();

// ... perform operations

const after = captureSnapshot();

console.log('Changes:', diff(before.state, after.state));
```

### Pattern 3: Validation Layer

```typescript
// Validate before executing
export function validateDashboardConfig(config: DashboardConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.name || config.name.length === 0) {
    errors.push('Dashboard name is required');
  }

  if (!Array.isArray(config.widgets)) {
    errors.push('Widgets must be an array');
  }

  config.widgets?.forEach((widget, idx) => {
    if (!widget.type) {
      errors.push(`Widget ${idx}: type is required`);
    }
    if (!isValidWidgetConfig(widget.config)) {
      errors.push(`Widget ${idx}: invalid config`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// Use in commands
async create(name: string, config?: Partial<DashboardConfig>) {
  const fullConfig = { name, ...config };
  const validation = validateDashboardConfig(fullConfig);

  if (!validation.valid) {
    throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
  }

  // ... proceed with creation
}
```

## Testing Agentic Interfaces

```typescript
// Test that agents can control UI
describe('Agentic Dashboard Control', () => {
  it('should create dashboard programmatically', () => {
    const id = DashboardCommands.create('Test Dashboard');

    const state = dashboardStore.getState();
    expect(state.dashboards).toHaveLength(1);
    expect(state.dashboards[0].id).toBe(id);
  });

  it('should emit events on state changes', async () => {
    const eventPromise = new Promise((resolve) => {
      window.addEventListener('dashboard:created', (e) => {
        resolve(e.detail);
      }, { once: true });
    });

    DashboardCommands.create('Test');

    const event = await eventPromise;
    expect(event.name).toBe('Test');
  });

  it('should refresh widgets on command', () => {
    const refreshSpy = jest.fn();

    window.addEventListener('dashboard:refresh', refreshSpy);

    DashboardCommands.refresh();

    expect(refreshSpy).toHaveBeenCalled();
  });
});
```

## Best Practices Summary

1. **State in Zustand**: All application state in observable store
2. **Events for Side Effects**: Use custom DOM events for cross-cutting concerns
3. **Actions Everywhere**: Every UI action has a programmatic equivalent
4. **JSON Config**: All configuration must be serializable
5. **Command Interface**: Expose high-level commands for agents
6. **Validation**: Validate before execution
7. **Event-Driven**: Emit events on state changes
8. **Snapshots**: Support state capture/restore for debugging

## Anti-Patterns to Avoid

```typescript
// ❌ Component-local state that agents can't access
const [widgets, setWidgets] = useState([]);

// ❌ Functions in config
config: { fetcher: () => fetch() }

// ❌ No events on state changes
setState({ widgets: [...] });  // Silent update

// ❌ UI-only actions
<Button onClick={() => /* inline logic */}>

// ❌ Non-serializable dates
dateRange: { start: new Date(), end: new Date() }
```

---

**Remember**: Every feature you build should answer "Can an agent do this programmatically?"

If the answer is no, refactor to make it observable and controllable.

---

**Last Updated**: 2025-10-23
**Version**: 1.0
