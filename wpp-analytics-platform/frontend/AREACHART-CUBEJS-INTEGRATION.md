# AreaChart + Cube.js Integration Guide

## Executive Summary

✅ **STATUS: FULLY INTEGRATED**

The AreaChart component (`/frontend/src/components/dashboard-builder/charts/AreaChart.tsx`) is **completely integrated** with Cube.js semantic layer. This document explains the implementation, demonstrates usage, and provides testing instructions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     WPP Analytics Platform                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        │                                                     │
        ▼                                                     ▼
┌───────────────┐                                    ┌───────────────┐
│   Frontend    │                                    │  Cube Backend │
│  (React/Next) │◄─────── HTTP/WebSocket ──────────►│   (Semantic   │
│               │                                    │     Layer)    │
└───────────────┘                                    └───────────────┘
        │                                                     │
        │ useCubeQuery()                                     │ SQL
        │ @cubejs-client/react                               │ Queries
        │                                                     │
        ▼                                                     ▼
┌───────────────┐                                    ┌───────────────┐
│  AreaChart    │                                    │   BigQuery    │
│  Component    │                                    │   (Data Lake) │
└───────────────┘                                    └───────────────┘
        │
        │ ReactECharts
        │
        ▼
┌───────────────┐
│  ECharts 5.6  │
│ Visualization │
└───────────────┘
```

---

## File Locations

### Frontend Files
- **AreaChart Component:** `/frontend/src/components/dashboard-builder/charts/AreaChart.tsx` (197 lines)
- **Cube.js Client:** `/frontend/src/lib/cubejs/client.ts` (10 lines)
- **Metric Formatter:** `/frontend/src/lib/utils/metric-formatter.ts` (82 lines)
- **ECharts Theme:** `/frontend/src/lib/themes/echarts-theme.ts` (83 lines)
- **Types:** `/frontend/src/types/dashboard-builder.ts` (136 lines)
- **Environment:** `/frontend/.env.local`
- **Test Page:** `/frontend/src/app/test-area-chart/page.tsx` (NEW - comprehensive tests)

### Backend Files
- **Cube.js Config:** `/cube-backend/cube.js`
- **Environment:** `/cube-backend/.env`
- **GSC Data Model:** `/cube-backend/schema/GscPerformance7days.js` (190 lines)
- **Orders Demo Model:** `/cube-backend/model/cubes/orders.yml`

---

## Dependencies

### Frontend Package.json
```json
{
  "dependencies": {
    "@cubejs-client/core": "^1.3.82",
    "@cubejs-client/react": "^1.3.82",
    "echarts": "^5.6.0",
    "echarts-for-react": "^3.0.2",
    "react": "19.1.0",
    "next": "15.5.6"
  }
}
```

All dependencies are **installed and working** ✅

---

## Configuration

### Frontend Environment Variables
```bash
# /frontend/.env.local
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=wpp_analytics_secret_key_2025_do_not_share
```

### Backend Environment Variables
```bash
# /cube-backend/.env
CUBEJS_DB_TYPE=bigquery
CUBEJS_DB_BQ_PROJECT_ID=mcp-servers-475317
CUBEJS_DB_BQ_KEY_FILE=/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json
CUBEJS_API_SECRET=wpp_analytics_secret_key_2025_do_not_share
CUBEJS_DEV_MODE=true
CUBEJS_WEB_SOCKETS=true
CUBEJS_CORS_ALLOW_ORIGIN=http://localhost:3000
```

---

## Implementation Details

### 1. Cube.js Client Initialization

**File:** `/frontend/src/lib/cubejs/client.ts`
```typescript
import cubejs from '@cubejs-client/core';

export const cubeApi = cubejs(
  process.env.NEXT_PUBLIC_CUBEJS_API_SECRET!,
  {
    apiUrl: process.env.NEXT_PUBLIC_CUBEJS_API_URL!
  }
);
```

### 2. AreaChart Component Integration

**File:** `/frontend/src/components/dashboard-builder/charts/AreaChart.tsx`

#### Core Query Logic (Lines 52-79)
```typescript
// Build Cube.js query configuration
const queryConfig: any = shouldQuery
  ? {
      measures: metrics,  // e.g., ['GscPerformance7days.clicks']

      // Handle time dimensions vs regular dimensions
      ...(isDateDimension ? {
        timeDimensions: [{
          dimension: dimension,  // e.g., 'GscPerformance7days.date'
          granularity: 'day',
          dateRange: dateRange
            ? [dateRange.start, dateRange.end]
            : 'last 30 days'
        }],
        dimensions: breakdownDimension ? [breakdownDimension] : []
      } : {
        dimensions: [dimension, breakdownDimension].filter(Boolean)
      }),

      // Apply filters
      filters: filters?.map(f => ({
        member: f.field,
        operator: f.operator,
        values: f.values
      })) || []
    }
  : null;

