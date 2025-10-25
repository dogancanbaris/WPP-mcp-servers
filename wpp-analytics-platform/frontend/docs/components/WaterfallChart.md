# WaterfallChart Component

## Overview

The `WaterfallChart` component visualizes sequential changes from a starting value through a series of additions and subtractions to an ending value. It uses stacked bars with invisible helper series to correctly position positive and negative changes.

**Perfect for:**
- Revenue/profit bridges showing components of change
- Budget allocation and spending tracking
- Conversion funnel drop-off visualization
- Period-over-period metric changes
- Cost optimization tracking (CPA, CPC, ROAS)
- Traffic source contribution analysis

## Features

✅ **Cube.js Integration**: Direct connection to semantic layer
✅ **Smart Positioning**: Invisible helper bars for accurate stacking
✅ **Running Total**: Automatic cumulative calculation
✅ **Interactive Tooltips**: Shows value, change type, and running total
✅ **Customizable Colors**: Separate colors for increases, decreases, totals
✅ **Responsive Design**: Adapts to container width
✅ **Value Formatting**: Custom formatters for currency, percentages, etc.
✅ **Summary Statistics**: Shows start, net change, and end values
✅ **Dark Mode Support**: Full Tailwind dark mode compatibility

## Installation

```bash
npm install @cubejs-client/react recharts lucide-react
```

## Basic Usage

```tsx
import { WaterfallChart } from '@/components/dashboard-builder/charts/WaterfallChart';

function RevenueAnalysis() {
  return (
    <WaterfallChart
      query={{
        measures: ['Revenue.amount'],
        dimensions: ['Revenue.category'],
        order: { 'Revenue.sequenceOrder': 'asc' }
      }}
      title="Revenue Breakdown"
      startLabel="Q1 Revenue"
      endLabel="Q2 Revenue"
      valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `query` | `CubeQuery` | Cube.js query configuration |
| `query.measures` | `string[]` | Measures to visualize (typically 1) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `query.dimensions` | `string[]` | - | Dimensions for grouping (categories) |
| `query.timeDimensions` | `TimeDimension[]` | - | Time-based filtering |
| `query.filters` | `Filter[]` | - | Additional filters |
| `query.order` | `Record<string, 'asc'\|'desc'>` | - | Sort order (important!) |
| `query.limit` | `number` | - | Max number of data points |
| `title` | `string` | - | Chart title |
| `startLabel` | `string` | `"Starting"` | Label for starting bar |
| `endLabel` | `string` | `"Ending"` | Label for ending bar |
| `valueFormat` | `(val: number) => string` | `toLocaleString()` | Value formatter |
| `positiveColor` | `string` | `"#10b981"` | Color for increases |
| `negativeColor` | `string` | `"#ef4444"` | Color for decreases |
| `totalColor` | `string` | `"#3b82f6"` | Color for totals |
| `height` | `number` | `400` | Chart height in pixels |
| `showLabels` | `boolean` | `true` | Show value labels on bars |
| `loadingComponent` | `ReactNode` | - | Custom loading component |
| `errorComponent` | `(error: Error) => ReactNode` | - | Custom error component |

## Data Structure

### Input Data Format

The component expects data from Cube.js in this format:

```javascript
[
  { 'Revenue.category': 'Starting', 'Revenue.amount': 100000 },
  { 'Revenue.category': 'Product A', 'Revenue.amount': 25000 },
  { 'Revenue.category': 'Product B', 'Revenue.amount': -10000 },
  { 'Revenue.category': 'Product C', 'Revenue.amount': 15000 }
]
```

### How It Calculates

1. **First data point** becomes the starting value
2. **Subsequent points** are treated as changes (+/-)
3. **Running cumulative** tracks position for each change
4. **Final bar** shows the total (cumulative sum)

Example calculation:
```
Starting: 100,000
+ Product A: +25,000 → Cumulative: 125,000
+ Product B: -10,000 → Cumulative: 115,000
+ Product C: +15,000 → Cumulative: 130,000
Ending: 130,000
```

### Visualization Technique

Uses **stacked bars with invisible helper series**:

```javascript
// For a change at position 115,000 with value +15,000:
{
  helper: 115000,     // Invisible bar from 0 to 115,000
  visible: 15000,     // Visible bar from 115,000 to 130,000
  cumulative: 130000  // Next position
}
```

## Examples

### Example 1: Revenue Bridge

Shows how revenue changed from Q1 to Q2:

```tsx
<WaterfallChart
  query={{
    measures: ['Revenue.amount'],
    dimensions: ['Revenue.component'],
    timeDimensions: [{
      dimension: 'Revenue.date',
      dateRange: ['2025-01-01', '2025-06-30']
    }],
    order: { 'Revenue.sequenceOrder': 'asc' }
  }}
  title="Q1 to Q2 Revenue Bridge"
  startLabel="Q1 Revenue"
  endLabel="Q2 Revenue"
  valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
