# 🎯 Looker Studio-Like Rebuild - Complete Implementation Plan

**Status**: Ready to implement
**Estimated Time**: 16 hours (Day 1-3)
**Complexity**: Major architectural change
**Result**: True Looker Studio experience

---

## 📋 CURRENT STATE ASSESSMENT

### What Works Now:
- ✅ OAuth authentication
- ✅ RLS security (just fixed!)
- ✅ Dashboard CRUD
- ✅ Cube.js + BigQuery connection
- ✅ 13 chart types (basic grid layout)
- ✅ Basic filters
- ✅ Export (PDF, Excel, CSV)

### What's Missing (Your Requirements):
- ❌ Row/column layout builder with + buttons
- ❌ Right sidebar with Setup/Style tabs
- ❌ Component toolbox (left sidebar)
- ❌ Multi-page support
- ❌ Looker-style topbar (undo/redo/zoom)
- ❌ Control components (9 types)
- ❌ Content components (text, image, shape, line)
- ❌ Per-component configuration
- ❌ Theme system
- ❌ State persistence on every change

**Gap**: Current solution is a simple grid. You want Looker Studio.

---

## 🔍 RESEARCH FINDINGS

### Looker Studio Features (From Google Docs):

**Layout**:
- Freeform (drag anywhere) OR Responsive (12-column grid)
- Canvas: 10px to 2000px wide, 10px to 10,000px tall
- Grid system with snap-to-grid
- Preset sizes (US Letter, A4, Screen 16:9)

**Components** (40+):
- **Charts**: Time Series, Bar, Line, Pie, Table, Scorecard, Gauge, Geo Map, Scatter, Treemap, Pivot Table, Bullet Chart, Area, Combo, etc.
- **Controls**: Date Range, Dropdown List, Fixed List, Input Box, Slider, Checkbox, Advanced Filter, Data Control, Dimension Control
- **Content**: Text (rich text, hyperlinks), Images (upload/URL), Shapes (rectangle, circle), Lines (with connectors)

**Configuration**:
- **Setup Tab**: Data source, Dimensions, Metrics, Sort, Filters, Date range, Optional metrics, Drill down
- **Style Tab**: Chart styling, Header (title/subtitle/fonts), Background, Borders, Spacing, Text formatting

**Pages**:
- Multi-page reports (3-level hierarchy)
- 4 navigation styles: Left drawer, Tabs, Dropdown, Hidden
- Per-page themes
- Page-level filters

**Themes**:
- Global theme settings
- Per-page overrides
- Fonts, colors, chart color schemes
- Background customization

**Data**:
- Multiple data sources
- Data blending (up to 5 sources)
- Calculated fields
- Parameters
- Filters (component, page, report-level)

---

## 🏗️ SOLUTION: Craft.js

### Why Craft.js is Perfect:

**From Context7 Research**:
- ✅ **Purpose-built** for visual editors (163 code examples, 8.8 trust score)
- ✅ **Sidebar-first** architecture (exactly what you want)
- ✅ **Nested canvases** (rows contain columns)
- ✅ **Component settings** (`craft.related.setup` + `craft.related.style`)
- ✅ **JSON serialization** (DB persistence + AI agents)
- ✅ **Undo/Redo** built-in (`actions.history.undo/redo`)
- ✅ **onNodesChange** callback (auto-save on every edit)
- ✅ **Drag from toolbox** (`connectors.create`)
- ✅ **Click to select** → Sidebar updates automatically
- ✅ **Programmatic API** (`actions.add`, `actions.setProp`, etc.)

**Code Pattern**:
```tsx
// Component with two-tab sidebar (YOUR REQUIREMENT!)
const TimeSeriesChart = (props) => {
  const { connectors, selected } = useNode();
  return <div ref={connect}><ECharts /></div>;
};

// Setup Tab (Data configuration)
const TimeSeriesSetup = () => {
  const { props, setProp } = useNode();
  return (
    <>
      <DimensionPicker />
      <MetricPicker />
      <FilterBuilder />
    </>
  );
};

// Style Tab (Design configuration)
const TimeSeriesStyle = () => {
  const { props, setProp } = useNode();
  return (
    <>
      <ColorPicker />
      <FontPicker />
      <OpacitySlider />
    </>
  );
};

TimeSeriesChart.craft = {
  related: {
    setup: TimeSeriesSetup,  // Your "Data" tab
    style: TimeSeriesStyle   // Your "Design" tab
  }
};
```