// Execute query using Cube.js React hook
const { resultSet, isLoading, error } = useCubeQuery(queryConfig, {
  skip: !shouldQuery,
  cubeApi
});

// Transform data for ECharts
const chartData = resultSet?.chartPivot() || [];
```

#### Chart Rendering (Lines 103-158)
```typescript
const chartOption = {
  backgroundColor: 'transparent',

  // Interactive tooltip
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
    formatter: (params: any) => {
      // Custom formatting using metric configuration
      let tooltipHtml = `<div><strong>${params[0].axisValue}</strong></div>`;
      params.forEach((param: any, idx: number) => {
        const metricId = metrics[idx];
        const formattedValue = formatMetricValue(param.value, metricId, metricsConfig);
        tooltipHtml += `<div>${param.marker} ${param.seriesName}: ${formattedValue}</div>`;
      });
      return tooltipHtml;
    }
  },

  // X-axis configuration
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: chartData.map((d: any) => d.x)
  },

  // Y-axis with formatted labels
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => formatMetricValue(value, metrics[0], metricsConfig)
    }
  },

  // Multi-series support
  series: metrics.map((metric, index) => ({
    data: chartData.map((d: any) => d[metric]),
    type: 'line',
    smooth: true,
    name: metric.split('.').pop(),
    areaStyle: { opacity: 0.5 },
    itemStyle: { color: chartColors[index % chartColors.length] },
    lineStyle: { width: 2 },
    emphasis: { focus: 'series' }
  }))
};
```

### 3. Metric Formatting

**File:** `/frontend/src/lib/utils/metric-formatter.ts`

Supports:
- **Number:** Standard numeric formatting with commas
- **Currency:** USD with customizable decimals
- **Percent:** Percentage with % suffix
- **Duration:** HH:MM:SS format
- **Compact:** 1.2K, 3.4M notation for large numbers

Example:
```typescript
formatMetricValue(1250000, 'GscPerformance7days.impressions', [
  {
    id: 'GscPerformance7days.impressions',
    format: 'number',
    decimals: 0,
    compact: true
  }
])
// Returns: "1.3M"
```

---

## Available Data Models

### 1. GscPerformance7days Cube

**File:** `/cube-backend/schema/GscPerformance7days.js`

**Measures:**
- `clicks` - Total clicks (sum)
- `impressions` - Total impressions (sum)
- `avgCtr` - Average CTR (percentage)
- `avgPosition` - Average position (lower is better)

**Dimensions:**
- `date` - Time dimension (TIMESTAMP)
- `query` - Search query (string, high cardinality)
- `page` - Landing page (string, high cardinality)
- `device` - Device type (string, low cardinality: DESKTOP, MOBILE, TABLET)
- `country` - Country code (string, medium cardinality)

**BigQuery Table:**
```
mcp-servers-475317.wpp_marketing.gsc_performance_7days
```

### 2. Orders Cube (Demo)

**File:** `/cube-backend/model/cubes/orders.yml`

**Measures:**
- `count` - Order count
- `totalAmount` - Total revenue

**Dimensions:**
- `status` - Order status (new, processed, shipped)

---

## Usage Examples

### Example 1: Single Metric Time Series
```tsx
<AreaChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance7days.date"
  metrics={['GscPerformance7days.clicks']}
  dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
  title="Daily Clicks"
  chartColors={['#3b82f6']}