/>
```

**Cube.js Data Model:**
```javascript
cube('Revenue', {
  sql: `
    SELECT
      'Q1 Starting' as component, 5000000 as amount, 1 as sequence_order
    UNION ALL
    SELECT 'New Customers', 1200000, 2
    UNION ALL
    SELECT 'Expansion', 800000, 3
    UNION ALL
    SELECT 'Churn', -500000, 4
  `,

  dimensions: {
    component: { sql: 'component', type: 'string' }
  },

  measures: {
    amount: { sql: 'amount', type: 'sum' },
    sequenceOrder: { sql: 'sequence_order', type: 'number' }
  }
});
```

### Example 2: Campaign Budget Allocation

Tracks how budget is allocated across campaigns:

```tsx
<WaterfallChart
  query={{
    measures: ['GoogleAds.dailyBudget'],
    dimensions: ['GoogleAds.campaignName'],
    filters: [{
      member: 'GoogleAds.status',
      operator: 'equals',
      values: ['ENABLED']
    }],
    order: { 'GoogleAds.dailyBudget': 'desc' },
    limit: 10
  }}
  title="Daily Budget Allocation"
  startLabel="Total Budget"
  endLabel="Remaining"
  valueFormat={(val) => `$${val.toLocaleString()}`}
/>
```

### Example 3: Conversion Funnel Drop-offs

Visualizes user drop-off at each funnel stage:

```tsx
<WaterfallChart
  query={{
    measures: ['Analytics.users'],
    dimensions: ['Analytics.funnelStep'],
    timeDimensions: [{
      dimension: 'Analytics.date',
      dateRange: 'last 30 days'
    }],
    order: { 'Analytics.funnelStepOrder': 'asc' }
  }}
  title="Conversion Funnel Analysis"
  startLabel="Landing Page"
  endLabel="Conversions"
  valueFormat={(val) => val.toLocaleString()}
  // Use warning color for drop-offs
  negativeColor="#f59e0b"
  height={500}
/>
```

### Example 4: CPA Optimization (Inverted Colors)

Tracks cost per acquisition where decreases are good:

```tsx
<WaterfallChart
  query={{
    measures: ['GoogleAds.costPerConversion'],
    dimensions: ['GoogleAds.week'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 8 weeks',
      granularity: 'week'
    }],
    order: { 'GoogleAds.date': 'asc' }
  }}
  title="Weekly CPA Optimization"
  startLabel="Week 1"
  endLabel="Week 8"
  valueFormat={(val) => `$${val.toFixed(2)}`}
  // Inverted: red = increase (bad), green = decrease (good)
  positiveColor="#ef4444"
  negativeColor="#10b981"
