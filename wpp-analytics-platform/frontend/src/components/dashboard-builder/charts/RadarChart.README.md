# RadarChart Component - Cube.js Integration

## Overview

The `RadarChart` component is a fully-featured, Cube.js-connected radar chart for multi-dimensional data visualization. It's perfect for comparing multiple metrics across different dimensions or analyzing performance patterns across categories.

## Key Features

✅ **Full Cube.js Integration** - Direct connection to semantic layer
✅ **Multi-Metric Support** - Compare multiple measures on one chart
✅ **Breakdown Dimension** - Compare series across categories
✅ **Date Range Filtering** - Built-in time dimension support
✅ **Custom Filters** - Apply complex filter conditions
✅ **Metric Formatting** - Currency, percent, duration, compact numbers
✅ **Responsive Design** - Works on mobile to 4K displays
✅ **Loading States** - Elegant loading and error handling
✅ **Custom Styling** - Full control over colors, borders, shadows

## Basic Usage

```tsx
import { RadarChart } from '@/components/dashboard-builder/charts/RadarChart';

function MyDashboard() {
  return (
    <RadarChart
      datasource="gsc_performance"
      dimension="GSCPerformance.query"
      metrics={["GSCPerformance.clicks"]}
      title="Top Search Queries"
    />
  );
}
```

## Cube.js Query Structure

The component automatically builds a Cube.js query with this structure:

```javascript
{
  measures: ["GSCPerformance.clicks"],
  dimensions: ["GSCPerformance.query"],
  filters: [],
  timeDimensions: [
    {
      dimension: "GSCPerformance.date",
      dateRange: ["2024-09-22", "2024-10-22"]
    }
  ],
  limit: 50,
  order: { "GSCPerformance.clicks": "desc" }
}
```

## Props Reference

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasource` | `string` | `'gsc_performance_7days'` | Cube.js cube name |
| `dimension` | `string \| null` | `null` | Primary dimension (radar axis labels) |
| `breakdownDimension` | `string \| null` | `null` | Secondary dimension (multiple series) |
| `metrics` | `string[]` | `[]` | Array of Cube.js measures |
| `filters` | `FilterConfig[]` | `[]` | Filter conditions |
| `dateRange` | `DateRangeConfig` | `undefined` | Start/end dates |

### Title Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Radar Chart'` | Chart title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `titleFontFamily` | `string` | `'roboto'` | Font family |
| `titleFontSize` | `string` | `'16'` | Font size (px) |
| `titleFontWeight` | `string` | `'600'` | Font weight |
| `titleColor` | `string` | `'#111827'` | Text color |
| `titleBackgroundColor` | `string` | `'transparent'` | Background color |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |

### Background & Border Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#ffffff'` | Background color |
| `showBorder` | `boolean` | `true` | Show border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderWidth` | `number` | `1` | Border width (px) |
| `borderRadius` | `number` | `8` | Border radius (px) |
| `showShadow` | `boolean` | `false` | Show shadow |
| `shadowColor` | `string` | `'#000000'` | Shadow color |
| `shadowBlur` | `number` | `10` | Shadow blur (px) |
| `padding` | `number` | `16` | Internal padding (px) |

### Chart Appearance Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLegend` | `boolean` | `true` | Show legend |
| `chartColors` | `string[]` | `['#5470c6', ...]` | Series colors |
| `metricsConfig` | `MetricStyleConfig[]` | `[]` | Metric formatting rules |

## Advanced Examples

### 1. Multi-Metric Comparison

Compare multiple metrics on the same radar chart:

```tsx
<RadarChart
  datasource="google_ads"
  dimension="GoogleAds.campaignName"
  metrics={[
    "GoogleAds.impressions",
    "GoogleAds.clicks",
    "GoogleAds.conversions",
    "GoogleAds.cost",
    "GoogleAds.ctr"
  ]}
  title="Campaign Performance Overview"
  metricsConfig={[
    {
      id: "GoogleAds.cost",
      format: "currency",
      decimals: 0,
      compact: true
    },
    {
      id: "GoogleAds.ctr",
      format: "percent",
      decimals: 2
    }
  ]}
  chartColors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
/>
```

**Result**: 5 different metrics visualized on one radar chart, with proper currency/percent formatting.

### 2. Breakdown by Category

Compare performance across different categories:

```tsx
<RadarChart
  datasource="gsc_performance"
  dimension="GSCPerformance.query"
  breakdownDimension="GSCPerformance.device"
  metrics={["GSCPerformance.clicks"]}
  title="Query Performance by Device Type"
  chartColors={['#5470c6', '#91cc75', '#fac858']}
/>
```

**Result**: Separate radar lines for Desktop, Mobile, and Tablet showing how each query performs per device.

### 3. With Date Range and Filters

Apply time-based and conditional filters:

```tsx
<RadarChart
  datasource="ga4_analytics"
  dimension="GA4.landingPage"
  metrics={["GA4.sessions", "GA4.bounceRate", "GA4.conversions"]}

  dateRange={{
    start: "2024-09-01",
    end: "2024-10-22"
  }}

  filters={[
    {
      field: "GA4.sessions",
      operator: "gt",
      values: ["500"]
    },
    {
      field: "GA4.source",
      operator: "equals",
      values: ["google", "bing"]
    }
  ]}

  title="High-Traffic Landing Pages (Organic Search)"
/>
```

**Result**: Only shows landing pages with 500+ sessions from Google/Bing during Sept-Oct.

### 4. Custom Styling for Dark Theme

```tsx
<RadarChart
  datasource="gsc_performance"
  dimension="GSCPerformance.query"
  metrics={["GSCPerformance.clicks"]}
  title="Search Performance"

  // Dark theme styling
  backgroundColor="#1f2937"
  titleColor="#f9fafb"
  borderColor="#374151"
  showShadow={true}
  shadowColor="#00000040"
  shadowBlur={16}

  chartColors={['#60a5fa', '#34d399', '#fbbf24']}
/>
```

### 5. Real-Time Today's Data

```tsx
function RealTimeDashboard() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <RadarChart
      datasource="gsc_performance"
      dimension="GSCPerformance.query"
      metrics={["GSCPerformance.clicks", "GSCPerformance.impressions"]}
      title="Today's Performance (Live)"

      dateRange={{
        start: today,
        end: today
      }}

      // Minimal widget styling
      backgroundColor="transparent"
      showBorder={false}
      padding={8}
    />
  );
}
```

## Data Transformation Logic

### Single Metric, No Breakdown

```
Cube.js Data:
[
  { query: "seo tools", clicks: 1500 },
  { query: "analytics", clicks: 1200 },
  { query: "marketing", clicks: 800 }
]

Radar Chart:
- Axis: "seo tools", "analytics", "marketing"
- Series 1 (clicks): [1500, 1200, 800]
```

### Multiple Metrics, No Breakdown

```
Cube.js Data:
[
  { query: "seo", clicks: 1500, impressions: 25000 },
  { query: "analytics", clicks: 1200, impressions: 20000 }
]

Radar Chart:
- Axis: "seo", "analytics"
- Series 1 (clicks): [1500, 1200]
- Series 2 (impressions): [25000, 20000]
```

### Single Metric, With Breakdown

```
Cube.js Data:
[
  { query: "seo", device: "DESKTOP", clicks: 1000 },
  { query: "seo", device: "MOBILE", clicks: 500 },
  { query: "analytics", device: "DESKTOP", clicks: 800 },
  { query: "analytics", device: "MOBILE", clicks: 400 }
]

Radar Chart:
- Axis: "seo", "analytics"
- Series 1 (DESKTOP): [1000, 800]
- Series 2 (MOBILE): [500, 400]
```

## Performance Optimization

### Token-Efficient Queries

The component automatically limits results for performance:

```javascript
queryConfig = {
  measures: metrics,
  dimensions: [dimension, breakdownDimension].filter(Boolean),
  limit: 50,  // ✅ Max 50 rows returned
  order: { [metrics[0]]: 'desc' }  // ✅ Top performers first
}
```

### Display Limits

The chart slices data for optimal rendering:

```javascript
const dimensionValues = chartData.slice(0, 8);  // ✅ Max 8 axes
const breakdownValues = [...].slice(0, 6);      // ✅ Max 6 series
```

**Result**: Even with 1000 rows from Cube.js, only 8 dimensions × 6 series = 48 points rendered.

### Pre-aggregations

For best performance, define pre-aggregations in your Cube.js model:

```javascript
// In Cube.js model
cube('GSCPerformance', {
  // ... dimensions and measures ...

  preAggregations: {
    topQueriesDaily: {
      measures: [clicks, impressions, ctr],
      dimensions: [query, device],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

## Integration with Dashboard Builder

The RadarChart works seamlessly with the dashboard builder:

```tsx
import { DashboardBuilder } from '@/components/dashboard-builder';

const dashboardConfig = {
  id: 'my-dashboard',
  name: 'Marketing Dashboard',
  rows: [
    {
      id: 'row-1',
      columns: [
        {
          id: 'col-1',
          width: '1/2',
          component: {
            id: 'radar-1',
            type: 'radar',
            datasource: 'gsc_performance',
            dimension: 'GSCPerformance.query',
            metrics: ['GSCPerformance.clicks'],
            title: 'Top Queries'
          }
        }
      ]
    }
  ]
};

