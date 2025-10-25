# RadarChart - Cube.js Integration Architecture

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                   RadarChart Component                         │ │
│  │                                                                 │ │
│  │  Props:                                                         │ │
│  │  - datasource: "gsc_performance"                               │ │
│  │  - dimension: "GSCPerformance.query"                           │ │
│  │  - metrics: ["clicks", "impressions"]                          │ │
│  │  - dateRange: { start, end }                                   │ │
│  │  - filters: [...]                                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT / CUBE.JS LAYER                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  useCubeQuery Hook                                             │ │
│  │                                                                 │ │
│  │  Query Config:                                                  │ │
│  │  {                                                              │ │
│  │    measures: ["GSCPerformance.clicks"],                        │ │
│  │    dimensions: ["GSCPerformance.query"],                       │ │
│  │    timeDimensions: [{                                          │ │
│  │      dimension: "GSCPerformance.date",                         │ │
│  │      dateRange: ["2024-09-22", "2024-10-22"]                   │ │
│  │    }],                                                          │ │
│  │    filters: [...],                                             │ │
│  │    limit: 50,                                                  │ │
│  │    order: { "GSCPerformance.clicks": "desc" }                  │ │
│  │  }                                                              │ │
│  │                                                                 │ │
│  │  Returns: { resultSet, isLoading, error }                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      CUBE.JS CLIENT SDK                             │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  @cubejs-client/core                                           │ │
│  │                                                                 │ │
│  │  HTTP Request:                                                  │ │
│  │  POST http://localhost:4000/cubejs-api/v1/load                 │ │
│  │  Authorization: Bearer <API_SECRET>                            │ │
│  │  Content-Type: application/json                                │ │
│  │                                                                 │ │
│  │  Body: { query: {...} }                                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    CUBE.JS SEMANTIC LAYER                           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Cube Model: GSCPerformance                                    │ │
│  │                                                                 │ │
│  │  cube('GSCPerformance', {                                      │ │
│  │    sql: `SELECT * FROM gsc_performance`,                       │ │
│  │                                                                 │ │
│  │    dimensions: {                                               │ │
│  │      query: { sql: 'query', type: 'string' },                 │ │
│  │      device: { sql: 'device', type: 'string' },               │ │
│  │      date: { sql: 'date', type: 'time' }                      │ │
│  │    },                                                           │ │
│  │                                                                 │ │
│  │    measures: {                                                 │ │
│  │      clicks: { sql: 'clicks', type: 'sum' },                  │ │
│  │      impressions: { sql: 'impressions', type: 'sum' },        │ │
│  │      ctr: {                                                    │ │
│  │        sql: `SAFE_DIVIDE(SUM(clicks), SUM(impressions))*100`, │ │
│  │        type: 'number'                                          │ │
│  │      }                                                          │ │
│  │    },                                                           │ │
│  │                                                                 │ │
│  │    preAggregations: { ... }                                    │ │
│  │  })                                                             │ │
│  │                                                                 │ │
│  │  Generates SQL ↓                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         BIGQUERY / DATABASE                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Generated SQL Query:                                          │ │
│  │                                                                 │ │
│  │  SELECT                                                         │ │
│  │    query,                                                       │ │
│  │    SUM(clicks) as clicks,                                      │ │
│  │    SUM(impressions) as impressions                             │ │
│  │  FROM `project.dataset.gsc_performance`                        │ │
│  │  WHERE date >= '2024-09-22' AND date <= '2024-10-22'           │ │
│  │  GROUP BY query                                                │ │
│  │  ORDER BY clicks DESC                                          │ │
│  │  LIMIT 50                                                       │ │
│  │                                                                 │ │
│  │  Result: 50 rows × 3 columns = ~5KB                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA TRANSFORMATION                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  RadarChart Component (continued)                              │ │
│  │                                                                 │ │
│  │  Step 1: Extract dimension values                              │ │
│  │  const dimensionValues = chartData.slice(0, 8).map(d => d.x)  │ │
│  │  → ["seo tools", "analytics", "marketing", ...]               │ │
│  │                                                                 │ │
│  │  Step 2: Calculate max values for indicators                   │ │
│  │  const maxValues = {                                           │ │
│  │    "seo tools": 1500,                                          │ │
│  │    "analytics": 1200,                                          │ │
│  │    ...                                                          │ │
│  │  }                                                              │ │
│  │                                                                 │ │
│  │  Step 3: Build radar indicators (axes)                         │ │
│  │  const indicators = [                                          │ │
│  │    { name: "seo tools", max: 1500 },                          │ │
│  │    { name: "analytics", max: 1200 },                          │ │
│  │    ...                                                          │ │
│  │  ]                                                              │ │
│  │                                                                 │ │
│  │  Step 4: Build series data                                     │ │
│  │  const seriesData = [                                          │ │
│  │    {                                                            │ │
│  │      name: "clicks",                                           │ │
│  │      value: [1500, 1200, 800, ...],                           │ │
│  │      itemStyle: { color: "#5470c6" }                           │ │
│  │    },                                                           │ │
│  │    {                                                            │ │
│  │      name: "impressions",                                      │ │
│  │      value: [25000, 20000, 15000, ...],                       │ │
│  │      itemStyle: { color: "#91cc75" }                           │ │
│  │    }                                                            │ │
│  │  ]                                                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      ECHARTS RENDERING                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  ECharts Option:                                               │ │
│  │                                                                 │ │
│  │  {                                                              │ │
│  │    backgroundColor: 'transparent',                             │ │
│  │    tooltip: {                                                  │ │
│  │      trigger: 'item',                                          │ │
│  │      formatter: (params) => {                                  │ │
│  │        return formatMetricValue(params.value, metricId)        │ │
│  │      }                                                          │ │
│  │    },                                                           │ │
│  │    legend: { show: true, bottom: 0 },                         │ │
│  │    radar: {                                                    │ │
│  │      indicator: [                                              │ │
│  │        { name: "seo tools", max: 1500 },                      │ │
│  │        { name: "analytics", max: 1200 }                        │ │
│  │      ],                                                         │ │
│  │      shape: 'polygon',                                         │ │
│  │      splitNumber: 4                                            │ │
│  │    },                                                           │ │
│  │    series: [{                                                  │ │
│  │      type: 'radar',                                            │ │
│  │      data: seriesData                                          │ │
│  │    }]                                                           │ │
│  │  }                                                              │ │
│  │                                                                 │ │
│  │  ReactECharts renders interactive radar chart                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         VISUAL OUTPUT                               │
│                                                                     │
│              ┌─────────────────────────────────┐                   │
│              │      Top Search Queries         │                   │
│              │                                  │                   │
│              │            seo tools             │                   │
│              │               ╱╲                 │                   │
│              │              ╱  ╲                │                   │
│              │             ╱    ╲               │                   │
│              │   marketing      analytics       │                   │
│              │            ╲    ╱                │                   │
│              │             ╲  ╱                 │                   │
│              │              ╲╱                  │                   │
│              │           web design             │                   │
│              │                                  │                   │
│              │  Legend: □ clicks  □ impressions │                   │
│              └─────────────────────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component State Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Component Lifecycle                        │
└──────────────────────────────────────────────────────────────┘
                          │
                          ↓
           ┌──────────────────────────────┐
           │  Component Mounts             │
           │  - Props received             │
           │  - Check shouldQuery          │
           └──────────────────────────────┘
                          │
                          ↓
            ┌─────────────────────────────┐
            │  Is Configuration Valid?    │
            └─────────────────────────────┘
                    │           │
               No   │           │  Yes
                    ↓           ↓
      ┌──────────────────┐  ┌─────────────────────┐
      │  Show Empty State │  │  Build Query Config │
      │  "Configure..."   │  │  - measures          │
      └──────────────────┘  │  - dimensions        │
                             │  - filters           │
                             │  - timeDimensions    │
                             └─────────────────────┘
                                      │
                                      ↓
                             ┌─────────────────┐
                             │  useCubeQuery   │
                             │  isLoading=true │
                             └─────────────────┘
                                      │
                                      ↓
                          ┌──────────────────────┐
                          │  Show Loading State  │
                          │  (Spinner)           │
                          └──────────────────────┘
                                      │
                                      ↓
                        ┌─────────────────────────┐
                        │  API Call to Cube.js    │
                        │  POST /cubejs-api/v1/   │
                        └─────────────────────────┘
                                      │
                        ┌─────────────┴──────────────┐
                        │                            │
                   Success                        Error
                        │                            │
                        ↓                            ↓
           ┌─────────────────────┐       ┌────────────────────┐
           │  resultSet received │       │  Show Error State  │
           │  isLoading=false    │       │  "Error loading    │
           └─────────────────────┘       │   data..."         │
                        │                 └────────────────────┘
                        ↓
           ┌─────────────────────┐
           │  Transform Data      │
           │  - Extract dims      │
           │  - Calc max values   │
           │  - Build indicators  │
           │  - Build series      │
           └─────────────────────┘
                        │
                        ↓
           ┌─────────────────────┐
           │  Build ECharts Opt  │
           │  - tooltip config    │
           │  - legend config     │
           │  - radar config      │
           │  - series config     │
           └─────────────────────┘
                        │
                        ↓
           ┌─────────────────────┐
           │  Render Chart        │
           │  ReactECharts        │
           └─────────────────────┘
                        │
                        ↓
           ┌─────────────────────┐
           │  User Interaction    │
           │  - Hover tooltips    │
           │  - Legend toggle     │
           │  - Chart animations  │
           └─────────────────────┘
