# ComboChart Component

## Overview

The `ComboChart` component combines bar and line series on the same chart, allowing you to visualize multiple metrics with different representation types. This is ideal for comparing volume metrics (bars) with rate/ratio metrics (lines) in a single, cohesive visualization.

## Features

- **Mixed Series Types**: Display some metrics as bars and others as lines
- **Dual Y-Axes**: Support for left and right y-axes with independent scales
- **Auto-Detection**: Automatically determines when dual axes are needed based on value ranges
- **Flexible Configuration**: Control series types, axis assignments, and visual styles
- **Time Series & Categorical**: Works with both date dimensions and categorical dimensions
- **Stacked Bars**: Optional bar stacking for part-to-whole relationships
- **Smooth Lines**: Optional bezier curves for trend lines
- **Data Labels**: Optional value labels on bars and points
- **Cube.js Integration**: Direct integration with Cube.js semantic layer
- **Responsive Tooltips**: Synchronized tooltips showing all metrics

## Installation

```tsx
import { ComboChart } from '@/components/dashboard-builder/charts';
```

## Basic Usage

### Simple Bar + Line Chart

```tsx
<ComboChart
  title="Clicks vs CTR"
  dimension="GoogleAds.date"
  metrics={[
    'GoogleAds.clicks',
    'GoogleAds.ctr'
  ]}
  seriesTypes={['bar', 'line']}
  yAxisAssignment={['left', 'right']}
  dateRange={{
    start: '2025-10-01',
    end: '2025-10-22'
  }}
/>
```

### Multiple Metrics with Mixed Types

```tsx
<ComboChart
  title="Campaign Performance"
  dimension="GoogleAds.campaignName"
  metrics={[
    'GoogleAds.cost',
    'GoogleAds.conversions',
    'GoogleAds.costPerConversion'
  ]}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
  stackBars={true}
/>
```

## Props

### Data Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dimension` | `string \| null` | `null` | Primary dimension (x-axis) - date or category field |
| `breakdownDimension` | `string \| null` | `null` | Optional secondary dimension for grouping |
| `metrics` | `string[]` | `[]` | Array of metric IDs to display |
| `filters` | `Filter[]` | `[]` | Cube.js filters to apply |
| `dateRange` | `DateRange` | - | Date range for time-series data |

### Series Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `seriesTypes` | `('bar' \| 'line')[]` | `['bar', 'line', ...]` | Type for each metric (first bar, rest lines by default) |
| `yAxisAssignment` | `('left' \| 'right')[]` | `['left', ...]` | Which y-axis each metric uses |
| `smoothLines` | `boolean` | `false` | Enable smooth bezier curves for lines |
| `stackBars` | `boolean` | `false` | Stack bar series |
| `showDataLabels` | `boolean` | `false` | Display values on bars/points |
| `barWidth` | `string` | `'40%'` | Bar width percentage |

### Visual Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Combo Chart'` | Chart title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `chartColors` | `string[]` | `['#5470c6', '#91cc75', ...]` | Color palette for series |
| `backgroundColor` | `string` | `'#ffffff'` | Container background |
| `showBorder` | `boolean` | `true` | Show container border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderRadius` | `number` | `8` | Border radius in pixels |

### Metric Formatting

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metricsConfig` | `MetricConfig[]` | `[]` | Formatting rules for each metric |

## Use Cases

### 1. Volume vs Rate Analysis

Compare absolute metrics with percentage/rate metrics:

```tsx
// Clicks (volume) vs CTR (rate)
<ComboChart
  dimension="GoogleAds.date"
  metrics={['GoogleAds.clicks', 'GoogleAds.ctr']}
  seriesTypes={['bar', 'line']}
  yAxisAssignment={['left', 'right']}
/>
```

### 2. Multi-Platform Performance

Show paid and organic metrics together:

```tsx
// Paid clicks + Organic clicks + ROAS
<ComboChart
  dimension="HolisticSearch.searchTerm"
  metrics={[
    'HolisticSearch.totalPaidClicks',
    'HolisticSearch.totalOrganicClicks',
    'HolisticSearch.roas'
  ]}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
/>
```

### 3. Cost Analysis

Compare costs with efficiency metrics:

```tsx
// Cost + Conversions + CPA
<ComboChart
  dimension="GoogleAds.campaignName"
  metrics={[
    'GoogleAds.cost',
    'GoogleAds.conversions',
    'GoogleAds.costPerConversion'
  ]}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
  stackBars={true}
/>
```

### 4. Quality Score Tracking

Monitor volume with quality metrics:

```tsx
// Impressions + Quality Score
<ComboChart
  dimension="GoogleAds.date"
  metrics={[
    'GoogleAds.impressions',
    'GoogleAds.avgQualityScore'
  ]}
  seriesTypes={['bar', 'line']}
  yAxisAssignment={['left', 'right']}
  smoothLines={true}
/>
```

### 5. Landing Page Analysis

Three-metric analysis for pages:

```tsx
// Sessions + Bounce Rate + Conversions
<ComboChart
  dimension="Analytics.landingPage"
  metrics={[
    'Analytics.sessions',
    'Analytics.bounceRate',
    'Analytics.conversions'
  ]}
  seriesTypes={['bar', 'line', 'bar']}
  yAxisAssignment={['left', 'right', 'left']}
/>
```

## Configuration Guide

### Series Types

Choose `bar` or `line` based on data characteristics:

- **Bar**: Volume metrics (clicks, impressions, cost, conversions)
- **Line**: Rates, percentages, scores (CTR, conversion rate, position, quality score)

```tsx
seriesTypes={['bar', 'line', 'bar']}
// First metric: bar
// Second metric: line
// Third metric: bar
```

### Y-Axis Assignment

