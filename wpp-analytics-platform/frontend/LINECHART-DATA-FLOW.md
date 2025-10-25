# LineChart Cube.js Data Flow Diagram

## Complete Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD BUILDER UI                                 │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │  Data Source   │  │   Dimension    │  │    Metrics     │                │
│  │    Select      │  │    Select      │  │  Multi-Select  │                │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘                │
│           │                   │                    │                        │
│           └───────────────────┴────────────────────┘                        │
│                               │                                              │
└───────────────────────────────┼──────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   ComponentConfig     │
                    │   (Props Object)      │
                    └───────────┬───────────┘
                                │
                                │  {
                                │    dimension: "GoogleAds.date",
                                │    metrics: ["GoogleAds.clicks", "GoogleAds.cost"],
                                │    dateRange: { start: "2024-01-01", end: "2024-01-31" }
                                │  }
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LineChart Component                               │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Query Builder (React.useMemo)                                       │ │
│  │    ├─ Detect dimension type (date vs category)                        │ │
│  │    ├─ Build timeDimensions or dimensions                              │ │
│  │    ├─ Map filters to Cube.js format                                   │ │
│  │    └─ Return query config object                                      │ │
│  └────────┬───────────────────────────────────────────────────────────────┘ │
│           │                                                                  │
│           │  queryConfig = {                                                │
│           │    measures: ["GoogleAds.clicks", "GoogleAds.cost"],           │
│           │    timeDimensions: [{                                           │
│           │      dimension: "GoogleAds.date",                              │
│           │      granularity: "day",                                       │
│           │      dateRange: ["2024-01-01", "2024-01-31"]                  │
│           │    }]                                                           │
│           │  }                                                              │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 2. useCubeQuery Hook                                                   │ │
│  │    ├─ Send query to Cube.js API                                       │ │
│  │    ├─ Handle loading state                                            │ │
│  │    ├─ Handle error state                                              │ │
│  │    └─ Return resultSet                                                │ │
│  └────────┬───────────────────────────────────────────────────────────────┘ │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            │  resultSet.tablePivot() = [
            │    { "GoogleAds.date": "2024-01-01", "GoogleAds.clicks": 820, ... },
            │    { "GoogleAds.date": "2024-01-02", "GoogleAds.clicks": 932, ... }
            │  ]
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Cube.js Semantic Layer                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ cube('GoogleAds', {                                                    │ │
│  │   sql: `SELECT * FROM google_ads_data`,                               │ │
│  │   measures: {                                                          │ │
│  │     clicks: { type: 'sum', sql: 'clicks' },                          │ │
│  │     cost: { type: 'sum', sql: 'cost' }                               │ │
│  │   },                                                                   │ │
│  │   dimensions: {                                                        │ │
│  │     date: { type: 'time', sql: 'date' }                              │ │
│  │   }                                                                    │ │
│  │ })                                                                     │ │
│  └────────┬───────────────────────────────────────────────────────────────┘ │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            │  Generated SQL:
            │  SELECT
            │    date,
            │    SUM(clicks) as clicks,
            │    SUM(cost) as cost
            │  FROM google_ads_data
            │  WHERE date BETWEEN '2024-01-01' AND '2024-01-31'
            │  GROUP BY date
            │  ORDER BY date ASC
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BigQuery                                        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Dataset: wpp_marketing_data                                            │ │
│  │ Table: google_ads_data                                                 │ │
│  │                                                                        │ │
│  │ ┌──────────┬────────┬──────┬─────────────┬─────────────┐            │ │
│  │ │   date   │ clicks │ cost │  campaign   │   device    │            │ │
│  │ ├──────────┼────────┼──────┼─────────────┼─────────────┤            │ │
│  │ │2024-01-01│  820   │ 45.2 │ Campaign A  │   Desktop   │            │ │
│  │ │2024-01-01│  120   │ 12.1 │ Campaign A  │   Mobile    │            │ │
│  │ │2024-01-02│  932   │ 52.8 │ Campaign A  │   Desktop   │            │ │
│  │ │2024-01-02│  145   │ 15.3 │ Campaign A  │   Mobile    │            │ │
│  │ └──────────┴────────┴──────┴─────────────┴─────────────┘            │ │
│  └────────┬───────────────────────────────────────────────────────────────┘ │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            │  Query Result (aggregated):
            │  [
            │    { date: '2024-01-01', clicks: 940, cost: 57.3 },
            │    { date: '2024-01-02', clicks: 1077, cost: 68.1 },
            │    ...
            │  ]
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Back to LineChart Component                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 3. Data Transformer (React.useMemo)                                    │ │
│  │    ├─ resultSet.chartPivot() → raw data                              │ │
│  │    ├─ Extract x-axis values (dates/categories)                       │ │
│  │    ├─ Build series arrays for each metric                            │ │
│  │    └─ Return {xAxis: [], series: []}                                 │ │
│  └────────┬───────────────────────────────────────────────────────────────┘ │
│           │                                                                  │
│           │  transformedData = {                                            │
│           │    xAxis: ["2024-01-01", "2024-01-02", ...],                   │
│           │    series: [                                                    │
│           │      { name: "clicks", data: [940, 1077, ...] },              │
│           │      { name: "cost", data: [57.3, 68.1, ...] }                │
│           │    ]                                                            │
│           │  }                                                              │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 4. ECharts Option Builder (React.useMemo)                             │ │
│  │    ├─ Map xAxis data to category axis                                │ │
│  │    ├─ Configure y-axis with metric formatters                        │ │
│  │    ├─ Build series with colors and styles                            │ │
│  │    ├─ Configure tooltip with custom formatter                        │ │
│  │    └─ Return complete ECharts option object                          │ │
│  └────────┬───────────────────────────────────────────────────────────────┘ │
│           │                                                                  │
│           │  chartOption = {                                                │
│           │    xAxis: { type: 'category', data: ["Jan 1", "Jan 2", ...] },│
│           │    yAxis: { type: 'value', axisLabel: { formatter: ... } },    │
│           │    series: [                                                    │
│           │      { type: 'line', name: 'clicks', data: [940, 1077, ...],  │
│           │        lineStyle: { color: '#5470c6', width: 2 } },            │
│           │      { type: 'line', name: 'cost', data: [57.3, 68.1, ...],   │
│           │        lineStyle: { color: '#91cc75', width: 2 } }             │
│           │    ]                                                            │
│           │  }                                                              │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 5. ReactECharts Component                                              │ │
│  │    └─ Renders interactive chart with animations                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          User's Browser (DOM)                                │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         Interactive Line Chart                         │ │
│  │                                                                        │ │
│  │  ╔═══════════════════════════════════════════════════════════════╗   │ │
│  │  ║                    Campaign Performance                        ║   │ │
│  │  ╚═══════════════════════════════════════════════════════════════╝   │ │
│  │                                                                        │ │
│  │  1200┤                                          ●────●              │ │
│  │      │                                    ●────●                    │ │
│  │  1000┤                             ●────●                          │ │
│  │      │                       ●────●                                │ │
│  │   800┤                 ●────●                                      │ │
│  │      │           ●────●                                            │ │
│  │   600┤     ●────●                                                  │ │
│  │      │                                                             │ │
│  │   400┼─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────      │ │
│  │       Jan 1 Jan 5 Jan 10 Jan 15 Jan 20 Jan 25 Jan 30             │ │
│  │                                                                        │ │
│  │  ─── clicks (940 → 1330)    ─── cost ($57 → $85)                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  User Interactions:                                                          │
│  • Hover → Tooltip shows exact values                                       │
│  • Click legend → Toggle series visibility                                  │
│  • Drag → Zoom into date range (if dataZoom enabled)                       │
│  • Click data point → onDataClick callback (drill-down)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Component Lifecycle                         │
└─────────────────────────────────────────────────────────────────┘