---

## 📐 DETAILED IMPLEMENTATION PLAN

### PHASE 1: Setup & Architecture (2 hours)

**1.1 Backup Current Code**
```bash
# Preserve current implementation
cp -r src/app/dashboard src/app/dashboard-OLD
cp src/lib/supabase/dashboard-service.ts src/lib/supabase/dashboard-service.OLD.ts
```

**1.2 Install Dependencies**
```bash
cd frontend
npm install @craftjs/core @craftjs/utils
npm install react-colorful          # Color picker for Style tab
npm install react-icons              # Icons for toolbox/topbar
npm install lz-string                # State compression
npm install @tiptap/react @tiptap/starter-kit  # Rich text for TextBox
```

**1.3 Create Folder Structure**
```
frontend/src/components/builder/
├── Editor/
│   ├── EditorCanvas.tsx          # Main Craft.js Frame
│   ├── EditorTopbar.tsx          # Undo/Redo/Zoom/Pages/Save
│   ├── EditorProvider.tsx        # Craft <Editor> wrapper
│   └── index.ts
├── Toolbox/
│   ├── Toolbox.tsx               # Left sidebar
│   ├── ToolboxSection.tsx        # Collapsible sections
│   ├── DraggableItem.tsx         # Drag handle component
│   └── index.ts
├── Sidebar/
│   ├── SettingsSidebar.tsx       # Right sidebar container
│   ├── SetupTab.tsx              # Data configuration panel
│   ├── StyleTab.tsx              # Design configuration panel
│   ├── NoSelection.tsx           # "Select a component" placeholder
│   └── ComponentSettings/
│       ├── ChartSetup.tsx        # Shared chart data config
│       ├── ChartStyle.tsx        # Shared chart style config
│       ├── ControlSetup.tsx      # Shared control config
│       └── ContentStyle.tsx      # Shared content style config
├── Canvas/
│   ├── Row.tsx                   # Craft.js Canvas row
│   ├── Column.tsx                # Craft.js Canvas column
│   ├── AddRowButton.tsx          # + to add rows
│   ├── AddColumnButton.tsx       # + to add columns
│   ├── ColumnLayoutPicker.tsx    # Modal: Full, 1/2, 1/3, 1/4
│   └── ComponentPicker.tsx       # Modal: Choose component type
├── Components/
│   ├── Charts/
│   │   ├── TimeSeriesChart.tsx   # With Setup + Style
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── TableChart.tsx
│   │   ├── Scorecard.tsx         # KPI-style (from Looker)
│   │   ├── GaugeChart.tsx
│   │   ├── TreemapChart.tsx
│   │   ├── PivotTable.tsx        # (from Looker)
│   │   ├── GeoMap.tsx            # (from Looker)
│   │   └── ... (13+ total)
│   ├── Controls/
│   │   ├── DateRangeControl.tsx  # Looker control
│   │   ├── DropdownControl.tsx   # Looker control
│   │   ├── SliderControl.tsx     # Looker control
│   │   ├── CheckboxControl.tsx   # Looker control
│   │   ├── InputBoxControl.tsx   # Looker control
│   │   ├── FixedListControl.tsx  # Looker control
│   │   ├── AdvancedFilterControl.tsx
│   │   ├── DataSourceControl.tsx # Switch datasource
│   │   └── DimensionControl.tsx  # Filter by dimension
│   └── Content/
│       ├── TextBox.tsx           # Rich text with TipTap
│       ├── Image.tsx             # Upload or URL
│       ├── Shape.tsx             # Rectangle, Circle
│       └── Line.tsx              # Connectable arrows
├── Pages/
│   ├── PageManager.tsx           # Multi-page state
│   ├── PageNavigation.tsx        # 4 nav styles
│   ├── PageTabs.tsx              # Tab-style nav
│   └── AddPageModal.tsx          # Create new page
└── Shared/
    ├── FieldPicker.tsx           # Dimension/Metric picker
    ├── FilterBuilder.tsx         # Filter UI
    ├── ColorPicker.tsx           # Color picker wrapper
    ├── FontPicker.tsx            # Font selector
    └── AggregationPicker.tsx     # SUM/AVG/COUNT/etc.
```

