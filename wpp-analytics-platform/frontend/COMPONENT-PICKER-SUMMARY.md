# ComponentPicker - Complete Component Library

**File:** `/frontend/src/components/dashboard-builder/ComponentPicker.tsx`

## Overview
Updated ComponentPicker with **48 total components** organized in 3 categories with search functionality and tabbed interface.

## Component Breakdown

### 📊 Charts (31)

#### Basic Charts (4)
1. **Bar Chart** - Compare values across categories
2. **Horizontal Bar** - Horizontal bar chart for long labels
3. **Line Chart** - Show trends over time
4. **Area Chart** - Display cumulative totals over time (includes stacked)

#### Circular Charts (3)
5. **Pie Chart** - Show parts of a whole
6. **Donut Chart** - Pie chart with center hollow
7. **Gauge Chart** - Display progress toward a goal

#### Scatter & Correlation (2)
8. **Scatter Chart** - Show correlations between variables
9. **Bubble Chart** - 3D scatter plot with sized bubbles

#### Heatmaps (2)
10. **Heatmap** - Visualize data density and patterns
11. **Calendar Heatmap** - GitHub-style calendar showing daily activity

#### Multi-Dimensional (3)
12. **Radar Chart** - Compare multiple variables on axes
13. **Polar Chart** - Circular bar chart with radial axes
14. **Parallel Coordinates** - Multi-dimensional data visualization

#### Hierarchical & Nested (3)
15. **Treemap** - Show hierarchical data as nested rectangles
16. **Sunburst Chart** - Circular hierarchical visualization
17. **Sankey Diagram** - Show flow between categories

#### Specialized Charts (5)
18. **Funnel Chart** - Show conversion rates and stages
19. **Waterfall Chart** - Show cumulative effect of sequential values
20. **Candlestick Chart** - Financial data with open/close/high/low
21. **Box Plot** - Statistical distribution visualization
22. **Violin Plot** - Distribution with density curve

#### Time-Based (2)
23. **Time Series** - Analyze time-based patterns with zoom
24. **Gantt Chart** - Project timeline and task scheduling

#### Network & Relationships (2)
25. **Network Graph** - Visualize relationships and networks
26. **Chord Diagram** - Show relationships between entities

#### Geographic (2)
27. **Choropleth Map** - Geographic data visualization
28. **Geo Bubble Map** - Bubbles on geographic map

#### Data Tables & Metrics (3)
29. **Data Table** - Display data in rows and columns
30. **Scorecard** - Show key metrics and KPIs
31. **Pivot Table** - Interactive multi-dimensional data table

---

### 🎛️ Controls (11)

1. **Date Picker** - Select a single date
2. **Date Range Picker** - Select start and end dates
3. **Dropdown** - Single-select dropdown menu
4. **Multi-Select** - Multiple selection dropdown
5. **Slider** - Numeric range slider
6. **Text Input** - Free-form text input field
7. **Number Input** - Numeric input field
8. **Toggle Switch** - Boolean on/off switch
9. **Radio Group** - Single selection from options
10. **Checkbox Group** - Multiple selection checkboxes
11. **Search Box** - Search input with autocomplete

---

### 📝 Content (6)

1. **Text Block** - Rich text content block
2. **Heading** - Section title or heading
3. **Image** - Static image or logo
4. **Video** - Embedded video player
5. **Divider** - Horizontal line separator
6. **iFrame** - Embed external content

---

## Features

### 🔍 Search Functionality
- Real-time search across component names, descriptions, and tags
- Case-insensitive matching
- Shows "No results" message when search returns empty

### 🗂️ Tabbed Categories
- **Charts Tab** - 31 visualization components
- **Controls Tab** - 11 interactive filter components
- **Content Tab** - 6 content layout components
- Component counts displayed in tab labels: `Charts (31)`

### 🎨 Visual Design
- **3-column grid layout** for optimal browsing
- **Icon-based cards** with hover effects
- **Lucide icons** for visual identification
- **Scrollable content area** (max-height: 50vh)
- **Responsive hover states** with color transitions

### 📦 Component Cards
Each card displays:
- Large icon (8x8) representing the component
- Component name
- Brief description (2 lines max with ellipsis)
- Hover effect with blue border and background

### 🏷️ Tags System
Every component has searchable tags for improved discoverability:
- Example: `bar_chart` has tags: `['bar', 'compare', 'categories', 'vertical']`
- Example: `calendar_heatmap` has tags: `['calendar', 'heatmap', 'daily', 'activity', 'github', 'contributions']`

---

## Usage Example

```tsx
import { ComponentPicker } from '@/components/dashboard-builder/ComponentPicker';

function DashboardBuilder() {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelectComponent = (type: ComponentType) => {
    // Add component to dashboard
    addComponent(type);
    setShowPicker(false);
  };

  return (
    <>
      <Button onClick={() => setShowPicker(true)}>
        Add Component
      </Button>

      {showPicker && (
        <ComponentPicker
          onSelect={handleSelectComponent}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
```

---

## Icon Library

Uses **Lucide React** icons:
- `BarChart3`, `BarChart4` - Bar charts
- `LineChart` - Line charts
- `PieChart` - Pie charts
- `AreaChart` - Area charts
- `ScatterChart` - Scatter plots
- `Activity` - Heatmaps, violin plots
- `Radar` - Radar charts
- `Filter` - Funnel charts
- `Table` - Data tables
- `Hash` - Scorecards
- `Gauge` - Gauge charts
- `TreePine` - Treemaps
- `Clock` - Time series
- `Calendar`, `CalendarRange` - Date pickers
- `Search` - Search functionality
- `Type` - Text inputs
- `Image`, `Video` - Media content
- `Box`, `Layers` - Layout and grouping
- `Network` - Network graphs
- `TrendingUp` - Waterfall charts
- `GitBranch` - Sankey diagrams
- `Sparkles` - Bubble charts
- `Binary` - Number inputs
- `CircleDot` - Donut, polar, chord charts
- `BoxSelect` - Multi-select, checkboxes, box plots
- `Boxes` - Toggles
- `Columns3` - Parallel coordinates
- `Grid3x3` - Pivot tables
- `MapPin`, `Globe` - Geographic maps
- `Target` - Polar charts
- `Code2` - Dividers
- `Sliders` - Sliders
- `FileText`, `Heading`, `List`, `FileCode` - Content elements

---

## Next Steps

1. **Type Definitions** - Ensure all 48 component types are in `/frontend/src/types/dashboard-builder.ts`
2. **Component Implementations** - Create placeholder components for each type
3. **Data Configuration** - Add data binding UI for each component type
4. **Styling Configuration** - Add appearance customization panels
5. **Preview System** - Add live preview of each component in picker

---

## File Location
`/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/ComponentPicker.tsx`

**Total Lines:** ~650
**Total Components:** 48 (31 + 11 + 6)
**Search:** ✅ Enabled
**Tabs:** ✅ 3 categories
**Icons:** ✅ All components