```

## Query Optimization Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    Query Optimization Layers                   │
└────────────────────────────────────────────────────────────────┘

Layer 1: Component Level
┌──────────────────────────────────────────┐
│  RadarChart limits:                      │
│  - Query limit: 50 rows                  │
│  - Display limit: 8 dimensions           │
│  - Series limit: 6 breakdown values      │
│  Result: Max 50 rows queried             │
└──────────────────────────────────────────┘
                    ↓
Layer 2: Cube.js Query
┌──────────────────────────────────────────┐
│  Query optimizations:                    │
│  - Aggregations at DB level              │
│  - Efficient joins                       │
│  - Index utilization                     │
│  Result: ~100-300ms query time           │
└──────────────────────────────────────────┘
                    ↓
Layer 3: Pre-Aggregations (Optional)
┌──────────────────────────────────────────┐
│  Pre-computed rollups:                   │
│  - Hourly refresh                        │
│  - Common dimensions pre-grouped         │
│  - Stored in cache layer                 │
│  Result: <50ms query time                │
└──────────────────────────────────────────┘
                    ↓
Layer 4: BigQuery
┌──────────────────────────────────────────┐
│  BigQuery optimizations:                 │
│  - Partitioned tables (by date)          │
│  - Clustered columns                     │
│  - Materialized views                    │
│  Result: Fast scan of billions of rows   │
└──────────────────────────────────────────┘

Total: Component loads in <2 seconds
Token Efficiency: ~5KB response (50 rows × 3 cols)
Cost Efficiency: Minimal BigQuery bytes scanned
```

