# HeatmapChart - Cube.js Integration Documentation

## Overview

The HeatmapChart component is a fully integrated visualization that connects to the Cube.js semantic layer to display two-dimensional performance data with color-coded intensity values.

**Key Features:**
- Real-time data fetching from Cube.js API
- Automatic matrix transformation for ECharts
- Support for multiple metric formats (number, percentage, currency)
- Responsive design with automatic label rotation
- Token-efficient aggregation (10-400 data points)
- Interactive tooltips and visual mapping

## Architecture

```
User Input → HeatmapChart → Cube.js Query → BigQuery → Cube.js Aggregation → ECharts Heatmap
              ↓
         Configuration Props
              ↓
    [dimension, breakdownDimension, metrics]
              ↓
         Cube.js API Call
              ↓
         {
           measures: ["GscPerformance7days.clicks"],
           dimensions: ["device", "country"],
           timeDimensions: [{ dateRange: "last 7 days" }]
         }
              ↓
         Aggregated Result (50-200 rows)
              ↓
         Matrix Transformation
              ↓
         [[0, 0, 1523], [0, 1, 876], ...]
              ↓
         ECharts Heatmap Rendering
```

## Component API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `dimension` | `string` | X-axis dimension (e.g., "GscPerformance7days.device") |
| `breakdownDimension` | `string` | Y-axis dimension (e.g., "GscPerformance7days.country") |
| `metrics` | `string[]` | Array with one measure (e.g., ["GscPerformance7days.clicks"]) |

### Optional Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasource` | `string` | `'gsc_performance_7days'` | Cube.js cube name |
| `filters` | `Filter[]` | `[]` | Cube.js filter conditions |
| `dateRange` | `string` | - | Date range filter (e.g., "last 7 days") |
| `metricsConfig` | `MetricConfig[]` | `[]` | Formatting rules for metrics |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Heatmap'` | Chart title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `backgroundColor` | `string` | `'#ffffff'` | Container background |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderWidth` | `number` | `1` | Border width in pixels |
| `borderRadius` | `number` | `8` | Border radius in pixels |
| `padding` | `number` | `16` | Container padding in pixels |
| `chartColors` | `string[]` | Sequential blue | Color gradient for heatmap |

## Cube.js Integration

### 1. Query Configuration

The component automatically builds a Cube.js query based on props:

```typescript
{
  measures: metrics,                    // ["GscPerformance7days.clicks"]
  dimensions: [                         // Both X and Y dimensions
    dimension,                          // "GscPerformance7days.device"
    breakdownDimension                  // "GscPerformance7days.country"
  ],
  filters: filters,                     // Optional filtering
  timeDimensions: [{                    // Optional date filtering
    dimension: `${datasource}.date`,
    dateRange: dateRange
  }]
}
```

### 2. Data Transformation

Cube.js returns tabular data that the component transforms into ECharts matrix format:

**Cube.js Response:**
```json
[
  { "device": "MOBILE", "country": "USA", "clicks": 1523 },
  { "device": "MOBILE", "country": "UK", "clicks": 876 },
  { "device": "DESKTOP", "country": "USA", "clicks": 2134 }
]
```

**Matrix Transformation:**
```javascript
// Extract unique categories
xAxisCategories = ["DESKTOP", "MOBILE"]
yAxisCategories = ["UK", "USA"]

// Create matrix: [xIndex, yIndex, value]
matrixData = [
  [1, 1, 1523],  // MOBILE, USA, 1523
  [1, 0, 876],   // MOBILE, UK, 876
  [0, 1, 2134]   // DESKTOP, USA, 2134
]
```

### 3. Visual Mapping

The component calculates min/max values and applies color gradients:

```javascript
const minValue = Math.min(...values, 0);
const maxValue = Math.max(...values, 0);

visualMap: {
  min: minValue,
  max: maxValue,
  inRange: { color: chartColors }
}
```

## Usage Examples

### Example 1: Device Performance by Country

```tsx
<HeatmapChart
  datasource="GscPerformance7days"
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.clicks"]}
  title="Clicks by Device and Country"
  dateRange="last 7 days"
  metricsConfig={[
    {
      key: "GscPerformance7days.clicks",
      format: "number",
      decimals: 0
    }
  ]}
/>
```

**Generated Cube.js Query:**
```json
{
  "measures": ["GscPerformance7days.clicks"],
  "dimensions": [
    "GscPerformance7days.device",
    "GscPerformance7days.country"
  ],
  "timeDimensions": [{
    "dimension": "GscPerformance7days.date",
    "dateRange": "last 7 days"
  }]
}
```

**Expected Data Points:** ~15 rows (3 devices × 5 countries)

### Example 2: CTR Distribution (Percentage Format)

