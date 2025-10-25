# 🚀 Craft.js Rebuild - Next Session Handoff

**Date**: October 22, 2025
**Status**: Ready to implement Looker Studio-like experience
**Dependencies**: ✅ Installed (@craftjs/core, react-colorful, lz-string, @tiptap)
**Implementation Plan**: See LOOKER-STUDIO-REBUILD-PLAN.md
**Estimated Time**: 16 hours

---

## 🎯 WHAT NEEDS TO BE BUILT

### User's Exact Requirements:
1. ✅ Add row with + button
2. ✅ Choose column layout (Full, 1/2|1/2, 1/3|2/3, 1/4|3/4)
3. ✅ Click + in column → Choose component (Time Series, etc.)
4. ✅ Blank chart appears
5. ✅ Right sidebar opens automatically with TWO tabs:
   - **Setup Tab**: Data source, Dimension, Metric, Filters (like Looker)
   - **Style Tab**: Fonts, colors, borders, spacing (like Looker)
6. ✅ Configure in sidebar → Chart updates live
7. ✅ Add controls (Date Range, Dropdown, Slider, etc.)
8. ✅ Add content (Text box, Image, Shape, Line)
9. ✅ Topbar with: Undo/Redo, Zoom, Add Page, Save
10. ✅ Multi-page support (Page 1, Page 2, ...)
11. ✅ State persists on every change (auto-save)
12. ✅ AI agents can do same via JSON API

---

## 📊 CURRENT STATE (What Works Now)

### ✅ Working:
- OAuth authentication (Google)
- RLS security (properly configured)
- Supabase database (workspaces, dashboards, dashboard_shares)
- Cube.js backend (running on port 4000)
- 1 Cube model loaded: GscPerformance7days
- Dashboard CRUD (create, read, update, delete)
- User can login and see dashboard list

### ⚠️ Issues to Fix First:
1. **Cube.js pre-aggregations failing** (TIME/UTC cast error)
   - Solution: Remove pre-aggregations from all Cube models OR fix DATETIME syntax
   - Already removed from GscPerformance7days.js

2. **Ads/Analytics tables don't exist in BigQuery**
   - Solution: Comment out AdsPerformance7days.js and AnalyticsSessions7days.js for now
   - OR create dummy tables in BigQuery

3. **Charts showing white/blank**
   - Related to Cube.js errors above
   - Will be fixed when Cube queries work

---

## 🏗️ IMPLEMENTATION ROADMAP

### Day 1 (6 hours): Core Architecture

**Morning** (3 hours):
1. Backup current dashboard builder
2. Create folder structure (35 files)
3. Implement Row/Column components with Craft.js Canvas
4. Create AddRowButton and AddColumnButton
5. Create ColumnLayoutPicker modal

**Afternoon** (3 hours):
6. Create ComponentPicker modal (Charts/Controls/Content)
7. Implement basic SettingsSidebar (empty shell)
8. Create 1 example chart: TimeSeriesChart with Setup + Style
9. Test: Add row → Add column → Add chart → Configure → See data

**End of Day 1**: Can add rows/columns and 1 working chart with sidebar config

---

### Day 2 (6 hours): Components & Sidebar

**Morning** (3 hours):
1. Create all 13 chart components (copy TimeSeriesChart pattern)
2. Create ChartSetup panel (shared for all charts)
3. Create ChartStyle panel (shared for all charts)
4. Each chart uses related.setup and related.style

**Afternoon** (3 hours):
5. Create 9 control components (DateRange, Dropdown, Slider, etc.)
6. Create ControlSetup panel (shared)
7. Create 4 content components (TextBox with TipTap, Image, Shape, Line)
8. Create ContentStyle panel (shared)

**End of Day 2**: All 26 components work with sidebar configuration

---

### Day 3 (4 hours): Polish & Features

