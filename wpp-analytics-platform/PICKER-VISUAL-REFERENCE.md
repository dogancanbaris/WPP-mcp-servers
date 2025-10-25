# Picker Components - Visual Reference

This document shows the visual design of the enhanced LayoutPicker and ComponentPicker modals.

---

## LayoutPicker Modal

### Overall Layout
```
┌─────────────────────────────────────────────────────┐
│  Choose Row Layout                            [X]   │
│  Select a column configuration for this row         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  [≡] Single      │  │  [⫴] Two Columns │       │
│  │  ████████████████ │  │  ████████ ████████│      │
│  │  Full width...   │  │  Two equal...     │       │
│  │  [1 column]      │  │  [2 columns]      │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  [⫴] 1/3 + 2/3   │  │  [⫴] 2/3 + 1/3   │       │
│  │  █████ ███████████│  │  ███████████ █████│      │
│  │  Narrow left...  │  │  Wide left...     │       │
│  │  [2 columns]     │  │  [2 columns]      │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  [⋮] Three Cols  │  │  [⋮] Four Cols    │       │
│  │  █████ █████ █████│  │  ████ ████ ████ ████│   │
│  │  Three equal...  │  │  Four equal...    │       │
│  │  [3 columns]     │  │  [4 columns]      │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Individual Layout Card (Hover State)
```
┌──────────────────────────────────┐
│  [≡] Two Columns (Equal)         │ ← Icon + Title
│                                  │
│  ┌─────────────────────────────┐│
│  │  ████████ ████████          ││ ← ASCII Preview
│  └─────────────────────────────┘│
│                                  │
│  Two equal columns, 50-50 split │ ← Description
│                                  │
│  [2 columns]                     │ ← Badge
└──────────────────────────────────┘
```

### Hover Effects
- Border: Gray → Blue
- Background: Transparent → Light Blue
- Icon: Gray → Blue
- Smooth 200ms transition

---

## ComponentPicker Modal

### Overall Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Add Component                                        [X]   │
│  Choose a chart, control, or content element                │
├─────────────────────────────────────────────────────────────┤
│  [🔍] Search components...                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┬──────────┐                         │
│  │ Charts  │ Controls │ Content  │ ← Tabs                   │
│  │  (13)   │   (0)    │   (0)    │                          │
│  └─────────┴──────────┴──────────┘                         │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │   📊    │ │   📈    │ │   🥧    │                       │
│  │ Bar     │ │ Line    │ │ Pie     │                       │
│  │ Chart   │ │ Chart   │ │ Chart   │                       │
│  │         │ │         │ │         │                       │
│  │Compare  │ │Show     │ │Show     │                       │
│  │values...│ │trends...│ │parts... │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │   📉    │ │   🎯    │ │   🔥    │                       │
│  │ Area    │ │ Scatter │ │ Heatmap │                       │
│  │ Chart   │ │ Chart   │ │         │                       │
│  │         │ │         │ │         │                       │
│  │Display  │ │Show     │ │Visualize│                       │
│  │cumul... │ │correl...│ │density..│                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│                                                             │
│  ... (more components, scrollable)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Individual Component Card
```
┌───────────────────┐
│                   │
│       📊          │ ← Icon (8x8, large)
│                   │
│    Bar Chart      │ ← Label (bold)
│                   │
│  Compare values   │ ← Description
│  across categories│   (2 lines max)
│                   │
└───────────────────┘
```

### Tab Views

#### Charts Tab (Active)
```
┌──────────────────────────────────────────┐
│ [Charts (13)] Controls (0)  Content (0) │
└──────────────────────────────────────────┘

Grid of 13 chart types:
1. Bar Chart
2. Line Chart
3. Pie Chart
4. Area Chart
5. Scatter Chart
6. Heatmap
7. Radar Chart
8. Funnel Chart
9. Table
10. Scorecard
11. Gauge Chart
12. Treemap
13. Time Series
```

#### Controls Tab (Placeholder)
```
┌──────────────────────────────────────────┐
│ Charts (13) [Controls (0)]  Content (0) │
└──────────────────────────────────────────┘

      ┌─────────┐
      │   🎛️   │
      └─────────┘

   Controls coming soon

   Date filters, dropdowns, and
   more will be available here
```

#### Content Tab (Placeholder)
```
┌──────────────────────────────────────────┐
│ Charts (13) Controls (0)  [Content (0)] │
└──────────────────────────────────────────┘

      ┌─────────┐
      │   📦   │
      └─────────┘

   Content elements coming soon

   Text, images, and rich content
   will be available here
```

### Search Functionality

#### Active Search
```
┌──────────────────────────────────────────┐
│  [🔍] time                               │ ← User typing "time"
└──────────────────────────────────────────┘

Results shown:
- Time Series Chart (matches label)
- Line Chart (tagged with "time")
```

#### No Results
```
┌──────────────────────────────────────────┐
│  [🔍] nonexistent                        │
└──────────────────────────────────────────┘

      ┌─────────┐
      │   🔍   │
      └─────────┘

   No charts found matching
   "nonexistent"
