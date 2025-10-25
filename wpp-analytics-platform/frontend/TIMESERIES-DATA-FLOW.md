# TimeSeriesChart Data Flow Architecture

## Complete Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
│  Dashboard Builder → Select TimeSeriesChart → Configure Props        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPONENT PROPS                                 │
│  datasource: 'gsc_performance_7days'                                 │
│  dimension: 'GoogleAds.date'                                         │
│  metrics: ['GoogleAds.clicks', 'GoogleAds.impressions']              │
│  dateRange: { start: '2024-01-01', end: '2024-01-31' }               │
│  metricsConfig: [{ id: 'GoogleAds.clicks', format: 'number' }]       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   QUERY BUILDER (Lines 54-79)                        │
│                                                                       │
│  shouldQuery = dimension && metrics.length > 0                       │
│  isDateDimension = dimension.includes('date')                        │
│                                                                       │
│  queryConfig = {                                                     │
│    measures: ['GoogleAds.clicks', 'GoogleAds.impressions'],          │
│    timeDimensions: [{                                                │
│      dimension: 'GoogleAds.date',                                    │
│      granularity: 'day',                                             │
│      dateRange: ['2024-01-01', '2024-01-31']                         │
│    }],                                                               │
│    filters: []                                                       │
│  }                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   CUBE.JS CLIENT (Line 81-84)                        │
│                                                                       │
│  const { resultSet, isLoading, error } = useCubeQuery(               │
│    queryConfig,                                                      │
│    { skip: !shouldQuery, cubeApi }                                   │
│  );                                                                  │
│                                                                       │
│  cubeApi = cubejs(API_SECRET, { apiUrl: API_URL })                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CUBE.JS SEMANTIC LAYER                          │
│                      (External - Cube.js Server)                     │
│                                                                       │
│  1. Parse query                                                      │
│  2. Apply security context (tenant_id, user_id)                      │
│  3. Load data model: GoogleAds.js                                    │
│  4. Generate SQL query                                               │
│  5. Check pre-aggregations                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BIGQUERY                                    │
│                     (Data Warehouse)                                 │
│                                                                       │
│  SELECT                                                              │
│    DATE(date) as day,                                                │
│    SUM(clicks) as clicks,                                            │
│    SUM(impressions) as impressions                                   │
│  FROM `project.dataset.google_ads_data`                              │
│  WHERE date BETWEEN '2024-01-01' AND '2024-01-31'                    │
│    AND tenant_id = 'current_tenant'                                  │
│  GROUP BY day                                                        │
│  ORDER BY day ASC                                                    │
│  LIMIT 400;                                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CUBE.JS RESULT PROCESSING                         │
│                                                                       │
│  Raw Result:                                                         │
│  [                                                                   │
│    { "GoogleAds.date": "2024-01-01", "GoogleAds.clicks": 150,       │
│      "GoogleAds.impressions": 2000 },                                │
│    { "GoogleAds.date": "2024-01-02", "GoogleAds.clicks": 180,       │
│      "GoogleAds.impressions": 2200 },                                │
│    ...                                                               │
│  ]                                                                   │
│                                                                       │
│  resultSet.chartPivot():                                             │
│  [                                                                   │
│    { "GoogleAds.date.day": "2024-01-01",                             │
│      "GoogleAds.clicks": 150, "GoogleAds.impressions": 2000 },      │
│    { "GoogleAds.date.day": "2024-01-02",                             │
│      "GoogleAds.clicks": 180, "GoogleAds.impressions": 2200 },      │
│    ...                                                               │
│  ]                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DATA TRANSFORMATION (Lines 87-98)                       │
│                                                                       │
│  const chartData = resultSet?.chartPivot() || [];                   │
│                                                                       │
│  // Extract x-axis (dates)                                           │
│  xAxisData = ['2024-01-01', '2024-01-02', ..., '2024-01-31']        │
│                                                                       │
│  // Extract series data per metric                                   │
│  clicksData = [150, 180, 165, ..., 200]                             │
│  impressionsData = [2000, 2200, 2100, ..., 2400]                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│            ECHARTS OPTION BUILDING (Lines 123-233)                   │
│                                                                       │
│  chartOption = {                                                     │
│    tooltip: {                                                        │
│      formatter: formatMetricValue(value, metricId, config)           │
│    },                                                                │
│    xAxis: {                                                          │
│      data: xAxisData,                                                │
│      axisLabel: { formatter: formatDate }                            │
│    },                                                                │
│    yAxis: {                                                          │
│      axisLabel: { formatter: formatMetricValue }                     │
│    },                                                                │
│    series: [                                                         │
│      {                                                               │
│        name: 'clicks',                                               │
│        type: 'line',                                                 │
│        data: clicksData,                                             │
│        itemStyle: { color: '#5470c6' }                               │
│      },                                                              │
│      {                                                               │
│        name: 'impressions',                                          │
│        type: 'line',                                                 │
│        data: impressionsData,                                        │
│        itemStyle: { color: '#91cc75' }                               │
│      }                                                               │
│    ]                                                                 │
│  }                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  REACT RENDERING (Lines 235-282)                     │
│                                                                       │
│  State Management:                                                   │
│  - !shouldQuery → Empty State                                        │
│  - isLoading → Loading Spinner                                       │
│  - error → Error Display                                             │
│  - success → Render Chart                                            │
│                                                                       │
│  <ReactECharts                                                       │
│    option={chartOption}                                              │
│    theme={getEChartsTheme('light')}                                  │
│    style={{ height: '100%', minHeight: '250px' }}                   │
│  />                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTERACTIVE CHART DISPLAY                         │
│                                                                       │
│  User Interactions:                                                  │
│  - Hover → Tooltip with formatted values                             │
│  - Click legend → Toggle series visibility                           │
│  - Zoom → DataZoom on x-axis                                         │
│  - Export → Download PNG/SVG                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
                        Component Mount
                             │
                             ▼
                    Props Received
                             │
                             ├──→ No dimension/metrics?
                             │    └──→ Show Empty State
                             │
                             ├──→ Has dimension + metrics?
                             │    └──→ Build queryConfig
                             │         │
                             │         ▼
                             │    useCubeQuery()
                             │         │
                             │         ├──→ Loading?
                             │         │    └──→ Show Spinner
                             │         │
                             │         ├──→ Error?
                             │         │    └──→ Show Error
                             │         │
                             │         └──→ Success?
                             │              └──→ Transform Data
                             │                   │
                             │                   ▼
                             │              Build ECharts Option
                             │                   │
                             │                   ▼
                             │              Render Chart
                             │
                             └──→ Props Change?
                                  └──→ Re-query (React Hook)