---

### PHASE 2: Core Craft.js Integration (3 hours)

**2.1 Main Builder Page** (Complete rewrite)
```tsx
// src/app/dashboard/[id]/builder/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Editor, Frame, Element } from '@craftjs/core';
import { EditorTopbar } from '@/components/builder/Editor/EditorTopbar';
import { Toolbox } from '@/components/builder/Toolbox/Toolbox';
import { SettingsSidebar } from '@/components/builder/Sidebar/SettingsSidebar';
import { Row } from '@/components/builder/Canvas/Row';
import { Column } from '@/components/builder/Canvas/Column';
import { loadDashboard, saveDashboard } from '@/lib/supabase/dashboard-service';
import { builderComponents } from '@/components/builder/Components';

export default function DashboardBuilder() {
  const params = useParams();
  const dashboardId = params.id as string;

  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState('page-1');
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard from Supabase
  useEffect(() => {
    loadDashboard(dashboardId).then(result => {
      if (result.success && result.data) {
        setPages(result.data.pages || [{
          id: 'page-1',
          name: 'Page 1',
          canvas: null
        }]);
      }
      setIsLoading(false);
    });
  }, [dashboardId]);

  // Auto-save on every change
  const handleNodesChange = (query) => {
    const currentPageState = query.serialize();
    const updatedPages = pages.map(p =>
      p.id === currentPageId ? { ...p, canvas: currentPageState } : p
    );
    debouncedSave(dashboardId, updatedPages);
  };

  if (isLoading) return <LoadingSpinner />;

  const currentPage = pages.find(p => p.id === currentPageId);

  return (
    <div className="builder-layout">
      {/* Top Bar */}
      <EditorTopbar
        pages={pages}
        currentPageId={currentPageId}
        onPageSwitch={setCurrentPageId}
        onAddPage={handleAddPage}
        dashboardId={dashboardId}
      />

      <div className="builder-content">
        {/* Left Toolbox */}
        <Toolbox />

        {/* Center Canvas */}
        <div className="builder-canvas">
          <Editor
            resolver={builderComponents} // All our components
            onNodesChange={handleNodesChange}
          >
            <Frame data={currentPage?.canvas}>
              <Element is={Row} canvas>
                {/* Empty row by default */}
              </Element>
            </Frame>
          </Editor>
        </div>

        {/* Right Sidebar */}
        <SettingsSidebar />
      </div>
    </div>
  );
}
```

**2.2 Resolver (All Components)**
```tsx
// components/builder/Components/index.ts
import { Row } from '../Canvas/Row';
import { Column } from '../Canvas/Column';
import { TimeSeriesChart } from './Charts/TimeSeriesChart';
import { BarChart } from './Charts/BarChart';
// ... all 13 chart types
import { DateRangeControl } from './Controls/DateRangeControl';
// ... all 9 control types
import { TextBox } from './Content/TextBox';
// ... all 4 content types

export const builderComponents = {
  Row,
  Column,
  TimeSeriesChart,
  BarChart,
  // ... (total 30+ components)
};
```

---

### PHASE 3: Row/Column System (Your Exact Requirement!) (2 hours)

**3.1 Row Component**
```tsx
// Canvas/Row.tsx
import { useNode, useEditor } from '@craftjs/core';
import { AddColumnButton } from './AddColumnButton';

export const Row = ({ children }) => {
  const { connectors: {connect, drag}, id } = useNode();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  return (
    <div
      ref={ref => connect(drag(ref))}
      className="builder-row"
    >
      <Canvas id={id}>
        {children}
        {enabled && <AddColumnButton rowId={id} />}
      </Canvas>
    </div>
  );
};

Row.craft = {
  displayName: 'Row',
  rules: {
    canMoveIn: (nodes) => nodes.every(n => n.data.type === Column)
  }
};
```

