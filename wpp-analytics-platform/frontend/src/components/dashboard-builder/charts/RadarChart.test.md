# RadarChart - Cube.js Integration Test Guide

## Quick Integration Test

This guide helps you verify the RadarChart component is properly connected to Cube.js.

## Prerequisites

1. **Cube.js Server Running**
   ```bash
   # Check if Cube.js is running
   curl http://localhost:4000/cubejs-api/v1/meta
   ```

2. **Environment Variables Set**
   ```env
   NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
   NEXT_PUBLIC_CUBEJS_API_SECRET=your-secret-key
   ```

3. **Sample Cube.js Model**
   ```javascript
   // cube/GSCPerformance.js
   cube('GSCPerformance', {
     sql: `SELECT * FROM gsc_performance`,

     dimensions: {
       query: {
         sql: 'query',
         type: 'string'
       },
       device: {
         sql: 'device',
         type: 'string'
       },
       date: {
         sql: 'date',
         type: 'time'
       }
     },

     measures: {
       clicks: {
         sql: 'clicks',
         type: 'sum'
       },
       impressions: {
         sql: 'impressions',
         type: 'sum'
       },
       ctr: {
         sql: `SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100`,
         type: 'number'
       },
       position: {
         sql: 'position',
         type: 'avg'
       }
     }
   });
   ```

## Test 1: Basic Connection

**Goal**: Verify component can connect to Cube.js and load data

**Component Code**:
```tsx
import { RadarChart } from '@/components/dashboard-builder/charts/RadarChart';

export default function TestPage() {
  return (
    <div className="p-8">
      <RadarChart
        datasource="GSCPerformance"
        dimension="GSCPerformance.query"
        metrics={["GSCPerformance.clicks"]}
        title="Test: Top Search Queries"
      />
    </div>
  );
}
```

**Expected Behavior**:
1. Component shows loading spinner initially
2. After 1-3 seconds, radar chart appears with data
3. Chart shows top 8 queries with their click counts
4. No error messages in console

**Cube.js Query Generated**:
```json
{
  "measures": ["GSCPerformance.clicks"],
  "dimensions": ["GSCPerformance.query"],
  "filters": [],
  "limit": 50,
  "order": { "GSCPerformance.clicks": "desc" }
}
```

**Verify in Browser DevTools**:
```javascript
// In browser console, check network tab for:
// Request: POST http://localhost:4000/cubejs-api/v1/load
// Response should contain: { data: [...], query: {...} }
```

## Test 2: Multiple Metrics

**Goal**: Verify multi-metric visualization

**Component Code**:
```tsx
<RadarChart
  datasource="GSCPerformance"
  dimension="GSCPerformance.query"
  metrics={[
    "GSCPerformance.clicks",
    "GSCPerformance.impressions",
    "GSCPerformance.ctr"
  ]}
  title="Test: Multi-Metric Analysis"
  showLegend={true}
  chartColors={['#5470c6', '#91cc75', '#fac858']}
/>
```

**Expected Behavior**:
1. Three colored lines on radar chart (one per metric)
2. Legend shows: "clicks", "impressions", "ctr"
3. Each metric has different scale but visualizes correctly
4. Hovering shows tooltips with formatted values

**Cube.js Query Generated**:
```json
{
  "measures": [
    "GSCPerformance.clicks",
    "GSCPerformance.impressions",
    "GSCPerformance.ctr"
  ],
  "dimensions": ["GSCPerformance.query"],
  "filters": [],
  "limit": 50,
  "order": { "GSCPerformance.clicks": "desc" }
}
```

## Test 3: Breakdown Dimension

**Goal**: Verify multi-series comparison by category

**Component Code**:
```tsx
<RadarChart
  datasource="GSCPerformance"
  dimension="GSCPerformance.query"
  breakdownDimension="GSCPerformance.device"
  metrics={["GSCPerformance.clicks"]}
  title="Test: Clicks by Device Type"
  showLegend={true}
/>
```

**Expected Behavior**:
1. Multiple colored lines (one per device: DESKTOP, MOBILE, TABLET)
2. Each device type shows as separate series
3. Legend shows device names
4. Chart compares same queries across devices