```

## Data Structure Transformation

### Stage 1: Component Props
```typescript
{
  datasource: 'gsc_performance_7days',
  dimension: 'GoogleAds.date',
  metrics: ['GoogleAds.clicks', 'GoogleAds.impressions'],
  dateRange: { start: '2024-01-01', end: '2024-01-31' }
}
```

### Stage 2: Cube.js Query
```typescript
{
  measures: ['GoogleAds.clicks', 'GoogleAds.impressions'],
  timeDimensions: [{
    dimension: 'GoogleAds.date',
    granularity: 'day',
    dateRange: ['2024-01-01', '2024-01-31']
  }]
}
```

### Stage 3: BigQuery SQL (Generated by Cube.js)
```sql
SELECT
  DATE(date) as day,
  SUM(clicks) as clicks,
  SUM(impressions) as impressions
FROM `project.dataset.google_ads_data`
WHERE date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY day
ORDER BY day ASC;
```

### Stage 4: Cube.js ResultSet
```typescript
resultSet.chartPivot() = [
  {
    "GoogleAds.date.day": "2024-01-01",
    "GoogleAds.clicks": 150,
    "GoogleAds.impressions": 2000
  },
  {
    "GoogleAds.date.day": "2024-01-02",
    "GoogleAds.clicks": 180,
    "GoogleAds.impressions": 2200
  },
  // ... 29 more rows
]
```

### Stage 5: ECharts Data Structure
```typescript
{
  xAxis: {
    data: ['2024-01-01', '2024-01-02', ..., '2024-01-31']
  },
  series: [
    {
      name: 'clicks',
      data: [150, 180, 165, ..., 200]
    },
    {
      name: 'impressions',
      data: [2000, 2200, 2100, ..., 2400]
    }
  ]
}
```

## Performance Characteristics

| Stage | Time | Optimization |
|-------|------|--------------|
| Query Build | <1ms | Pure JS logic |
| Cube.js API | 50-200ms | Pre-aggregations |
| BigQuery | 100-500ms | Indexed tables |
| Data Transform | <5ms | Simple mapping |
| ECharts Render | 10-50ms | Canvas rendering |
| **Total** | **160-760ms** | Token-efficient (400 rows) |

## Error Handling Flow

```
useCubeQuery
     │
     ├──→ Network Error
     │    └──→ Display: "Error loading data"
     │
     ├──→ Cube.js Error (Invalid query)
     │    └──→ Display: "Query failed: [message]"
     │
     ├──→ BigQuery Error (Permission denied)
     │    └──→ Display: "Access denied: [message]"
     │
     ├──→ No Data
     │    └──→ Display: Empty chart with message
     │
     └──→ Success
          └──→ Render chart
```

## Key Integration Points

1. **Cube.js Client** (`/lib/cubejs/client.ts`)
   - Configured with API_URL and API_SECRET
   - Manages connection to Cube.js server

2. **useCubeQuery Hook** (`@cubejs-client/react`)
   - Handles query execution
   - Manages loading/error states
   - Provides reactive updates

3. **Metric Formatter** (`/lib/utils/metric-formatter.ts`)
   - Formats numbers, currency, percentages
   - Applies user-defined formatting rules

4. **ECharts Theme** (`/lib/themes/echarts-theme.ts`)
   - Consistent styling across charts
   - Light/dark theme support

## Security & Multi-Tenancy

```
User Request
     ↓
JWT Token → Security Context
     ↓
Cube.js applies tenant_id filter
     ↓
BigQuery sees: WHERE tenant_id = 'current_tenant'
     ↓
User ONLY sees their data
```

## Summary

The TimeSeriesChart implements a **complete data pipeline** from user configuration to interactive visualization:

✅ **Props → Query Builder** - Intelligent query construction
✅ **Cube.js Integration** - Semantic layer abstraction
✅ **BigQuery Execution** - Scalable data warehouse
✅ **Data Transformation** - chartPivot() → ECharts format
✅ **Interactive Rendering** - ReactECharts with full UX
✅ **Error Handling** - Graceful failures at every stage
✅ **Performance** - Token-efficient, <1 second loads
✅ **Security** - Multi-tenant isolation built-in