function App() {
  return <DashboardBuilder config={dashboardConfig} />;
}
```

## Common Use Cases

### 1. Search Console Analysis
- **Dimension**: Search queries, pages, countries
- **Metrics**: Clicks, impressions, CTR, position
- **Use Case**: Identify query performance patterns

### 2. Google Ads Campaign Comparison
- **Dimension**: Campaign names, ad groups
- **Metrics**: Impressions, clicks, cost, conversions, CPA
- **Use Case**: Compare multi-dimensional campaign performance

### 3. Analytics Landing Page Analysis
- **Dimension**: Landing pages, traffic sources
- **Metrics**: Sessions, bounce rate, avg duration, conversions
- **Use Case**: Identify best-performing content

### 4. Competitive Analysis
- **Dimension**: Metrics (visibility, traffic, keywords, backlinks)
- **Breakdown**: Competitors (your site vs 3-5 competitors)
- **Use Case**: Multi-factor competitive positioning

### 5. Multi-Platform Search Performance
- **Dimension**: Search terms
- **Breakdown**: Platforms (Ads vs Organic)
- **Metrics**: Clicks, cost, conversions
- **Use Case**: Paid vs organic comparison

## Troubleshooting

### Chart Shows "Configure dimension and metric"

**Problem**: No data configuration provided

**Solution**: Set `dimension` and at least one `metric`:

```tsx
<RadarChart
  dimension="GSCPerformance.query"  // ✅ Required
  metrics={["GSCPerformance.clicks"]}  // ✅ Required
/>
```

### Error: "Invalid Cube.js query"

**Problem**: Measure/dimension names don't match Cube.js schema

**Solution**: Check your Cube.js model:

```bash
# List available cubes
curl "http://localhost:4000/cubejs-api/v1/meta"

# Verify measure names match exactly
# ❌ Wrong: metrics={["clicks"]}
# ✅ Correct: metrics={["GSCPerformance.clicks"]}
```

### Chart is Empty Despite Loading

**Problem**: Data exists but doesn't render

**Debug Steps**:

1. Check browser console for errors
2. Verify data structure: `console.log(resultSet?.tablePivot())`
3. Ensure dimension has values: Check if `dimensionValues.length > 0`
4. Check metric values aren't all zero/null

### Performance Issues / Slow Loading

**Solutions**:

1. **Add pre-aggregations** to Cube.js model
2. **Reduce date range** - Query smaller time windows
3. **Add filters** - Limit data scope
4. **Use limit** - Already set to 50, but can reduce further

## API Reference

### MetricStyleConfig

```typescript
interface MetricStyleConfig {
  id: string;                    // Metric identifier (e.g., "GSCPerformance.clicks")
  name: string;                  // Display name
  format: 'auto' | 'number' | 'percent' | 'currency' | 'duration';
  decimals: number;              // Number of decimal places
  compact: boolean;              // Use K/M/B notation (1.2K instead of 1200)
  alignment: 'left' | 'center' | 'right';
  textColor: string;             // Hex color
  fontWeight: string;            // CSS font-weight value
  showComparison: boolean;       // Not used in radar chart
  compareVs?: 'previous' | 'custom' | 'target';
  showBars: boolean;             // Not used in radar chart
  barColor?: string;
}
```

### FilterConfig

```typescript
interface FilterConfig {
  field: string;                 // Dimension/measure name
  operator: string;              // 'equals', 'notEquals', 'contains', 'gt', 'gte', 'lt', 'lte'
  values: string[];              // Filter values
}
```

### DateRangeConfig

```typescript
interface DateRangeConfig {
  start: string;                 // ISO date string (YYYY-MM-DD)
  end: string;                   // ISO date string (YYYY-MM-DD)
}
```

## Best Practices

### ✅ DO

- Use 3-8 dimensions for readable radar charts
- Limit to 6 or fewer series when using breakdown
- Apply filters to focus on meaningful data
- Use metric formatting for currency/percent values
- Set appropriate date ranges (avoid querying years of data)
- Order by primary metric to show top performers
- Use clear, concise dimension labels

### ❌ DON'T

- Query more than 50 rows (already limited, but consider reducing)
- Use more than 10 dimensions (chart becomes unreadable)
- Mix metrics with vastly different scales without normalization
- Forget to add pre-aggregations for production use
- Hardcode credentials or secrets
- Skip error handling
- Ignore loading states

## Related Components

- **LineChart** - Time series trends
- **BarChart** - Simple comparisons
- **Heatmap** - Two-dimensional density
- **Table** - Detailed data view
- **Scorecard** - Single KPI display

## Support & Resources

- **Cube.js Docs**: https://cube.dev/docs
- **ECharts Radar Docs**: https://echarts.apache.org/en/option.html#series-radar
- **Project Docs**: `/docs/architecture/PROJECT-BACKBONE.md`
- **Integration Guide**: `/docs/architecture/INTEGRATION-GUIDE.md`

## Version History

- **v1.0** - Initial release with Cube.js integration
- **v1.1** - Added date range support
- **v1.2** - Improved breakdown dimension handling
- **v1.3** - Enhanced tooltip formatting
- **v1.4** - Performance optimizations (current)