1. Mount / Props Change
        │
        ▼
   [Props Received]
   dimension, metrics, dateRange, filters
        │
        ▼
   ┌─────────────────┐
   │ useMemo:        │ ─── Dependency: [dimension, metrics, dateRange, ...]
   │ Build Query     │
   └────────┬────────┘
            │
            ▼
   queryConfig = {
     measures: [...],
     timeDimensions: [...]
   }
            │
            ▼
   ┌─────────────────┐
   │ useCubeQuery    │ ─── Sends HTTP request to Cube.js API
   └────────┬────────┘
            │
            ├─── [Loading State] → Show spinner
            │
            ├─── [Error State] → Show error message
            │
            └─── [Success State]
                      │
                      ▼
                 resultSet object
                      │
                      ▼
   ┌─────────────────────────┐
   │ useMemo:                │ ─── Dependency: [resultSet, metrics]
   │ Transform Data          │
   │ chartPivot() → xAxis    │
   │            → series     │
   └────────┬────────────────┘
            │
            ▼
   transformedData = {
     xAxis: [...],
     series: [...]
   }
            │
            ▼
   ┌─────────────────────────┐
   │ useMemo:                │ ─── Dependency: [transformedData, chartColors, ...]
   │ Build ECharts Option    │
   └────────┬────────────────┘
            │
            ▼
   chartOption = {
     xAxis: {...},
     yAxis: {...},
     series: [...]
   }
            │
            ▼
   ┌─────────────────┐
   │ ReactECharts    │
   │ Renders Chart   │
   └─────────────────┘
            │
            ▼
   [Chart Displayed to User]
