# TreeChart Component - Visual Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         TreeChart Component                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Props Configuration                      │ │
│  │                                                             │ │
│  │  • dimension (GSC.page, GoogleAds.campaignPath)           │ │
│  │  • metrics (clicks, impressions, cost)                    │ │
│  │  • treeLayout ('orthogonal' | 'radial')                   │ │
│  │  • treeOrientation ('LR' | 'RL' | 'TB' | 'BT')           │ │
│  │  • nodeMetric (metric for node sizing)                    │ │
│  │  • expandLevel (1-5)                                       │ │
│  │  • filters, dateRange, styling props                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Cube.js Query Builder                     │ │
│  │                                                             │ │
│  │  const queryConfig = {                                     │ │
│  │    measures: metrics,                                      │ │
│  │    dimensions: [dimension],                                │ │
│  │    filters: [...dateRange, ...customFilters],             │ │
│  │    order: { [metrics[0]]: 'desc' },                       │ │
│  │    limit: 100  // Token efficiency                        │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  useCubeQuery Hook                          │ │
│  │                                                             │ │
│  │  const { resultSet, isLoading, error } = useCubeQuery()   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Data Processing (useMemo)                      │ │
│  │                                                             │ │
│  │  Flat Data → Hierarchical Tree Structure                   │ │
│  │                                                             │ │
│  │  Input: [                                                   │ │
│  │    { x: '/products/electronics/laptops', clicks: 1000 },   │ │
│  │    { x: '/products/electronics/phones', clicks: 800 },     │ │
│  │    { x: '/products/furniture/chairs', clicks: 500 }        │ │
│  │  ]                                                          │ │
│  │                                                             │ │
│  │  Output: {                                                  │ │
│  │    name: 'Root',                                            │ │
│  │    children: [                                              │ │
│  │      {                                                      │ │
│  │        name: 'products',                                    │ │
│  │        children: [                                          │ │
│  │          {                                                  │ │
│  │            name: 'electronics',                             │ │
│  │            children: [                                      │ │
│  │              { name: 'laptops', value: 1000, metrics: {} }, │ │
│  │              { name: 'phones', value: 800, metrics: {} }    │ │
│  │            ]                                                │ │
│  │          },                                                 │ │
│  │          {                                                  │ │
│  │            name: 'furniture',                               │ │
│  │            children: [                                      │ │
│  │              { name: 'chairs', value: 500, metrics: {} }    │ │
│  │            ]                                                │ │
│  │          }                                                  │ │
│  │        ]                                                    │ │
│  │      }                                                      │ │
│  │    ]                                                        │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 ECharts Option Builder                      │ │
│  │                                                             │ │
│  │  • Configure tree series type                              │ │
│  │  • Set layout (orthogonal/radial)                          │ │
│  │  • Configure node sizing based on metrics                  │ │
│  │  • Setup tooltips with formatted values                    │ │
│  │  • Configure expand/collapse behavior                      │ │
│  │  • Apply styling (colors, borders, shadows)                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 ReactECharts Renderer                       │ │
│  │                                                             │ │
│  │  <ReactECharts option={chartOption} theme={...} />         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Layout Comparison

### Orthogonal Layout - Left to Right (LR)

```
                  Root
                   │
        ┌──────────┼──────────┐
        │                     │
    Products              About
        │                     │
   ┌────┴────┐               │
   │         │               │
Electronics Furniture     Contact
   │
┌──┴──┐
│     │
Laptops Phones
```

### Orthogonal Layout - Top to Bottom (TB)

```
                 Root
                  │
        ┌─────────┴─────────┐
        │                   │
    Products              About
        │                   │
   ┌────┴────┐             │
   │         │             │
Electronics Furniture   Contact
   │
┌──┴──┐
│     │
Laptops Phones
```

### Radial Layout

```
               Laptops
                  │
              Electronics ──┐
                  │         │
              Products ── Root ── About ── Contact
                  │
              Furniture
                  │
               Chairs
```

## Node Sizing Logic

```
┌──────────────────────────────────────────────────────────────┐
│                    Node Size Calculation                      │
│                                                               │
│  Base Size: symbolSize prop (default: 12px)                  │
│                                                               │
│  If nodeMetric is specified:                                 │
│    minSize = symbolSize * 0.6    (e.g., 7.2px)              │
│    maxSize = symbolSize * 2      (e.g., 24px)               │
│                                                               │
│    ratio = node.value / max(all node values)                 │
│    finalSize = minSize + (maxSize - minSize) * ratio         │
│                                                               │
│  If nodeMetric is null:                                      │
│    All nodes = symbolSize (uniform)                          │
│                                                               │
│  Example:                                                     │
│    Node A: 1000 clicks → 24px (largest)                      │
│    Node B: 500 clicks  → 15.6px (medium)                     │
│    Node C: 100 clicks  → 8.76px (smallest)                   │
└──────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Component States                         │
│                                                               │
│  1. EMPTY STATE                                               │
│     ↓                                                         │
│     • No dimension or metrics configured                      │
│     • Display: "Configure dimension and metric"               │
│     • Action: User configures props                           │
│                                                               │
│  2. LOADING STATE                                             │
│     ↓                                                         │
│     • Cube.js query executing                                 │
│     • Display: Loader2 spinner                                │
│     • Duration: Typically <2 seconds                          │
│                                                               │
│  3. SUCCESS STATE (with data)                                 │
│     ↓                                                         │
│     • resultSet populated                                     │
│     • Tree data built                                         │
│     • Chart rendered                                          │
│     • User can interact                                       │
│                                                               │
│  4. SUCCESS STATE (no data)                                   │
│     ↓                                                         │
│     • Query returned 0 rows                                   │
│     • Display: "No data available"                            │
│     • Suggestion: Adjust filters                              │
│                                                               │
│  5. ERROR STATE                                               │
│     ↓                                                         │
│     • Cube.js query failed                                    │
│     • Display: Error message                                  │
│     • Color: Red error styling                                │
└──────────────────────────────────────────────────────────────┘
```

## Data Transformation Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│               STEP 1: Cube.js Query Result                    │
│                                                               │
│  [                                                            │
│    {                                                          │
│      "GSC.page": "/products/electronics/laptops",            │
│      "GSC.clicks": 1000,                                     │
│      "GSC.impressions": 50000,                               │
│      "GSC.ctr": 0.02                                         │
│    },                                                         │
│    {                                                          │
│      "GSC.page": "/products/electronics/phones",             │
│      "GSC.clicks": 800,                                      │
│      "GSC.impressions": 40000,                               │
│      "GSC.ctr": 0.02                                         │
│    }                                                          │
│  ]                                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│               STEP 2: Parse Paths                             │
│                                                               │
│  "/products/electronics/laptops" → ["products", "electronics", "laptops"]  │
│  "/products/electronics/phones"  → ["products", "electronics", "phones"]   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│          STEP 3: Build Hierarchical Structure                 │
│                                                               │
│  {                                                            │
│    name: "Root",                                              │
│    children: [                                                │
│      {                                                        │
│        name: "products",                                      │
│        children: [                                            │
│          {                                                    │
│            name: "electronics",                               │
│            children: [                                        │
│              {                                                │
│                name: "laptops",                               │
│                value: 1000,                                   │
│                metrics: {                                     │
│                  "GSC.clicks": 1000,                          │
│                  "GSC.impressions": 50000,                    │
│                  "GSC.ctr": 0.02                              │
│                },                                             │
│                fullPath: "/products/electronics/laptops"      │
│              },                                               │
│              {                                                │
│                name: "phones",                                │
│                value: 800,                                    │
│                metrics: { ... }                               │
│              }                                                │
│            ]                                                  │
│          }                                                    │
│        ]                                                      │
│      }                                                        │
│    ]                                                          │
│  }                                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│            STEP 4: ECharts Tree Rendering                     │
│                                                               │
│  • Draw nodes as circles                                      │
│  • Size based on value (if nodeMetric set)                    │
│  • Draw lines connecting parent-child                         │
│  • Apply colors from palette                                  │
│  • Position labels                                            │
│  • Enable expand/collapse                                     │
│  • Attach tooltips                                            │
└──────────────────────────────────────────────────────────────┘
```

## Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      User Interactions                        │
│                                                               │
│  1. HOVER OVER NODE                                           │
│     ↓                                                         │
│     • Node border thickens (2px → 3px)                        │
│     • Shadow appears (10px blur)                              │
│     • Connected lines emphasized                              │
│     • Tooltip displays:                                       │
│       - Node name                                             │
│       - Full path (if available)                              │
│       - All metrics with formatting                           │
│                                                               │
│  2. CLICK ON NODE (with children)                             │
│     ↓                                                         │
│     • If collapsed: Expand children (750ms animation)         │
│     • If expanded: Collapse children (750ms animation)        │
│     • Update layout dynamically                               │
│     • Maintain viewport position                              │
│                                                               │
│  3. ZOOM (if roam=true)                                       │
│     ↓                                                         │
│     • Mouse wheel: Zoom in/out                                │
│     • Touch pinch: Zoom in/out                                │
│     • Smooth scaling animation                                │
│     • Min zoom: 10%, Max zoom: 1000%                          │
│                                                               │
│  4. PAN (if roam=true)                                        │
│     ↓                                                         │
│     • Click-drag: Move viewport                               │
│     • Touch-drag: Move viewport                               │
│     • No boundaries (infinite pan)                            │
└──────────────────────────────────────────────────────────────┘
```

## Tooltip Structure

```
┌────────────────────────────────────────┐
│  Tooltip Content                       │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Node Name (Bold)                 │ │
│  │                                  │ │
│  │ Full Path (Gray, Small)          │ │
│  │ /products/electronics/laptops    │ │
│  │                                  │ │
│  │ Metrics:                         │ │
│  │ • clicks: 1,000                  │ │
│  │ • impressions: 50,000            │ │
│  │ • ctr: 2.00%                     │ │
│  │ • position: #5.2                 │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

## Performance Optimization Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                Performance Optimization                       │
│                                                               │
│  1. QUERY OPTIMIZATION                                        │
│     • Limit: 100 nodes (token efficiency)                     │
│     • Pre-aggregations in Cube.js                             │
│     • Server-side filtering                                   │
│                                                               │
│  2. RENDERING OPTIMIZATION                                    │
│     • useMemo for tree building (only rebuild when data changes) │
│     • Canvas renderer (faster than SVG for many nodes)        │
│     • Progressive rendering (expand level control)            │
│                                                               │
│  3. INTERACTION OPTIMIZATION                                  │
│     • Hardware-accelerated animations                         │
│     • Debounced zoom/pan                                      │
│     • Virtual scrolling (large trees)                         │
│                                                               │
│  4. MEMORY OPTIMIZATION                                       │
│     • Cleanup on unmount                                      │
│     • No memory leaks (proper event listener management)      │
│     • Efficient data structures                               │
└──────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│              External Dependencies                            │
│                                                               │
│  @cubejs-client/react                                         │
│  ├─ useCubeQuery hook                                         │
│  └─ cubeApi client instance                                   │
│                                                               │
│  echarts-for-react                                            │
│  └─ ReactECharts component                                    │
│                                                               │
│  @/lib/cubejs/client                                          │
│  └─ cubeApi configuration                                     │
│                                                               │
│  @/lib/themes/echarts-theme                                   │
│  └─ getEChartsTheme function                                  │
│                                                               │
│  @/types/dashboard-builder                                    │
│  └─ ComponentConfig interface                                 │
│                                                               │
│  @/lib/utils/metric-formatter                                 │
│  └─ formatMetricValue function                                │
│                                                               │
│  lucide-react                                                 │
│  └─ Loader2 icon                                              │
└──────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

```
┌──────────────────────────────────────────────────────────────┐
│               Responsive Design Strategy                      │
│                                                               │
│  MOBILE (320px - 767px)                                       │
│  ├─ Radial layout preferred (more compact)                    │
│  ├─ Smaller symbolSize (8-10px)                               │
│  ├─ Touch-optimized interactions                              │
│  └─ Simplified tooltips                                       │
│                                                               │
│  TABLET (768px - 1023px)                                      │
│  ├─ Both layouts work well                                    │
│  ├─ Standard symbolSize (12px)                                │
│  ├─ Touch and mouse support                                   │
│  └─ Full tooltips                                             │
│                                                               │
│  DESKTOP (1024px+)                                            │
│  ├─ Orthogonal layout optimal                                 │
│  ├─ Larger symbolSize (14-16px)                               │
│  ├─ Mouse-optimized interactions                              │
│  └─ Enhanced tooltips                                         │
│                                                               │
│  4K (2560px+)                                                 │
│  ├─ Maximum detail                                            │
│  ├─ Largest symbolSize (18-20px)                              │
│  └─ More nodes visible without scroll                         │
└──────────────────────────────────────────────────────────────┘
```

This visual architecture document provides a comprehensive understanding of how the TreeChart component works, from data flow to user interactions.