```tsx
<HeatmapChart
  datasource="GscPerformance7days"
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.avgCtr"]}
  title="Average CTR by Device and Country"
  metricsConfig={[
    {
      key: "GscPerformance7days.avgCtr",
      format: "percentage",
      decimals: 2
    }
  ]}
  chartColors={[
    '#fff5f0', '#fee0d2', '#fcbba1', '#fc9272',
    '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15'
  ]}
/>
```

**Tooltip Display:** "MOBILE → USA: 2.17%" (value 0.0217 formatted)

### Example 3: High-Cardinality Dimensions with Filtering

```tsx
<HeatmapChart
  datasource="GscPerformance7days"
  dimension="GscPerformance7days.country"
  breakdownDimension="GscPerformance7days.query"
  metrics={["GscPerformance7days.impressions"]}
  filters={[
    {
      member: "GscPerformance7days.impressions",
      operator: "gt",
      values: ["100"]
    }
  ]}
  title="Top Performing Queries by Country"
  dateRange="last 7 days"
/>
```

**Why Filtering Matters:**
- Without filter: 50,000 queries × 20 countries = 1M potential cells
- With filter: Top 50 queries × 20 countries = 1,000 cells (manageable)

### Example 4: Position Analysis (Inverted Scale)

```tsx
<HeatmapChart
  datasource="GscPerformance7days"
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.page"
  metrics={["GscPerformance7days.avgPosition"]}
  filters={[
    {
      member: "GscPerformance7days.clicks",
      operator: "gt",
      values: ["10"]
    }
  ]}
  chartColors={[
    '#a50026', '#d73027', '#f46d43', '#fdae61',  // Red (bad)
    '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9',  // Yellow (ok)
    '#74add1', '#4575b4', '#313695'              // Blue (good)
  ].reverse()}  // Reverse for position (lower = better)
/>
```

## Available Dimensions (GscPerformance7days)

| Dimension | Cardinality | Best Use | Notes |
|-----------|-------------|----------|-------|
| `date` | 7 | Time series | Use with timeDimensions |
| `device` | 3 | X or Y axis | LOW: Perfect for heatmaps |
| `country` | 20-50 | X or Y axis | MEDIUM: Works well |
| `page` | 1,000+ | Y axis only | HIGH: Requires TOP N filter |
| `query` | 10,000+ | Y axis only | HIGH: Requires TOP N filter |

## Available Measures

| Measure | Format | Description | Example Values |
|---------|--------|-------------|----------------|
| `clicks` | number | Total clicks | 1,523 |
| `impressions` | number | Total impressions | 45,678 |
| `avgCtr` | percentage | Click-through rate | 0.0217 → 2.17% |
| `avgPosition` | number | Search position | 3.4 (lower better) |

## Metric Configuration

Define formatting rules via `metricsConfig`:

```typescript
metricsConfig={[
  {
    key: "GscPerformance7days.clicks",
    format: "number",      // number | percentage | currency
    decimals: 0            // Number of decimal places
  }
]}
```

### Format Types

**Number:**
```typescript
{ format: "number", decimals: 0 }
// 1523 → "1,523"
```

**Percentage:**
```typescript
{ format: "percentage", decimals: 2 }
// 0.0217 → "2.17%"
```

**Currency:**
```typescript
{ format: "currency", decimals: 2 }
// 42.5 → "$42.50"
```

## Performance Optimization

### 1. Target Data Volume

**Ideal:** 10-400 data points
- 10 × 10 grid = 100 cells ✅
- 20 × 20 grid = 400 cells ✅
- 100 × 100 grid = 10,000 cells ❌ (too many)

### 2. Use TOP N Filters

```typescript
// BAD: Query all search queries
dimension="GscPerformance7days.query"
// Returns 50,000 rows → browser crash

// GOOD: Filter to top performers
dimension="GscPerformance7days.query"
filters={[
  { member: "GscPerformance7days.clicks", operator: "gt", values: ["50"] }
]}
// Returns 200 rows → fast render
```

### 3. Cube.js Pre-Aggregations

Define in Cube.js schema for 100x speedup:

```javascript
// cube-backend/schema/GscPerformance7days.js
preAggregations: {
  deviceCountryDaily: {
    measures: [clicks, impressions, avgCtr],
    dimensions: [device, country],
    timeDimension: date,
    granularity: 'day',
    refreshKey: { every: '1 hour' }
  }
}
```

## Best Practices

### ✅ DO

1. **Use low-cardinality dimensions for axes**
   - device (3 values), country (20 values)

2. **Apply TOP N filters for high-cardinality dimensions**
   - query, page with impression/click threshold

3. **Configure metric formatting**
   - Percentage: multiply by 100, add %
   - Position: lower is better (inverted colors)