```

---

## Performance Optimization Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                  Memoization Strategy                             │
└──────────────────────────────────────────────────────────────────┘

Scenario: User changes chart title (unrelated prop)

Without Memoization:
  Title Change → Re-render
               → Rebuild queryConfig
               → Re-fetch from Cube.js (❌ expensive!)
               → Re-transform data
               → Rebuild chartOption
               → Re-render ECharts (❌ flash/flicker)

With Memoization (Current Implementation):
  Title Change → Re-render
               → Check queryConfig deps (unchanged)
               → SKIP query rebuild ✅
               → SKIP Cube.js fetch ✅
               → Check transformedData deps (unchanged)
               → SKIP data transformation ✅
               → Check chartOption deps (unchanged)
               → SKIP option rebuild ✅
               → ReactECharts receives same option object
               → ECharts SKIPS re-initialization ✅
               → Only title DOM element updates ✅

Result: Smooth, instant UI updates with zero API calls
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    Error Recovery                                 │
└──────────────────────────────────────────────────────────────────┘

Happy Path:
  Props → Query → Cube.js → BigQuery → Data → Chart ✅

Error Scenarios:

1. Invalid Dimension/Metric
   Props → Query Builder → Cube.js API
                        → 400 Bad Request
                        → useCubeQuery.error = "Invalid field name"
                        → Render Error State
                        → User sees: "Error loading data: Invalid field name"

2. No Data Returned
   Props → Query → Cube.js → BigQuery (0 rows)
                           → resultSet.tablePivot() = []
                           → transformedData = { xAxis: [], series: [] }
                           → chartOption with empty series
                           → ECharts renders empty chart with "No data"

3. Network Timeout
   Props → Query → Cube.js (request hangs)
                 → isLoading = true (indefinitely)
                 → Show spinner
                 → User can cancel/refresh

4. Missing Configuration
   Props { dimension: null, metrics: [] }
       → shouldQuery = false
       → SKIP useCubeQuery
       → Render Empty State
       → "Configure dimension and metric"
```

---

## Multi-Dimensional Query Example