/>
```

**Generated Cube.js Query:**
```json
{
  "measures": ["GscPerformance7days.clicks"],
  "timeDimensions": [{
    "dimension": "GscPerformance7days.date",
    "granularity": "day",
    "dateRange": ["2025-10-15", "2025-10-22"]
  }]
}
```

### Example 2: Multiple Metrics
```tsx
<AreaChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance7days.date"
  metrics={[
    'GscPerformance7days.clicks',
    'GscPerformance7days.impressions',
    'GscPerformance7days.avgCtr'
  ]}
  dateRange={{ start: '2025-09-22', end: '2025-10-22' }}
  title="Multi-Metric Analysis"
  showLegend={true}
  chartColors={['#3b82f6', '#10b981', '#f59e0b']}
  metricsConfig={[
    {
      id: 'GscPerformance7days.clicks',
      format: 'number',
      decimals: 0,
      compact: true
    },
    {
      id: 'GscPerformance7days.avgCtr',
      format: 'percent',
      decimals: 2
    }
  ]}
/>
```

### Example 3: With Breakdown Dimension
```tsx
<AreaChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance7days.date"
  breakdownDimension="GscPerformance7days.device"
  metrics={['GscPerformance7days.clicks']}
  dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
  title="Clicks by Device"
/>
```

**Generated Cube.js Query:**
```json
{
  "measures": ["GscPerformance7days.clicks"],
  "timeDimensions": [{
    "dimension": "GscPerformance7days.date",
    "granularity": "day",
    "dateRange": ["2025-10-15", "2025-10-22"]
  }],
  "dimensions": ["GscPerformance7days.device"]
}
```

### Example 4: With Filters
```tsx
<AreaChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance7days.date"
  metrics={['GscPerformance7days.clicks']}
  filters={[
    {
      field: 'GscPerformance7days.device',
      operator: 'equals',
      values: ['MOBILE']
    },
    {
      field: 'GscPerformance7days.country',
      operator: 'equals',
      values: ['USA', 'GBR']
    }
  ]}
  title="Mobile Clicks (USA + GBR)"
/>
```

---

## Component Props

### Data Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasource` | `string` | `'gsc_performance_7days'` | Cube name |
| `dimension` | `string \| null` | `null` | Primary dimension (x-axis) |
| `breakdownDimension` | `string \| null` | `null` | Secondary dimension for segmentation |
| `metrics` | `string[]` | `[]` | Array of measure names |
| `filters` | `FilterConfig[]` | `[]` | Query filters |
| `dateRange` | `DateRangeConfig` | `undefined` | Date range for time series |

### Visual Styling
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Area Chart'` | Chart title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `backgroundColor` | `string` | `'#ffffff'` | Background color |
| `showBorder` | `boolean` | `true` | Show/hide border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderRadius` | `number` | `8` | Border radius (px) |
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `chartColors` | `string[]` | `['#5470c6', ...]` | Series colors |
| `metricsConfig` | `MetricStyleConfig[]` | `[]` | Metric formatting rules |

---

## Testing

### Method 1: Run Test Page (Recommended)

1. **Start Cube.js Backend:**
   ```bash
   cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/cube-backend
   npm run dev
   # Server starts on http://localhost:4000
   ```

2. **Start Frontend:**
   ```bash
   cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/frontend
   npm run dev
   # Server starts on http://localhost:3000
   ```

3. **Open Test Page:**
   ```
   http://localhost:3000/test-area-chart
   ```

4. **Verify Tests:**
   - ✅ Test 1: Basic time series rendering
   - ✅ Test 2: Multiple metrics in one chart
   - ✅ Test 3: Custom styling (borders, shadows, colors)
   - ✅ Test 4: Orders cube data (demo)
   - ✅ Test 5: Error handling (invalid cube)
   - ✅ Test 6: Unconfigured state message

### Method 2: Dashboard Builder

1. Navigate to dashboard builder
2. Add AreaChart component
3. Configure data source and metrics
4. Verify real-time rendering

### Method 3: Direct Component Test
```tsx
import { AreaChart } from '@/components/dashboard-builder/charts/AreaChart';

function MyDashboard() {
  return (
    <AreaChart
      dimension="GscPerformance7days.date"
      metrics={['GscPerformance7days.clicks']}
      dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
    />
  );
}
```

---

## Debugging

### Check Cube.js Backend Status
```bash
curl http://localhost:4000/readyz
# Should return: {"health":"HEALTH"}
```

### Test Cube.js Query Directly
```bash
curl -H "Authorization: wpp_analytics_secret_key_2025_do_not_share" \
  -G "http://localhost:4000/cubejs-api/v1/load" \
  --data-urlencode 'query={"measures":["GscPerformance7days.clicks"],"timeDimensions":[{"dimension":"GscPerformance7days.date","granularity":"day","dateRange":"last 7 days"}]}'