**Morning** (2 hours):
1. Create Toolbox (left sidebar) with drag-to-add
2. Create EditorTopbar with Undo/Redo/Zoom
3. Implement keyboard shortcuts (Cmd+Z, Cmd+Y)
4. Add grid/snap-to-grid

**Afternoon** (2 hours):
5. Implement multi-page support
6. Create PageTabs in topbar
7. Add auto-save on every change (onNodesChange)
8. Create AI agent API (JSON manipulation)
9. Test complete workflow
10. Clean up old code

**End of Day 3**: Complete Looker Studio experience!

---

## 📁 FILE STRUCTURE TO CREATE

```
frontend/src/components/builder/
├── Editor/
│   ├── EditorCanvas.tsx          # Craft <Editor><Frame>
│   ├── EditorTopbar.tsx          # Undo/Redo/Zoom/Pages
│   └── EditorProvider.tsx        # Wrapper
├── Toolbox/
│   ├── Toolbox.tsx               # Left sidebar
│   ├── ToolboxSection.tsx        # Collapsible sections
│   └── DraggableItem.tsx         # Drag from toolbox
├── Sidebar/
│   ├── SettingsSidebar.tsx       # Right sidebar
│   ├── SetupTab.tsx              # Data tab
│   ├── StyleTab.tsx              # Design tab
│   ├── NoSelection.tsx           # Empty state
│   └── ComponentSettings/
│       ├── ChartSetup.tsx        # Shared chart data config
│       ├── ChartStyle.tsx        # Shared chart design config
│       ├── ControlSetup.tsx      # Shared control config
│       └── ContentStyle.tsx      # Shared content config
├── Canvas/
│   ├── Row.tsx                   # Craft Canvas - row container
│   ├── Column.tsx                # Craft Canvas - column container
│   ├── AddRowButton.tsx          # + Add Row
│   ├── AddColumnButton.tsx       # + Add Column
│   ├── ColumnLayoutPicker.tsx    # Modal: layout options
│   └── ComponentPicker.tsx       # Modal: choose component
├── Components/
│   ├── Charts/
│   │   ├── TimeSeriesChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── TableChart.tsx
│   │   ├── Scorecard.tsx
│   │   ├── GaugeChart.tsx
│   │   ├── TreemapChart.tsx
│   │   ├── AreaChart.tsx
│   │   ├── ScatterChart.tsx
│   │   ├── HeatmapChart.tsx
│   │   ├── FunnelChart.tsx
│   │   └── RadarChart.tsx
│   ├── Controls/
│   │   ├── DateRangeControl.tsx
│   │   ├── DropdownControl.tsx
│   │   ├── SliderControl.tsx
│   │   ├── CheckboxControl.tsx
│   │   ├── InputBoxControl.tsx
│   │   ├── FixedListControl.tsx
│   │   ├── AdvancedFilterControl.tsx
│   │   ├── DataSourceControl.tsx
│   │   └── DimensionControl.tsx
│   ├── Content/
│   │   ├── TextBox.tsx
│   │   ├── Image.tsx
│   │   ├── Shape.tsx
│   │   └── Line.tsx
│   └── index.ts                  # Export all components
├── Pages/
│   ├── PageManager.tsx           # State management
│   ├── PageNavigation.tsx        # 4 nav styles
│   └── PageTabs.tsx              # Tab UI
└── Shared/
    ├── FieldPicker.tsx           # Dimension/Metric picker
    ├── FilterBuilder.tsx         # Filter UI
    ├── ColorPicker.tsx           # Color picker
    ├── FontPicker.tsx            # Font selector
    ├── AggregationPicker.tsx     # SUM/AVG/COUNT
    └── Section.tsx               # Sidebar section wrapper
```

---

## 🔧 IMMEDIATE FIXES NEEDED (Before Craft.js)

### Fix 1: Remove Pre-Aggregations from Cube Models
The `DATETIME('UTC')` syntax is wrong for BigQuery. Pre-aggs aren't needed for small datasets.