```
┌──────────────────────────────────────────────────────────────────┐
│        Breakdown Analysis: Clicks by Date and Device             │
└──────────────────────────────────────────────────────────────────┘

User Configuration:
  dimension: "GoogleAds.date"
  breakdownDimension: "GoogleAds.device"
  metrics: ["GoogleAds.clicks"]
        │
        ▼
Generated Query:
{
  measures: ["GoogleAds.clicks"],
  timeDimensions: [{
    dimension: "GoogleAds.date",
    granularity: "day",
    dateRange: "last 7 days"
  }],
  dimensions: ["GoogleAds.device"]  ← Breakdown dimension
}
        │
        ▼
Cube.js → BigQuery:
SELECT
  date,
  device,
  SUM(clicks) as clicks
FROM google_ads_data
WHERE date >= CURRENT_DATE() - 7
GROUP BY date, device
ORDER BY date, device
        │
        ▼
Result:
[
  { date: '2024-01-01', device: 'Desktop', clicks: 820 },
  { date: '2024-01-01', device: 'Mobile', clicks: 120 },
  { date: '2024-01-02', device: 'Desktop', clicks: 932 },
  { date: '2024-01-02', device: 'Mobile', clicks: 145 }
]
        │
        ▼
chartPivot() Output:
[
  { x: '2024-01-01', 'GoogleAds.clicks,Desktop': 820, 'GoogleAds.clicks,Mobile': 120 },
  { x: '2024-01-02', 'GoogleAds.clicks,Desktop': 932, 'GoogleAds.clicks,Mobile': 145 }
]
        │
        ▼
Transformed Data:
{
  xAxis: ['2024-01-01', '2024-01-02'],
  series: [
    { name: 'Desktop', data: [820, 932] },
    { name: 'Mobile', data: [120, 145] }
  ]
}
        │
        ▼
Chart Renders:
Two lines (Desktop in blue, Mobile in green) showing click trends
```

---

## Token-Efficient Data Loading

```
┌──────────────────────────────────────────────────────────────────┐
│            Why Aggregation Happens in Cube.js/BigQuery           │
└──────────────────────────────────────────────────────────────────┘

❌ ANTI-PATTERN (Loading raw data into React):
BigQuery (50,000 rows) → Cube.js → React → Browser
                                           → 50MB JSON
                                           → 2s parsing
                                           → Out of memory
                                           → Browser crash

✅ CORRECT PATTERN (Aggregation in semantic layer):
BigQuery (50,000 rows) → Cube.js (GROUP BY) → React (31 rows)
                                              → 10KB JSON
                                              → <50ms parsing
                                              → Instant render

Example:
  Query: Show daily clicks for last 30 days
  Raw data: 50,000 individual ad clicks
  Aggregated: 30 rows (one per day)
  Token savings: 50,000 rows → 30 rows = 99.94% reduction
```

---

## Comparison: LineChart vs Other Chart Types

```
┌──────────────────────────────────────────────────────────────────┐
│           Chart Type Selection Decision Tree                      │
└──────────────────────────────────────────────────────────────────┘

LineChart (smooth: false)
  Use when: Sharp point-to-point connections matter
  Example: Daily exact click counts

TimeSeriesChart (smooth: true)
  Use when: Overall trend more important than exact points
  Example: Revenue trend visualization for presentations

StackedLineChart (stack: 'Total')
  Use when: Part-to-whole composition over time
  Example: Traffic by channel (organic + paid + social)

StepLineChart (step: 'start')
  Use when: Values stay constant between changes
  Example: Pricing tier changes, inventory levels

AreaLineChart (areaStyle: true)
  Use when: Emphasizing magnitude/volume
  Example: Total impressions volume over time

BarChart
  Use when: Comparing discrete categories
  Example: Campaign performance comparison (not over time)

PieChart
  Use when: Showing proportions at a single point
  Example: Current month traffic breakdown by source
```

---

## Next: Apply Same Pattern to Other Charts

```
LineChart (✅ Complete)
  ├─ Cube.js integration ✅
  ├─ Data transformation ✅
  ├─ Type-safe implementation ✅
  └─ Memoization ✅

TimeSeriesChart (TODO)
  └─ Copy LineChart, set smooth: true

StackedLineChart (TODO)
  └─ Copy LineChart, add stack: 'Total'

BarChart (TODO)
  └─ Similar pattern, change type: 'bar'

PieChart (TODO)
  └─ Different transformation (categories → pie slices)

All 40+ chart types follow same pattern:
  1. Props → useMemo(queryConfig)
  2. useCubeQuery(queryConfig)
  3. useMemo(transform resultSet)
  4. useMemo(build ECharts option)
  5. ReactECharts render
```