/>
```

### Example 5: Multi-Source Traffic Changes

Compares traffic sources month-over-month:

```tsx
<WaterfallChart
  query={{
    measures: ['HolisticSearch.clicks'],
    dimensions: ['HolisticSearch.sourceType'],
    timeDimensions: [{
      dimension: 'HolisticSearch.date',
      dateRange: ['2025-09-01', '2025-10-31'],
      granularity: 'month'
    }],
    order: { 'HolisticSearch.clicks': 'desc' }
  }}
  title="Traffic Source Changes (Sep → Oct)"
  startLabel="September Total"
  endLabel="October Total"
  valueFormat={(val) => `${(val / 1000).toFixed(1)}K`}
/>
```

## Cube.js Integration Patterns

### Pattern 1: Sequential Order

Use a `sequenceOrder` field to control bar order:

```javascript
cube('RevenueComponents', {
  sql: `
    SELECT
      component_name,
      amount,
      display_order
    FROM revenue_breakdown
  `,

  dimensions: {
    componentName: { sql: 'component_name', type: 'string' }
  },

  measures: {
    amount: { sql: 'amount', type: 'sum' },
    displayOrder: { sql: 'display_order', type: 'number' }
  }
});
```

Query:
```javascript
{
  measures: ['RevenueComponents.amount'],
  dimensions: ['RevenueComponents.componentName'],
  order: { 'RevenueComponents.displayOrder': 'asc' }
}
```

### Pattern 2: Calculated Changes

Calculate period-over-period changes in Cube.js:

```javascript
cube('TrafficChanges', {
  sql: `
    SELECT
      source,
      current_month - previous_month as change
    FROM (
      SELECT
        source,
        SUM(CASE WHEN month = 'current' THEN clicks ELSE 0 END) as current_month,
        SUM(CASE WHEN month = 'previous' THEN clicks ELSE 0 END) as previous_month
      FROM traffic_data
      GROUP BY source
    )
  `,

  measures: {
    change: { sql: 'change', type: 'sum' }
  }
});
```

### Pattern 3: Funnel Drop-offs

Model conversion funnel with automatic drop-off calculation:

```javascript
cube('ConversionFunnel', {
  sql: `
    WITH funnel_steps AS (
      SELECT 'Landing Page' as step, COUNT(DISTINCT user_id) as users, 1 as step_order FROM landings
      UNION ALL
      SELECT 'Product View', COUNT(DISTINCT user_id), 2 FROM product_views
      UNION ALL
      SELECT 'Add to Cart', COUNT(DISTINCT user_id), 3 FROM cart_adds
      UNION ALL
      SELECT 'Checkout', COUNT(DISTINCT user_id), 4 FROM checkouts
      UNION ALL
      SELECT 'Purchase', COUNT(DISTINCT user_id), 5 FROM purchases
    )
    SELECT
      step,
      users - LAG(users) OVER (ORDER BY step_order) as change,
      step_order
    FROM funnel_steps
  `,

  measures: {
    change: { sql: 'change', type: 'sum' }
  }
});
```

## Performance Optimization

### Token-Efficient Queries

❌ **Bad**: Loading raw data
```javascript
// Returns 50,000 rows
{
  measures: ['Revenue.amount'],
  dimensions: ['Revenue.transactionId']
}
```

✅ **Good**: Pre-aggregated categories
```javascript
// Returns 8 rows
{
  measures: ['Revenue.amount'],
  dimensions: ['Revenue.category'],
  order: { 'Revenue.sequenceOrder': 'asc' },
  limit: 10
}
```

### Pre-Aggregations

Define pre-aggregations for waterfall queries:

```javascript
cube('Revenue', {
  // ... cube definition

  preAggregations: {
    categoryBreakdown: {
      measures: [amount],
      dimensions: [category, sequenceOrder],
      refreshKey: {
        every: '1 day'
      }
    }
  }
});
```

### Limit Data Points

Keep waterfall charts to 5-12 data points for readability:

```javascript
{
  measures: ['GoogleAds.cost'],
  dimensions: ['GoogleAds.campaignName'],
  order: { 'GoogleAds.cost': 'desc' },
  limit: 10  // Top 10 campaigns only
}
```

## Customization

### Custom Colors

```tsx
<WaterfallChart
  positiveColor="#059669"  // emerald-600
  negativeColor="#dc2626"  // red-600
  totalColor="#2563eb"     // blue-600
  // ...
