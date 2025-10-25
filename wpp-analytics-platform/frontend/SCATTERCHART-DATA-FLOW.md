# ScatterChart Data Flow Diagram

## Complete Data Flow: Cube.js → ScatterChart → ECharts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER CONFIGURATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  <ScatterChart                                                           │
│    metrics={['GoogleAds.impressions', 'GoogleAds.clicks']}             │
│    breakdownDimension="GoogleAds.campaignName"                          │
│    filters={[{ field: 'GoogleAds.date', ... }]}                        │
│  />                                                                      │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SCATTERCHART COMPONENT                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: Build Cube.js Query                                            │
│  ─────────────────────────────                                          │
│  const queryConfig = {                                                   │
│    measures: [                                                           │
│      'GoogleAds.impressions',  // X-axis                                │
│      'GoogleAds.clicks'         // Y-axis                               │
│    ],                                                                    │
│    dimensions: ['GoogleAds.campaignName'],                              │
│    filters: [...],                                                       │
│    limit: 5000                                                           │
│  };                                                                      │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CUBE.JS API LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 2: Execute Query                                                   │
│  ──────────────────────                                                  │
│  const { resultSet } = useCubeQuery(queryConfig, { cubeApi });          │
│                                                                          │
│  Cube.js:                                                                │
│  • Loads data model (GoogleAds.js)                                      │
│  • Checks pre-aggregations                                              │
│  • Generates SQL query                                                   │
│  • Executes on BigQuery                                                  │
│  • Returns aggregated data                                               │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CUBE.JS RESPONSE FORMAT                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  resultSet.tablePivot()                                                  │
│  ──────────────────────                                                  │
│  [                                                                       │
│    {                                                                     │
│      'GoogleAds.campaignName': 'Campaign A',                            │
│      'GoogleAds.impressions': '10000',                                  │
│      'GoogleAds.clicks': '500'                                          │
│    },                                                                    │
│    {                                                                     │
│      'GoogleAds.campaignName': 'Campaign B',                            │
│      'GoogleAds.impressions': '5000',                                   │
│      'GoogleAds.clicks': '300'                                          │
│    },                                                                    │
│    {                                                                     │
│      'GoogleAds.campaignName': 'Campaign C',                            │
│      'GoogleAds.impressions': '8000',                                   │
│      'GoogleAds.clicks': '450'                                          │
│    }                                                                     │
│  ]                                                                       │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  DATA TRANSFORMATION FUNCTION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 3: prepareScatterData()                                            │
│  ─────────────────────────────                                          │
│                                                                          │
│  Input: tablePivot() array                                               │
│  Process:                                                                │
│    1. Extract xMetric = 'GoogleAds.impressions'                         │
│    2. Extract yMetric = 'GoogleAds.clicks'                              │
│    3. Extract breakdownDimension = 'GoogleAds.campaignName'             │
│    4. Group data by campaign name                                        │
│    5. Convert to coordinate pairs [x, y]                                 │
│    6. Assign colors to each series                                       │
│                                                                          │
│  Code:                                                                   │
│  ────                                                                    │
│  const groupedData = {};                                                 │
│  rawData.forEach(row => {                                                │
│    const groupKey = row['GoogleAds.campaignName'];                      │
│    const xValue = parseFloat(row['GoogleAds.impressions']);             │
│    const yValue = parseFloat(row['GoogleAds.clicks']);                  │
│    groupedData[groupKey].push([xValue, yValue]);                        │
│  });                                                                     │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   TRANSFORMED SCATTER DATA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Output: ECharts-compatible format                                       │
│  ──────────────────────────────────                                     │
│  {                                                                       │
│    series: [                                                             │
│      {                                                                   │
│        name: 'Campaign A',                                               │
│        data: [[10000, 500]],                                            │
│        color: '#5470c6'                                                  │
│      },                                                                  │
│      {                                                                   │
│        name: 'Campaign B',                                               │
│        data: [[5000, 300]],                                             │
│        color: '#91cc75'                                                  │
│      },                                                                  │
│      {                                                                   │
│        name: 'Campaign C',                                               │
│        data: [[8000, 450]],                                             │
│        color: '#fac858'                                                  │
│      }                                                                   │
│    ],                                                                    │
│    xAxisName: 'impressions',                                             │
│    yAxisName: 'clicks'                                                   │
│  }                                                                       │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ECHARTS CONFIGURATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 4: Build ECharts Option                                            │
│  ──────────────────────────────                                         │
│  const chartOption = {                                                   │
│    xAxis: {                                                              │
│      type: 'value',                                                      │
│      name: 'impressions',                                                │
│      axisLabel: {                                                        │
│        formatter: (value) => formatMetricValue(...)                     │
│      }                                                                   │
│    },                                                                    │
│    yAxis: {                                                              │
│      type: 'value',                                                      │
│      name: 'clicks',                                                     │
│      axisLabel: {                                                        │
│        formatter: (value) => formatMetricValue(...)                     │
│      }                                                                   │
│    },                                                                    │
│    series: [                                                             │
│      {                                                                   │
│        type: 'scatter',                                                  │
│        name: 'Campaign A',                                               │
│        data: [[10000, 500]],                                            │
│        symbolSize: 10,                                                   │
│        itemStyle: { color: '#5470c6', opacity: 0.7 }                    │
│      },                                                                  │
│      // ... more series                                                  │
│    ],                                                                    │
│    tooltip: {                                                            │
│      trigger: 'item',                                                    │
│      formatter: (params) => {                                            │
│        return `${params.seriesName}<br/>                                │
│                impressions: ${formatMetricValue(params.value[0])}<br/> │
│                clicks: ${formatMetricValue(params.value[1])}`;          │
│      }                                                                   │
│    },                                                                    │
│    legend: {                                                             │
│      show: true,                                                         │
│      data: ['Campaign A', 'Campaign B', 'Campaign C']                   │
│    }                                                                     │
│  };                                                                      │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ECHARTS RENDERING                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 5: Render Chart                                                    │
│  ──────────────────────                                                  │
│  <ReactECharts                                                           │
│    option={chartOption}                                                  │
│    theme={getEChartsTheme('light')}                                     │
│    style={{ height: '100%', minHeight: '250px' }}                      │
│  />                                                                      │
│                                                                          │
│  ECharts:                                                                │
│  • Calculates axis scales                                               │
│  • Positions data points                                                 │
│  • Renders scatter symbols                                               │
│  • Attaches event listeners (hover, click)                              │
│  • Animates transitions                                                  │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      VISUAL RESULT                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Campaign Performance: Impressions vs Clicks                             │
│  ─────────────────────────────────────────────────                      │
│                                                                          │
│  Clicks                                                                  │
│    │                                                                     │
│ 500├─────────────●(A)                                                   │
│    │                                                                     │
│ 450├──────────────────────●(C)                                          │
│    │                                                                     │
│ 300├──────────●(B)                                                      │
│    │                                                                     │
│    └─────────┬─────────┬─────────┬─────────► Impressions               │
│           5,000    8,000    10,000                                      │
│                                                                          │
│  Legend: ● Campaign A  ● Campaign B  ● Campaign C                       │
│                                                                          │
│  Interactive Features:                                                   │
│  • Hover over points to see tooltip with formatted values               │
│  • Click legend items to toggle series visibility                       │
│  • Points scale up on hover                                              │
│  • Smooth animations on data updates                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Format Comparison