**3.2 Add Column Flow** (Your workflow!)
```tsx
// AddColumnButton.tsx
const AddColumnButton = ({ rowId }) => {
  const { actions } = useEditor();
  const [showPicker, setShowPicker] = useState(false);

  const layouts = [
    { name: 'Full Width', columns: ['1/1'] },
    { name: '1/2 | 1/2', columns: ['1/2', '1/2'] },
    { name: '1/3 | 2/3', columns: ['1/3', '2/3'] },
    { name: '1/4 | 3/4', columns: ['1/4', '3/4'] },
    { name: '1/3 | 1/3 | 1/3', columns: ['1/3', '1/3', '1/3'] }
  ];

  const addColumns = (layout) => {
    layout.columns.forEach(width => {
      const colNode = query.parseFreshNode({
        type: Column,
        props: { width },
        nodes: []
      }).toNode();
      actions.add(colNode, rowId);
    });
    setShowPicker(false);
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>+ Add Column</button>
      <ColumnLayoutPicker
        open={showPicker}
        layouts={layouts}
        onSelect={addColumns}
      />
    </>
  );
};
```

**3.3 Add Component Flow**
```tsx
// AddComponentButton.tsx (in Column)
const AddComponentButton = ({ columnId }) => {
  const { actions } = useEditor();
  const [showPicker, setShowPicker] = useState(false);

  const componentCategories = [
    {
      name: 'Charts',
      items: [
        { type: 'TimeSeriesChart', name: 'Time Series', icon: <LineChart /> },
        { type: 'BarChart', name: 'Bar Chart', icon: <BarChart /> },
        // ... all 13 chart types
      ]
    },
    {
      name: 'Controls',
      items: [
        { type: 'DateRangeControl', name: 'Date Range', icon: <Calendar /> },
        { type: 'DropdownControl', name: 'Dropdown', icon: <ChevronDown /> },
        // ... all 9 control types
      ]
    },
    {
      name: 'Content',
      items: [
        { type: 'TextBox', name: 'Text', icon: <Type /> },
        { type: 'Image', name: 'Image', icon: <Image /> },
        { type: 'Shape', name: 'Shape', icon: <Square /> },
        { type: 'Line', name: 'Line', icon: <Minus /> }
      ]
    }
  ];

  const addComponent = (componentType) => {
    const node = query.parseFreshNode({
      type: builderComponents[componentType],
      props: {} // Uses craft.props defaults
    }).toNode();
    actions.add(node, columnId);
    setShowPicker(false);
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>+</button>
      <ComponentPicker
        categories={componentCategories}
        onSelect={addComponent}
      />
    </>
  );
};
```

---

### PHASE 4: Settings Sidebar (Your Requirement!) (4 hours)

**4.1 Sidebar Container**
```tsx
// Sidebar/SettingsSidebar.tsx
import { useEditor } from '@craftjs/core';
import { SetupTab } from './SetupTab';
import { StyleTab } from './StyleTab';

export const SettingsSidebar = () => {
  const { selected, setupComponent, styleComponent } = useEditor((state) => {
    const [selectedId] = state.events.selected;
    if (!selectedId) return { selected: null };

    const node = state.nodes[selectedId];
    return {
      selected: {
        id: selectedId,
        name: node.data.displayName,
        type: node.data.type
      },
      setupComponent: node.related?.setup,
      styleComponent: node.related?.style
    };
  });

  if (!selected) {
    return (
      <div className="sidebar">
        <NoSelection /> {/* "Select a component to configure" */}
      </div>
    );
  }

  return (
    <div className="sidebar">
      <SidebarHeader>
        <h3>{selected.name}</h3>
        <Badge>{selected.type}</Badge>
      </SidebarHeader>

      <Tabs defaultValue="setup">
        {/* SETUP TAB - Your "Data" tab */}
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          {setupComponent && React.createElement(setupComponent)}
        </TabsContent>

        <TabsContent value="style">
          {styleComponent && React.createElement(styleComponent)}
        </TabsContent>
      </Tabs>

      <SidebarFooter>
        <Button onClick={handleDelete} variant="destructive">
          Delete Component
        </Button>
      </SidebarFooter>
    </div>
  );
};
```