## Multi-Scenario Data Transformation

### Scenario 1: Single Metric, No Breakdown

```
Input Data (from Cube.js):
┌──────────────┬────────┐
│ query        │ clicks │
├──────────────┼────────┤
│ "seo tools"  │ 1500   │
│ "analytics"  │ 1200   │
│ "marketing"  │ 800    │
└──────────────┴────────┘

Transform Logic:
1. dimensionValues = ["seo tools", "analytics", "marketing"]
2. indicators = [
     { name: "seo tools", max: 1500 },
     { name: "analytics", max: 1200 },
     { name: "marketing", max: 800 }
   ]
3. seriesData = [
     { name: "clicks", value: [1500, 1200, 800] }
   ]

Output (Radar Chart):
     seo tools (1500)
          ╱╲
         ╱  ╲
        ╱    ╲
marketing   analytics
  (800)      (1200)
```

### Scenario 2: Multiple Metrics, No Breakdown

```
Input Data:
┌──────────────┬────────┬─────────────┬──────┐
│ query        │ clicks │ impressions │ ctr  │
├──────────────┼────────┼─────────────┼──────┤
│ "seo tools"  │ 1500   │ 25000       │ 6.0  │
│ "analytics"  │ 1200   │ 20000       │ 6.0  │
└──────────────┴────────┴─────────────┴──────┘

Transform Logic:
1. dimensionValues = ["seo tools", "analytics"]
2. indicators = [
     { name: "seo tools", max: 25000 },
     { name: "analytics", max: 20000 }
   ]
3. seriesData = [
     { name: "clicks", value: [1500, 1200], color: "#5470c6" },
     { name: "impressions", value: [25000, 20000], color: "#91cc75" },
     { name: "ctr", value: [6.0, 6.0], color: "#fac858" }
   ]

Output (Radar Chart):
  3 overlapping radar lines (one per metric)
  Different colors for each metric
  Legend: □ clicks  □ impressions  □ ctr
```

### Scenario 3: Single Metric, With Breakdown