**Action**: Remove from AdsPerformance7days.js and AnalyticsSessions7days.js (already removed from GSC)

### Fix 2: Comment Out Missing BigQuery Tables
Ads and Analytics tables don't exist yet.

**Action**:
```javascript
// Rename files to disable:
mv schema/AdsPerformance7days.js schema/AdsPerformance7days.js.DISABLED
mv schema/AnalyticsSessions7days.js schema/AnalyticsSessions7days.js.DISABLED

// Restart Cube.js
// Only GscPerformance7days will load
```

### Fix 3: Test GSC Chart Works
After fixes, this query should work:
```
GET /cubejs-api/v1/load?query={
  "measures":["GscPerformance7days.clicks"],
  "dimensions":["GscPerformance7days.device"]
}
```

---

## 💡 KEY CRAFT.JS PATTERNS TO USE

### Pattern 1: UserComponent with Setup + Style
```tsx
const TimeSeriesChart = (props) => {
  const { connectors: {connect, drag}, selected } = useNode();
  return <div ref={ref => connect(drag(ref))}>...</div>;
};

const Setup = () => {
  const { props, actions: {setProp} } = useNode();
  return <DimensionPicker onChange={val => setProp(p => p.dimension = val)} />;
};

const Style = () => {
  const { props, actions: {setProp} } = useNode();
  return <ColorPicker onChange={val => setProp(p => p.color = val)} />;
};

TimeSeriesChart.craft = {
  props: { dimension: null, metric: null, color: '#000' },
  related: { setup: Setup, style: Style }
};
```

### Pattern 2: Canvas (Row/Column)
```tsx
const Row = ({ children }) => {
  const { connectors: {connect, drag} } = useNode();
  return (
    <div ref={ref => connect(drag(ref))}>
      <Canvas id="row-canvas">
        {children}
      </Canvas>
    </div>
  );
};
```

### Pattern 3: Drag from Toolbox
```tsx
const Toolbox = () => {
  const { connectors } = useEditor();
  return (
    <div
      ref={ref => connectors.create(ref, <Element is={TimeSeriesChart} />)}
    >
      Time Series
    </div>
  );
};
```

### Pattern 4: Settings Sidebar
```tsx
const SettingsSidebar = () => {
  const { selected, setupComponent, styleComponent } = useEditor((state) => {
    const [id] = state.events.selected;
    if (!id) return { selected: null };

    const node = state.nodes[id];
    return {
      selected: node.data.displayName,
      setupComponent: node.related?.setup,
      styleComponent: node.related?.style
    };
  });

  if (!selected) return <NoSelection />;

  return (
    <Tabs>
      <Tab name="Setup">{React.createElement(setupComponent)}</Tab>
      <Tab name="Style">{React.createElement(styleComponent)}</Tab>
    </Tabs>
  );
};
```

### Pattern 5: Save/Load
```tsx
// Save
const handleSave = () => {
  const json = query.serialize();
  saveDashboard(dashboardId, currentPageId, json);
};

// Load
<Frame data={loadedCanvasState}>
  <Element is={Row} canvas />
</Frame>

// Auto-save
<Editor onNodesChange={(query) => {
  const json = query.serialize();
  debouncedSave(json);
}}>
```

---

## 🎨 LOOKER STUDIO FEATURE MAPPING

### Looker Feature → Our Implementation:

| Looker Feature | Our Implementation | Component |
|----------------|-------------------|-----------|
| Insert menu (left) | Toolbox (left sidebar) | Toolbox.tsx |
| Properties panel (right) | Settings Sidebar | SettingsSidebar.tsx |
| Setup tab | Setup tab with data config | SetupTab.tsx |
| Style tab | Style tab with design | StyleTab.tsx |
| Canvas | Craft.js Frame | EditorCanvas.tsx |
| Grid system | CSS Grid + snap | Canvas CSS |
| Add page | Page manager | PageManager.tsx |
| Page tabs | Topbar tabs | PageTabs.tsx |
| Undo/Redo | Craft.js history | actions.history |
| Zoom | CSS transform | Zoom control |
| Time Series chart | ECharts line | TimeSeriesChart.tsx |
| Bar chart | ECharts bar | BarChart.tsx |
| Table | HTML table | TableChart.tsx |
| Scorecard | KPI card | Scorecard.tsx |
| Date Range control | Date picker | DateRangeControl.tsx |
| Dropdown control | Select | DropdownControl.tsx |
| Slider control | Range slider | SliderControl.tsx |
| Text | TipTap editor | TextBox.tsx |
| Image | Image upload/URL | Image.tsx |
| Shape | SVG shapes | Shape.tsx |
| Line | SVG line | Line.tsx |
| Themes | Global theme + overrides | Theme system |
| Data blending | Cube.js joins | Query builder |
| Calculated fields | Cube measures | Metric config |
| Filters | Cube filters | Filter builder |

---

## 🔑 CRITICAL IMPLEMENTATION NOTES

### 1. Cube.js Integration
Each chart component must:
- Accept `datasource`, `dimension`, `metric`, `filters` props
- Use `useCubeQuery` to fetch data
- Handle loading states
- Show empty state when not configured
- Update when props change

```tsx
const { resultSet, isLoading } = useCubeQuery({
  dimensions: [props.dimension],
  measures: [props.metric],
  filters: props.filters
}, {
  skip: !props.dimension || !props.metric
});
```

### 2. Shared Panels
Don't duplicate code! Create shared Setup/Style panels:
- `ChartSetup.tsx` - Used by ALL chart types
- `ChartStyle.tsx` - Used by ALL chart types
- `ControlSetup.tsx` - Used by ALL control types
- Each component does: `related: { setup: ChartSetup, style: ChartStyle }`

### 3. State Persistence
Two approaches:
- **Auto-save**: `onNodesChange` → debounce → save to Supabase
- **Manual save**: Save button → `query.serialize()` → save to Supabase

Use auto-save for best UX (Looker-like).

### 4. Multi-Page Architecture
```typescript
interface DashboardState {
  pages: Array<{
    id: string;
    name: string;
    canvas: string; // Serialized Craft.js JSON
    theme?: ThemeConfig;
  }>;
  currentPageId: string;
  navigation: 'tabs' | 'left-drawer' | 'dropdown' | 'hidden';
}

// Save to Supabase dashboards.config:
{
  "config": {
    "pages": [...],
    "currentPageId": "page-1",
    "navigation": "tabs"
  }
}
```

### 5. Component Resolver
Must register ALL components:
```tsx
<Editor
  resolver={{
    Row, Column,
    TimeSeriesChart, BarChart, PieChart, Table, Scorecard, // ... all charts
    DateRangeControl, DropdownControl, // ... all controls
    TextBox, Image, Shape, Line // ... all content
  }}
>
```

---

## 🚨 COMMON PITFALLS TO AVOID

### Pitfall 1: Forgetting `canvas` prop
```tsx
// ❌ WRONG - Column won't accept children
<Element is={Column}>

// ✅ RIGHT - Column is a droppable area
<Element is={Column} canvas>
```

### Pitfall 2: Not using `Element` wrapper
```tsx
// ❌ WRONG - Won't be managed by Craft.js
<TimeSeriesChart />

// ✅ RIGHT - Craft.js tracks it
<Element is={TimeSeriesChart} />
```

### Pitfall 3: Mutating props directly
```tsx
// ❌ WRONG
props.color = newColor;

// ✅ RIGHT - Use setProp
setProp(props => props.color = newColor);
```

### Pitfall 4: Not handling null props
```tsx
// Charts start with dimension=null, metric=null
// Must show empty state and skip Cube query
if (!props.dimension || !props.metric) {
  return <EmptyState>Configure dimension and metric</EmptyState>;
}
```