/>
```

### Custom Formatters

```tsx
// Currency
valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}

// Percentage
valueFormat={(val) => `${(val * 100).toFixed(1)}%`}

// Thousands
valueFormat={(val) => `${(val / 1000).toFixed(1)}K`}

// Localized
valueFormat={(val) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(val)}
```

### Custom Loading/Error

```tsx
<WaterfallChart
  loadingComponent={
    <div className="flex items-center gap-2">
      <Spinner />
      <span>Loading revenue data...</span>
    </div>
  }
  errorComponent={(error) => (
    <Alert variant="destructive">
      <AlertTitle>Failed to load chart</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )}
  // ...
/>
```

## Best Practices

### 1. Order Matters

Always specify an `order` parameter to ensure correct sequence:

```javascript
// ✅ Correct
order: { 'Revenue.sequenceOrder': 'asc' }
order: { 'Revenue.date': 'asc' }
order: { 'Revenue.amount': 'desc' }

// ❌ Wrong - unpredictable order
// No order specified
```

### 2. Meaningful Labels

Use descriptive start/end labels:

```tsx
// ✅ Clear
startLabel="Q1 2025 Revenue"
endLabel="Q2 2025 Revenue"

// ❌ Vague
startLabel="Start"
endLabel="End"
```

### 3. Appropriate Colors

Consider the meaning of changes:

```tsx
// For revenue/profit (increase = good)
positiveColor="#10b981"  // green
negativeColor="#ef4444"  // red

// For costs/CPA (decrease = good)
positiveColor="#ef4444"  // red
negativeColor="#10b981"  // green
```

### 4. Limit Data Points

Too many bars reduce readability:

- **Ideal**: 5-12 data points
- **Maximum**: 15 data points
- **Use aggregation**: Group small items into "Other"

### 5. Consistent Formatting

Match format to metric type:

- Revenue/Cost: Currency format
- Percentages: Include % symbol
- Large numbers: Use K/M suffixes
- Keep decimal places consistent

## Accessibility

The component includes:

- ✅ Semantic HTML structure
- ✅ Color contrast (WCAG AA)
- ✅ Interactive tooltips
- ✅ Keyboard navigation (via Recharts)
- ✅ Screen reader support
- ✅ Dark mode support

## Troubleshooting

### Issue: Bars appear in wrong order

**Solution**: Add `order` parameter to query:
```javascript
order: { 'Revenue.sequenceOrder': 'asc' }
```

### Issue: Negative values appear above positive

**Solution**: This is expected behavior - waterfall shows sequential changes. Check data order.

### Issue: Starting value is wrong

**Solution**: First data point becomes starting value. Ensure data is ordered correctly or add explicit starting row.

### Issue: Colors are inverted

**Solution**: For cost metrics, swap colors:
```tsx
positiveColor="#ef4444"  // red (increase is bad)
negativeColor="#10b981"  // green (decrease is good)
```

### Issue: Too many bars, chart is cluttered

**Solution**: Add limit to query:
```javascript
limit: 10
```
Or aggregate small items in Cube.js.

## Related Components

- **LineChart**: For time-series trend analysis
- **BarChart**: For simple comparisons
- **StackedBarChart**: For composition analysis
- **FunnelChart**: For conversion visualization

## TypeScript Support

Full TypeScript support with type definitions:

```tsx
import type { WaterfallChartProps } from './WaterfallChart';

const config: WaterfallChartProps = {
  query: {
    measures: ['Revenue.amount'],
    dimensions: ['Revenue.category']
  },
  title: 'Revenue Analysis',
  valueFormat: (val) => `$${val.toFixed(2)}`
};
```

## License

Part of the WPP Analytics Platform - MIT License