```

---

## Color Palette

### Light Mode
```
Background:     #ffffff
Card Background: #f9fafb (hover: #eff6ff)
Border:         #e5e7eb (hover: #3b82f6)
Text Primary:   #111827
Text Secondary: #6b7280
Icon:           #6b7280 (hover: #2563eb)
Badge BG:       #f3f4f6 (hover: #dbeafe)
Badge Text:     #374151 (hover: #1e40af)
```

### Dark Mode
```
Background:     #0f172a
Card Background: #1e293b (hover: #1e3a8a/50)
Border:         #475569 (hover: #3b82f6)
Text Primary:   #f1f5f9
Text Secondary: #94a3b8
Icon:           #94a3b8 (hover: #60a5fa)
Badge BG:       #1e293b (hover: #1e3a8a/50)
Badge Text:     #cbd5e1 (hover: #93c5fd)
```

---

## Spacing & Sizing

### LayoutPicker
- Dialog width: 700px max
- Card padding: 16px (p-4)
- Grid gap: 16px (gap-4)
- Icon size: 20px (w-5 h-5)
- Border width: 2px
- Border radius: 8px (rounded-lg)

### ComponentPicker
- Dialog width: 900px max
- Dialog height: 85vh max
- Card padding: 16px (p-4)
- Grid gap: 12px (gap-3)
- Grid columns: 3
- Icon size: 32px (w-8 h-8)
- Border width: 2px
- Border radius: 8px (rounded-lg)
- Content scroll height: 50vh max

---

## Responsive Behavior

### Desktop (>= 640px)
- LayoutPicker: 2 columns
- ComponentPicker: 3 columns
- Full dialog width

### Tablet (640px - 1024px)
- LayoutPicker: 2 columns
- ComponentPicker: 2 columns
- Adjusted dialog width

### Mobile (< 640px)
- LayoutPicker: 1 column
- ComponentPicker: 1 column
- Full-width dialogs
- Reduced padding

---

## Animation & Transitions

### Dialog Open/Close
- Fade in: 200ms
- Zoom in: 95% → 100%
- Overlay fade: 0 → 50% opacity

### Hover States
- Duration: 200ms
- Easing: ease-in-out
- Properties: border-color, background-color, color

### Tab Switching
- Instant content swap
- No animation (for performance)
- Active tab indicator slides

---

## Icon Reference

### Layout Icons (lucide-react)
- Columns: Single column
- Columns2: Two columns
- Columns3: Three columns
- Columns4: Four columns

### Chart Icons (lucide-react)
- BarChart3: Bar chart
- LineChart: Line chart
- PieChart: Pie chart
- AreaChart: Area chart
- ScatterChart: Scatter chart
- Activity: Heatmap
- Radar: Radar chart
- Filter: Funnel chart
- Table: Table
- Hash: Scorecard
- Gauge: Gauge chart
- TreePine: Treemap
- Clock: Time series

### UI Icons (lucide-react)
- Search: Search input
- Layers: Controls tab
- Box: Content tab

---

## Accessibility Features

### Keyboard Navigation
- Tab: Move between elements
- Enter/Space: Activate buttons
- Escape: Close dialog
- Arrow keys: Navigate tabs

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on dialogs
- Button roles explicit
- Tab roles via Radix UI

### Visual Accessibility
- Sufficient color contrast (WCAG AA)
- Focus indicators visible
- Large click targets (min 44x44px)
- Clear visual hierarchy

---

## Integration Example

### Using LayoutPicker
```tsx
import { LayoutPicker } from '@/components/dashboard-builder/canvas';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);

  const handleLayoutSelect = (widths: ColumnWidth[]) => {
    console.log('Selected layout:', widths);
    // Example: ['1/2', '1/2']
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Choose Layout
      </button>

      <LayoutPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleLayoutSelect}
      />
    </>
  );
}
```

### Using ComponentPicker
```tsx
import { ComponentPicker } from '@/components/dashboard-builder/ComponentPicker';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);

  const handleComponentSelect = (type: ComponentType) => {
    console.log('Selected component:', type);
    // Example: 'bar-chart'
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Add Component
      </button>

      <ComponentPicker
        onSelect={handleComponentSelect}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}
```

---

## Performance Considerations

### Optimization Techniques
1. **Memoization**: useMemo for filtered components
2. **Lazy Loading**: Icons loaded on demand
3. **CSS Transitions**: Hardware-accelerated
4. **Virtual Scrolling**: Not needed (< 20 items)

### Bundle Impact
- lucide-react (tree-shakeable): ~2KB per icon
- Radix UI Dialog: ~8KB
- Total component size: ~12KB (gzipped)

---

*This visual reference serves as a design specification for the picker components.*
*All measurements and styles are implemented in the actual code.*