---

## 🧪 TESTING CHECKLIST

After implementation, verify:

**Basic Flow**:
- [ ] Click "+ Add Row" → Row appears
- [ ] Click "+" in row → Choose layout (1/2|1/2)
- [ ] Two columns appear
- [ ] Click "+" in left column → Component picker opens
- [ ] Select "Time Series" → Blank chart appears
- [ ] Right sidebar opens with "Setup" tab selected
- [ ] Click "Dimension" → See dropdown with GSC dimensions
- [ ] Select "date" → Dropdown shows it
- [ ] Click "Metric" → See dropdown with GSC metrics
- [ ] Select "clicks" → Dropdown shows it
- [ ] Chart queries Cube.js and shows data
- [ ] Switch to "Style" tab
- [ ] Change title → Chart updates
- [ ] Change color → Chart updates
- [ ] Click Save → Dashboard persists
- [ ] Refresh page → Dashboard loads with charts

**Advanced**:
- [ ] Undo (Cmd+Z) reverts last change
- [ ] Redo (Cmd+Shift+Z) reapplies change
- [ ] Add Page 2 → New blank canvas
- [ ] Switch between pages → Each has own content
- [ ] Add Date Range control
- [ ] Date Range affects charts
- [ ] Add text box with rich text
- [ ] Add image from URL
- [ ] Export PDF still works
- [ ] Share dashboard still works

---

## 📚 CODE TEMPLATES

### Template 1: Basic Chart Component
```tsx
import { useNode } from '@craftjs/core';
import { useCubeQuery } from '@cubejs-client/react';
import ReactECharts from 'echarts-for-react';
import { ChartSetup } from '../Sidebar/ComponentSettings/ChartSetup';
import { ChartStyle } from '../Sidebar/ComponentSettings/ChartStyle';

interface ChartProps {
  datasource: string;
  dimension: string | null;
  metric: string | null;
  filters: any[];
  title: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export const MyChart: React.FC<ChartProps> = (props) => {
  const { connectors: {connect, drag}, selected } = useNode((node) => ({
    selected: node.events.selected
  }));

  const shouldQuery = props.dimension && props.metric;

  const { resultSet, isLoading } = useCubeQuery(
    shouldQuery ? {
      dimensions: [props.dimension],
      measures: [props.metric],
      filters: props.filters
    } : null,
    { skip: !shouldQuery }
  );

  const chartOption = {
    // Build ECharts config from resultSet + props
  };

  return (
    <div
      ref={ref => connect(drag(ref))}
      className={selected ? 'selected-component' : ''}
      style={{
        backgroundColor: props.backgroundColor,
        border: `${props.borderWidth}px solid ${props.borderColor}`
      }}
    >
      {!shouldQuery && <EmptyState>Configure chart</EmptyState>}
      {isLoading && <Spinner />}
      {shouldQuery && !isLoading && <ReactECharts option={chartOption} />}
    </div>
  );
};

MyChart.craft = {
  displayName: 'My Chart',
  props: {
    datasource: 'gsc_performance_7days',
    dimension: null,
    metric: null,
    filters: [],
    title: 'My Chart',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1
  },
  related: {
    setup: ChartSetup, // Reusable!
    style: ChartStyle  // Reusable!
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false // Charts don't have children
  }
};
```