**4.2 Shared Setup Panel** (For Charts)
```tsx
// Sidebar/ComponentSettings/ChartSetup.tsx
export const ChartSetup = () => {
  const { datasource, dimension, metric, filters, actions: {setProp} } = useNode((node) => ({
    datasource: node.data.props.datasource,
    dimension: node.data.props.dimension,
    metric: node.data.props.metric,
    filters: node.data.props.filters
  }));

  // Fetch available fields from Cube.js
  const { dimensions, metrics } = useCubeMeta(datasource);

  return (
    <div className="space-y-4">
      {/* Data Source */}
      <Section title="Data Source">
        <Select
          value={datasource}
          options={[
            'gsc_performance_7days',
            'ads_performance_7days',
            'analytics_sessions_7days'
          ]}
          onChange={(val) => setProp(p => p.datasource = val)}
        />
      </Section>

      {/* Dimension */}
      <Section title="Dimension">
        <FieldPicker
          type="dimension"
          fields={dimensions}
          selected={dimension}
          onChange={(val) => setProp(p => p.dimension = val)}
          badge="green" // Green like Looker
        />
        <HelpText>
          Determines how data is grouped
        </HelpText>
      </Section>

      {/* Metric */}
      <Section title="Metric">
        <FieldPicker
          type="metric"
          fields={metrics}
          selected={metric}
          onChange={(val) => setProp(p => p.metric = val)}
          badge="blue" // Blue like Looker
        />
        <AggregationPicker
          value={metric?.aggregation}
          options={['SUM', 'AVG', 'COUNT', 'MIN', 'MAX']}
          onChange={(val) => setProp(p => p.metric.aggregation = val)}
        />
      </Section>

      {/* Sort */}
      <Section title="Sort">
        <Select field={sortField} />
        <Select direction={['Ascending', 'Descending']} />
      </Section>

      {/* Filters */}
      <Section title="Filter">
        <FilterBuilder
          filters={filters}
          availableFields={[...dimensions, ...metrics]}
          onChange={(val) => setProp(p => p.filters = val)}
        />
        <Button size="sm">+ Add Filter</Button>
      </Section>

      {/* Date Range */}
      <Section title="Date Range">
        <DateRangePicker
          value={dateRange}
          presets={['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom']}
          onChange={(val) => setProp(p => p.dateRange = val)}
        />
      </Section>
    </div>
  );
};
```

**4.3 Shared Style Panel** (For Charts)
```tsx
// Sidebar/ComponentSettings/ChartStyle.tsx
export const ChartStyle = () => {
  const {
    title,
    titleFont,
    titleColor,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    padding,
    showLegend,
    chartColors,
    actions: {setProp}
  } = useNode((node) => ({
    title: node.data.props.title,
    titleFont: node.data.props.titleFont,
    titleColor: node.data.props.titleColor,
    backgroundColor: node.data.props.backgroundColor,
    borderColor: node.data.props.borderColor,
    borderWidth: node.data.props.borderWidth,
    borderRadius: node.data.props.borderRadius,
    padding: node.data.props.padding,
    showLegend: node.data.props.showLegend,
    chartColors: node.data.props.chartColors
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <Section title="Header">
        <Input
          label="Title"
          value={title}
          onChange={(val) => setProp(p => p.title = val)}
        />
        <FontPicker
          label="Title Font"
          value={titleFont}
          onChange={(val) => setProp(p => p.titleFont = val)}
        />
        <ColorPicker
          label="Title Color"
          value={titleColor}
          onChange={(val) => setProp(p => p.titleColor = val)}
        />
      </Section>

      {/* Chart */}
      <Section title="Chart">
        <ColorSchemePicker
          label="Color Scheme"
          value={chartColors}
          presets={['Default', 'Blue', 'Green', 'Red', 'Custom']}
          onChange={(val) => setProp(p => p.chartColors = val)}
        />
        <Toggle
          label="Show Legend"
          checked={showLegend}
          onChange={(val) => setProp(p => p.showLegend = val)}
        />
      </Section>

      {/* Background */}
      <Section title="Background">
        <ColorPicker
          label="Background Color"
          value={backgroundColor}
          onChange={(val) => setProp(p => p.backgroundColor = val)}
        />
        <OpacitySlider
          value={backgroundOpacity}
          onChange={(val) => setProp(p => p.backgroundOpacity = val)}
        />
      </Section>

      {/* Border */}
      <Section title="Border">
        <ColorPicker
          label="Border Color"
          value={borderColor}
          onChange={(val) => setProp(p => p.borderColor = val)}
        />
        <Slider
          label="Border Width"
          min={0}
          max={10}
          value={borderWidth}
          onChange={(val) => setProp(p => p.borderWidth = val)}
        />
        <Slider
          label="Border Radius"
          min={0}
          max={20}
          value={borderRadius}
          onChange={(val) => setProp(p => p.borderRadius = val)}
        />
      </Section>

      {/* Spacing */}
      <Section title="Spacing">
        <Slider
          label="Padding"
          min={0}
          max={50}
          value={padding}
          onChange={(val) => setProp(p => p.padding = val)}
        />
      </Section>
    </div>
  );
};
```