```
Input Data:
┌──────────────┬─────────┬────────┐
│ query        │ device  │ clicks │
├──────────────┼─────────┼────────┤
│ "seo tools"  │ DESKTOP │ 1000   │
│ "seo tools"  │ MOBILE  │ 500    │
│ "analytics"  │ DESKTOP │ 800    │
│ "analytics"  │ MOBILE  │ 400    │
└──────────────┴─────────┴────────┘

Transform Logic:
1. dimensionValues = ["seo tools", "analytics"]
2. breakdownValues = ["DESKTOP", "MOBILE"]
3. For each breakdown value, extract data per dimension
4. seriesData = [
     {
       name: "DESKTOP",
       value: [1000, 800],  // seo tools, analytics
       color: "#5470c6"
     },
     {
       name: "MOBILE",
       value: [500, 400],   // seo tools, analytics
       color: "#91cc75"
     }
   ]

Output (Radar Chart):
  2 overlapping radar lines (DESKTOP vs MOBILE)
  Legend: □ DESKTOP  □ MOBILE
  Compare same queries across devices
```

## Performance Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│              Performance Metrics to Monitor                  │
└─────────────────────────────────────────────────────────────┘

Query Performance
├─ Cube.js query time: <300ms (with pre-aggs) or <3s (without)
├─ Network latency: <100ms
├─ Data transfer size: <10KB
└─ API rate limit: Monitor for throttling

Component Performance
├─ Initial render: <500ms
├─ Re-render on interaction: <16ms (60 FPS)
├─ Memory usage: <5MB per chart
└─ CPU usage: <5% during idle

User Experience
├─ Time to interactive: <2s
├─ Smooth animations: 60 FPS
├─ Responsive at all viewports: ✅
└─ No layout shifts: CLS < 0.1
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Error Scenarios                            │
└──────────────────────────────────────────────────────────────┘

1. Invalid Configuration
   ↓
   ┌─────────────────────────┐
   │  No dimension/metrics   │
   │  → Show empty state     │
   │  "Configure..."         │
   └─────────────────────────┘

2. Network Error
   ↓
   ┌─────────────────────────┐
   │  API unreachable        │
   │  → Show error state     │
   │  "Error loading data"   │
   │  → Retry mechanism      │
   └─────────────────────────┘

3. Invalid Query
   ↓
   ┌─────────────────────────┐
   │  Cube.js returns error  │
   │  → Parse error message  │
   │  → Display to user      │
   │  → Log to console       │
   └─────────────────────────┘

4. Empty Result Set
   ↓
   ┌─────────────────────────┐
   │  Query successful but   │
   │  no data returned       │
   │  → Show "No data"       │
   │  → Suggest filter adj.  │
   └─────────────────────────┘

5. Data Transformation Error
   ↓
   ┌─────────────────────────┐
   │  Invalid data structure │
   │  → Fallback rendering   │
   │  → Log error            │
   │  → Show partial data    │
   └─────────────────────────┘
```

## Security & Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│              Authentication & Authorization                   │
└──────────────────────────────────────────────────────────────┘

1. Component Level
   ↓
   ┌──────────────────────────┐
   │  Environment variables   │
   │  - API_URL               │
   │  - API_SECRET            │
   │  (Not exposed to client) │
   └──────────────────────────┘
           ↓
2. Cube.js Client SDK
   ↓
   ┌──────────────────────────┐
   │  Add Authorization       │
   │  header to all requests  │
   │  Bearer <API_SECRET>     │
   └──────────────────────────┘
           ↓
3. Cube.js Server
   ↓
   ┌──────────────────────────┐
   │  Validate token          │
   │  Check permissions       │
   │  Apply row-level         │
   │  security (RLS)          │
   └──────────────────────────┘
           ↓
4. Database Layer
   ↓
   ┌──────────────────────────┐
   │  Multi-tenant filtering  │
   │  WHERE tenant_id = ?     │
   │  Prevent cross-tenant    │
   │  data access             │
   └──────────────────────────┘
```

## Caching Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    Caching Layers                             │
└──────────────────────────────────────────────────────────────┘

Layer 1: Browser Cache
┌─────────────────────────────┐
│  React Query Cache          │
│  - 5 minute TTL             │
│  - Automatic invalidation   │
│  - Shared across components │
└─────────────────────────────┘
         ↓
Layer 2: CDN Cache
┌─────────────────────────────┐
│  Static assets cached       │
│  - JS bundles               │
│  - CSS files                │
│  - Long TTL (1 year)        │
└─────────────────────────────┘
         ↓
Layer 3: Cube.js Cache
┌─────────────────────────────┐
│  Query result cache         │
│  - 1 hour TTL               │
│  - Redis backend            │
│  - Automatic refresh        │
└─────────────────────────────┘
         ↓
Layer 4: Pre-Aggregations
┌─────────────────────────────┐
│  Pre-computed rollups       │
│  - Daily/hourly refresh     │
│  - Stored in DB             │
│  - 100x faster queries      │
└─────────────────────────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: October 22, 2024
**Component**: RadarChart with Cube.js Integration