### Template 2: Shared Setup Panel
```tsx
// Shared by ALL chart types
export const ChartSetup = () => {
  const {
    datasource,
    dimension,
    metric,
    filters,
    actions: {setProp}
  } = useNode((node) => ({
    datasource: node.data.props.datasource,
    dimension: node.data.props.dimension,
    metric: node.data.props.metric,
    filters: node.data.props.filters
  }));

  const { dimensions, metrics } = useCubeMeta(datasource);

  return (
    <div className="space-y-4">
      <Section title="Data Source">
        <Select
          value={datasource}
          options={['gsc_performance_7days', 'ads_performance_7days']}
          onChange={(val) => setProp(p => p.datasource = val)}
        />
      </Section>

      <Section title="Dimension">
        <FieldPicker
          type="dimension"
          fields={dimensions}
          selected={dimension}
          onChange={(val) => setProp(p => p.dimension = val)}
          badge="green"
        />
      </Section>

      <Section title="Metric">
        <FieldPicker
          type="metric"
          fields={metrics}
          selected={metric}
          onChange={(val) => setProp(p => p.metric = val)}
          badge="blue"
        />
        <AggregationPicker />
      </Section>

      <Section title="Filter">
        <FilterBuilder
          filters={filters}
          onChange={(val) => setProp(p => p.filters = val)}
        />
      </Section>
    </div>
  );
};
```

---

## 🎯 START HERE (Next Session)

### Step 1: Fix Cube.js Issues (30 min)
```bash
cd cube-backend/schema
mv AdsPerformance7days.js AdsPerformance7days.js.DISABLED
mv AnalyticsSessions7days.js AnalyticsSessions7days.js.DISABLED

# Cube.js will hot-reload, errors should stop
# Test in browser: Charts should show data
```

### Step 2: Backup Current Code (10 min)
```bash
cd frontend/src
cp -r app/dashboard/[id]/builder app/dashboard/[id]/builder-OLD
cp lib/supabase/dashboard-service.ts lib/supabase/dashboard-service.OLD.ts
```

### Step 3: Create Folder Structure (20 min)
```bash
mkdir -p components/builder/{Editor,Toolbox,Sidebar,Canvas,Components,Pages,Shared}
mkdir -p components/builder/Components/{Charts,Controls,Content}
mkdir -p components/builder/Sidebar/ComponentSettings
```

### Step 4: Start Implementing
Follow LOOKER-STUDIO-REBUILD-PLAN.md Phase 2 onwards.

Start with Row/Column system - that's the foundation.

---

## 📖 REFERENCE DOCUMENTS

**Read These First**:
1. **LOOKER-STUDIO-REBUILD-PLAN.md** - Complete implementation plan
2. This handoff document

**Craft.js Docs** (Context7):
- `/prevwong/craft.js` - Full API reference
- Focus on: Editor, Frame, Element, useNode, useEditor, Canvas

**Looker Studio Research**:
- WebSearch results saved in this doc
- 2-tab sidebar (Setup/Style)
- Component types (Charts, Controls, Content)
- Multi-page with 4 navigation styles

---

## ⚠️ REMEMBER

**The Goal**: Make it feel exactly like Looker Studio
- Row/column builder with + buttons (not free-form drag)
- Right sidebar that updates when you click components
- Two tabs: Setup (data) and Style (design)
- Toolbox on left for component types
- Topbar with undo/redo/pages
- Everything persists automatically
- AI agents can build same thing via JSON

**Don't**:
- Don't reuse react-grid-layout approach (delete it)
- Don't make charts draggable freely (use row/column structure)
- Don't skip the Setup/Style tab split (critical for UX)
- Don't forget auto-save (user never clicks save manually)

**Do**:
- Follow Craft.js patterns from Context7 examples
- Reuse shared panels (ChartSetup, ChartStyle)
- Test each component as you build it
- Keep Cube.js integration clean
- Make it feel like Looker Studio

---

## 🚀 YOU'RE READY!

**Installed**: ✅ Craft.js + all dependencies
**Researched**: ✅ Looker Studio features comprehensive
**Planned**: ✅ 16-hour implementation roadmap
**Backed up**: ⏳ Do this first next session
**Fixed**: ⏳ Fix Cube.js pre-agg errors first

**Next session**: Read this + LOOKER-STUDIO-REBUILD-PLAN.md, then start Phase 1!

Good luck! 🎉