Use dual axes when:
- Metrics have different scales (clicks vs CTR)
- Value ranges differ by 10x or more
- Different unit types (currency vs percentage)

```tsx
yAxisAssignment={['left', 'right', 'left']}
// First metric: left axis (volume)
// Second metric: right axis (rate)
// Third metric: left axis (volume)
```

### Smooth Lines

- `smoothLines: true` - Use for trend analysis, cleaner appearance
- `smoothLines: false` - Use when precise values matter, data science context

### Stack Bars

- `stackBars: true` - Show part-to-whole relationships (paid + organic = total)
- `stackBars: false` - Show side-by-side comparisons (campaign A vs campaign B)

### Data Labels

- `showDataLabels: true` - Display exact values on chart (fewer data points)
- `showDataLabels: false` - Clean appearance, use tooltips for values (many data points)

## Advanced Examples

### Auto-Detecting Dual Axes

The component automatically detects when dual axes are needed:

```tsx
<ComboChart
  dimension="GoogleAds.date"
  metrics={[
    'GoogleAds.impressions', // Large values (thousands)
    'GoogleAds.ctr'          // Small values (percentages)
  ]}
  // Auto-detects 10x+ difference and creates dual axes
/>
```

### Hour-of-Day Analysis

```tsx
<ComboChart
  title="Performance by Hour"
  dimension="GoogleAds.hour"
  metrics={['GoogleAds.clicks', 'GoogleAds.conversionRate']}
  seriesTypes={['bar', 'line']}
  yAxisAssignment={['left', 'right']}
  smoothLines={true}
  metricsConfig={[
    { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
    { metricId: 'GoogleAds.conversionRate', format: 'percent', decimals: 2 }
  ]}
/>
```

### Budget Pacing

```tsx
<ComboChart
  title="Daily Budget Pacing"
  dimension="GoogleAds.date"
  metrics={['GoogleAds.cost', 'GoogleAds.budgetUtilization']}
  seriesTypes={['bar', 'line']}
  yAxisAssignment={['left', 'right']}
  smoothLines={true}
  chartColors={['#5470c6', '#ee6666']}
  metricsConfig={[
    { metricId: 'GoogleAds.cost', format: 'currency', decimals: 2 },
    { metricId: 'GoogleAds.budgetUtilization', format: 'percent', decimals: 1 }
  ]}
/>
```

### Search Console Performance

```tsx
<ComboChart
  title="GSC Performance - Impressions, Clicks & Position"
  dimension="GSC.date"
  metrics={[
    'GSC.impressions',
    'GSC.clicks',
    'GSC.position'
  ]}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
  stackBars={false}
  smoothLines={true}
  metricsConfig={[
    { metricId: 'GSC.impressions', format: 'number', decimals: 0 },
    { metricId: 'GSC.clicks', format: 'number', decimals: 0 },
    { metricId: 'GSC.position', format: 'number', decimals: 1 }
  ]}
  chartColors={['#5470c6', '#91cc75', '#ee6666']}
/>
```

## Integration with Cube.js

The ComboChart automatically constructs Cube.js queries based on your configuration:

### Time-Series Query

```tsx
<ComboChart dimension="GoogleAds.date" ... />
```

Generates:
```javascript
{
  measures: ['GoogleAds.clicks', 'GoogleAds.ctr'],
  timeDimensions: [{
    dimension: 'GoogleAds.date',
    granularity: 'day',
    dateRange: ['2025-10-01', '2025-10-22']
  }]
}
```

### Categorical Query

```tsx
<ComboChart dimension="GoogleAds.campaignName" ... />
```

Generates:
```javascript
{
  measures: ['GoogleAds.cost', 'GoogleAds.conversions'],
  dimensions: ['GoogleAds.campaignName'],
  order: { 'GoogleAds.cost': 'desc' },
  limit: 20
}
```

## Performance Optimization

### Token Efficiency

The component implements WPP platform's token-efficient patterns:

- Limits categorical data to top 20 items
- Aggregates data in Cube.js (not in React)
- Returns 100-400 rows maximum
- Uses pre-aggregations when available

### Pre-Aggregations

Configure in Cube.js for faster queries:

```javascript
// In Cube.js data model
preAggregations: {
  dailyMetrics: {
    measures: [clicks, ctr, cost, conversions],
    dimensions: [campaignName],
    timeDimension: date,
    granularity: 'day',
    refreshKey: { every: '1 hour' }
  }
}
```

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color options
- Responsive tooltips

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Related Components

- **BarChart**: For bar-only visualizations
- **LineChart**: For line-only visualizations
- **TimeSeriesChart**: For smooth time-series trends
- **AreaChart**: For filled area charts

## Troubleshooting

### Bars and Lines Don't Align

Ensure your data has matching x-axis values:

```tsx
// Bad: Mismatched data
metrics={['GoogleAds.clicks', 'GSC.clicks']}
dimension="GoogleAds.date" // GSC data won't align

// Good: Same data source
metrics={['GoogleAds.clicks', 'GoogleAds.ctr']}
dimension="GoogleAds.date"
```

### Right Y-Axis Not Showing

Explicitly set `yAxisAssignment`:

```tsx
yAxisAssignment={['left', 'right']}
```

### Lines Hidden Behind Bars

Reorder metrics to put lines last:

```tsx
// Bar will hide line
metrics={['cost', 'ctr']}
seriesTypes={['line', 'bar']} // BAD

// Line visible on top
metrics={['cost', 'ctr']}
seriesTypes={['bar', 'line']} // GOOD
```

## Version History

- **v1.0.0** (2025-10-22): Initial release with mixed bar/line support

## License

Part of the WPP Analytics Platform - Internal Use Only