---

### PHASE 5: Example Chart Component (Full Implementation) (1 hour per chart)

```tsx
// Components/Charts/TimeSeriesChart.tsx
import { useNode } from '@craftjs/core';
import { useCubeQuery } from '@cubejs-client/react';
import ReactECharts from 'echarts-for-react';
import { ChartSetup } from '@/components/builder/Sidebar/ComponentSettings/ChartSetup';
import { ChartStyle } from '@/components/builder/Sidebar/ComponentSettings/ChartStyle';

interface TimeSeriesChartProps {
  // Setup props
  datasource: string;
  dimension: string | null;
  metric: string | null;
  filters: any[];
  dateRange: string;
  sort: { field: string; direction: 'asc' | 'desc' };

  // Style props
  title: string;
  titleFont: string;
  titleColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
  showLegend: boolean;
  chartColors: string[];
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = (props) => {
  const {
    connectors: {connect, drag},
    selected,
    id
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id
  }));

  // Only query if configured
  const shouldQuery = props.dimension && props.metric;

  const { resultSet, isLoading } = useCubeQuery(
    shouldQuery ? {
      dimensions: [props.dimension],
      measures: [props.metric],
      timeDimensions: [{
        dimension: props.dimension,
        granularity: 'day',
        dateRange: props.dateRange
      }],
      filters: props.filters
    } : null,
    { skip: !shouldQuery }
  );

  // Build ECharts option
  const chartOption = {
    title: {
      text: props.title,
      textStyle: {
        fontFamily: props.titleFont,
        color: props.titleColor
      }
    },
    backgroundColor: props.backgroundColor,
    tooltip: { trigger: 'axis' },
    legend: { show: props.showLegend },
    xAxis: {
      type: 'category',
      data: resultSet?.chartPivot().map(d => d.x) || []
    },
    yAxis: { type: 'value' },
    series: [{
      data: resultSet?.chartPivot().map(d => d[props.metric]) || [],
      type: 'line',
      smooth: true,
      itemStyle: {
        color: props.chartColors[0]
      }
    }]
  };

  return (
    <div
      ref={ref => connect(drag(ref))}
      className={`chart-container ${selected ? 'selected' : ''}`}
      style={{
        backgroundColor: props.backgroundColor,
        border: `${props.borderWidth}px solid ${props.borderColor}`,
        borderRadius: `${props.borderRadius}px`,
        padding: `${props.padding}px`
      }}
    >
      {isLoading && <Spinner />}
      {!shouldQuery && <EmptyState>Configure dimension and metric</EmptyState>}
      {shouldQuery && !isLoading && (
        <ReactECharts option={chartOption} style={{ height: '300px' }} />
      )}
    </div>
  );
};

// Craft.js configuration
TimeSeriesChart.craft = {
  displayName: 'Time Series',
  props: {
    // Setup defaults
    datasource: 'gsc_performance_7days',
    dimension: null,
    metric: null,
    filters: [],
    dateRange: 'last 30 days',
    sort: { field: 'date', direction: 'asc' },

    // Style defaults
    title: 'Time Series Chart',
    titleFont: 'Roboto',
    titleColor: '#333',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    showLegend: true,
    chartColors: ['#5470c6', '#91cc75', '#fac858']
  },
  related: {
    setup: ChartSetup, // Reusable setup panel
    style: ChartStyle  // Reusable style panel
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false // Charts can't have children
  }
};
```

---

### PHASE 6: Topbar (Looker-Style) (2 hours)