4. **Use date ranges to limit data**
   - Last 7 days, last 30 days

5. **Choose appropriate color schemes**
   - Sequential: Single metric (clicks)
   - Diverging: Positive/negative (change)
   - Inverted: Lower-is-better (position)

### ❌ DON'T

1. **Don't use two high-cardinality dimensions**
   - query × page = 500M potential cells

2. **Don't skip filtering on high-cardinality dimensions**
   - Always add TOP N filter

3. **Don't load more than 1,000 data points**
   - Browser will slow down significantly

4. **Don't forget metric formatting configuration**
   - 0.0217 displayed raw instead of 2.17%

## Component States

### Empty State
```
┌─────────────────────────┐
│   Configure heatmap     │
│                         │
│  Requires: 1 metric,    │
│  X-axis dimension,      │
│  Y-axis dimension       │
└─────────────────────────┘
```

### Loading State
```
┌─────────────────────────┐
│                         │
│          ⟳              │
│      Loading...         │
│                         │
└─────────────────────────┘
```

### Error State
```
┌─────────────────────────┐
│   Error loading data    │
│                         │
│   Query failed: ...     │
└─────────────────────────┘
```

### No Data State
```
┌─────────────────────────┐
│   No data available     │
│                         │
│  Try adjusting your     │
│  filters or date range  │
└─────────────────────────┘
```

### Success State
```
┌─────────────────────────┐
│  Clicks by Device       │
├─────────────────────────┤
│  USA  UK  CA  AU  DE    │
│ ┌─┬─┬─┬─┬─┐             │
│D│█│▓│▒│░│▒│             │
│E├─┼─┼─┼─┼─┤             │
│S│▓│▒│░│▒│░│             │
│K├─┼─┼─┼─┼─┤             │
│T│▒│░│▒│░│░│             │
│O└─┴─┴─┴─┴─┘             │
│P                        │
│ ░ 0  ▒ 500  ▓ 1000 █ 2000│
└─────────────────────────┘
```

## Troubleshooting

### Issue: Empty heatmap despite data

**Cause:** Dimension/breakdownDimension not matching Cube.js response keys

**Solution:** Check exact key names in Cube.js response
```typescript
// ❌ Wrong
dimension="device"

// ✅ Correct
dimension="GscPerformance7days.device"
```

### Issue: Query takes > 5 seconds

**Cause:** No pre-aggregations, high cardinality

**Solution:** Add pre-aggregations in Cube.js schema
```javascript
preAggregations: {
  main: {
    measures: [clicks, impressions],
    dimensions: [device, country],
    timeDimension: date,
    granularity: 'day'
  }
}
```

### Issue: Heatmap too crowded

**Cause:** Too many categories (50+ per axis)

**Solution:** Add TOP N filter or limit dimensions
```typescript
filters={[
  { member: "GscPerformance7days.clicks", operator: "gt", values: ["100"] }
]}
```

### Issue: Percentage showing as 0.02 instead of 2%

**Cause:** Missing metricsConfig

**Solution:** Configure percentage formatting
```typescript
metricsConfig={[
  {
    key: "GscPerformance7days.avgCtr",
    format: "percentage",
    decimals: 2
  }
]}
```

## Related Files

| File | Purpose |
|------|---------|
| `/frontend/src/components/dashboard-builder/charts/HeatmapChart.tsx` | Main component |
| `/frontend/src/components/dashboard-builder/charts/HeatmapChart.example.tsx` | Usage examples |
| `/frontend/src/components/dashboard-builder/charts/__tests__/HeatmapChart.test.tsx` | Test suite |
| `/frontend/src/lib/cubejs/client.ts` | Cube.js API client |
| `/cube-backend/schema/GscPerformance7days.js` | Data model definition |

## Testing

Run tests:
```bash
npm test HeatmapChart.test.tsx
```

Test coverage includes:
- Empty state rendering
- Loading state display
- Error handling
- Cube.js query construction
- Data transformation logic
- Metric formatting
- No data state

## Future Enhancements

1. **Multi-Metric Support**: Display multiple metrics via color + size
2. **Drill-Down**: Click cells to filter deeper
3. **Export**: Download heatmap as PNG/SVG
4. **Annotations**: Add text labels to specific cells
5. **Time Animation**: Animate heatmap changes over time

## Summary

The HeatmapChart component provides a fully integrated, production-ready solution for visualizing two-dimensional performance data from Cube.js. It handles:

- ✅ Real-time data fetching
- ✅ Automatic data transformation
- ✅ Multiple metric formats
- ✅ Token-efficient queries
- ✅ Interactive tooltips
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

Use it for any scenario where you need to compare performance across two categorical dimensions (device × country, query × page, etc.).