```

### Check Browser Console
1. Open DevTools (F12)
2. Check Network tab for `/cubejs-api/v1/load` requests
3. Verify response data structure
4. Check Console tab for errors

### Common Issues

**Issue:** "Cannot connect to Cube.js API"
- **Solution:** Verify `NEXT_PUBLIC_CUBEJS_API_URL` matches backend port
- Check CORS configuration in `/cube-backend/.env`

**Issue:** "Cube not found: GscPerformance7days"
- **Solution:** Ensure cube file exists in `/cube-backend/schema/`
- Restart Cube.js backend after schema changes

**Issue:** "Chart shows no data"
- **Solution:** Verify BigQuery table exists and has data
- Check BigQuery credentials in `/cube-backend/.env`
- Test query in Cube.js Developer Playground (http://localhost:4000)

---

## Performance Optimization

### 1. Pre-Aggregations
Add to Cube.js data model for faster queries:

```javascript
// In /cube-backend/schema/GscPerformance7days.js
preAggregations: {
  dailyMetrics: {
    measures: [clicks, impressions, avgCtr],
    dimensions: [device, country],
    timeDimension: date,
    granularity: 'day',
    refreshKey: {
      every: '1 hour'
    }
  }
}
```

### 2. Query Result Caching
Cube.js automatically caches query results. Configure in `/cube-backend/cube.js`:

```javascript
module.exports = {
  schemaPath: 'schema',
  cacheAndQueueDriver: 'memory',
  // For production, use Redis:
  // cacheAndQueueDriver: 'redis',
  // redis: {
  //   url: process.env.REDIS_URL
  // }
};
```

### 3. Limit Data Points
For large time ranges, use coarser granularity:

```tsx
// Instead of daily for 1 year (365 points):
timeDimensions: [{
  dimension: 'GscPerformance7days.date',
  granularity: 'day',
  dateRange: 'last year'
}]

// Use weekly (52 points):
timeDimensions: [{
  dimension: 'GscPerformance7days.date',
  granularity: 'week',
  dateRange: 'last year'
}]
```

---

## Next Steps

### 1. Add More Data Models
Create cubes for other BigQuery tables:

```bash
cd /cube-backend/schema
# Create new cube file
touch GoogleAds.js
```

Example:
```javascript
cube('GoogleAds', {
  sql: `SELECT * FROM \`mcp-servers-475317.wpp_marketing.google_ads_performance\``,

  measures: {
    cost: { sql: 'cost', type: 'sum' },
    clicks: { sql: 'clicks', type: 'sum' },
    conversions: { sql: 'conversions', type: 'sum' }
  },

  dimensions: {
    campaignName: { sql: 'campaign_name', type: 'string' },
    date: { sql: 'CAST(date AS TIMESTAMP)', type: 'time' }
  }
});
```

### 2. Build Multi-Platform Dashboards
Combine multiple cubes in one dashboard:

```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Google Search Console */}
  <AreaChart
    dimension="GscPerformance7days.date"
    metrics={['GscPerformance7days.clicks']}
    title="Organic Traffic"
  />

  {/* Google Ads */}
  <AreaChart
    dimension="GoogleAds.date"
    metrics={['GoogleAds.clicks', 'GoogleAds.cost']}
    title="Paid Traffic"
  />
</div>
```

### 3. Implement Real-Time Updates
Add WebSocket support for live dashboards:

```typescript
// Enable in Cube.js config
const { resultSet } = useCubeQuery(query, {
  subscribe: true,  // Auto-refresh on data changes
  cubeApi
});
```

### 4. Create Custom Chart Types
Extend pattern to other chart types:
- LineChart (already implemented)
- BarChart
- PieChart
- ScatterChart
- Heatmap

---

## Conclusion

✅ **AreaChart is fully integrated with Cube.js**

**What's Working:**
- Cube.js client initialized and configured
- useCubeQuery hook fetches data from semantic layer
- Time series queries with date granularity
- Multiple metrics support
- Breakdown dimensions
- Filters and date ranges
- Custom metric formatting
- Loading states and error handling
- ECharts rendering with themes
- Responsive styling

**Test it now:**
```bash
# Terminal 1: Start Cube.js backend
cd cube-backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: Open test page
http://localhost:3000/test-area-chart
```

**Questions?** Check test page for live examples and debugging info.