### Before Transformation (Cube.js tablePivot)

```javascript
[
  {
    'GoogleAds.campaignName': 'Campaign A',
    'GoogleAds.impressions': '10000',
    'GoogleAds.clicks': '500'
  },
  {
    'GoogleAds.campaignName': 'Campaign B',
    'GoogleAds.impressions': '5000',
    'GoogleAds.clicks': '300'
  }
]
```

### After Transformation (ECharts format)

```javascript
[
  {
    name: 'Campaign A',
    type: 'scatter',
    data: [[10000, 500]],  // [x, y] coordinate pair
    symbolSize: 10,
    itemStyle: { color: '#5470c6' }
  },
  {
    name: 'Campaign B',
    type: 'scatter',
    data: [[5000, 300]],   // [x, y] coordinate pair
    symbolSize: 10,
    itemStyle: { color: '#91cc75' }
  }
]
```

## Key Transformation Steps

### 1. Extract Metrics
```javascript
const [xMetric, yMetric] = metrics;
// xMetric = 'GoogleAds.impressions'
// yMetric = 'GoogleAds.clicks'
```

### 2. Group by Breakdown Dimension
```javascript
const groupedData: Record<string, Array<[number, number]>> = {};

rawData.forEach(row => {
  const groupKey = row[breakdownDimension] || 'Unknown';
  const xValue = parseFloat(row[xMetric]) || 0;
  const yValue = parseFloat(row[yMetric]) || 0;

  if (!groupedData[groupKey]) {
    groupedData[groupKey] = [];
  }
  groupedData[groupKey].push([xValue, yValue]);
});

// Result:
// {
//   'Campaign A': [[10000, 500]],
//   'Campaign B': [[5000, 300]],
//   'Campaign C': [[8000, 450]]
// }
```

### 3. Create Series Array
```javascript
const series = Object.entries(groupedData).map(([name, data], index) => ({
  name,
  data,
  color: chartColors[index % chartColors.length]
}));

// Result:
// [
//   { name: 'Campaign A', data: [[10000, 500]], color: '#5470c6' },
//   { name: 'Campaign B', data: [[5000, 300]], color: '#91cc75' },
//   { name: 'Campaign C', data: [[8000, 450]], color: '#fac858' }
// ]
```