```tsx
// Editor/EditorTopbar.tsx
import { useEditor } from '@craftjs/core';

export const EditorTopbar = ({
  pages,
  currentPageId,
  onPageSwitch,
  onAddPage,
  dashboardId
}) => {
  const {
    canUndo,
    canRedo,
    actions,
    enabled
  } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo()
  }));

  const [zoom, setZoom] = useState(100);

  return (
    <div className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <ButtonGroup>
          <IconButton
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
          >
            <Undo />
          </IconButton>
          <IconButton
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo />
          </IconButton>
        </ButtonGroup>

        <Separator />

        <Select
          value={`${zoom}%`}
          options={['50%', '75%', '100%', '125%', '150%', '200%']}
          onChange={(val) => setZoom(parseInt(val))}
        />

        <Separator />

        <Button onClick={onAddPage} size="sm">
          <Plus /> Add Page
        </Button>

        <Separator />

        <Toggle
          checked={enabled}
          onChange={(val) => actions.setOptions(opt => opt.enabled = val)}
          label="Edit Mode"
        />
      </div>

      {/* Center Section - Page Tabs */}
      <div className="topbar-center">
        <PageTabs>
          {pages.map(page => (
            <Tab
              key={page.id}
              active={page.id === currentPageId}
              onClick={() => onPageSwitch(page.id)}
            >
              {page.name}
            </Tab>
          ))}
          <Tab onClick={onAddPage} variant="add">
            <Plus /> New Page
          </Tab>
        </PageTabs>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        <Button variant="outline" onClick={handlePreview}>
          <Eye /> Preview
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 /> Share
        </Button>
        <Button onClick={handleSave}>
          <Save /> Save
        </Button>
      </div>
    </div>
  );
};
```

---

### PHASE 7: Toolbox (Left Sidebar) (1 hour)

```tsx
// Toolbox/Toolbox.tsx
import { useEditor } from '@craftjs/core';
import { ToolboxSection } from './ToolboxSection';

export const Toolbox = () => {
  const { connectors } = useEditor();

  const sections = [
    {
      title: 'Charts',
      items: [
        { type: 'TimeSeriesChart', name: 'Time Series', icon: <TrendingUp /> },
        { type: 'BarChart', name: 'Bar', icon: <BarChart2 /> },
        { type: 'PieChart', name: 'Pie', icon: <PieChart /> },
        { type: 'Table', name: 'Table', icon: <Table /> },
        { type: 'Scorecard', name: 'Scorecard', icon: <Hash /> },
        // ... all 13 types
      ]
    },
    {
      title: 'Controls',
      items: [
        { type: 'DateRangeControl', name: 'Date Range', icon: <Calendar /> },
        { type: 'DropdownControl', name: 'Dropdown', icon: <ChevronDown /> },
        { type: 'SliderControl', name: 'Slider', icon: <SlidersHorizontal /> },
        { type: 'CheckboxControl', name: 'Checkbox', icon: <CheckSquare /> },
        { type: 'InputBoxControl', name: 'Input Box', icon: <Type /> },
        // ... all 9 types
      ]
    },
    {
      title: 'Content',
      items: [
        { type: 'TextBox', name: 'Text', icon: <Type /> },
        { type: 'Image', name: 'Image', icon: <Image /> },
        { type: 'Shape', name: 'Shape', icon: <Square /> },
        { type: 'Line', name: 'Line', icon: <Minus /> }
      ]
    }
  ];

  return (
    <div className="toolbox">
      <ToolboxHeader>
        <h3>Insert</h3>
      </ToolboxHeader>

      {sections.map(section => (
        <ToolboxSection
          key={section.title}
          title={section.title}
          items={section.items}
          connectors={connectors}
        />
      ))}
    </div>
  );
};

// Draggable item
const DraggableItem = ({ item, connectors }) => {
  return (
    <div
      ref={ref => connectors.create(
        ref,
        <Element is={builderComponents[item.type]} />
      )}
      className="toolbox-item"
    >
      {item.icon}
      <span>{item.name}</span>
    </div>
  );
};
```

---

### PHASE 8: Control Components (Looker Controls) (2 hours)