**Cube.js Query Generated**:
```json
{
  "measures": ["GSCPerformance.clicks"],
  "dimensions": [
    "GSCPerformance.query",
    "GSCPerformance.device"
  ],
  "filters": [],
  "limit": 50,
  "order": { "GSCPerformance.clicks": "desc" }
}
```

## Test 4: Date Range Filtering

**Goal**: Verify time dimension support

**Component Code**:
```tsx
<RadarChart
  datasource="GSCPerformance"
  dimension="GSCPerformance.query"
  metrics={["GSCPerformance.clicks"]}
  dateRange={{
    start: "2024-09-22",
    end: "2024-10-22"
  }}
  title="Test: Last 30 Days Performance"
/>
```

**Expected Behavior**:
1. Chart only shows data from Sept 22 - Oct 22
2. Data outside this range is excluded
3. Query includes timeDimensions parameter

**Cube.js Query Generated**:
```json
{
  "measures": ["GSCPerformance.clicks"],
  "dimensions": ["GSCPerformance.query"],
  "filters": [],
  "timeDimensions": [
    {
      "dimension": "GSCPerformance.date",
      "dateRange": ["2024-09-22", "2024-10-22"]
    }
  ],
  "limit": 50,
  "order": { "GSCPerformance.clicks": "desc" }
}
```

## Test 5: Filters

**Goal**: Verify filter application

**Component Code**:
```tsx
<RadarChart
  datasource="GSCPerformance"
  dimension="GSCPerformance.query"
  metrics={["GSCPerformance.clicks"]}
  filters={[
    {
      field: "GSCPerformance.impressions",
      operator: "gt",
      values: ["1000"]
    },
    {
      field: "GSCPerformance.device",
      operator: "equals",
      values: ["DESKTOP"]
    }
  ]}
  title="Test: High-Impression Desktop Queries"
/>
```

**Expected Behavior**:
1. Only queries with >1000 impressions shown
2. Only DESKTOP data included
3. Chart shows filtered subset of data

**Cube.js Query Generated**:
```json
{
  "measures": ["GSCPerformance.clicks"],
  "dimensions": ["GSCPerformance.query"],
  "filters": [
    {
      "member": "GSCPerformance.impressions",
      "operator": "gt",
      "values": ["1000"]
    },
    {
      "member": "GSCPerformance.device",
      "operator": "equals",
      "values": ["DESKTOP"]
    }
  ],
  "limit": 50,
  "order": { "GSCPerformance.clicks": "desc" }
}
```

## Test 6: Metric Formatting

**Goal**: Verify proper value formatting

**Component Code**:
```tsx
<RadarChart
  datasource="GoogleAds"
  dimension="GoogleAds.campaignName"
  metrics={[
    "GoogleAds.cost",
    "GoogleAds.ctr",
    "GoogleAds.conversions"
  ]}
  title="Test: Formatted Metrics"

  metricsConfig={[
    {
      id: "GoogleAds.cost",
      name: "Cost",
      format: "currency",
      decimals: 2,
      compact: true,
      alignment: "right",
      textColor: "#111",
      fontWeight: "600",
      showComparison: false,
      showBars: false
    },
    {
      id: "GoogleAds.ctr",
      name: "CTR",
      format: "percent",
      decimals: 2,
      compact: false,
      alignment: "right",
      textColor: "#111",
      fontWeight: "600",
      showComparison: false,
      showBars: false
    }
  ]}
/>
```

**Expected Behavior**:
1. Cost values show as: "$1.2K", "$2.5K", etc.
2. CTR values show as: "3.45%", "2.67%", etc.
3. Conversions show as: "150", "200", etc. (default number format)
4. Tooltips display formatted values

## Test 7: Error Handling

**Goal**: Verify graceful error handling

**Test A - Invalid Cube Name**:
```tsx
<RadarChart
  datasource="NonExistentCube"
  dimension="NonExistentCube.field"
  metrics={["NonExistentCube.metric"]}
/>
```

