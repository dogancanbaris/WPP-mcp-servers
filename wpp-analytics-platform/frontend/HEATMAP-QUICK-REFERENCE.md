# HeatmapChart - Quick Reference Card

## Minimum Required Props

```tsx
<HeatmapChart
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.clicks"]}
/>
```

## Complete Example

```tsx
<HeatmapChart
  // Data configuration (required)
  datasource="GscPerformance7days"
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.clicks"]}

  // Optional filters
  filters={[
    {
      field: "GscPerformance7days.impressions",
      operator: "gt",
      values: ["100"]
    }
  ]}

  // Optional date range
  dateRange={{ start: "2025-10-15", end: "2025-10-22" }}

  // Metric formatting
  metricsConfig={[
    {
      id: "GscPerformance7days.clicks",
      name: "Clicks",
      format: "number",  // number | percent | currency | duration
      decimals: 0,
      compact: false,
      alignment: 'right',
      textColor: '#111827',
      fontWeight: '600',
      showComparison: false,
      showBars: false
    }
  ]}

  // Styling
  title="Clicks by Device and Country"
  showTitle={true}
  backgroundColor="#ffffff"
  borderColor="#e0e0e0"
  borderWidth={1}
  borderRadius={8}
  padding={16}

  // Colors
  chartColors={[
    '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
    '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
  ]}
/>
```

## Available Dimensions (GscPerformance7days)

| Dimension | Cardinality | Usage | Example Values |
|-----------|-------------|-------|----------------|
| `date` | 7 | Time series | 2025-10-15, 2025-10-16 |
| `device` | 3 | ✅ X/Y axis | MOBILE, DESKTOP, TABLET |
| `country` | 20-50 | ✅ X/Y axis | USA, UK, CA, AU, DE |
| `page` | 1000+ | ⚠️ Filter required | /laptops, /tablets, /phones |
| `query` | 10000+ | ⚠️ Filter required | "best laptop", "gaming pc" |

## Available Measures

| Measure | Format | Description |
|---------|--------|-------------|
| `clicks` | number | Total clicks |
| `impressions` | number | Total impressions |
| `avgCtr` | percent | Click-through rate |
| `avgPosition` | number | Search position |

## Recommended Combinations

### ✅ Fast and Readable

```tsx
// Device × Country (3 × 20 = 60 cells)
<HeatmapChart
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.clicks"]}
/>

// Date × Device (7 × 3 = 21 cells)
<HeatmapChart
  dimension="GscPerformance7days.date"
  breakdownDimension="GscPerformance7days.device"
  metrics={["GscPerformance7days.impressions"]}
/>
```

### ⚠️ Requires Filtering

```tsx
// Country × Query (20 × 50 = 1000 cells with filter)
<HeatmapChart
  dimension="GscPerformance7days.country"
  breakdownDimension="GscPerformance7days.query"
  metrics={["GscPerformance7days.impressions"]}
  filters={[
    {
      field: "GscPerformance7days.impressions",
      operator: "gt",
      values: ["100"]  // Top performers only
    }
  ]}
/>
```

### ❌ Avoid

```tsx
// Query × Page = 10k × 10k = 100M cells (too many!)
<HeatmapChart
  dimension="GscPerformance7days.query"
  breakdownDimension="GscPerformance7days.page"
  metrics={["GscPerformance7days.clicks"]}
/>
```

## Metric Formatting Examples

### Number Format
```tsx
metricsConfig={[
  {
    id: "GscPerformance7days.clicks",
    format: "number",
    decimals: 0
  }
]}
// Result: 1,523
```

### Percent Format
```tsx
metricsConfig={[
  {
    id: "GscPerformance7days.avgCtr",
    format: "percent",
    decimals: 2
  }
]}
// Result: 2.17% (from 0.0217)
```

### Currency Format
```tsx
metricsConfig={[
  {
    id: "GscPerformance7days.cost",
    format: "currency",
    decimals: 2
  }
]}
// Result: $42.50
```

## Color Schemes

### Sequential (Blue)
```tsx
chartColors={[
  '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
  '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
]}
```

### Sequential (Red)
```tsx
chartColors={[
  '#fff5f0', '#fee0d2', '#fcbba1', '#fc9272',
  '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'
]}
```

### Sequential (Green)
```tsx
chartColors={[
  '#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
  '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'
]}
```

### Diverging (Red-Blue)
```tsx
chartColors={[
  '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf',
  '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'
]}
```

### Inverted (Lower = Better)
```tsx
chartColors={[
  '#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090',
  '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'
].reverse()}  // Use for avgPosition
```

## Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `{ field: "device", operator: "equals", values: ["MOBILE"] }` |
| `notEquals` | Not equal | `{ field: "country", operator: "notEquals", values: ["US"] }` |
| `contains` | String contains | `{ field: "query", operator: "contains", values: ["laptop"] }` |
| `notContains` | String doesn't contain | `{ field: "page", operator: "notContains", values: ["/admin"] }` |
| `gt` | Greater than | `{ field: "clicks", operator: "gt", values: ["100"] }` |
| `gte` | Greater or equal | `{ field: "impressions", operator: "gte", values: ["1000"] }` |
| `lt` | Less than | `{ field: "position", operator: "lt", values: ["10"] }` |
| `lte` | Less or equal | `{ field: "ctr", operator: "lte", values: ["0.05"] }` |
| `set` | Has value | `{ field: "country", operator: "set", values: [] }` |
| `notSet` | No value | `{ field: "page", operator: "notSet", values: [] }` |

## Common Patterns

### Pattern 1: TOP N with Filter
```tsx
<HeatmapChart
  dimension="GscPerformance7days.country"
  breakdownDimension="GscPerformance7days.query"
  metrics={["GscPerformance7days.clicks"]}
  filters={[
    {
      field: "GscPerformance7days.clicks",
      operator: "gt",
      values: ["50"]  // Only top performers
    }
  ]}
/>
```

### Pattern 2: Percentage CTR
```tsx
<HeatmapChart
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.avgCtr"]}
  metricsConfig={[
    {
      id: "GscPerformance7days.avgCtr",
      format: "percent",
      decimals: 2
    }
  ]}
/>
```

### Pattern 3: Inverted Position
```tsx
<HeatmapChart
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.page"
  metrics={["GscPerformance7days.avgPosition"]}
  chartColors={[
    '#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090',
    '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'
  ].reverse()}  // Lower position = better = darker blue
/>
```

### Pattern 4: Date Range Filter
```tsx
<HeatmapChart
  dimension="GscPerformance7days.device"
  breakdownDimension="GscPerformance7days.country"
  metrics={["GscPerformance7days.impressions"]}
  dateRange={{
    start: "2025-10-15",
    end: "2025-10-22"
  }}
/>
```

## Performance Tips

### ✅ DO

1. **Keep data points under 400**
   - Aim for 10-400 cells total
   - Example: 10 × 10 = 100 cells ✅

2. **Use filters for high-cardinality dimensions**
   - Add TOP N filter (impressions > 100)
   - Limit to relevant subset

3. **Enable pre-aggregations in Cube.js**
   - 100x speedup for common queries
   - Refresh every 1 hour

4. **Choose appropriate color schemes**
   - Sequential: One-directional (clicks)
   - Diverging: Two-directional (change)
   - Inverted: Lower-is-better (position)

### ❌ DON'T

1. **Don't use two high-cardinality dimensions**
   - Query × Page = millions of cells

2. **Don't skip metric formatting**
   - 0.0217 raw vs 2.17% formatted

3. **Don't load > 1000 data points**
   - Browser performance degrades

## Troubleshooting

### Empty Heatmap
```typescript
// ❌ Wrong
dimension="device"

// ✅ Correct
dimension="GscPerformance7days.device"
```

### Slow Query
```javascript
// Add to Cube.js schema
preAggregations: {
  main: {
    measures: [clicks, impressions],
    dimensions: [device, country],
    timeDimension: date,
    granularity: 'day'
  }
}
```

### Too Crowded
```tsx
// Add TOP N filter
filters={[
  { field: "clicks", operator: "gt", values: ["100"] }
]}
```

### Wrong Percentage Format
```tsx
// ❌ Wrong
metricsConfig={[{ format: "percentage" }]}

// ✅ Correct
metricsConfig={[{ format: "percent" }]}
```

## Files Reference

| File | Purpose |
|------|---------|
| `/frontend/src/components/dashboard-builder/charts/HeatmapChart.tsx` | Main component |
| `/frontend/src/components/dashboard-builder/charts/HeatmapChart.example.tsx` | Usage examples |
| `/frontend/docs/HEATMAP-CUBEJS-INTEGRATION.md` | Full documentation |
| `/frontend/HEATMAP-CUBEJS-INTEGRATION-SUMMARY.md` | Implementation summary |
| `/frontend/HEATMAP-ARCHITECTURE-DIAGRAM.txt` | Data flow diagram |

## Next Steps

1. Import component: `import { HeatmapChart } from '@/components/dashboard-builder/charts/HeatmapChart'`
2. Configure props: dimension, breakdownDimension, metrics
3. Add filters if needed: for high-cardinality dimensions
4. Style as needed: colors, title, borders
5. Test with real data: verify Cube.js connection

## Support

For issues or questions:
1. Check `/frontend/docs/HEATMAP-CUBEJS-INTEGRATION.md` for detailed docs
2. Review examples in `HeatmapChart.example.tsx`
3. Verify Cube.js schema in `/cube-backend/schema/`
4. Check browser console for query errors