**8.1 DateRangeControl** (Example)
```tsx
// Components/Controls/DateRangeControl.tsx
export const DateRangeControl = ({
  label,
  defaultRange,
  affectsComponents
}) => {
  const { connectors, selected } = useNode();
  const [range, setRange] = useState(defaultRange);

  // When value changes, emit event to update charts
  const handleChange = (newRange) => {
    setRange(newRange);
    // Broadcast to all charts in affectsComponents
    affectsComponents.forEach(componentId => {
      actions.setProp(componentId, props => props.dateRange = newRange);
    });
  };

  return (
    <div ref={ref => connect(drag(ref))} className={selected ? 'selected' : ''}>
      <Label>{label}</Label>
      <DateRangePicker value={range} onChange={handleChange} />
    </div>
  );
};

const DateRangeControlSetup = () => {
  const { label, defaultRange, affectsComponents, actions: {setProp} } = useNode();

  return (
    <>
      <Input label="Label" value={label} onChange={v => setProp(p => p.label = v)} />
      <DateRangePicker label="Default Range" value={defaultRange} onChange={v => setProp(p => p.defaultRange = v)} />
      <ComponentSelector
        label="Affects Components"
        selected={affectsComponents}
        onChange={v => setProp(p => p.affectsComponents = v)}
      />
    </>
  );
};

DateRangeControl.craft = {
  displayName: 'Date Range Control',
  props: {
    label: 'Date Range',
    defaultRange: 'last 30 days',
    affectsComponents: []
  },
  related: {
    setup: DateRangeControlSetup,
    style: ControlStyle // Reusable style panel
  }
};
```

---

### PHASE 9: Multi-Page Support (1 hour)

```tsx
// Pages/PageManager.tsx
interface PageState {
  pages: Page[];
  currentPageId: string;
  navigation: 'left-drawer' | 'tabs' | 'dropdown' | 'hidden';
}

export const PageManager = () => {
  const [pageState, setPageState] = useState<PageState>({
    pages: [{ id: 'page-1', name: 'Page 1', canvas: null }],
    currentPageId: 'page-1',
    navigation: 'tabs'
  });

  const addPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      name: `Page ${pageState.pages.length + 1}`,
      canvas: null
    };
    setPageState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
  };

  const switchPage = (pageId) => {
    // Save current page canvas
    const currentCanvas = query.serialize();
    const updatedPages = pageState.pages.map(p =>
      p.id === pageState.currentPageId ? { ...p, canvas: currentCanvas } : p
    );

    // Load new page
    const newPage = updatedPages.find(p => p.id === pageId);
    actions.deserialize(newPage.canvas || '{}');

    setPageState(prev => ({
      ...prev,
      pages: updatedPages,
      currentPageId: pageId
    }));
  };

  return { pageState, addPage, switchPage };
};
```

---

### PHASE 10: Migration & Cleanup (1 hour)

**10.1 Database Migration**
```sql
-- Update dashboards table for Craft.js pages
UPDATE public.dashboards
SET pages = jsonb_build_array(
  jsonb_build_object(
    'id', 'page-1',
    'name', 'Page 1',
    'canvas', config
  )
)
WHERE pages IS NULL;
```

**10.2 Remove Old Code**
```bash
# Backup
git add -A
git commit -m "Backup before Craft.js migration"

# Remove
npm uninstall react-grid-layout
npm uninstall @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Clean imports
# (Done manually in affected files)
```

---

## 🎯 TIMELINE

### Day 1 (6 hours):
- ✅ Install Craft.js + dependencies
- ✅ Create folder structure
- ✅ Implement Row/Column system with + buttons
- ✅ Basic Craft.js Editor wrapper
- ✅ 1-2 example chart components

### Day 2 (6 hours):
- ✅ Settings Sidebar (Setup + Style tabs)
- ✅ All chart components (13 types)
- ✅ FieldPicker, FilterBuilder shared components
- ✅ Cube.js integration hook

### Day 3 (4 hours):
- ✅ Control components (9 types)
- ✅ Content components (4 types)
- ✅ Toolbox (left sidebar)
- ✅ Topbar with undo/redo
- ✅ Multi-page support
- ✅ Auto-save
- ✅ Testing

**Total**: 16 hours → Complete Looker Studio experience

---

## ✅ SUCCESS CRITERIA

User can:
1. Add row with + button
2. Choose column layout (Full, 1/2, 1/3, 1/4)
3. Click + in column → Choose Time Series
4. Blank chart appears
5. Right sidebar opens automatically
6. Setup tab: Select dimension (date), metric (clicks)
7. Chart shows data from Cube.js
8. Style tab: Change colors, fonts, title
9. Chart updates live
10. Add date range control
11. Add text box for title
12. Undo/Redo works
13. Create Page 2
14. Switch pages - each has own canvas
15. Save - all pages persist
16. Refresh - loads saved state
17. AI agent can do same via JSON API

---

## 🚀 READY TO START

All research complete. Plan comprehensive. Every detail covered.

**Approve to begin Day 1 implementation?**