**Expected**: Error message displayed, no crash

**Test B - Invalid Dimension**:
```tsx
<RadarChart
  datasource="GSCPerformance"
  dimension="GSCPerformance.invalidField"
  metrics={["GSCPerformance.clicks"]}
/>
```

**Expected**: Error message from Cube.js, component shows error state

**Test C - No Configuration**:
```tsx
<RadarChart />
```

**Expected**: Empty state message: "Configure dimension and metric"

## Test 8: Loading States

**Goal**: Verify UI during data loading

**Test Method**:
1. Throttle network in Chrome DevTools (Slow 3G)
2. Load component
3. Observe loading spinner
4. Wait for data to load

**Expected Behavior**:
1. Loader2 spinner appears immediately
2. Spinner is blue (#blue-500)
3. Spinner animates smoothly
4. Chart replaces spinner when data arrives
5. No flash of unstyled content

## Test 9: Responsive Design

**Goal**: Verify chart works at different screen sizes

**Test Viewports**:
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1920px width
- 4K: 3840px width

**Expected Behavior**:
1. Chart scales proportionally
2. Labels remain readable
3. Legend adjusts position if needed
4. No horizontal scrolling
5. Touch interactions work on mobile

## Test 10: Performance

**Goal**: Verify token-efficient data loading

**Setup**: Insert 50,000 rows in BigQuery

**Component Code**:
```tsx
<RadarChart
  datasource="GSCPerformance"
  dimension="GSCPerformance.query"
  metrics={["GSCPerformance.clicks"]}
/>
```

**Expected Behavior**:
1. Query returns max 50 rows (despite 50k available)
2. Load time < 2 seconds
3. Chart renders smoothly
4. Browser doesn't freeze or lag

**Verify Query Limit**:
```javascript
// In Cube.js query, check:
{
  // ...
  "limit": 50  // ✅ Limit is applied
}
```

## Debugging Tips

### Issue: "Cannot find module '@/lib/cubejs/client'"

**Solution**: Check `tsconfig.json` has path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "Cube.js API secret not configured"

**Solution**: Add to `.env.local`:
```env
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=your-secret-here
```

### Issue: "Invalid query"

**Debug Steps**:
1. Log query config:
   ```javascript
   console.log('Query Config:', queryConfig);
   ```
2. Check Cube.js logs:
   ```bash
   tail -f cube-logs.txt
   ```
3. Test query directly:
   ```bash
   curl -X POST http://localhost:4000/cubejs-api/v1/load \
     -H "Authorization: YOUR_SECRET" \
     -H "Content-Type: application/json" \
     -d '{
       "query": {
         "measures": ["GSCPerformance.clicks"],
         "dimensions": ["GSCPerformance.query"]
       }
     }'
   ```

### Issue: Chart shows empty

**Debug Steps**:
1. Check resultSet:
   ```javascript
   console.log('Result Set:', resultSet?.tablePivot());
   console.log('Chart Data:', chartData);
   console.log('Dimension Values:', dimensionValues);
   ```
2. Verify data has values:
   ```javascript
   console.log('Has data:', dimensionValues.length > 0);
   ```
3. Check ECharts option:
   ```javascript
   console.log('Chart Option:', chartOption);
   ```

## Success Criteria

✅ All 10 tests pass
✅ No console errors
✅ Load time < 2 seconds
✅ Chart renders correctly at all viewports
✅ Tooltips show formatted values
✅ Legend displays when enabled
✅ Date range filtering works
✅ Filters apply correctly
✅ Multi-metric visualization works
✅ Breakdown dimension creates multiple series

## Next Steps

After successful testing:

1. **Production Setup**
   - Configure Cube.js pre-aggregations
   - Set up CDN for static assets
   - Enable CORS for production domain

2. **Monitoring**
   - Add error tracking (Sentry, etc.)
   - Monitor query performance
   - Track user interactions

3. **Optimization**
   - Implement query caching
   - Add request deduplication
   - Optimize bundle size

4. **Documentation**
   - Document available cubes/measures
   - Create team training materials
   - Add Storybook stories