### 4. Generate Axis Names
```javascript
const xAxisName = xMetric.split('.').pop();  // 'impressions'
const yAxisName = yMetric.split('.').pop();  // 'clicks'
```

## Query Performance Flow

```
User Interaction (Select metrics)
         │
         ▼
React Component (Build query config)
         │
         ▼
useCubeQuery Hook (Send to Cube.js)
         │
         ▼
Cube.js Server
    ├─► Check pre-aggregations (if available)
    │   └─► Use cached data (instant response)
    │
    └─► Generate SQL query
        └─► Execute on BigQuery
            └─► Aggregate results
                └─► Return to client
                        │
                        ▼
                React Component (Transform data)
                        │
                        ▼
                ECharts (Render visualization)
                        │
                        ▼
                User sees chart (< 500ms)
```

## Metric Formatting Flow

```
Raw Value: 10000
         │
         ▼
formatMetricValue(10000, 'GoogleAds.impressions', metricsConfig)
         │
         ├─► Check metricsConfig for 'GoogleAds.impressions'
         │   └─► Found: { format: 'number', compact: true, decimals: 1 }
         │
         ├─► Apply format: 'number'
         ├─► Apply compact: true
         │   └─► 10000 → 10.0K
         │
         └─► Apply decimals: 1
             └─► Result: '10.0K'

Display in tooltip: "impressions: 10.0K"
Display on axis: "10.0K"
```

## Error Handling Flow

```
User Configuration
         │
         ▼
Validation Check
    │
    ├─► metrics.length < 2?
    │   └─► Show: "Select at least 2 metrics"
    │
    └─► Valid configuration
            │
            ▼
        Execute Query
            │
            ├─► Loading State
            │   └─► Show: <Loader2 />
            │
            ├─► Error State
            │   └─► Show: "Error loading data: {error.message}"
            │
            └─► Success State
                └─► Show: Chart with data
```

## Real-Time Update Flow

```
Initial Render
         │
         ▼
Cube.js Query (subscribed)
         │
         ├─► Data updates in BigQuery
         │   └─► Cube.js detects change (via refreshKey)
         │       └─► Re-executes query
         │           └─► New resultSet
         │               └─► prepareScatterData() re-runs
         │                   └─► ECharts updates visualization
         │                       └─► Smooth animation transition
         │
         └─► User sees updated chart (automatic)
```

## Memory Management

```
Component Mount
    ├─► useCubeQuery subscribes
    ├─► resultSet stored in React state
    └─► ECharts instance created

Component Update
    ├─► New resultSet received
    ├─► prepareScatterData() transforms data
    ├─► ECharts updates (no re-create)
    └─► Old data garbage collected

Component Unmount
    ├─► useCubeQuery unsubscribes
    ├─► ECharts instance disposed
    └─► Memory freed
```

## Complete Example with All Steps

```tsx
// 1. User Configuration
<ScatterChart
  metrics={['GoogleAds.impressions', 'GoogleAds.clicks']}
  breakdownDimension="GoogleAds.campaignName"
  filters={[
    { field: 'GoogleAds.date', operator: 'inDateRange', values: ['last 30 days'] }
  ]}
  metricsConfig={[
    { id: 'GoogleAds.impressions', format: 'number', compact: true },
    { id: 'GoogleAds.clicks', format: 'number', compact: false }
  ]}
/>

// 2. Query Config Built
{
  measures: ['GoogleAds.impressions', 'GoogleAds.clicks'],
  dimensions: ['GoogleAds.campaignName'],
  filters: [{ member: 'GoogleAds.date', operator: 'inDateRange', values: ['last 30 days'] }],
  limit: 5000
}

// 3. Cube.js Executes Query
SELECT
  campaign_name,
  SUM(impressions) as impressions,
  SUM(clicks) as clicks
FROM google_ads_data
WHERE date >= '2025-09-22' AND date <= '2025-10-22'
GROUP BY campaign_name
LIMIT 5000

// 4. Cube.js Returns Data
[
  { 'GoogleAds.campaignName': 'Campaign A', 'GoogleAds.impressions': '10000', 'GoogleAds.clicks': '500' },
  { 'GoogleAds.campaignName': 'Campaign B', 'GoogleAds.impressions': '5000', 'GoogleAds.clicks': '300' }
]

// 5. Transform to Scatter Format
{
  series: [
    { name: 'Campaign A', data: [[10000, 500]], color: '#5470c6' },
    { name: 'Campaign B', data: [[5000, 300]], color: '#91cc75' }
  ],
  xAxisName: 'impressions',
  yAxisName: 'clicks'
}

// 6. ECharts Renders
// Visual scatter plot with 2 series, 2 data points, interactive tooltips
```

This completes the full data flow from user configuration to visual rendering!
